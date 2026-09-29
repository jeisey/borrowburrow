import { describe, expect, it } from 'vitest'
import { ECHOES } from './content/echoes'
import { FESTIVAL_ECHOES } from './content/festival'
import { DONATIONS, HAPPENINGS } from './content/happenings'
import { JOINT_ECHOES } from './content/joints'
import { KEEPSAKES } from './content/keepsakes'
import { OBJECTS } from './content/objects'
import { REQUESTS } from './content/requests'
import { RESIDENTS } from './content/residents'
import { LOCATIONS, MARKS } from './content/world'
import { fill } from './text'
import { OBJECT_IDS, RESIDENT_IDS, type ObjectId } from './types'

const arr = <T,>(v: T | T[]) => (Array.isArray(v) ? v : [v])
const ENGINE_FILLED = ['keepsake', 'mark', 'latest', 'photoCount', 'traceFound', 'social']

function unresolved(template: string, extraKeys: string[] = []): string[] {
  const extra = Object.fromEntries([...ENGINE_FILLED, ...extraKeys].map((k) => [k, 'X']))
  const out = fill(template, { borrower: 'tansy', other: 'odile', objectId: 'kite', location: 'hill', extra })
  return out.match(/\{\w+\}/g) ?? []
}

describe('content integrity', () => {
  it('every echo points at real objects, residents, marks and locations', () => {
    for (const e of [...ECHOES, ...FESTIVAL_ECHOES]) {
      for (const o of arr(e.object)) expect(OBJECT_IDS).toContain(o)
      for (const r of e.resident ? arr(e.resident) : []) expect(RESIDENT_IDS).toContain(r)
      if (e.mark && e.mark !== 'signature') expect(MARKS[e.mark]).toBeDefined()
      if (e.location && e.location !== 'home') expect(LOCATIONS[e.location]).toBeDefined()
      if (e.other?.kind === 'resident') expect(RESIDENT_IDS).toContain(e.other.id)
    }
  })

  it('echo ids are unique', () => {
    const ids = [...ECHOES, ...FESTIVAL_ECHOES, ...JOINT_ECHOES].map((e) => e.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('echo templates only use placeholders the engine knows', () => {
    for (const e of [...ECHOES, ...FESTIVAL_ECHOES]) {
      expect(unresolved(e.title), e.id).toEqual([])
      expect(unresolved(e.text), e.id).toEqual([])
      if (e.markNote) expect(unresolved(e.markNote), e.id).toEqual([])
      if (e.keepsake && typeof e.keepsake === 'object') expect(unresolved(e.keepsake.text), e.id).toEqual([])
    }
    for (const j of JOINT_ECHOES) {
      const keys = ['a', 'b', 'A', 'B', 'objA', 'objB']
      expect(unresolved(j.text, keys), j.id).toEqual([])
      for (const k of [j.keepsakeA, j.keepsakeB])
        if (k && typeof k === 'object') expect(unresolved(k.text, keys), j.id).toEqual([])
    }
    for (const id of OBJECT_IDS) {
      const t = OBJECTS[id].trace
      expect(unresolved(t.mark), id).toEqual([])
      if (t.keepsake) expect(unresolved(t.keepsake), id).toEqual([])
    }
    for (const r of RESIDENT_IDS) expect(unresolved(RESIDENTS[r].social)).toEqual([])
  })

  it('every object always has an unconditional solo echo to fall back on', () => {
    for (const id of OBJECT_IDS) {
      const solo = ECHOES.find(
        (e) =>
          arr(e.object).includes(id) &&
          !e.other &&
          !e.resident &&
          !e.weather &&
          !e.notWeather &&
          e.clearNight === undefined &&
          !e.flags &&
          !e.requests &&
          !e.requestTags &&
          !e.once,
      )
      expect(solo, id).toBeDefined()
    }
  })

  it('every object can be brought to Lantern Night', () => {
    for (const id of OBJECT_IDS) expect(FESTIVAL_ECHOES.some((e) => arr(e.object).includes(id)), id).toBe(true)
  })

  it('objects that hold keepsakes know what every resident leaves behind', () => {
    for (const id of OBJECT_IDS.filter((o) => OBJECTS[o].keepsakeKind && o !== 'album')) {
      const table = KEEPSAKES[id as ObjectId]
      expect(table, id).toBeDefined()
      for (const r of RESIDENT_IDS) expect(table?.[r], `${id}/${r}`).toBeDefined()
    }
  })

  it('every resident has a repeatable request and a festival request', () => {
    for (const r of RESIDENT_IDS) {
      expect(REQUESTS.some((q) => q.resident === r && q.repeatable), r).toBe(true)
      expect(REQUESTS.some((q) => q.resident === r && q.day === 7), r).toBe(true)
    }
  })

  it('requests usually have several plausible answers in the collection', () => {
    for (const q of REQUESTS.filter((x) => !x.repeatable)) {
      const matches = OBJECT_IDS.filter((o) => OBJECTS[o].tags.some((t) => q.tags.includes(t)))
      expect(matches.length, q.id).toBeGreaterThanOrEqual(3)
    }
  })

  it('happenings and donations are well formed', () => {
    const ids = HAPPENINGS.map((h) => h.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const e of ECHOES) if (e.schedule) expect(ids, e.id).toContain(e.schedule.id)
    for (const d of DONATIONS) expect(OBJECTS[d.objectId].starting).toBe(false)
  })
})
