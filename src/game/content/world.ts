import type { LocationDef, LocationId, MarkDef, MarkId, Weather } from '../types'

export const LOCATIONS: Record<LocationId, LocationDef> = {
  burrow: {
    id: 'burrow',
    name: 'the Borrowburrow',
    planLine: 'I’ll pop back later.',
    planLineNight: 'I’ll pop back later.',
    startsOpen: true,
  },
  green: {
    id: 'green',
    name: 'the Green',
    planLine: 'I’ll be out on the Green.',
    planLineNight: 'Out on the Green tonight, I think.',
    startsOpen: true,
  },
  kettleRow: {
    id: 'kettleRow',
    name: 'Kettle Row',
    planLine: 'I’ll be at home with it, on Kettle Row.',
    planLineNight: 'Kettle Row, once it’s dark.',
    startsOpen: true,
  },
  millpond: {
    id: 'millpond',
    name: 'the Millpond',
    planLine: 'Down to the Millpond, I think.',
    planLineNight: 'The Millpond, after dark.',
    startsOpen: true,
  },
  hill: {
    id: 'hill',
    name: 'Observatory Hill',
    planLine: 'Up the Hill with it.',
    planLineNight: 'Up the Hill tonight.',
    startsOpen: true,
  },
  glasshouse: {
    id: 'glasshouse',
    name: 'the Glasshouse',
    planLine: 'Off to the Glasshouse.',
    planLineNight: 'The Glasshouse, this evening.',
    startsOpen: false,
  },
}

export const MARKS: Record<MarkId, MarkDef> = {
  starSticker: { id: 'starSticker', label: 'silver star sticker' },
  saturnSticker: { id: 'saturnSticker', label: 'ringed-planet sticker' },
  moonSticker: { id: 'moonSticker', label: 'crescent-moon sticker' },
  noteSticker: { id: 'noteSticker', label: 'music-note sticker' },
  scratch: { id: 'scratch', label: 'small scratch' },
  ribbon: { id: 'ribbon', label: 'red ribbon bow' },
  pressedFlower: { id: 'pressedFlower', label: 'pressed violet' },
  label: { id: 'label', label: 'handwritten label' },
  charm: { id: 'charm', label: 'little brass bell charm' },
  patch: { id: 'patch', label: 'stitched patch' },
  photo: { id: 'photo', label: 'tucked-in photograph' },
  jamStain: { id: 'jamStain', label: 'jam stain' },
  grassStain: { id: 'grassStain', label: 'grass stain' },
  teaRing: { id: 'teaRing', label: 'tea ring' },
  mudSplash: { id: 'mudSplash', label: 'splash of mud' },
  paintDab: { id: 'paintDab', label: 'dab of blue paint' },
  dent: { id: 'dent', label: 'new dent' },
  feather: { id: 'feather', label: 'grey feather' },
  button: { id: 'button', label: 'sewn-on button' },
  flourPrint: { id: 'flourPrint', label: 'floury pawprint' },
  clover: { id: 'clover', label: 'four-leaf clover' },
  doodle: { id: 'doodle', label: 'pencil doodle' },
  knot: { id: 'knot', label: 'fussy knot' },
  leaf: { id: 'leaf', label: 'oak leaf, caught fast' },
  waxDrip: { id: 'waxDrip', label: 'drip of candle wax' },
}

export const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export const FESTIVAL_DAY = 7

/** Three authored weeks of weather. Lantern Night (day 7) is always clear. */
export const WEATHER_PATTERNS: Weather[][] = [
  ['sunny', 'windy', 'rainy', 'foggy', 'sunny', 'windy', 'sunny'],
  ['sunny', 'rainy', 'windy', 'sunny', 'foggy', 'rainy', 'sunny'],
  ['sunny', 'foggy', 'sunny', 'windy', 'rainy', 'sunny', 'sunny'],
]

export const WEATHER_TEXT: Record<Weather, { name: string; line: string; night: string }> = {
  sunny: { name: 'Bright', line: 'Bright and mild. Washing-line weather.', night: 'Clear skies tonight — the stars will be out.' },
  windy: { name: 'Blustery', line: 'Blustery. Hold onto your hat, and your post.', night: 'The wind will sweep the sky clear tonight.' },
  rainy: { name: 'Rain', line: 'Rain, on and off, mostly on.', night: 'Cloud all night. No stars.' },
  foggy: { name: 'Fog', line: 'Thick fog in the lanes until noon.', night: 'Fog lingering after dark. No stars.' },
}

export const isClearNight = (w: Weather) => w === 'sunny' || w === 'windy'
