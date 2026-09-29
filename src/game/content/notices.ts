import { hasFlag, isOpen } from '../query'
import type { GameState } from '../types'

export interface NoticeDef {
  id: string
  title: string
  text: string
  priority: number
  day?: number
  minDay?: number
  when?: (s: GameState) => boolean
}

/** The village notice pinned by the door each morning. Highest priority that applies wins. */
export const NOTICES: NoticeDef[] = [
  {
    id: 'open_again',
    day: 1,
    priority: 100,
    title: 'OPEN AGAIN',
    text: 'The Borrowburrow is open again after a long, dusty winter. Borrow a thing. Bring it back with a story. — The Keeper',
  },
  {
    id: 'new_neighbour',
    day: 2,
    priority: 100,
    title: 'NEW NEIGHBOUR',
    text: 'A warm Mosswick welcome to whoever has just moved into No. 3 Kettle Row. (A mole, we think. Seems very polite.)',
  },
  {
    id: 'festival_today',
    day: 7,
    priority: 100,
    title: 'LANTERN NIGHT — TONIGHT',
    text: 'On the Green at dusk. The Borrowburrow is lending until then, for anyone who wants to bring something.',
  },
  {
    id: 'festival_tomorrow',
    day: 6,
    priority: 90,
    title: 'LANTERN NIGHT TOMORROW',
    text: 'On the Green at dusk. Bring a lantern, a friend, or a friend with a lantern. Bunting volunteers to the bandstand.',
  },
  {
    id: 'club',
    priority: 80,
    minDay: 3,
    when: (s) => hasFlag(s, 'club'),
    title: 'ASTRONOMY CLUB',
    text: 'Meets on Observatory Hill whenever it is clear. Bring cocoa. No telescope? Borrow one. — The Secretary',
  },
  {
    id: 'glasshouse_open',
    priority: 70,
    when: (s) => isOpen(s, 'glasshouse'),
    title: 'THE GLASSHOUSE IS OPEN',
    text: 'Wipe your feet. Do not touch the squash. Violets available on request. — M. Sloe',
  },
  {
    id: 'glasshouse_jammed',
    priority: 60,
    minDay: 3,
    when: (s) => !isOpen(s, 'glasshouse'),
    title: 'GLASSHOUSE',
    text: 'Door still jammed. Offers of help, hinges or hammers to M. Sloe. Tomatoes available (in teapots).',
  },
  {
    id: 'lantern_night',
    priority: 50,
    minDay: 3,
    title: 'LANTERN NIGHT',
    text: 'Sunday, on the Green. Volunteers wanted for bunting. And lanterns. And, if possible, the Green.',
  },
  {
    id: 'lost_tape',
    priority: 40,
    minDay: 4,
    title: 'LOST',
    text: 'One marrow measuring tape. Last seen near a marrow. No questions asked. — B.H.',
  },
  {
    id: 'usual',
    priority: 1,
    title: 'THE BORROWBURROW',
    text: 'Open as usual. Things out, things in, stories all round.',
  },
]

export function noticeFor(s: GameState): NoticeDef {
  const ok = NOTICES.filter(
    (n) =>
      (n.day === undefined || n.day === s.day) &&
      (n.minDay === undefined || s.day >= n.minDay) &&
      (!n.when || n.when(s)),
  )
  return ok.sort((a, b) => b.priority - a.priority)[0] ?? NOTICES[NOTICES.length - 1]
}
