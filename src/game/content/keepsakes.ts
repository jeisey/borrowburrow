import type { KeepsakeKind, LocationId, ObjectId, ResidentId } from '../types'

export interface KeepsakeTemplate {
  text: string
  subject?: ResidentId
  place?: LocationId
}

/**
 * What each resident tends to leave behind in an object. These are the default
 * keepsakes an Echo writes when it says `keepsake: true`; later borrowers find
 * them and can follow them back to the person who left them.
 */
export const KEEPSAKES: Partial<Record<ObjectId, Record<ResidentId, KeepsakeTemplate>>> = {
  recordPlayer: {
    odile: { text: '“Harbour Lights: Songs for Foggy Evenings”' },
    barnaby: { text: '“Brass Band Favourites, Vol. 3” (Vols. 1 and 2 lost in the Great Flood of the Bakery Cellar)' },
    tansy: { text: '“Sounds of Outer Space, for Children”' },
    tobias: { text: '“The Hollyhock Waltz” — a scratched old 78 that was Hettie’s favourite' },
    margo: { text: '“Madrigals for the Allotment”' },
    hollis: { text: '“Deep Accordion: Music from Below”' },
  },
  cakeTin: {
    odile: { text: 'Oven at 180°. Exactly 180°. — O.F.' },
    barnaby: { text: 'More lemon. MORE. — B.H.' },
    tansy: { text: 'add sprinkels (all of them)' },
    tobias: { text: 'Hettie always added a pinch of salt. Try it. — T.C.' },
    margo: { text: 'Grate in a courgette. Tell no one. — M.' },
    hollis: { text: 'Tastes even better eaten underground. Sorry. — H.U.' },
  },
  boardGame: {
    odile: { text: 'ODILE 1 · EVERYONE ELSE 0 (so far)' },
    barnaby: { text: 'BARNABY 3 · TOBIAS 5 · RECOUNT PENDING' },
    tansy: { text: 'TANSY: WON (new rules)' },
    tobias: { text: 'TOBIAS 4 · BARNABY 4 (his snail touched the ladder — it does NOT count)' },
    margo: { text: 'MARGO: won. Cheated. Strategically.' },
    hollis: { text: 'HOLLIS 3 (sorry) · GUEST 0' },
  },
  paints: {
    odile: { text: 'Mosswick from memory, every door numbered' },
    barnaby: { text: 'the post office, with a small grey figure in the doorway', subject: 'odile' },
    tansy: { text: 'Tobias, as the Moon', subject: 'tobias' },
    tobias: { text: 'Kettle Row in 1952, with Hettie at the gate' },
    margo: { text: 'fourteen squash and one Glasshouse' },
    hollis: { text: 'Kettle Row, with everyone drawn as their footsteps' },
  },
  camera: {
    odile: { text: 'Mosswick from the post office roof', place: 'green' },
    barnaby: { text: 'Odile on the Green, mid-stride, faintly outraged', subject: 'odile', place: 'green' },
    tansy: { text: 'the Moon (a small white smudge named Gerald)', place: 'kettleRow' },
    tobias: { text: 'Kettle Row, exactly as it always was, minus one lamppost', place: 'kettleRow' },
    margo: { text: 'two marrows and a badger, for scale', subject: 'barnaby', place: 'green' },
    hollis: { text: 'every front door on the Green', place: 'green' },
  },
  birdGuide: {
    odile: { text: 'p.41, Grey Heron: “Unflattering likeness.” — O.F.' },
    barnaby: { text: 'Robin on the bakery step, 7am daily. Named Crumb. — B.' },
    tansy: { text: 'SAW A MOORHEN. (or is it)' },
    tobias: { text: 'Kingfisher by the jetty, early. Worth the cold. — T.C.' },
    margo: { text: 'Pigeons: not birds. Vermin with a publicist. — M.' },
    hollis: { text: 'Heard 14. Saw 2. — H.U.' },
  },
  gardenKit: {
    odile: { text: 'LAVENDER — by the post box — in a straight line' },
    barnaby: { text: 'HERBS — behind the bakery — (Margo says basil)' },
    tansy: { text: 'SUNFLOWERS — for Odile — along the wall' },
    tobias: { text: 'SWEET PEAS — No. 1 railings — as always' },
    margo: { text: 'SEEDLINGS — forty — in teapots (and a gravy boat)' },
    hollis: { text: 'BULBS — No. 3 front step — (tulips?)' },
  },
  flowerPress: {
    odile: { text: 'a sunflower petal, a feather and a violet, each labelled' },
    barnaby: { text: 'lavender (for shortbread research)' },
    tansy: { text: 'a dandelion clock, mid-puff' },
    tobias: { text: 'a sweet pea, for the back of Hettie’s cookbook' },
    margo: { text: 'the first violets from the reopened Glasshouse' },
    hollis: { text: 'one flower from every garden on Kettle Row' },
  },
  starChart: {
    odile: { text: '“The Envelope” (four stars, very square)' },
    barnaby: { text: '“The Crumpet” (it is the Moon)' },
    tansy: { text: '“Gerald’s Neighbours”' },
    tobias: { text: '“Hettie’s Hat”' },
    margo: { text: '“The Big Spoon (NOT a ladle)”' },
    hollis: { text: '“The Burrow” (a rough guess, by ear)' },
  },
}

export const KEEPSAKE_KIND_LABEL: Record<KeepsakeKind, string> = {
  photo: 'photograph',
  painting: 'painting',
  record: 'record',
  recipe: 'recipe note',
  score: 'score',
  note: 'pencil note',
  planting: 'seed packet',
  pressed: 'pressing',
  constellation: 'constellation',
}
