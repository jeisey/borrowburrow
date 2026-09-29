// Core types for Borrowburrow. Content lives in ./content, rules in ./engine.

export const RESIDENT_IDS = ['odile', 'barnaby', 'tansy', 'tobias', 'margo', 'hollis'] as const
export type ResidentId = (typeof RESIDENT_IDS)[number]

export const OBJECT_IDS = [
  'telescope',
  'blanket',
  'camera',
  'recordPlayer',
  'cakeTin',
  'kite',
  'boardGame',
  'thermos',
  'lantern',
  'umbrella',
  'paints',
  'gardenKit',
  'toolbox',
  'birdGuide',
  'binoculars',
  'album',
  'sewingBasket',
  'flowerPress',
  'starChart',
] as const
export type ObjectId = (typeof OBJECT_IDS)[number]

export type LocationId = 'burrow' | 'green' | 'kettleRow' | 'millpond' | 'hill' | 'glasshouse'
export type Weather = 'sunny' | 'windy' | 'rainy' | 'foggy'
export type TimeOfDay = 'day' | 'dusk' | 'night'
export type Phase = 'morning' | 'open' | 'echoes' | 'evening' | 'festival' | 'epilogue'

export type MarkId =
  | 'starSticker'
  | 'saturnSticker'
  | 'moonSticker'
  | 'noteSticker'
  | 'scratch'
  | 'ribbon'
  | 'pressedFlower'
  | 'label'
  | 'charm'
  | 'patch'
  | 'photo'
  | 'jamStain'
  | 'grassStain'
  | 'teaRing'
  | 'mudSplash'
  | 'paintDab'
  | 'dent'
  | 'feather'
  | 'button'
  | 'flourPrint'
  | 'clover'
  | 'doodle'
  | 'knot'
  | 'leaf'
  | 'waxDrip'

export type KeepsakeKind =
  | 'photo'
  | 'painting'
  | 'record'
  | 'recipe'
  | 'score'
  | 'note'
  | 'planting'
  | 'pressed'
  | 'constellation'

/** How an object is drawn inside an Echo vignette. */
export type PropMode = 'held' | 'ground' | 'sky' | 'stand' | 'overhead' | 'lap' | 'easel'
export type SceneFx =
  | 'stars'
  | 'notes'
  | 'steam'
  | 'leaves'
  | 'sparkle'
  | 'moths'
  | 'petals'
  | 'confetti'
  | 'flash'
  | 'hearts'
  | 'lanterns'

export interface Pronouns {
  they: string
  them: string
  their: string
}

export interface ResidentDef {
  id: ResidentId
  name: string
  short: string
  species: string
  pronouns: Pronouns
  role: string
  home: LocationId
  homeLabel: string
  rhythm: string
  traits: string[]
  likes: string[]
  frets: string[]
  relations: Partial<Record<ResidentId, string>>
  secret: string
  /** Used for their pin and portrait ribbon on the Thread Board. */
  color: string
  arrives: number
  /** Follow-up sentence for trace echoes: how this resident reaches out. Uses {other}. */
  social: string
  /** The small mark this resident leaves beside someone else's when they reach out. */
  signature: MarkId
  react: { yes: string[]; hmm: string[]; huh: string[] }
  /** What they say when you have nothing to lend. */
  decline: string
}

export interface ObjectDef {
  id: ObjectId
  name: string
  short: string
  catalogue: string
  blurb: string
  tags: string[]
  color: string
  home: LocationId | 'home'
  time: TimeOfDay
  indoor?: boolean
  mode: PropMode
  fx?: SceneFx
  /** The mark this object tends to pick up when nothing more specific happens. */
  defaultMark: MarkId
  origin: string
  originBy?: ResidentId
  keepsakeKind?: KeepsakeKind
  keepsakeLabel?: string
  /** Found-trace sentences. `keepsake` is used when the trace is a keepsake, `mark` when it is a mark. */
  trace: { title: string; keepsake?: string; mark: string }
  /** What a borrower leaves behind after a trace scene, when their usual keepsake would tell a different story. */
  traceKeepsake?: { text: string; subject?: 'other' }
  starting: boolean
}

export interface LocationDef {
  id: LocationId
  name: string
  planLine: string
  planLineNight: string
  startsOpen: boolean
}

export interface MarkDef {
  id: MarkId
  label: string
}

export interface MarkInstance {
  id: MarkId
  day: number
  by: ResidentId
  note?: string
  foundBy?: ResidentId[]
}

export interface Keepsake {
  kind: KeepsakeKind
  by: ResidentId
  day: number
  text: string
  subject?: ResidentId
  place?: LocationId
  foundBy?: ResidentId[]
}

export type EntryKind = 'echo' | 'joint' | 'happening' | 'festival' | 'mend'

export interface ProvenanceEntry {
  day: number
  kind: EntryKind
  echoId: string
  borrower: ResidentId
  with: ResidentId[]
  /** Group moments tie every participant together, not just borrower-to-each. */
  group?: boolean
  location: LocationId
  time: TimeOfDay
  weather: Weather
  title: string
  text: string
  tags: string[]
  mark?: MarkInstance
}

export interface ObjectState {
  id: ObjectId
  acquiredDay: number
  donor?: ResidentId
  donorNote?: string
  history: ProvenanceEntry[]
  marks: MarkInstance[]
  keepsakes: Keepsake[]
}

export interface Loan {
  objectId: ObjectId
  residentId: ResidentId
  requestId: string
  day: number
  returnDay: number
}

export interface Visit {
  residentId: ResidentId
  requestId: string
  lent?: ObjectId
  declined?: boolean
}

export interface Strand {
  a: ResidentId
  b: ResidentId
  day: number
  objectId: ObjectId
  echoId: string
  title: string
}

export interface Thread {
  key: string
  a: ResidentId
  b: ResidentId
  strands: Strand[]
}

export interface ScheduledEvent {
  day: number
  id: string
  by: ResidentId
  objectId: ObjectId
}

export interface Donation {
  objectId: ObjectId
  from: ResidentId
  note: string
  day: number
}

export interface SceneCast {
  who: ResidentId
  pose?: 'stand' | 'sit' | 'wave'
}

/** Everything the UI needs to present one Echo / Happening card. */
export interface EchoResult {
  uid: string
  echoId: string
  kind: EntryKind
  title: string
  text: string
  gist?: string
  location: LocationId
  time: TimeOfDay
  weather: Weather
  indoor: boolean
  cast: ResidentId[]
  objects: ObjectId[]
  mode: PropMode
  fx?: SceneFx
  marks: { objectId: ObjectId; mark: MarkInstance }[]
  threads: { a: ResidentId; b: ResidentId; isNew: boolean }[]
  unlocks: string[]
}

export interface DayReport {
  echoes: EchoResult[]
  echoIndex: number
  returned: ObjectId[]
  stillOut: ObjectId[]
  donations: Donation[]
  notes: string[]
}

export interface GameState {
  version: number
  seed: number
  day: number
  phase: Phase
  weatherPattern: number
  present: ResidentId[]
  collection: ObjectId[]
  objects: Partial<Record<ObjectId, ObjectState>>
  shelf: ObjectId[]
  visits: Visit[]
  visitIndex: number
  loans: Loan[]
  report: DayReport
  /** Objects that came back yesterday evening (for the morning's "just returned" ribbons). */
  recentlyReturned: ObjectId[]
  flags: Record<string, number>
  seen: string[]
  usedRequests: string[]
  lastVisit: Partial<Record<ResidentId, number>>
  scheduled: ScheduledEvent[]
  donationsGiven: ObjectId[]
  festivalDone: boolean
}
