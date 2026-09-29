import { useEffect, useReducer } from 'react'
import {
  closeForAfternoon,
  decline,
  feature,
  finishFestival,
  lend,
  newGame,
  openDoors,
  setEchoIndex,
  sleep,
  toEvening,
  toFestival,
  unfeature,
} from '../game/engine'
import { clearGame, loadGame, saveGame } from '../game/persistence'
import { newSeed } from '../game/rng'
import type { GameState, ObjectId } from '../game/types'

export type GameAction =
  | { type: 'new'; seed?: number }
  | { type: 'feature'; id: ObjectId }
  | { type: 'unfeature'; id: ObjectId }
  | { type: 'open' }
  | { type: 'lend'; id: ObjectId }
  | { type: 'decline' }
  | { type: 'close' }
  | { type: 'echoIndex'; index: number }
  | { type: 'evening' }
  | { type: 'festival' }
  | { type: 'finishFestival' }
  | { type: 'sleep' }
  | { type: 'reset' }

function reducer(state: GameState | null, action: GameAction): GameState | null {
  if (action.type === 'new') return newGame(action.seed ?? newSeed())
  if (action.type === 'reset') return null
  if (!state) return state
  switch (action.type) {
    case 'feature':
      return feature(state, action.id)
    case 'unfeature':
      return unfeature(state, action.id)
    case 'open':
      return openDoors(state)
    case 'lend':
      return lend(state, action.id)
    case 'decline':
      return decline(state)
    case 'close':
      return closeForAfternoon(state)
    case 'echoIndex':
      return setEchoIndex(state, action.index)
    case 'evening':
      return toEvening(state)
    case 'festival':
      return toFestival(state)
    case 'finishFestival':
      return finishFestival(state)
    case 'sleep':
      return sleep(state)
  }
}

/** The whole game lives in one reducer over the pure engine, saved after every change. */
export function useGame() {
  const [state, dispatch] = useReducer(reducer, null, () => loadGame())
  useEffect(() => {
    if (state) saveGame(state)
    else clearGame()
  }, [state])
  return [state, dispatch] as const
}
