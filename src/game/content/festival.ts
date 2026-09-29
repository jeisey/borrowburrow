import type { EchoDef } from '../defs'
import { borrowersOf, deriveThreads, hasFlag, partnersOf, photos } from '../query'
import type { GameState, ObjectId, ResidentId } from '../types'
import { RESIDENTS } from './residents'

/*
 * LANTERN NIGHT — day 7. Everything lent today goes to the festival, and the
 * festival itself is assembled from everything that happened this week.
 */
// On Lantern Night people celebrate with the friends they made this week.
const F = {
  festival: true,
  other: { kind: 'any' as const, bias: 'known' as const },
  location: 'green' as const,
  time: 'night' as const,
}

export const FESTIVAL_ECHOES: EchoDef[] = [
  {
    ...F,
    id: 'fest_tobias_waltz',
    object: 'recordPlayer',
    resident: 'tobias',
    priority: 100,
    title: 'May I Have This Dance?',
    text: 'Tobias put the Hollyhock Waltz on the bandstand steps and, for the first time in a very long time, asked someone to dance: {other}. They were slow. They were perfect. Half the Green had joined in by the second chorus.',
    keepsake: true,
    mark: 'noteSticker',
    tags: ['music', 'dance', 'festival'],
    flagsSet: ['fest_dance'],
  },
  {
    ...F,
    id: 'fest_music',
    object: 'recordPlayer',
    priority: 96,
    title: 'The Bandstand Steps',
    text: '{name} set the record player on the bandstand steps and put on {latest}. Half of Mosswick danced. The other half tapped a foot and claimed it didn’t count. {other} danced with {name}, and it counted.',
    keepsake: true,
    mark: 'noteSticker',
    tags: ['music', 'dance', 'festival'],
    flagsSet: ['fest_dance'],
  },
  {
    ...F,
    id: 'fest_tansy_lantern',
    object: 'lantern',
    resident: 'tansy',
    priority: 100,
    title: 'At the Front, Where the Dark Is',
    text: 'Tansy led the lantern procession round the Green, lantern held high, at the very front, where the dark is. She was not scared at all. Or at least, not so you’d notice. {other} walked right behind her, just in case, and wasn’t needed.',
    mark: 'starSticker',
    tags: ['festival', 'brave'],
    flagsSet: ['fest_procession'],
  },
  {
    ...F,
    id: 'fest_lantern',
    object: 'lantern',
    priority: 96,
    title: 'The Procession',
    text: '{name} led the lantern procession round the Green, lantern held high, the whole village bobbing along behind like a string of small moons. {other} carried the tail end.',
    mark: 'waxDrip',
    tags: ['festival'],
    flagsSet: ['fest_procession'],
  },
  {
    ...F,
    id: 'fest_telescope',
    object: 'telescope',
    priority: 96,
    location: 'hill',
    title: 'Saturn Every Ten Minutes',
    text: '{name} ran telescope viewings on the Hill all night: Saturn every ten minutes, and a queue all the way down to the stile. {other} managed the queue with enormous authority.',
    mark: 'saturnSticker',
    tags: ['stargazing', 'festival'],
    flagsSet: ['fest_telescope'],
  },
  {
    ...F,
    id: 'fest_camera',
    object: 'camera',
    priority: 96,
    title: 'Everybody on the Steps',
    text: '{name} took the Lantern Night photograph: everybody squashed together on the bandstand steps, mid-laugh, {other} blinking. It is the best photograph in the album.',
    keepsake: { text: 'Lantern Night: everybody on the bandstand steps, mid-laugh' },
    mark: 'starSticker',
    tags: ['photo', 'festival'],
    flagsSet: ['fest_photo'],
  },
  {
    ...F,
    id: 'fest_blanket',
    object: 'blanket',
    priority: 96,
    title: 'Headquarters',
    text: '{name} spread the blanket on the Green and it became headquarters: buns, cocoa, lost gloves, and a flask of something nobody would own up to. {other} ran the lost-and-found from one corner.',
    mark: 'jamStain',
    tags: ['picnic', 'festival'],
    flagsSet: ['fest_picnic'],
  },
  {
    ...F,
    id: 'fest_cake',
    object: 'cakeTin',
    priority: 96,
    title: 'Every Note at Once',
    text: '{name} brought a cake in the old tin, baked from the recipe card with every borrower’s note followed at once. It should not have worked. It was the first thing to go. {other} got the last slice.',
    keepsake: true,
    mark: 'ribbon',
    tags: ['baking', 'festival'],
    flagsSet: ['fest_cake'],
  },
  {
    ...F,
    id: 'fest_kite',
    object: 'kite',
    priority: 96,
    time: 'dusk',
    title: 'A Second Moon',
    text: '{name} flew the kite at dusk with a little lantern tied to its tail, so there was a second moon over the Green. {other} held the string while {name} went to fetch a bun.',
    mark: 'knot',
    tags: ['kite', 'festival'],
    flagsSet: ['fest_kite'],
  },
  {
    ...F,
    id: 'fest_game',
    object: 'boardGame',
    priority: 96,
    title: 'The Grand Tournament',
    text: '{name} ran the first ever Lantern Night Snails & Ladders tournament on the bandstand. {other} won. There will be a recount.',
    keepsake: { text: 'LANTERN NIGHT CHAMPION: {OTHER} (recount pending)' },
    mark: 'teaRing',
    tags: ['games', 'festival'],
    flagsSet: ['fest_games'],
  },
  {
    ...F,
    id: 'fest_thermos',
    object: 'thermos',
    priority: 96,
    title: 'Nobody’s Cup Was Cold',
    text: '{name} went round the Green with the thermos all night, topping up everyone’s cocoa. Nobody’s cup was cold. {other} followed along with the biscuits.',
    mark: 'teaRing',
    tags: ['tea', 'festival'],
    flagsSet: ['fest_cocoa'],
  },
  {
    ...F,
    id: 'fest_umbrella',
    object: 'umbrella',
    priority: 96,
    title: 'A Travelling Light Show',
    text: '{name} hung little lanterns from the spokes of the big green umbrella and walked about as a small travelling light show. {other} walked underneath it all night.',
    mark: 'ribbon',
    tags: ['festival'],
    flagsSet: ['fest_umbrella'],
  },
  {
    ...F,
    id: 'fest_paints',
    object: 'paints',
    priority: 96,
    title: 'Still Wet',
    text: '{name} painted Lantern Night as it happened, so fast the paint was still wet when people queued to see it. {other} is in it, somewhere near the middle, laughing.',
    keepsake: { text: 'Lantern Night, still wet', subject: 'other' },
    mark: 'paintDab',
    tags: ['painting', 'festival'],
    flagsSet: ['fest_painting'],
  },
  {
    ...F,
    id: 'fest_margo_garden',
    object: 'gardenKit',
    resident: 'margo',
    priority: 100,
    time: 'dusk',
    title: 'A Great Deal of Squash',
    text: 'Margo decorated the bandstand with everything growing in Mosswick: squash, beans, sweet peas, and one sunflower borrowed from the post office wall, with permission. {other} was allowed to carry things. Everyone agreed it was not bad, which is Margo for marvellous.',
    mark: 'mudSplash',
    tags: ['garden', 'festival'],
    flagsSet: ['fest_garden'],
  },
  {
    ...F,
    id: 'fest_garden',
    object: 'gardenKit',
    priority: 96,
    time: 'dusk',
    title: 'Everything That Grows',
    text: '{name} decorated the bandstand with everything growing in Mosswick, until it looked like a small, very proud allotment. {other} was allowed to carry things.',
    mark: 'mudSplash',
    tags: ['garden', 'festival'],
    flagsSet: ['fest_garden'],
  },
  {
    ...F,
    id: 'fest_toolbox',
    object: 'toolbox',
    priority: 96,
    time: 'dusk',
    title: 'Holding It All Up',
    text: '{name} kept the whole festival standing: bunting re-hung, the bandstand step fixed, a table leg shimmed with a folded letter. {other} passed the nails.',
    mark: 'scratch',
    tags: ['repair', 'festival'],
    flagsSet: ['fest_toolbox'],
  },
  {
    ...F,
    id: 'fest_birds',
    object: 'birdGuide',
    priority: 96,
    location: 'millpond',
    time: 'dusk',
    title: 'The Swifts Go to Roost',
    text: '{name} led a dusk walk to the Millpond to watch the swifts go to roost. Everyone came back talking in whispers, even {other}, who is usually loud.',
    mark: 'feather',
    tags: ['birds', 'festival'],
    flagsSet: ['fest_birds'],
  },
  {
    ...F,
    id: 'fest_bino',
    object: 'binoculars',
    priority: 96,
    location: 'hill',
    title: 'Nine Shooting Stars',
    text: '{name} lay on the Hill with the binoculars and called out every shooting star. There were nine. {other} made a wish on each one and won’t say what.',
    mark: 'starSticker',
    tags: ['stargazing', 'festival'],
    flagsSet: ['fest_shooting'],
  },
  {
    ...F,
    id: 'fest_album',
    object: 'album',
    priority: 96,
    title: 'Finding Themselves',
    text: '{name} laid the photo album open on the bandstand, and people crowded round it all night, finding themselves. {other} found themselves four times.',
    mark: 'photo',
    tags: ['album', 'festival'],
    flagsSet: ['fest_album'],
  },
  {
    ...F,
    id: 'fest_sewing',
    object: 'sewingBasket',
    priority: 96,
    time: 'dusk',
    title: 'The Last of the Bunting',
    text: '{name} sewed the last of the bunting up just in time, and mended three festival outfits along the way — one of them {other}’s, while {other} was still in it.',
    mark: 'button',
    tags: ['sewing', 'festival'],
    flagsSet: ['fest_bunting'],
  },
  {
    ...F,
    id: 'fest_press',
    object: 'flowerPress',
    priority: 96,
    title: 'One for Everyone',
    text: '{name} gave out pressed flowers as keepsakes, one for everybody, each one labelled. {other} got the violet.',
    mark: 'pressedFlower',
    tags: ['flowers', 'festival'],
    flagsSet: ['fest_flowers'],
  },
  {
    ...F,
    id: 'fest_chart',
    object: 'starChart',
    priority: 96,
    location: 'hill',
    title: 'Gerald’s Neighbours',
    text: '{name} pinned the star chart to the old observatory door and pointed out the club’s constellations to anyone who would listen, which was everyone. {other} would now like one named after them.',
    keepsake: true,
    mark: 'starSticker',
    tags: ['stargazing', 'festival'],
    flagsSet: ['fest_chart'],
  },
]

export interface FestivalSegment {
  id: string
  title: string
  text: string
  cast: ResidentId[]
  objects: ObjectId[]
}

const who = (ids: ResidentId[]): string => {
  const n = ids.map((id) => RESIDENTS[id].short)
  if (n.length <= 1) return n.join('')
  return `${n.slice(0, -1).join(', ')} and ${n[n.length - 1]}`
}

/** The shape of Lantern Night is assembled from the week you made. */
export function festivalSegments(s: GameState): FestivalSegment[] {
  const segs: FestivalSegment[] = []
  const f = (flag: string) => hasFlag(s, flag)
  segs.push({
    id: 'lanterns',
    title: 'Lanterns on the Green',
    text: 'At dusk somebody lit the first lantern, and then everybody did, until the Green was a bowl of small warm lights.',
    cast: [...s.present],
    objects: [],
  })
  if (f('club'))
    segs.push({
      id: 'club',
      title: 'The Astronomy Club',
      text: 'The Mosswick Astronomy Club held its first public viewing on the Hill. Membership doubled. The biscuit rota was revised.',
      cast: [],
      objects: ['telescope'],
    })
  if (f('fest_dance') || f('dance_on_green'))
    segs.push({
      id: 'dance',
      title: 'The Dancing',
      text: 'The record player that had been round half the houses in Mosswick played on the bandstand steps, and people who “don’t dance” danced.',
      cast: [],
      objects: ['recordPlayer'],
    })
  const pics = photos(s).length
  if (pics >= 3 || f('fest_album'))
    segs.push({
      id: 'photos',
      title: 'The Photographs',
      text: `All ${pics} photographs from the camera were pegged along the bandstand rail. People kept stopping to find themselves in the background.`,
      cast: [],
      objects: ['camera', 'album'],
    })
  if (f('housewarming'))
    segs.push({
      id: 'map',
      title: 'Hollis’s Map',
      text: `Hollis unveiled his map of Mosswick: every house, every bench, every path, and — drawn as their footsteps — everyone he has come to know: ${who(partnersOf(s, 'hollis'))}. He said “sorry” only once, and it was about the frame.`,
      cast: ['hollis'],
      objects: [],
    })
  if (f('truce'))
    segs.push({
      id: 'truce',
      title: 'The Great Joint Marrow',
      text: 'Barnaby and Margo wheeled in the marrow they grew together. It needed two wheelbarrows. They argued about which end was whose, happily, for the rest of the night.',
      cast: ['barnaby', 'margo'],
      objects: [],
    })
  if (f('four_oclock') || f('odile_scone') || f('odile_birthday_party'))
    segs.push({
      id: 'odile',
      title: 'Odile, Off Duty',
      text: 'Odile came to Lantern Night without her satchel. She stood on one leg by the bakery stall and did absolutely nothing, beautifully, for an entire hour.',
      cast: ['odile', 'barnaby'],
      objects: [],
    })
  if (f('moon_letter'))
    segs.push({
      id: 'letter',
      title: 'The Moon’s Reply',
      text: 'Tansy read her letter from the Moon aloud, twice. Odile looked at the sky the whole time.',
      cast: ['tansy', 'odile'],
      objects: [],
    })
  if (f('sunflowers_bloomed'))
    segs.push({
      id: 'sunflowers',
      title: 'The Sunflowers',
      text: 'The sunflowers along the post office wall had lanterns hung from them, so that they looked, briefly, like very tall guests.',
      cast: ['tansy'],
      objects: ['gardenKit'],
    })
  if (f('rosemary_loaf') || f('barnaby_new_recipe') || f('moon_crumpets') || f('lavender_shortbread'))
    segs.push({
      id: 'baking',
      title: 'Something New From the Bakery',
      text: `Barnaby’s stall had something on it that wasn’t one of the six loaves: ${[
        f('rosemary_loaf') && 'rosemary loaves',
        f('barnaby_new_recipe') && 'Lemon Drizzle (Revised)',
        f('moon_crumpets') && 'crumpets shaped like the Moon',
        f('lavender_shortbread') && 'lavender shortbread',
      ]
        .filter(Boolean)
        .join(', ')}. He handed them out as if he’d always baked them.`,
      cast: ['barnaby'],
      objects: [],
    })
  if (f('glasshouse_open'))
    segs.push({
      id: 'glasshouse',
      title: 'Flowers From the Glasshouse',
      text: 'Every table had a jar of flowers from the reopened Glasshouse. Margo told everyone not to make a fuss, and then counted how many people did.',
      cast: ['margo'],
      objects: ['toolbox'],
    })
  const blanket = s.objects.blanket
  if (blanket && borrowersOf(blanket).length >= 3)
    segs.push({
      id: 'picnic',
      title: 'The Long Picnic',
      text: `The red checked blanket, which has been to picnics with ${who(borrowersOf(blanket))}, was spread out at the edge of the Green with every other blanket in Mosswick laid end to end beside it.`,
      cast: borrowersOf(blanket),
      objects: ['blanket'],
    })
  if (f('map_bunting') || f('signpost'))
    segs.push({
      id: 'bunting',
      title: 'Bunting Made of Maps',
      text: 'Strung over the bandstand was Hollis’s bunting, every flag cut from an old map, so the whole festival was hung with little pieces of somewhere.',
      cast: ['hollis'],
      objects: ['sewingBasket'],
    })
  return segs
}

export interface WeekSummary {
  lends: number
  threads: number
  strands: number
  mostTravelled?: { id: ObjectId; borrowers: ResidentId[] }
  closest?: { a: ResidentId; b: ResidentId; strands: number }
  hollisFriends: number
  tansyBrave: boolean
}

export function weekSummary(s: GameState): WeekSummary {
  const threads = deriveThreads(s)
  let most: WeekSummary['mostTravelled']
  for (const obj of Object.values(s.objects)) {
    if (!obj) continue
    const b = borrowersOf(obj)
    if (!most || b.length > most.borrowers.length) most = { id: obj.id, borrowers: b }
  }
  const closest = [...threads].sort((a, b) => b.strands.length - a.strands.length)[0]
  const lends = Object.values(s.objects).reduce(
    (n, o) => n + (o ? o.history.filter((e) => e.kind === 'echo' || e.kind === 'joint' || e.kind === 'festival').length : 0),
    0,
  )
  return {
    lends,
    threads: threads.length,
    strands: threads.reduce((n, t) => n + t.strands.length, 0),
    mostTravelled: most && most.borrowers.length ? most : undefined,
    closest: closest ? { a: closest.a, b: closest.b, strands: closest.strands.length } : undefined,
    hollisFriends: partnersOf(s, 'hollis').length,
    tansyBrave: hasFlag(s, 'tansy_brave') || hasFlag(s, 'fest_procession'),
  }
}
