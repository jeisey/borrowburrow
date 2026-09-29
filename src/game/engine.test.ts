import { describe, expect, it } from 'vitest'
import {
  allVisitorsServed,
  closeForAfternoon,
  currentVisit,
  feature,
  finishFestival,
  lend,
  morningHints,
  newGame,
  openDoors,
  reactionFor,
  sleep,
  toEvening,
  toFestival,
  unfeature,
  weatherFor,
} from './engine'
import { festivalSegments } from './content/festival'
import { OBJECTS } from './content/objects'
import { REQUESTS_BY_ID } from './content/requests'
import { deriveThreads, partnersOf, photos, shelfSize, strandCount } from './query'
import { mulberry32, seedFromUrl } from './rng'
import { endDay, ensureObject, gameWithWeather, runDay } from './testkit'
import type { GameState, ObjectId } from './types'

const history = (s: GameState, id: ObjectId) => s.objects[id]!.history

describe('a new week', () => {
  it('opens on day one with the first two visitors and an empty display table', () => {
    const s = newGame(42)
    expect(s.day).toBe(1)
    expect(s.phase).toBe('morning')
    expect(s.collection.length).toBe(12)
    expect(s.shelf).toEqual([])
    expect(s.visits.map((v) => v.requestId)).toEqual(['tansy_moon', 'barnaby_rut'])
    expect(s.present).not.toContain('hollis')
  })

  it('lets you feature up to the shelf size, only in the morning', () => {
    let s = newGame(42)
    for (const id of s.collection) s = feature(s, id)
    expect(s.shelf.length).toBe(shelfSize(s))
    const first = s.shelf[0]
    s = unfeature(s, first)
    expect(s.shelf).not.toContain(first)
    s = openDoors(s)
    expect(feature(s, first)).toBe(s)
  })

  it('lending hands the object over and moves to the next visitor', () => {
    let s = feature(feature(newGame(42), 'telescope'), 'kite')
    s = openDoors(s)
    expect(currentVisit(s)?.residentId).toBe('tansy')
    s = lend(s, 'telescope')
    expect(s.loans).toHaveLength(1)
    expect(s.loans[0]).toMatchObject({ objectId: 'telescope', residentId: 'tansy' })
    expect(s.shelf).not.toContain('telescope')
    expect(currentVisit(s)?.residentId).toBe('barnaby')
    s = lend(s, 'kite')
    expect(allVisitorsServed(s)).toBe(true)
  })

  it('visitors react differently depending on what you offer', () => {
    let s = feature(feature(newGame(42), 'telescope'), 'toolbox')
    s = ensureObject(s, 'toolbox')
    s = openDoors(s)
    expect(reactionFor(s, 'telescope')?.tone).toBe('yes')
    expect(reactionFor(s, 'telescope')?.plan).toMatch(/Hill/)
  })
})

describe('echoes and provenance', () => {
  it('every loan produces an echo that is written permanently into the object’s history', () => {
    const s = runDay(gameWithWeather(['sunny']), [
      ['tansy', 'tansy_moon', 'telescope'],
      ['barnaby', 'barnaby_rut', 'kite'],
    ])
    expect(s.phase).toBe('echoes')
    expect(s.report.echoes.length).toBeGreaterThanOrEqual(2)
    const tele = history(s, 'telescope')
    expect(tele).toHaveLength(1)
    expect(tele[0]).toMatchObject({ borrower: 'tansy', location: 'hill', echoId: 'tele_tansy_first' })
    expect(s.objects.telescope!.marks.map((m) => m.id)).toContain('starSticker')
    expect(s.flags.tansy_stargazed).toBe(1)
  })

  it('objects come back in the evening, and the first donation arrives', () => {
    let s = runDay(gameWithWeather(['sunny']), [['tansy', 'tansy_moon', 'telescope']])
    s = toEvening(s)
    expect(s.phase).toBe('evening')
    expect(s.report.returned).toEqual(['telescope'])
    expect(s.loans).toHaveLength(0)
    expect(s.report.donations.map((d) => d.objectId)).toContain('toolbox')
    expect(s.collection).toContain('toolbox')
  })

  it('a telescope that remembers Tansy’s stargazing brings Odile and Tansy together', () => {
    // Day 1 (clear): Tansy looks at the Moon. Day 2 (clear, windy): Odile borrows the same telescope.
    let s = runDay(gameWithWeather(['sunny', 'windy']), [['tansy', 'tansy_moon', 'telescope']])
    s = endDay(s)
    expect(strandCount(s, 'odile', 'tansy')).toBe(0)
    s = runDay(s, [['odile', 'odile_early', 'telescope']])
    const saturn = s.report.echoes.find((e) => e.echoId === 'tele_saturn')
    expect(saturn).toBeDefined()
    expect(saturn!.cast).toEqual(['odile', 'tansy'])
    expect(saturn!.threads).toEqual([{ a: 'odile', b: 'tansy', isNew: true }])
    expect(history(s, 'telescope').map((e) => e.borrower)).toEqual(['tansy', 'odile'])
    expect(s.objects.telescope!.marks.map((m) => m.id)).toEqual(['starSticker', 'saturnSticker'])
    expect(strandCount(s, 'odile', 'tansy')).toBe(1)
  })

  it('a fresh telescope with no history cannot produce that meeting', () => {
    const s = runDay(gameWithWeather(['sunny']), [['odile', 'odile_early', 'telescope']])
    expect(s.report.echoes.some((e) => e.echoId === 'tele_saturn')).toBe(false)
    expect(strandCount(s, 'odile', 'tansy')).toBe(0)
  })

  it('things left inside objects are found by the next borrower, once', () => {
    // Tobias leaves his waltz in the record player; Barnaby finds it and goes round.
    let s = runDay(gameWithWeather(['sunny', 'windy', 'rainy']), [['tobias', 'tobias_quiet', 'recordPlayer']])
    expect(s.objects.recordPlayer!.keepsakes.at(-1)).toMatchObject({ by: 'tobias', kind: 'record' })
    s = endDay(s)
    s = runDay(s, [['barnaby', 'barnaby_afternoon', 'recordPlayer']])
    const waltz = s.report.echoes.find((e) => e.echoId === 'rec_barnaby_waltz')
    expect(waltz).toBeDefined()
    expect(waltz!.text).toContain('Hollyhock Waltz')
    expect(s.objects.recordPlayer!.keepsakes[0].foundBy).toContain('barnaby')
    expect(strandCount(s, 'barnaby', 'tobias')).toBe(1)
    // Barnaby borrowing it again does not "find" the same record twice.
    s = endDay(s)
    s = runDay(s, [['barnaby', 'barnaby_rain', 'recordPlayer']])
    expect(s.report.echoes.some((e) => e.echoId === 'rec_barnaby_waltz' || e.echoId === 'trace_recordPlayer')).toBe(
      false,
    )
  })

  it('generic trace scenes follow marks back to whoever left them', () => {
    let s = runDay(gameWithWeather(['sunny', 'windy']), [['tansy', 'tansy_underfoot', 'umbrella']])
    s = endDay(s)
    s = runDay(s, [['hollis', 'hollis_hello', 'umbrella']])
    const echo = s.report.echoes[0]
    expect(echo.echoId).toBe('trace_umbrella')
    expect(echo.cast).toEqual(['hollis', 'tansy'])
    expect(echo.text).toMatch(/Tansy’s/)
    expect(echo.text).not.toMatch(/\{\w+\}/)
    // Hollis leaves his own little mark beside the one he followed.
    const marks = s.objects.umbrella!.marks
    expect(marks.map((m) => [m.by, m.id])).toEqual([
      ['tansy', 'mudSplash'],
      ['hollis', 'doodle'],
    ])
    expect(marks[0].foundBy).toEqual(['hollis'])
  })

  it('two loans meeting on the same clear night become one shared moment', () => {
    let s = gameWithWeather(['sunny'])
    s = runDay(s, [
      ['tansy', 'tansy_moon', 'telescope'],
      ['barnaby', 'barnaby_rut', 'lantern'],
    ])
    const joint = s.report.echoes.find((e) => e.kind === 'joint')
    expect(joint?.echoId).toBe('joint_hill_lantern')
    // Remembered by both objects…
    expect(history(s, 'telescope')[0].with).toEqual(['barnaby'])
    expect(history(s, 'lantern')[0].with).toEqual(['tansy'])
    // …but counted as a single strand between them.
    expect(strandCount(s, 'tansy', 'barnaby')).toBe(1)
  })

  it('threads are derived entirely from object histories', () => {
    let s = runDay(gameWithWeather(['sunny', 'windy']), [['barnaby', 'barnaby_rut', 'camera']])
    const threads = deriveThreads(s)
    expect(threads).toHaveLength(1)
    expect(threads[0]).toMatchObject({ a: 'odile', b: 'barnaby' })
    expect(threads[0].strands[0].objectId).toBe('camera')
    // Wipe the camera's memory and the thread is gone too.
    s = structuredClone(s)
    s.objects.camera!.history = []
    expect(deriveThreads(s)).toHaveLength(0)
  })

  it('planting schedules a bloom days later that ties people together', () => {
    let s = runDay(gameWithWeather(['sunny', 'windy', 'rainy', 'foggy']), [['tansy', 'tansy_moon', 'gardenKit']])
    expect(s.scheduled).toContainEqual({ day: 4, id: 'bloom_sunflowers', by: 'tansy', objectId: 'gardenKit' })
    s = endDay(s)
    s = endDay(runDay(s, [['barnaby', 'barnaby_wind', 'kite']]))
    s = endDay(runDay(s, [['margo', 'margo_rain', 'paints']]))
    expect(s.day).toBe(4)
    s = runDay(s, [['tobias', 'tobias_fog', 'thermos']])
    const bloom = s.report.echoes.find((e) => e.echoId === 'bloom_sunflowers')
    expect(bloom).toBeDefined()
    expect(s.flags.sunflowers_bloomed).toBe(4)
    expect(strandCount(s, 'tansy', 'odile')).toBe(1)
  })

  it('fixing the Glasshouse door opens a location and brings a donation that evening', () => {
    let s = endDay(runDay(gameWithWeather(['sunny']), [['tansy', 'tansy_moon', 'telescope']]))
    expect(s.collection).toContain('toolbox')
    s = runDay(s, [['margo', 'margo_glasshouse', 'toolbox']])
    expect(s.report.echoes.map((e) => e.echoId)).toEqual(expect.arrayContaining(['tool_margo_glass', 'glasshouse_opens']))
    expect(s.flags.glasshouse_open).toBe(2)
    s = toEvening(s)
    expect(s.report.donations.map((d) => d.objectId)).toContain('flowerPress')
  })

  it('Barnaby and Odile’s growing thread eventually produces Four O’Clock', () => {
    let s = runDay(gameWithWeather(['sunny', 'windy', 'rainy']), [['barnaby', 'barnaby_rut', 'camera']])
    s = endDay(s)
    s = runDay(s, [['barnaby', 'barnaby_odile', 'thermos']])
    expect(strandCount(s, 'barnaby', 'odile')).toBe(2)
    expect(s.report.echoes.some((e) => e.echoId === 'four_oclock')).toBe(true)
  })

  it('the album holds the camera’s photographs', () => {
    let s = runDay(gameWithWeather(['sunny', 'windy', 'rainy']), [['barnaby', 'barnaby_rut', 'camera']])
    s = endDay(s)
    s = runDay(s, [['hollis', 'hollis_hello', 'camera']])
    expect(photos(s).length).toBe(2)
    s = toEvening(s)
    expect(s.collection).toContain('album')
  })
})

describe('determinism', () => {
  it('a week can be chosen from the page address', () => {
    expect(seedFromUrl('?seed=48213')).toBe(48213)
    expect(seedFromUrl('?seed=0')).toBe(0)
    for (const bad of ['', '?seed=', '?seed=moss', '?seed=-4', '?seed=1.5']) expect(seedFromUrl(bad)).toBeUndefined()
  })

  it('the same seed and the same choices produce the same week', () => {
    const play = () => {
      let s = newGame(777)
      for (let d = 0; d < 3; d++) {
        for (const id of s.collection) s = feature(s, id)
        s = openDoors(s)
        while (!allVisitorsServed(s)) s = lend(s, s.shelf[0])
        s = sleep(toEvening(closeForAfternoon(s)))
      }
      return s
    }
    expect(JSON.stringify(play())).toBe(JSON.stringify(play()))
  })
})

/** Play whole weeks with a simple policy and check the game always reaches a good ending. */
function playWeek(seed: number, policy: 'fit' | 'random'): GameState {
  const rng = mulberry32(seed)
  let s = newGame(seed)
  let guard = 0
  while (s.phase !== 'epilogue' && guard++ < 50) {
    const avail = s.collection.filter((id) => !s.loans.some((l) => l.objectId === id))
    for (const id of [...avail].sort(() => rng() - 0.5)) s = feature(s, id)
    s = openDoors(s)
    while (!allVisitorsServed(s)) {
      const v = currentVisit(s)!
      if (!s.shelf.length) break
      const tags = REQUESTS_BY_ID[v.requestId].tags
      const choice =
        policy === 'fit'
          ? [...s.shelf].sort(
              (a, b) =>
                OBJECTS[b].tags.filter((t) => tags.includes(t)).length -
                OBJECTS[a].tags.filter((t) => tags.includes(t)).length,
            )[0]
          : s.shelf[Math.floor(rng() * s.shelf.length)]
      s = lend(s, choice)
    }
    while (!allVisitorsServed(s)) s = { ...s, visitIndex: s.visitIndex + 1 }
    s = closeForAfternoon(s)
    if (s.day === 7) {
      s = finishFestival(toFestival(s))
    } else {
      s = sleep(toEvening(s))
    }
  }
  return s
}

describe('whole weeks', () => {
  it('always reach Lantern Night and an epilogue, with no unfilled text', () => {
    for (let i = 0; i < 24; i++) {
      const s = playWeek(1000 + i * 31, i % 2 ? 'fit' : 'random')
      expect(s.phase).toBe('epilogue')
      expect(s.festivalDone).toBe(true)
      expect(festivalSegments(s).length).toBeGreaterThan(0)
      for (const obj of Object.values(s.objects)) {
        for (const e of obj!.history) {
          expect(e.text, e.echoId).not.toMatch(/\{\w+\}/)
          expect(e.title, e.echoId).not.toMatch(/\{\w+\}/)
        }
        for (const k of obj!.keepsakes) expect(k.text).not.toMatch(/\{\w+\}/)
      }
      expect(deriveThreads(s).length).toBeGreaterThan(3)
      expect(s.collection.length).toBeGreaterThanOrEqual(15)
    }
  })

  it('different choices lead to different villages', () => {
    const shapes = new Set<string>()
    for (let i = 0; i < 12; i++) {
      const s = playWeek(5000 + i, i % 2 ? 'fit' : 'random')
      shapes.add(
        deriveThreads(s)
          .map((t) => t.key)
          .sort()
          .join(','),
      )
    }
    expect(shapes.size).toBeGreaterThan(6)
  })

  it('Hollis arrives on day two and can make friends', () => {
    const s = playWeek(4242, 'fit')
    expect(s.present).toContain('hollis')
    expect(partnersOf(s, 'hollis').length).toBeGreaterThan(0)
  })

  it('the morning can hint at a provenance opportunity', () => {
    let s = runDay(gameWithWeather(['sunny', 'windy']), [['tansy', 'tansy_moon', 'telescope']])
    s = endDay(s)
    s = structuredClone(s)
    s.visits = [{ residentId: 'odile', requestId: 'odile_early' }]
    expect(morningHints(s).provenance?.text).toMatch(/telescope.*Tansy.*Odile/)
    expect(weatherFor(s, 2)).toBe('windy')
  })
})
