import type { DonationDef, HappeningDef } from '../defs'
import { hasFlag, partnersOf, photos, stargazers, strandCount } from '../query'
import { isClearNight } from './world'
import { RESIDENTS } from './residents'
import type { ResidentId } from '../types'

const names = (ids: ResidentId[]): string => {
  const n = ids.map((id) => RESIDENTS[id].short)
  if (n.length <= 1) return n.join('')
  return `${n.slice(0, -1).join(', ')} and ${n[n.length - 1]}`
}

/*
 * HAPPENINGS — village-scale events that emerge from what has been lent.
 * Checked every afternoon after the day's Echoes, in this order.
 * Scheduled happenings (blooms) fire on the day an earlier Echo scheduled them.
 */
export const HAPPENINGS: HappeningDef[] = [
  // ——— Delayed consequences of planting ———
  {
    id: 'bloom_sunflowers',
    scheduled: true,
    fire: ({ state }) => ({
      title: 'Taller Than a Heron',
      text: 'The sunflowers Tansy planted along the post office wall came up overnight — taller, even, than Odile. Odile has been seen reading them the post.',
      cast: ['tansy', 'odile'],
      objects: ['gardenKit'],
      location: 'green',
      time: 'day',
      fx: 'petals',
      unlocks: ['Sunflowers now stand along the post office wall.'],
      entry: state.present.includes('odile')
        ? { objectId: 'gardenKit', borrower: 'tansy', with: ['odile'], tags: ['garden', 'bloom'] }
        : undefined,
      flagsSet: ['sunflowers_bloomed'],
    }),
  },
  {
    id: 'bloom_herbs',
    scheduled: true,
    fire: () => ({
      title: 'The Rosemary Loaf',
      text: 'Barnaby’s window box came good. He baked a rosemary loaf — his first new bread in eleven years — and made Margo try it. “Acceptable,” said Margo, which is Margo for marvellous.',
      cast: ['barnaby', 'margo'],
      objects: ['gardenKit'],
      location: 'green',
      time: 'day',
      fx: 'steam',
      unlocks: ['The bakery has a new loaf.'],
      entry: { objectId: 'gardenKit', borrower: 'barnaby', with: ['margo'], tags: ['garden', 'bloom'] },
      flagsSet: ['rosemary_loaf'],
    }),
  },
  {
    id: 'bloom_bulbs',
    scheduled: true,
    fire: ({ state }) => {
      const known = partnersOf(state, 'hollis')
      const pool = state.present.filter((r) => r !== 'hollis')
      const visitor = pool.find((r) => !known.includes(r)) ?? pool[0]
      return {
        title: 'No. 3 in Bloom',
        text: `The bulbs by Hollis’s step came up all at once: red, yellow, and one surprised white. ${RESIDENTS[visitor].short} knocked to ask what they were. “Tulips, I think,” said Hollis. “Sorry.”`,
        cast: ['hollis', visitor],
        objects: ['gardenKit'],
        location: 'kettleRow',
        time: 'day',
        fx: 'petals',
        unlocks: ['No. 3 Kettle Row finally looks lived in.'],
        entry: { objectId: 'gardenKit', borrower: 'hollis', with: [visitor], tags: ['garden', 'bloom'] },
        flagsSet: ['bulbs_bloomed'],
      }
    },
  },
  {
    id: 'bloom_sweetpeas',
    scheduled: true,
    fire: () => ({
      title: 'Sweet Peas on the Railings',
      text: 'Tobias’s sweet peas climbed the railings at No. 1, just the way they used to. Tansy picked one without asking, and he pretended not to see, which is how Tobias says you’re welcome.',
      cast: ['tobias', 'tansy'],
      objects: ['gardenKit'],
      location: 'kettleRow',
      time: 'day',
      fx: 'petals',
      unlocks: ['Sweet peas climb the railings of No. 1 Kettle Row.'],
      entry: { objectId: 'gardenKit', borrower: 'tobias', with: ['tansy'], tags: ['garden', 'bloom'] },
      flagsSet: ['sweetpeas_bloomed'],
    }),
  },
  {
    id: 'bloom_lavender',
    scheduled: true,
    fire: () => ({
      title: 'A Very Straight Line',
      text: 'The lavender by the post box came up in a perfectly straight line. The bees queue politely. Barnaby noticed, and there is now lavender shortbread on the post office counter every morning at nine.',
      cast: ['odile', 'barnaby'],
      objects: ['gardenKit'],
      location: 'green',
      time: 'day',
      fx: 'petals',
      unlocks: ['Lavender grows by the post box.'],
      entry: { objectId: 'gardenKit', borrower: 'odile', with: ['barnaby'], tags: ['garden', 'bloom'] },
      flagsSet: ['lavender_bloomed', 'lavender_shortbread'],
    }),
  },

  // ——— Places opening up ———
  {
    id: 'glasshouse_opens',
    once: true,
    fire: ({ state, day }) => {
      if (state.flags.glasshouse_open !== day) return null
      return {
        title: 'The Glasshouse Opens',
        text: 'The Glasshouse door swung open for the first time since spring. By teatime half of Mosswick had wandered in to stand among the tomatoes and say “well!” Margo pretended not to be delighted, and failed.',
        cast: ['margo'],
        objects: [],
        location: 'glasshouse',
        time: 'day',
        fx: 'sparkle',
        unlocks: ['The Glasshouse is open again.', 'Margo is sending over the Flower Press.'],
      }
    },
  },

  // ——— Threads growing into something bigger ———
  {
    id: 'birthday',
    major: true,
    once: true,
    fire: ({ state, day }) => {
      if (hasFlag(state, 'odile_birthday_party')) return null
      const today = state.visits.find((v) => v.requestId === 'odile_birthday')
      if (!today || state.lastVisit.odile !== day) return null
      if (strandCount(state, 'barnaby', 'odile') < 1) return null
      return {
        title: 'Somebody Knew',
        text: 'Barnaby found out it was Odile’s birthday — it was on a parcel, and he is not above reading parcels — and closed the bakery early. There was a cake with one candle, “for tact.” Odile blew it out with great precision.',
        cast: ['barnaby', 'odile'],
        objects: [],
        location: 'green',
        time: 'dusk',
        fx: 'confetti',
        flagsSet: ['odile_birthday_party'],
      }
    },
  },
  {
    id: 'astronomy_club',
    major: true,
    once: true,
    fire: ({ state, day, weather }) => {
      if (hasFlag(state, 'club') || day < 3 || !isClearNight(weather)) return null
      const members = stargazers(state).filter((r) => state.present.includes(r))
      if (members.length < 3 || !(hasFlag(state, 'saturn_seen') || hasFlag(state, 'moon_letter_seed'))) return null
      const founding = members.slice(0, 4)
      return {
        title: 'The Mosswick Astronomy Club',
        text: `Word got round about the rings. After dark, ${names(founding)} met on Observatory Hill with the telescope and a flask of cocoa. By ten o’clock they had a name, a secretary, and a biscuit rota. The Mosswick Astronomy Club is open to all, and meets whenever it is clear.`,
        cast: founding,
        objects: ['telescope'],
        location: 'hill',
        time: 'night',
        fx: 'stars',
        unlocks: ['The old observatory on the Hill is lit again.', 'The club is sending over a Star Chart.'],
        entry: { objectId: 'telescope', borrower: founding[0], with: founding.slice(1), group: true, tags: ['stargazing', 'club'] },
        flagsSet: ['club'],
      }
    },
  },
  {
    id: 'moon_letter',
    major: true,
    once: true,
    fire: ({ state, day }) => {
      if (hasFlag(state, 'moon_letter') || day < 3) return null
      if (strandCount(state, 'tansy', 'odile') < 1) return null
      if (!hasFlag(state, 'tansy_stargazed') && !hasFlag(state, 'moon_letter_seed')) return null
      return {
        title: 'A Letter From the Moon',
        text: 'A letter arrived at No. 2 Kettle Row, addressed to Tansy in very beautiful handwriting. “Dear Tansy, Thank you for your letters. I am doing well. It is quite dark up here too, and I manage. Yours, The Moon. P.S. Please use more stamps.” Tansy has read it forty times. Odile has said nothing whatsoever.',
        cast: ['tansy', 'odile'],
        objects: [],
        location: 'kettleRow',
        time: 'day',
        fx: 'sparkle',
        unlocks: ['Tansy pinned a copy of the Moon’s letter to your notice board, for safekeeping.'],
        flagsSet: ['moon_letter'],
      }
    },
  },
  {
    id: 'four_oclock',
    major: true,
    once: true,
    fire: ({ state }) => {
      if (hasFlag(state, 'four_oclock')) return null
      if (strandCount(state, 'barnaby', 'odile') < 2) return null
      const again = hasFlag(state, 'odile_scone')
      return {
        title: again ? 'Four O’Clock, Every Day' : 'Four O’Clock',
        text: again
          ? 'Odile has started taking her four o’clock tea at the bakery. Every day. Exactly four. Barnaby now shuts the bakery at five past, so that nobody interrupts.'
          : 'At four o’clock exactly, Odile put down her satchel, walked into the bakery and sat at the little table by the window. “I’ll have that scone now,” she said. Barnaby has offered her one every morning for twenty years. He had to go into the back for a minute.',
        cast: ['odile', 'barnaby'],
        objects: [],
        location: 'green',
        time: 'day',
        fx: 'steam',
        unlocks: ['Barnaby left a tin of biscuits on your counter, “for services rendered.”'],
        flagsSet: ['four_oclock'],
      }
    },
  },
  {
    id: 'housewarming',
    major: true,
    once: true,
    fire: ({ state }) => {
      if (hasFlag(state, 'housewarming') || !state.present.includes('hollis') || state.day < 3) return null
      const friends = partnersOf(state, 'hollis')
      if (friends.length < 3) return null
      const [a, b] = friends
      return {
        title: 'Housewarming at No. 3',
        text: `Nobody organised it. ${RESIDENTS[a].short} brought a cake, ${RESIDENTS[b].short} brought a chair, and by eight o’clock No. 3 Kettle Row was full. Hollis stood in the middle of it all and said “sorry” only twice.`,
        cast: ['hollis', a, b],
        objects: [],
        location: 'kettleRow',
        time: 'dusk',
        fx: 'confetti',
        unlocks: ['Hollis gave you a copy of his map of Mosswick, for the Borrowburrow wall.'],
        flagsSet: ['housewarming'],
      }
    },
  },
  {
    id: 'marrow_truce',
    major: true,
    once: true,
    fire: ({ state }) => {
      if (hasFlag(state, 'truce') || !hasFlag(state, 'glasshouse_open')) return null
      if (strandCount(state, 'barnaby', 'margo') < 1) return null
      return {
        title: 'The Marrow Truce',
        text: 'Barnaby and Margo met in the reopened Glasshouse and shook hands over a marrow. They have agreed to grow one enormous marrow together, for Lantern Night. The terms of the truce are written on a seed packet. Both of them signed it. Both of them added footnotes.',
        cast: ['barnaby', 'margo'],
        objects: [],
        location: 'glasshouse',
        time: 'day',
        fx: 'sparkle',
        unlocks: ['A truly enormous marrow is growing in the Glasshouse.'],
        flagsSet: ['truce'],
      }
    },
  },
]

/**
 * DONATIONS — the library grows as the village does. Listed in the order they're delivered
 * when several are earned at once (see processDonations): the toolbox first, then gifts that
 * answer something that just happened, then the ones neighbours give once they've made a friend.
 */
export const DONATIONS: DonationDef[] = [
  {
    objectId: 'toolbox',
    from: 'tobias',
    note: 'Heard the Borrowburrow was open again. I’ve got two of everything and only one of me. — T. Crumb',
    when: () => true,
  },
  {
    objectId: 'album',
    from: 'tobias',
    note: 'Photographs shouldn’t live in a drawer. This was Hettie’s album. It would like to be busy again. — T.C.',
    when: (s) => photos(s).length >= 2,
  },
  {
    objectId: 'flowerPress',
    from: 'margo',
    note: 'For the Glasshouse violets. Press them properly or not at all. — M.',
    when: (s) => hasFlag(s, 'glasshouse_open'),
  },
  {
    objectId: 'starChart',
    from: (s) => stargazers(s)[0] ?? 'tobias',
    note: 'The Club’s first chart. We named some of it. Please return by the next clear night. — The Mosswick Astronomy Club',
    when: (s) => hasFlag(s, 'club'),
    seedKeepsakesFrom: (s) => stargazers(s).slice(0, 3),
  },
  {
    objectId: 'sewingBasket',
    from: 'barnaby',
    note: 'My nan’s sewing basket. I only ever used it for icing bags. Somebody ought to sew with it. — B.H.',
    when: (s) => partnersOf(s, 'barnaby').length >= 1,
    fallbackDay: 4,
  },
  {
    objectId: 'birdGuide',
    from: 'odile',
    note: 'I have read it cover to cover. I am in it. Page 41. Unflattering. — O.F.',
    when: (s) => partnersOf(s, 'odile').length >= 1,
    fallbackDay: 3,
  },
  {
    objectId: 'binoculars',
    from: 'hollis',
    note: 'My uncle’s. I can’t see a thing through them — moles, you see — but somebody should. Sorry. — H.U.',
    when: (s) => s.present.includes('hollis') && partnersOf(s, 'hollis').length >= 1,
    fallbackDay: 5,
  },
]
