import { OBJECTS } from '../../game/content/objects'
import type { ResidentId, Thread } from '../../game/types'
import { RESIDENT_IDS } from '../../game/types'

/** Residents sit around a ring, in a fixed order so the picture stays familiar. */
export function ringPositions(cx: number, cy: number, r: number): Record<ResidentId, [number, number]> {
  const out = {} as Record<ResidentId, [number, number]>
  RESIDENT_IDS.forEach((id, i) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / RESIDENT_IDS.length
    out[id] = [cx + Math.cos(a) * r, cy + Math.sin(a) * r]
  })
  return out
}

/**
 * A yarn curve between two pins. It bows toward the middle of the board (like
 * string pulled round the pins), and extra strands fan out beside it.
 */
export function yarnPath(
  a: [number, number],
  b: [number, number],
  strand: number,
  of: number,
  pull: number,
  centre?: [number, number],
): string {
  const [x1, y1] = a
  const [x2, y2] = b
  const mx = (x1 + x2) / 2
  const my = (y1 + y2) / 2
  const dx = x2 - x1
  const dy = y2 - y1
  const len = Math.hypot(dx, dy) || 1
  const nx = -dy / len
  const ny = dx / len
  const spread = (strand - (of - 1) / 2) * 7
  let cx = mx + nx * spread
  let cy = my + ny * spread
  if (centre) {
    // Pull the midpoint toward the centre so short threads still show clearly.
    const k = Math.min(0.9, pull / 100)
    cx += (centre[0] - mx) * k
    cy += (centre[1] - my) * k
  } else {
    cy += pull
  }
  return `M${x1.toFixed(1)} ${y1.toFixed(1)} Q${cx.toFixed(1)} ${cy.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`
}

export function strandColor(t: Thread, i: number): string {
  return OBJECTS[t.strands[i].objectId].color
}
