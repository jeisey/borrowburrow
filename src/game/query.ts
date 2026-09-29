import { OBJECTS } from './content/objects'
import type {
  GameState,
  Keepsake,
  LocationId,
  ObjectId,
  ObjectState,
  ProvenanceEntry,
  ResidentId,
  Strand,
  Thread,
} from './types'
import { RESIDENT_IDS } from './types'

/** Stable key for an unordered pair of residents. */
export function pairKey(a: ResidentId, b: ResidentId): string {
  const [x, y] = RESIDENT_IDS.indexOf(a) <= RESIDENT_IDS.indexOf(b) ? [a, b] : [b, a]
  return `${x}|${y}`
}

function entryPairs(entry: ProvenanceEntry): [ResidentId, ResidentId][] {
  const pairs: [ResidentId, ResidentId][] = []
  const people = [entry.borrower, ...entry.with.filter((w) => w !== entry.borrower)]
  if (entry.group) {
    for (let i = 0; i < people.length; i++)
      for (let j = i + 1; j < people.length; j++) pairs.push([people[i], people[j]])
  } else {
    for (const w of people.slice(1)) pairs.push([entry.borrower, w])
  }
  return pairs
}

/**
 * Threads are never stored: they are derived from object provenance, so every
 * relationship in the village can always be traced back to a borrowed thing.
 */
export function deriveThreads(state: Pick<GameState, 'objects'>): Thread[] {
  const map = new Map<string, Thread>()
  // A joint moment is remembered by both objects involved, but it is one shared moment.
  const counted = new Set<string>()
  for (const obj of Object.values(state.objects) as ObjectState[]) {
    for (const entry of obj.history) {
      for (const [a, b] of entryPairs(entry)) {
        const key = pairKey(a, b)
        const momentKey = `${key}:${entry.day}:${entry.echoId}`
        if (counted.has(momentKey)) continue
        counted.add(momentKey)
        const [x, y] = key.split('|') as [ResidentId, ResidentId]
        const strand: Strand = { a: x, b: y, day: entry.day, objectId: obj.id, echoId: entry.echoId, title: entry.title }
        const t = map.get(key)
        if (t) t.strands.push(strand)
        else map.set(key, { key, a: x, b: y, strands: [strand] })
      }
    }
  }
  const threads = [...map.values()]
  for (const t of threads) t.strands.sort((p, q) => p.day - q.day)
  return threads.sort((p, q) => p.strands[0].day - q.strands[0].day || p.key.localeCompare(q.key))
}

export function strandCount(state: Pick<GameState, 'objects'>, a: ResidentId, b: ResidentId): number {
  const key = pairKey(a, b)
  return deriveThreads(state).find((t) => t.key === key)?.strands.length ?? 0
}

export function partnersOf(state: Pick<GameState, 'objects'>, r: ResidentId): ResidentId[] {
  const out = new Set<ResidentId>()
  for (const t of deriveThreads(state)) {
    if (t.a === r) out.add(t.b)
    else if (t.b === r) out.add(t.a)
  }
  return [...out]
}

export function objectState(state: Pick<GameState, 'objects'>, id: ObjectId): ObjectState | undefined {
  return state.objects[id]
}

/** Every photograph the camera has taken, oldest first. The album shows these. */
export function photos(state: Pick<GameState, 'objects'>): Keepsake[] {
  return (state.objects.camera?.keepsakes ?? []).filter((k) => k.kind === 'photo')
}

export function isOpen(state: Pick<GameState, 'flags'>, loc: LocationId): boolean {
  if (loc === 'glasshouse') return state.flags.glasshouse_open !== undefined
  return true
}

export function hasFlag(state: Pick<GameState, 'flags'>, flag: string): boolean {
  return state.flags[flag] !== undefined
}

/** Everyone who has looked at the sky through something borrowed. */
export function stargazers(state: Pick<GameState, 'objects'>): ResidentId[] {
  const out: ResidentId[] = []
  for (const id of ['telescope', 'lantern', 'starChart', 'camera', 'binoculars'] as ObjectId[]) {
    for (const e of state.objects[id]?.history ?? []) {
      if (!e.tags.includes('stargazing')) continue
      for (const r of [e.borrower, ...e.with]) if (!out.includes(r)) out.push(r)
    }
  }
  return out
}

export function timesBorrowed(obj: ObjectState): number {
  return obj.history.filter((e) => e.kind === 'echo' || e.kind === 'joint' || e.kind === 'festival').length
}

export function borrowersOf(obj: ObjectState): ResidentId[] {
  const out: ResidentId[] = []
  for (const e of obj.history)
    if ((e.kind === 'echo' || e.kind === 'joint' || e.kind === 'festival') && !out.includes(e.borrower)) out.push(e.borrower)
  return out
}

export function isOut(state: Pick<GameState, 'loans'>, id: ObjectId): boolean {
  return state.loans.some((l) => l.objectId === id)
}

/** Total distinct pairs of neighbours tied by at least one strand. */
export function threadCount(state: Pick<GameState, 'objects'>): number {
  return deriveThreads(state).length
}

export function shelfSize(state: Pick<GameState, 'objects'>): number {
  const n = threadCount(state)
  return 6 + (n >= 3 ? 1 : 0) + (n >= 6 ? 1 : 0)
}

export function objectName(id: ObjectId): string {
  return OBJECTS[id].name
}
