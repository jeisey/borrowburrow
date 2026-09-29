import type { LocationId, ResidentId } from '../../game/types'

/** Where things are in Mosswick, in map units (1600 × 1000). */
export const PLACE_AT: Record<LocationId, [number, number]> = {
  hill: [330, 300],
  green: [840, 610],
  kettleRow: [1320, 690],
  millpond: [300, 735],
  glasshouse: [1300, 440],
  burrow: [820, 880],
}

export const HOME_AT: Record<ResidentId, [number, number]> = {
  odile: [700, 530],
  barnaby: [1010, 530],
  tansy: [1262, 778],
  tobias: [1150, 778],
  margo: [1500, 486],
  hollis: [1376, 778],
}

export const PLACE_SIGN: Record<LocationId, [number, number]> = {
  hill: [410, 380],
  green: [910, 700],
  kettleRow: [1420, 790],
  millpond: [430, 840],
  glasshouse: [1190, 470],
  burrow: [990, 930],
}
