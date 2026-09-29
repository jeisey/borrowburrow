import type {
  GameState,
  LocationId,
  MarkId,
  ObjectId,
  PropMode,
  ResidentId,
  SceneFx,
  TimeOfDay,
  Weather,
} from './types'

/**
 * Who else takes part in an Echo.
 *  - resident:     a specific neighbour (must be in the village and free)
 *  - prev:         the most recent earlier borrower of this object (optionally with a tag)
 *  - trace:        whoever left the most recent keepsake/mark on this object that
 *                  this borrower hasn't discovered yet — the heart of provenance
 *  - any:          any free neighbour; by default preferring people the borrower isn't tied to yet
 *                  (bias 'known' prefers existing friends instead — used on Lantern Night)
 *  - photoSubject: someone who appears in a photograph taken with the camera
 */
export type OtherSpec =
  | { kind: 'resident'; id: ResidentId }
  | { kind: 'prev'; tag?: string }
  | { kind: 'trace'; by?: ResidentId; keepsakeOnly?: boolean }
  | { kind: 'any'; prefer?: ResidentId[]; bias?: 'new' | 'known' }
  | { kind: 'photoSubject' }

/** A condition on the object's provenance (its history entries). */
export interface HistoryCond {
  tag?: string
  /** Whose entries count: someone other than the borrower, the borrower, or a named resident. */
  by?: 'other' | 'self' | ResidentId
  /** Minimum number of matching entries (default 1). */
  min?: number
}

export interface KeepsakeSpec {
  text: string
  subject?: 'other' | ResidentId
  place?: LocationId
}

export interface EchoDef {
  id: string
  title: string
  text: string
  // ——— conditions ———
  object: ObjectId | ObjectId[]
  resident?: ResidentId | ResidentId[]
  notResident?: ResidentId[]
  weather?: Weather[]
  notWeather?: Weather[]
  /** true: needs a clear night (sunny/windy). false: needs a cloudy one. */
  clearNight?: boolean
  requests?: string[]
  requestTags?: string[]
  minDay?: number
  maxDay?: number
  flags?: string[]
  notFlags?: string[]
  open?: LocationId
  closed?: LocationId
  history?: HistoryCond
  other?: OtherSpec
  festival?: boolean
  /** Casual scenes only happen some of the time (seeded), so the village isn't knitted by default. */
  chance?: number
  priority: number
  once?: boolean
  // ——— outcome ———
  location?: LocationId | 'home'
  time?: TimeOfDay
  indoor?: boolean
  mode?: PropMode
  fx?: SceneFx
  mark?: MarkId
  markNote?: string
  tags?: string[]
  flagsSet?: string[]
  /** true = the resident's default keepsake for this object (see keepsakes.ts). */
  keepsake?: boolean | KeepsakeSpec
  returnsIn?: number
  schedule?: { inDays: number; id: string }
  /** Sewing: also mend one well-travelled fabric object waiting on the shelves. */
  mend?: boolean
}

export interface JointRole {
  object: ObjectId[]
  resident?: ResidentId[]
}

/** Two loans on the same day that meet in the world. */
export interface JointEchoDef {
  id: string
  title: string
  text: string
  a: JointRole
  b: JointRole
  weather?: Weather[]
  notWeather?: Weather[]
  clearNight?: boolean
  closed?: LocationId
  flags?: string[]
  notFlags?: string[]
  priority: number
  once?: boolean
  location: LocationId | 'homeA'
  time: TimeOfDay
  indoor?: boolean
  fx?: SceneFx
  markA?: MarkId
  markB?: MarkId
  tags: string[]
  flagsSet?: string[]
  keepsakeA?: boolean | KeepsakeSpec
  keepsakeB?: boolean | KeepsakeSpec
}

/** Context handed to Happening rules. */
export interface HappeningCtx {
  state: GameState
  day: number
  weather: Weather
  scheduledBy?: ResidentId
}

export interface HappeningFire {
  title: string
  text: string
  cast: ResidentId[]
  objects: ObjectId[]
  location: LocationId
  time: TimeOfDay
  fx?: SceneFx
  unlocks?: string[]
  /** A provenance entry to write onto an object (this is how happenings tie Threads). */
  entry?: { objectId: ObjectId; borrower: ResidentId; with: ResidentId[]; group?: boolean; tags: string[] }
  flagsSet?: string[]
}

/** Village-scale events that emerge from state: blooms, clubs, truces, letters. */
export interface HappeningDef {
  id: string
  /** Scheduled happenings fire only when an Echo scheduled them for today. */
  scheduled?: boolean
  /** Story beats: at most one major happening per day, so they arrive one at a time. */
  major?: boolean
  once?: boolean
  fire: (ctx: HappeningCtx) => HappeningFire | null
}

export interface DonationDef {
  objectId: ObjectId
  from: ResidentId | ((s: GameState) => ResidentId)
  note: string
  when: (s: GameState) => boolean
  /** Safety net: after this day it arrives regardless, so every week's library grows. */
  fallbackDay?: number
  /** Residents whose default keepsakes arrive already inside it (e.g. the club's named constellations). */
  seedKeepsakesFrom?: (s: GameState) => ResidentId[]
}
