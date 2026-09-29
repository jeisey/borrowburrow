// Helpers for driving the engine directly in tests (not used by the game itself).
import { closeForAfternoon, newGame, openDoors, sleep, toEvening } from './engine'
import type { GameState, ObjectId, ResidentId, Weather } from './types'
import { WEATHER_PATTERNS } from './content/world'

/** A seed whose weather pattern matches, e.g. pattern 0 = sunny, windy, rainy, foggy... */
export function seedForPattern(pattern: number, base = 1000): number {
  let seed = base
  while (seed % WEATHER_PATTERNS.length !== pattern) seed++
  return seed
}

export function gameWithWeather(weather: Weather[], base = 1000): GameState {
  const pattern = WEATHER_PATTERNS.findIndex((p) => weather.every((w, i) => p[i] === w))
  if (pattern < 0) throw new Error(`no weather pattern starts ${weather.join(',')}`)
  return newGame(seedForPattern(pattern, base))
}

/**
 * Run one whole day with exactly these lends, bypassing the visitor planner.
 * Objects are placed on the shelf automatically (even if the shelf is "full").
 */
export function runDay(state: GameState, lends: [ResidentId, string, ObjectId][]): GameState {
  let s: GameState = structuredClone(state)
  for (const [r] of lends) if (!s.present.includes(r)) s.present.push(r)
  s.visits = lends.map(([residentId, requestId]) => ({ residentId, requestId }))
  s.shelf = lends.map(([, , obj]) => obj)
  s = openDoors(s)
  for (const [, , obj] of lends) {
    const v = s.visits[s.visitIndex]
    v.lent = obj
    s.loans.push({ objectId: obj, residentId: v.residentId, requestId: v.requestId, day: s.day, returnDay: s.day })
    s.shelf = s.shelf.filter((x) => x !== obj)
    s.visitIndex++
  }
  return closeForAfternoon(s)
}

/** Close the day out: evening returns and donations, then sleep into the next morning. */
export function endDay(state: GameState): GameState {
  return sleep(toEvening(state))
}

export function ensureObject(state: GameState, id: ObjectId): GameState {
  const s = structuredClone(state)
  if (!s.collection.includes(id)) s.collection.push(id)
  if (!s.objects[id]) s.objects[id] = { id, acquiredDay: s.day, history: [], marks: [], keepsakes: [] }
  return s
}
