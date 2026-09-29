import { ECHOES } from './content/echoes'
import { FESTIVAL_ECHOES } from './content/festival'
import { DONATIONS, HAPPENINGS } from './content/happenings'
import { JOINT_ECHOES } from './content/joints'
import { KEEPSAKES } from './content/keepsakes'
import { OBJECTS, STARTING_OBJECTS } from './content/objects'
import { REQUESTS, REQUESTS_BY_ID, type RequestDef } from './content/requests'
import { RESIDENTS } from './content/residents'
import { FESTIVAL_DAY, LOCATIONS, MARKS, WEATHER_PATTERNS, isClearNight } from './content/world'
import type { EchoDef, HappeningFire, JointEchoDef, KeepsakeSpec, OtherSpec } from './defs'
import { hasFlag, isOpen, isOut, photos, shelfSize, strandCount } from './query'
import { pick, rngFor, shuffle, type Rng } from './rng'
import { fill, type TemplateCtx } from './text'
import type {
  DayReport,
  EchoResult,
  GameState,
  Keepsake,
  Loan,
  LocationId,
  MarkInstance,
  ObjectId,
  ObjectState,
  ResidentId,
  TimeOfDay,
  Visit,
  Weather,
} from './types'
import { RESIDENT_IDS } from './types'

export const SAVE_VERSION = 1
const VISITORS_PER_DAY = [2, 3, 3, 4, 4, 4, 6]
const ALL_ECHOES: EchoDef[] = [...ECHOES, ...FESTIVAL_ECHOES]

// ———————————————————————————————————————————————————————————— setup

const clone = <T>(v: T): T => structuredClone(v)
const arr = <T>(v: T | T[] | undefined): T[] => (v === undefined ? [] : Array.isArray(v) ? v : [v])

function emptyReport(): DayReport {
  return { echoes: [], echoIndex: 0, returned: [], stillOut: [], donations: [], notes: [] }
}

function freshObject(id: ObjectId, day: number): ObjectState {
  return { id, acquiredDay: day, history: [], marks: [], keepsakes: [] }
}

export function newGame(seed: number): GameState {
  const state: GameState = {
    version: SAVE_VERSION,
    seed,
    day: 1,
    phase: 'morning',
    weatherPattern: seed % WEATHER_PATTERNS.length,
    present: [],
    collection: [...STARTING_OBJECTS],
    objects: Object.fromEntries(STARTING_OBJECTS.map((id) => [id, freshObject(id, 0)])),
    shelf: [],
    visits: [],
    visitIndex: 0,
    loans: [],
    report: emptyReport(),
    recentlyReturned: [],
    flags: {},
    seen: [],
    usedRequests: [],
    lastVisit: {},
    scheduled: [],
    donationsGiven: [],
    festivalDone: false,
  }
  return beginDay(state)
}

export function weatherFor(s: Pick<GameState, 'seed' | 'weatherPattern'>, day: number): Weather {
  if (day <= WEATHER_PATTERNS[0].length) return WEATHER_PATTERNS[s.weatherPattern][day - 1]
  return pick(rngFor(s.seed, 'weather', day), ['sunny', 'sunny', 'windy', 'rainy', 'foggy'] as Weather[])
}

export const isFestivalDay = (s: GameState) => s.day === FESTIVAL_DAY && !s.festivalDone

function beginDay(s: GameState): GameState {
  for (const r of RESIDENT_IDS) if (RESIDENTS[r].arrives <= s.day && !s.present.includes(r)) s.present.push(r)
  s.phase = 'morning'
  s.report = emptyReport()
  s.visitIndex = 0
  s.visits = planVisits(s)
  s.shelf = s.shelf.filter((id) => s.collection.includes(id) && !isOut(s, id)).slice(0, shelfSize(s))
  return s
}

// ———————————————————————————————————————————————————————————— visitors

function requestEligible(s: GameState, r: RequestDef, weather: Weather): boolean {
  if (r.weather && !r.weather.includes(weather)) return false
  if (r.minDay !== undefined && s.day < r.minDay) return false
  if (r.maxDay !== undefined && s.day > r.maxDay) return false
  if (r.flags && !r.flags.every((f) => hasFlag(s, f))) return false
  if (r.notFlags && r.notFlags.some((f) => hasFlag(s, f))) return false
  if (r.locationClosed && isOpen(s, r.locationClosed)) return false
  return true
}

function pickRequest(s: GameState, resident: ResidentId, rng: Rng): RequestDef {
  const weather = weatherFor(s, s.day)
  const pool = REQUESTS.filter(
    (r) =>
      r.resident === resident &&
      r.day === undefined &&
      !r.repeatable &&
      !s.usedRequests.includes(r.id) &&
      requestEligible(s, r, weather),
  )
  if (pool.length) {
    const scored = pool.map((r) => ({ r, score: (r.priority ?? 0) + (r.weather ? 2 : 0) + rng() * 1.5 }))
    scored.sort((a, b) => b.score - a.score)
    return scored[0].r
  }
  return REQUESTS.find((r) => r.resident === resident && r.repeatable)!
}

function planVisits(s: GameState): Visit[] {
  const rng = rngFor(s.seed, 'visits', s.day)
  const fixed = REQUESTS.filter((r) => r.day === s.day && s.present.includes(r.resident))
  const festival = isFestivalDay(s)
  const count = festival ? fixed.length : (VISITORS_PER_DAY[s.day - 1] ?? 4)
  const away = new Set(s.loans.filter((l) => l.returnDay >= s.day).map((l) => l.residentId))

  const visits: Visit[] = fixed.map((r) => ({ residentId: r.resident, requestId: r.id }))
  const candidates = shuffle(
    rng,
    s.present.filter((r) => !visits.some((v) => v.residentId === r) && !away.has(r)),
  ).sort((a, b) => (s.lastVisit[a] ?? 0) - (s.lastVisit[b] ?? 0))
  const others: Visit[] = []
  for (const r of candidates.slice(0, Math.max(0, count - visits.length))) {
    others.push({ residentId: r, requestId: pickRequest(s, r, rng).id })
  }
  const all = festival ? shuffle(rng, visits) : [...visits, ...shuffle(rng, others)]
  for (const v of all) {
    s.lastVisit[v.residentId] = s.day
    if (!s.usedRequests.includes(v.requestId)) s.usedRequests.push(v.requestId)
  }
  return all
}

export function currentVisit(s: GameState): Visit | undefined {
  return s.phase === 'open' ? s.visits[s.visitIndex] : undefined
}

// ———————————————————————————————————————————————————————————— morning & lending

export function feature(state: GameState, id: ObjectId): GameState {
  if (state.phase !== 'morning') return state
  if (!state.collection.includes(id) || isOut(state, id) || state.shelf.includes(id)) return state
  if (state.shelf.length >= shelfSize(state)) return state
  const s = clone(state)
  s.shelf.push(id)
  return s
}

export function unfeature(state: GameState, id: ObjectId): GameState {
  if (state.phase !== 'morning' || !state.shelf.includes(id)) return state
  const s = clone(state)
  s.shelf = s.shelf.filter((x) => x !== id)
  return s
}

export function openDoors(state: GameState): GameState {
  if (state.phase !== 'morning') return state
  const s = clone(state)
  s.phase = 'open'
  s.visitIndex = 0
  return s
}

export function lend(state: GameState, objectId: ObjectId): GameState {
  const visit = currentVisit(state)
  if (!visit || !state.shelf.includes(objectId)) return state
  const s = clone(state)
  const v = s.visits[s.visitIndex]
  v.lent = objectId
  s.loans.push({ objectId, residentId: v.residentId, requestId: v.requestId, day: s.day, returnDay: s.day })
  s.shelf = s.shelf.filter((x) => x !== objectId)
  s.visitIndex++
  return s
}

export function decline(state: GameState): GameState {
  if (!currentVisit(state)) return state
  const s = clone(state)
  s.visits[s.visitIndex].declined = true
  s.visitIndex++
  return s
}

export const allVisitorsServed = (s: GameState) => s.phase === 'open' && s.visitIndex >= s.visits.length

// ———————————————————————————————————————————————————————————— echo matching

type Busy = Partial<Record<ResidentId, Partial<Record<TimeOfDay, LocationId>>>>

interface TraceRef {
  kind: 'keepsake' | 'mark'
  by: ResidentId
  keepsake?: Keepsake
  mark?: MarkInstance
}

interface Binding {
  def: EchoDef
  priority: number
  loan: Loan
  location: LocationId
  time: TimeOfDay
  indoor: boolean
  other?: ResidentId
  trace?: TraceRef
  order: number
}

interface ResolveCtx {
  s: GameState
  day: number
  weather: Weather
  festival: boolean
  busy: Busy
  rng: Rng
}

const participants = (e: { borrower: ResidentId; with: ResidentId[] }) => [e.borrower, ...e.with]

function isFree(ctx: ResolveCtx, r: ResidentId, time: TimeOfDay, loc: LocationId): boolean {
  if (ctx.festival) return true
  const at = ctx.busy[r]?.[time]
  return at === undefined || at === loc
}

function markBusy(ctx: ResolveCtx, r: ResidentId, time: TimeOfDay, loc: LocationId) {
  ctx.busy[r] = { ...ctx.busy[r], [time]: loc }
}

/** The newest thing someone else left on/in this object that `borrower` hasn't found yet. */
export function findTrace(
  obj: ObjectState,
  borrower: ResidentId,
  by?: ResidentId,
  keepsakeOnly = false,
): TraceRef | undefined {
  for (let i = obj.keepsakes.length - 1; i >= 0; i--) {
    const k = obj.keepsakes[i]
    if (k.by === borrower || k.foundBy?.includes(borrower) || (by && k.by !== by)) continue
    return { kind: 'keepsake', by: k.by, keepsake: k }
  }
  if (keepsakeOnly) return undefined
  for (let i = obj.marks.length - 1; i >= 0; i--) {
    const m = obj.marks[i]
    if (m.by === borrower || m.foundBy?.includes(borrower) || (by && m.by !== by)) continue
    return { kind: 'mark', by: m.by, mark: m }
  }
  return undefined
}

function resolveOther(
  ctx: ResolveCtx,
  spec: OtherSpec,
  loan: Loan,
  obj: ObjectState,
  time: TimeOfDay,
  loc: LocationId,
): { other?: ResidentId; trace?: TraceRef } | null {
  const { s } = ctx
  const b = loan.residentId
  const ok = (r: ResidentId | undefined): r is ResidentId =>
    !!r && r !== b && s.present.includes(r) && isFree(ctx, r, time, loc)
  const choose = (pool: ResidentId[], bias: 'new' | 'known' = 'new'): ResidentId | undefined => {
    if (!pool.length) return undefined
    const favoured = pool.filter((r) => (strandCount(s, b, r) === 0) === (bias === 'new'))
    return pick(ctx.rng, favoured.length ? favoured : pool)
  }
  switch (spec.kind) {
    case 'resident':
      return ok(spec.id) ? { other: spec.id } : null
    case 'prev': {
      for (let i = obj.history.length - 1; i >= 0; i--) {
        const e = obj.history[i]
        if (spec.tag && !e.tags.includes(spec.tag)) continue
        const who = participants(e).find((r) => r !== b)
        if (who) return ok(who) ? { other: who } : null
      }
      return null
    }
    case 'trace': {
      const trace = findTrace(obj, b, spec.by, spec.keepsakeOnly)
      return trace && ok(trace.by) ? { other: trace.by, trace } : null
    }
    case 'any': {
      const pool = s.present.filter(ok)
      const preferred = (spec.prefer ?? []).filter((r) => pool.includes(r))
      const other = preferred.length ? choose(preferred, spec.bias) : choose(pool, spec.bias)
      return other ? { other } : null
    }
    case 'photoSubject': {
      const pool = [...new Set(photos(s).map((p) => p.subject))].filter(ok)
      const other = choose(pool)
      return other ? { other } : null
    }
  }
}

function historyCount(obj: ObjectState, borrower: ResidentId, cond: NonNullable<EchoDef['history']>): number {
  return obj.history.filter((e) => {
    if (e.kind === 'mend') return false
    if (cond.tag && !e.tags.includes(cond.tag)) return false
    const who = participants(e)
    if (cond.by === 'other') return who.some((r) => r !== borrower)
    if (cond.by === 'self') return who.includes(borrower)
    if (cond.by) return who.includes(cond.by)
    return true
  }).length
}

function echoPlace(def: EchoDef, loan: Loan): { location: LocationId; time: TimeOfDay; indoor: boolean } {
  const obj = OBJECTS[loan.objectId]
  const home = RESIDENTS[loan.residentId].home
  let location: LocationId
  let indoor: boolean
  if (def.location === 'home') {
    location = home
    indoor = def.indoor ?? true
  } else if (def.location) {
    location = def.location
    indoor = def.indoor ?? false
  } else {
    location = obj.home === 'home' ? home : obj.home
    indoor = def.indoor ?? !!obj.indoor
  }
  return { location, time: def.time ?? obj.time, indoor }
}

function matchEcho(ctx: ResolveCtx, def: EchoDef, loan: Loan): Binding | null {
  const { s, weather, festival } = ctx
  const b = loan.residentId
  if (!!def.festival !== festival) return null
  if (!arr(def.object).includes(loan.objectId)) return null
  if (def.resident && !arr(def.resident).includes(b)) return null
  if (def.notResident?.includes(b)) return null
  if (def.weather && !def.weather.includes(weather)) return null
  if (def.notWeather?.includes(weather)) return null
  if (def.clearNight !== undefined && isClearNight(weather) !== def.clearNight) return null
  if (def.requests && !def.requests.includes(loan.requestId)) return null
  if (def.requestTags) {
    const tags = REQUESTS_BY_ID[loan.requestId]?.tags ?? []
    if (!def.requestTags.some((t) => tags.includes(t))) return null
  }
  if (def.minDay !== undefined && ctx.day < def.minDay) return null
  if (def.maxDay !== undefined && ctx.day > def.maxDay) return null
  if (def.flags && !def.flags.every((f) => hasFlag(s, f))) return null
  if (def.notFlags && def.notFlags.some((f) => hasFlag(s, f))) return null
  if (def.open && !isOpen(s, def.open)) return null
  if (def.closed && isOpen(s, def.closed)) return null
  if (def.once && s.seen.includes(def.id)) return null
  if (def.chance !== undefined && ctx.rng() > def.chance) return null
  const obj = s.objects[loan.objectId]!
  if (def.history && historyCount(obj, b, def.history) < (def.history.min ?? 1)) return null

  const { location, time, indoor } = echoPlace(def, loan)
  if (!isFree(ctx, b, time, location)) return null

  let other: ResidentId | undefined
  let trace: TraceRef | undefined
  if (def.other) {
    const res = resolveOther(ctx, def.other, loan, obj, time, location)
    if (!res) return null
    other = res.other
    trace = res.trace
  }

  let priority = def.priority
  // Generic trace scenes matter most when they introduce people; once tied, let character scenes lead.
  if (def.id.startsWith('trace_') && other) priority = strandCount(s, b, other) === 0 ? 67 : 57
  return { def, priority, loan, location, time, indoor, other, trace, order: ctx.rng() }
}

function candidatesFor(ctx: ResolveCtx, loan: Loan): Binding[] {
  const out: Binding[] = []
  for (const def of ALL_ECHOES) {
    const bnd = matchEcho(ctx, def, loan)
    if (bnd) out.push(bnd)
  }
  if (!out.length && ctx.festival) {
    // Safety net: any ordinary echo will do on Lantern Night.
    const relaxed = { ...ctx, festival: false }
    for (const def of ECHOES) {
      const bnd = matchEcho(relaxed, def, loan)
      if (bnd) out.push(bnd)
    }
  }
  const seen = (x: Binding) => (ctx.s.seen.includes(x.def.id) ? 1 : 0)
  return out.sort((x, y) => y.priority - x.priority || seen(x) - seen(y) || x.order - y.order)
}

function bestFor(ctx: ResolveCtx, loan: Loan): Binding | undefined {
  const found = candidatesFor(ctx, loan)[0]
  if (found) return found
  // Last resort: the object's plain solo echo, ignoring who is where.
  const solo = ECHOES.find((d) => arr(d.object).includes(loan.objectId) && !d.other && d.priority <= 10)!
  const { location, time, indoor } = echoPlace(solo, loan)
  const at = ctx.busy[loan.residentId]?.[time]
  return { def: solo, priority: solo.priority, loan, location: at ?? location, time, indoor, order: 0 }
}

// ———————————————————————————————————————————————————————————— applying outcomes

function keepsakeFrom(
  spec: boolean | KeepsakeSpec | undefined,
  objectId: ObjectId,
  by: ResidentId,
  other: ResidentId | undefined,
  location: LocationId,
  day: number,
  tctx: TemplateCtx,
): Keepsake | undefined {
  if (!spec) return undefined
  const kind = OBJECTS[objectId].keepsakeKind ?? 'note'
  if (spec === true) {
    const t = KEEPSAKES[objectId]?.[by]
    if (!t) return undefined
    return { kind, by, day, text: t.text, subject: t.subject, place: t.place ?? location }
  }
  const subject = spec.subject === 'other' ? other : spec.subject
  return { kind, by, day, text: fill(spec.text, tctx), subject, place: spec.place ?? location }
}

function setFlags(s: GameState, flags: string[] | undefined, day: number) {
  for (const f of flags ?? []) if (s.flags[f] === undefined) s.flags[f] = day
}

function markLabel(m: MarkInstance): string {
  return m.id === 'label' && m.note ? `${MARKS[m.id].label} (“${m.note}”)` : MARKS[m.id].label
}

/** Sewing sometimes mends a well-travelled fabric thing waiting on the shelves. */
function mendSomething(s: GameState, by: ResidentId, weather: Weather): ObjectId | undefined {
  for (const id of ['blanket', 'kite', 'umbrella', 'album'] as ObjectId[]) {
    const o = s.objects[id]
    if (!o || isOut(s, id) || !s.collection.includes(id)) continue
    if (o.marks.length < 2 || o.marks.some((m) => m.id === 'patch')) continue
    const name = RESIDENTS[by].short
    const mark: MarkInstance = { id: 'patch', day: s.day, by, note: `mended by ${name}` }
    o.marks.push(mark)
    o.history.push({
      day: s.day,
      kind: 'mend',
      echoId: 'mend',
      borrower: by,
      with: [],
      location: RESIDENTS[by].home,
      time: 'dusk',
      weather,
      title: 'Mended',
      text: `${name} noticed the ${OBJECTS[id].short} was looking well-travelled, took it home with the sewing basket, and mended it with small, neat stitches.`,
      tags: ['mended'],
      mark,
    })
    return id
  }
  return undefined
}

function applyBinding(ctx: ResolveCtx, bnd: Binding): EchoResult {
  const { s, day, weather } = ctx
  const { def, loan, other, trace, location, time, indoor } = bnd
  const b = loan.residentId
  const obj = s.objects[loan.objectId]!
  const objDef = OBJECTS[loan.objectId]
  const base: TemplateCtx = { borrower: b, other, objectId: loan.objectId, location }
  const latest = obj.keepsakes[obj.keepsakes.length - 1]?.text ?? 'an old record nobody could name'
  const traceText = trace?.kind === 'keepsake' ? trace.keepsake!.text : trace?.mark ? markLabel(trace.mark) : ''
  const traceFound = trace
    ? fill(trace.kind === 'keepsake' && objDef.trace.keepsake ? objDef.trace.keepsake : objDef.trace.mark, {
        ...base,
        extra: { keepsake: traceText, mark: traceText },
      })
    : ''
  const social = other ? fill(RESIDENTS[b].social, base) : ''
  const tctx: TemplateCtx = {
    ...base,
    extra: {
      keepsake: traceText,
      mark: traceText,
      latest,
      photoCount: String(photos(s).length),
      traceFound,
      social,
    },
  }
  const title = fill(def.title, tctx)
  const text = fill(def.text, tctx)

  if (trace?.keepsake) trace.keepsake.foundBy = [...(trace.keepsake.foundBy ?? []), b]
  if (trace?.mark) trace.mark.foundBy = [...(trace.mark.foundBy ?? []), b]

  const isNewThread = other ? strandCount(s, b, other) === 0 : false
  let mark: MarkInstance | undefined
  if (def.mark) {
    mark = { id: def.mark, day, by: b, note: def.markNote ? fill(def.markNote, tctx) : undefined }
    obj.marks.push(mark)
  }
  const keepsake = keepsakeFrom(def.keepsake, loan.objectId, b, other, location, day, tctx)
  if (keepsake) obj.keepsakes.push(keepsake)

  obj.history.push({
    day,
    kind: def.festival ? 'festival' : 'echo',
    echoId: def.id,
    borrower: b,
    with: other ? [other] : [],
    location,
    time,
    weather,
    title,
    text,
    tags: def.tags ?? [],
    mark,
  })

  setFlags(s, def.flagsSet, day)
  if (def.schedule) s.scheduled.push({ day: day + def.schedule.inDays, id: def.schedule.id, by: b, objectId: loan.objectId })
  if (def.returnsIn && def.returnsIn > 1) {
    const l = s.loans.find((x) => x.objectId === loan.objectId && x.day === day)
    if (l) l.returnDay = day + def.returnsIn - 1
  }
  if (!s.seen.includes(def.id)) s.seen.push(def.id)
  markBusy(ctx, b, time, location)
  if (other) markBusy(ctx, other, time, location)

  const unlocks: string[] = []
  const objects: ObjectId[] = [loan.objectId]
  if (def.mend) {
    const mended = mendSomething(s, b, weather)
    if (mended) {
      unlocks.push(`While the needle was out, ${RESIDENTS[b].short} also mended the ${OBJECTS[mended].short}.`)
      objects.push(mended)
    }
  }
  if (def.returnsIn && def.returnsIn > 1) unlocks.push(`${RESIDENTS[b].short} will keep the ${objDef.short} an extra night.`)

  return {
    uid: '',
    echoId: def.id,
    kind: def.festival ? 'festival' : 'echo',
    title,
    text,
    gist: REQUESTS_BY_ID[loan.requestId]?.gist,
    location,
    time,
    weather,
    indoor,
    cast: other ? [b, other] : [b],
    objects,
    mode: def.mode ?? objDef.mode,
    fx: def.fx ?? objDef.fx,
    marks: mark ? [{ objectId: loan.objectId, mark }] : [],
    threads: other ? [{ a: b, b: other, isNew: isNewThread }] : [],
    unlocks,
  }
}

function jointRoleOk(role: JointEchoDef['a'], loan: Loan) {
  return role.object.includes(loan.objectId) && (!role.resident || role.resident.includes(loan.residentId))
}

function jointConditionsOk(ctx: ResolveCtx, jd: JointEchoDef): boolean {
  const { s, weather } = ctx
  if (ctx.festival) return false
  if (jd.once && s.seen.includes(jd.id)) return false
  if (jd.weather && !jd.weather.includes(weather)) return false
  if (jd.notWeather?.includes(weather)) return false
  if (jd.clearNight !== undefined && isClearNight(weather) !== jd.clearNight) return false
  if (jd.closed && isOpen(s, jd.closed)) return false
  if (jd.flags && !jd.flags.every((f) => hasFlag(s, f))) return false
  if (jd.notFlags && jd.notFlags.some((f) => hasFlag(s, f))) return false
  return true
}

function applyJoint(ctx: ResolveCtx, jd: JointEchoDef, la: Loan, lb: Loan): EchoResult {
  const { s, day, weather } = ctx
  const a = la.residentId
  const b = lb.residentId
  const location = jd.location === 'homeA' ? RESIDENTS[a].home : jd.location
  const ra = RESIDENTS[a]
  const rb = RESIDENTS[b]
  const extra = {
    a: ra.short,
    b: rb.short,
    A: ra.short.toUpperCase(),
    B: rb.short.toUpperCase(),
    objA: OBJECTS[la.objectId].short,
    objB: OBJECTS[lb.objectId].short,
  }
  const tctx: TemplateCtx = { borrower: a, other: b, location, extra }
  const title = fill(jd.title, tctx)
  const text = fill(jd.text, tctx)
  const isNew = strandCount(s, a, b) === 0
  const marks: EchoResult['marks'] = []
  const sides: [Loan, ResidentId, ResidentId, JointEchoDef['markA'], JointEchoDef['keepsakeA']][] = [
    [la, a, b, jd.markA, jd.keepsakeA],
    [lb, b, a, jd.markB, jd.keepsakeB],
  ]
  for (const [loan, who, partner, markId, ks] of sides) {
    const obj = s.objects[loan.objectId]!
    let mark: MarkInstance | undefined
    if (markId) {
      mark = { id: markId, day, by: who, note: undefined }
      obj.marks.push(mark)
      marks.push({ objectId: loan.objectId, mark })
    }
    const k = keepsakeFrom(ks, loan.objectId, who, partner, location, day, { ...tctx, borrower: who, other: partner })
    if (k) obj.keepsakes.push(k)
    obj.history.push({
      day,
      kind: 'joint',
      echoId: jd.id,
      borrower: who,
      with: [partner],
      location,
      time: jd.time,
      weather,
      title,
      text,
      tags: jd.tags,
      mark,
    })
  }
  setFlags(s, jd.flagsSet, day)
  if (!s.seen.includes(jd.id)) s.seen.push(jd.id)
  markBusy(ctx, a, jd.time, location)
  markBusy(ctx, b, jd.time, location)
  return {
    uid: '',
    echoId: jd.id,
    kind: 'joint',
    title,
    text,
    gist: REQUESTS_BY_ID[la.requestId]?.gist,
    location,
    time: jd.time,
    weather,
    indoor: !!jd.indoor,
    cast: [a, b],
    objects: [la.objectId, lb.objectId],
    mode: OBJECTS[la.objectId].mode,
    fx: jd.fx ?? OBJECTS[la.objectId].fx,
    marks,
    threads: [{ a, b, isNew }],
    unlocks: [],
  }
}

function applyHappening(ctx: ResolveCtx, id: string, fire: HappeningFire): EchoResult {
  const { s, day, weather } = ctx
  const threads: EchoResult['threads'] = []
  if (fire.entry) {
    const { objectId, borrower, with: withWhom, group, tags } = fire.entry
    const people = [borrower, ...withWhom]
    const pairs: [ResidentId, ResidentId][] = []
    if (group) {
      for (let i = 0; i < people.length; i++) for (let j = i + 1; j < people.length; j++) pairs.push([people[i], people[j]])
    } else for (const w of withWhom) pairs.push([borrower, w])
    for (const [x, y] of pairs) threads.push({ a: x, b: y, isNew: strandCount(s, x, y) === 0 })
    const obj = s.objects[objectId]
    obj?.history.push({
      day,
      kind: 'happening',
      echoId: id,
      borrower,
      with: withWhom,
      group,
      location: fire.location,
      time: fire.time,
      weather,
      title: fire.title,
      text: fire.text,
      tags,
    })
  }
  setFlags(s, fire.flagsSet, day)
  if (!s.seen.includes(id)) s.seen.push(id)
  return {
    uid: '',
    echoId: id,
    kind: 'happening',
    title: fire.title,
    text: fire.text,
    location: fire.location,
    time: fire.time,
    weather,
    indoor: false,
    cast: fire.cast.filter((r) => s.present.includes(r)),
    objects: fire.objects.filter((o) => s.collection.includes(o)),
    mode: fire.objects[0] ? OBJECTS[fire.objects[0]].mode : 'held',
    fx: fire.fx,
    marks: [],
    threads,
    unlocks: fire.unlocks ?? [],
  }
}

// ———————————————————————————————————————————————————————————— afternoon

/** Resolve the day: joint meetings, then each loan's Echo, then village Happenings. */
export function closeForAfternoon(state: GameState): GameState {
  if (!allVisitorsServed(state)) return state
  const s = clone(state)
  const ctx: ResolveCtx = {
    s,
    day: s.day,
    weather: weatherFor(s, s.day),
    festival: isFestivalDay(s),
    busy: {},
    rng: rngFor(s.seed, 'echoes', s.day),
  }
  const todays = s.loans.filter((l) => l.day === s.day)
  const results: EchoResult[] = []
  const claimed = new Set<number>()

  // 1. Two things lent today meeting out in the world.
  const bestSingle = todays.map((l) => bestFor({ ...ctx, busy: {}, rng: rngFor(s.seed, 'peek', s.day) }, l)?.priority ?? 0)
  for (const jd of [...JOINT_ECHOES].sort((x, y) => y.priority - x.priority)) {
    if (!jointConditionsOk(ctx, jd)) continue
    let done = false
    for (let i = 0; i < todays.length && !done; i++) {
      for (let j = 0; j < todays.length && !done; j++) {
        if (i === j || claimed.has(i) || claimed.has(j)) continue
        const la = todays[i]
        const lb = todays[j]
        if (la.residentId === lb.residentId) continue
        if (!jointRoleOk(jd.a, la) || !jointRoleOk(jd.b, lb)) continue
        if (jd.priority < Math.max(bestSingle[i], bestSingle[j])) continue
        results.push(applyJoint(ctx, jd, la, lb))
        claimed.add(i)
        claimed.add(j)
        done = true
      }
    }
  }

  // 2. Every other loan finds its own Echo.
  todays.forEach((loan, i) => {
    if (claimed.has(i)) return
    const bnd = bestFor(ctx, loan)
    if (bnd) results.push(applyBinding(ctx, bnd))
  })

  // 3. Consequences arriving from earlier days, and village-scale happenings.
  for (const ev of s.scheduled.filter((e) => e.day === s.day)) {
    const def = HAPPENINGS.find((h) => h.id === ev.id)
    const fire = def?.fire({ state: s, day: s.day, weather: ctx.weather, scheduledBy: ev.by })
    if (def && fire) results.push(applyHappening(ctx, def.id, fire))
  }
  let majorToday = false
  for (const def of HAPPENINGS) {
    if (def.scheduled || (def.once && s.seen.includes(def.id)) || (def.major && majorToday)) continue
    const fire = def.fire({ state: s, day: s.day, weather: ctx.weather })
    if (!fire) continue
    results.push(applyHappening(ctx, def.id, fire))
    if (def.major) majorToday = true
  }

  results.forEach((r, i) => (r.uid = `d${s.day}-${i}`))
  s.report = { ...emptyReport(), echoes: results }
  s.phase = 'echoes'
  return s
}

export function setEchoIndex(state: GameState, index: number): GameState {
  if (state.phase !== 'echoes' || index === state.report.echoIndex) return state
  const s = clone(state)
  s.report.echoIndex = Math.max(0, Math.min(index, s.report.echoes.length))
  return s
}

// ———————————————————————————————————————————————————————————— evening

function processReturns(s: GameState, all: boolean) {
  const returned = s.loans.filter((l) => all || l.returnDay <= s.day).map((l) => l.objectId)
  s.loans = s.loans.filter((l) => !returned.includes(l.objectId))
  s.report.returned = returned
  s.report.stillOut = s.loans.map((l) => l.objectId)
  s.recentlyReturned = returned
}

function processDonations(s: GameState) {
  let fallbacksToday = 0
  for (const d of DONATIONS) {
    if (s.collection.includes(d.objectId) || s.donationsGiven.includes(d.objectId)) continue
    const earned = d.when(s)
    const fallback = !earned && d.fallbackDay !== undefined && s.day >= d.fallbackDay && fallbacksToday === 0
    if (!earned && !fallback) continue
    if (fallback) fallbacksToday++
    const from = typeof d.from === 'function' ? d.from(s) : d.from
    const obj = freshObject(d.objectId, s.day)
    obj.donor = from
    obj.donorNote = d.note
    for (const r of d.seedKeepsakesFrom?.(s) ?? []) {
      const t = KEEPSAKES[d.objectId]?.[r]
      if (t) obj.keepsakes.push({ kind: OBJECTS[d.objectId].keepsakeKind ?? 'note', by: r, day: s.day, text: t.text })
    }
    s.objects[d.objectId] = obj
    s.collection.push(d.objectId)
    s.donationsGiven.push(d.objectId)
    s.report.donations.push({ objectId: d.objectId, from, note: d.note, day: s.day })
  }
}

function shelfNotes(before: number, s: GameState) {
  const after = shelfSize(s)
  if (after > before)
    s.report.notes.push(
      after === 7
        ? 'Tobias came by and fixed the wobbly end of the display table. There’s room for seven things on it now.'
        : 'Hollis measured the display table and found room for one more thing. Eight now. He apologised for the maths.',
    )
}

export function toEvening(state: GameState): GameState {
  if (state.phase !== 'echoes') return state
  const s = clone(state)
  const before = shelfSize(state)
  processReturns(s, false)
  processDonations(s)
  shelfNotes(before, s)
  s.phase = 'evening'
  return s
}

/** Lantern Night: everything comes home at the end of the festival. */
export function toFestival(state: GameState): GameState {
  if (state.phase !== 'echoes' || !isFestivalDay(state)) return state
  const s = clone(state)
  processReturns(s, true)
  processDonations(s)
  s.phase = 'festival'
  return s
}

export function finishFestival(state: GameState): GameState {
  if (state.phase !== 'festival') return state
  const s = clone(state)
  s.festivalDone = true
  s.phase = 'epilogue'
  return s
}

export function sleep(state: GameState): GameState {
  if (state.phase !== 'evening' && state.phase !== 'epilogue') return state
  const s = clone(state)
  s.day += 1
  return beginDay(s)
}

// ———————————————————————————————————————————————————————————— morning hints

/**
 * Overheard gossip for the notice board: what today's visitors have been up to,
 * plus — when an object's history could bring two people together — a nudge.
 */
export function morningHints(s: GameState): { overheard: string[]; provenance?: string } {
  const overheard = s.visits.map((v) => REQUESTS_BY_ID[v.requestId]?.hint).filter(Boolean).slice(0, 3)
  if (isFestivalDay(s)) return { overheard }
  const ctx: ResolveCtx = {
    s,
    day: s.day,
    weather: weatherFor(s, s.day),
    festival: false,
    busy: {},
    rng: rngFor(s.seed, 'hint', s.day),
  }
  for (const v of s.visits) {
    for (const objectId of s.collection) {
      if (isOut(s, objectId)) continue
      const loan: Loan = { objectId, residentId: v.residentId, requestId: v.requestId, day: s.day, returnDay: s.day }
      const best = candidatesFor(ctx, loan)[0]
      if (!best?.other || best.priority < 67) continue
      if (!best.trace && best.def.other?.kind !== 'prev') continue
      return {
        overheard,
        provenance: `${RESIDENTS[v.residentId].short} has been wondering what became of the ${OBJECTS[objectId].short}.`,
      }
    }
  }
  return { overheard }
}

// ———————————————————————————————————————————————————————————— previews for the counter

export interface Reaction {
  tone: 'yes' | 'hmm' | 'huh'
  line: string
  plan: string
  memory?: string
}

/** What a visitor says when you offer them something (before you stamp it). */
export function reactionFor(s: GameState, objectId: ObjectId): Reaction | undefined {
  const visit = currentVisit(s)
  if (!visit) return undefined
  const req = REQUESTS_BY_ID[visit.requestId]
  const res = RESIDENTS[visit.residentId]
  const overlap = OBJECTS[objectId].tags.filter((t) => req.tags.includes(t)).length
  const tone = overlap >= 2 ? 'yes' : overlap === 1 ? 'hmm' : 'huh'
  const rng = rngFor(s.seed, 'react', s.day, visit.residentId, objectId)
  const line = fill(pick(rng, res.react[tone]), { borrower: visit.residentId, objectId })
  const loan: Loan = { objectId, residentId: visit.residentId, requestId: visit.requestId, day: s.day, returnDay: s.day }
  const ctx: ResolveCtx = {
    s,
    day: s.day,
    weather: weatherFor(s, s.day),
    festival: isFestivalDay(s),
    busy: {},
    rng: rngFor(s.seed, 'preview', s.day),
  }
  const best = bestFor(ctx, loan)
  const loc = LOCATIONS[best?.location ?? 'green']
  const plan = isFestivalDay(s)
    ? 'I’ll bring it to the Green tonight.'
    : best?.time === 'night'
      ? loc.planLineNight
      : loc.planLine
  let memory: string | undefined
  if (best?.trace) {
    const who = RESIDENTS[best.trace.by].short
    memory =
      best.trace.kind === 'keepsake'
        ? `Oh — there’s something of ${who}’s tucked inside.`
        : `Is that ${who}’s ${markLabel(best.trace.mark!)}?`
  }
  return { tone, line, plan, memory }
}
