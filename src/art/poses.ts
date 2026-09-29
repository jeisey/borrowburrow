import type { ResidentId } from '../game/types'

// Posing geometry for the resident figures, in their 200×300 drawing space.

/** Where each resident's paw/wing is, in their 200×300 space — objects are held here. */
export const HOLD_POINT: Record<ResidentId, [number, number]> = {
  odile: [66, 172],
  barnaby: [152, 244],
  tansy: [138, 252],
  tobias: [142, 250],
  margo: [142, 230],
  hollis: [152, 240],
}

/** Top of each resident's head (for placing speech and name tags). */
export const HEAD_TOP: Record<ResidentId, number> = {
  odile: 34,
  barnaby: 88,
  tansy: 136,
  tobias: 128,
  margo: 82,
  hollis: 170,
}

/** Lift so short neighbours can see over the lending counter (they bring their own step). */
export const COUNTER_LIFT: Record<ResidentId, number> = {
  odile: 0,
  barnaby: 62,
  tansy: 116,
  tobias: 80,
  margo: 26,
  hollis: 104,
}

/** Head-and-shoulders crops for portraits (x y w h in the 200×300 space). */
export const PORTRAIT_BOX: Record<ResidentId, string> = {
  odile: '18 18 150 150',
  barnaby: '40 82 120 120',
  tansy: '48 126 104 104',
  tobias: '44 116 112 112',
  margo: '38 76 126 126',
  hollis: '40 164 120 120',
}

/** Just the drawing, in the shared 200×300 space. */
