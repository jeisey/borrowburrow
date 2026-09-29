import { useEffect, useMemo, useRef, type Dispatch } from 'react'
import { sfx } from '../../audio/sfx'
import { WEEKDAYS } from '../../game/content/world'
import { isFestivalDay, weatherFor } from '../../game/engine'
import type { GameState, LocationId, ObjectId, ResidentId } from '../../game/types'
import type { GameAction } from '../../state/useGame'
import type { Orient } from '../Stage'
import { EchoCard } from './EchoCard'
import { HOME_AT, PLACE_AT } from './mapGeo'
import { VillageMap, type MapFigure } from './VillageMap'

interface Props {
  state: GameState
  dispatch: Dispatch<GameAction>
  orient: Orient
  motion: boolean
  onCard: (id: ObjectId) => void
}

/** The camera: centre a map location at a target point of the frame, zoomed in. */
function cameraTransform(loc: LocationId | undefined, orient: Orient): string {
  if (!loc) return 'translate(0, 0) scale(1)'
  const s = orient === 'wide' ? 1.75 : 1.6
  const [x, y] = PLACE_AT[loc]
  const dx = x / 1600 - 0.5
  const dy = y / 1000 - 0.5
  const target = orient === 'wide' ? [0.27, 0.5] : [0.5, 0.55]
  const tx = (target[0] - 0.5 - dx * s) * 100
  const ty = (target[1] - 0.5 - dy * s) * 100
  return `translate(${tx}%, ${ty}%) scale(${s})`
}

/** The afternoon: everything lent this morning goes out into Mosswick, one Echo at a time. */
export function Village({ state, dispatch, orient, motion, onCard }: Props) {
  const echoes = state.report.echoes
  const index = Math.min(state.report.echoIndex, Math.max(0, echoes.length - 1))
  const echo = echoes[index]
  const festival = isFestivalDay(state)
  const last = index >= echoes.length - 1
  const weather = weatherFor(state, state.day)

  // Where everyone is: today's echoes place people around the village.
  const figures = useMemo<MapFigure[]>(() => {
    const at = new Map<ResidentId, [number, number]>()
    for (const r of state.present) at.set(r, HOME_AT[r])
    echoes.slice(0, index + 1).forEach((e, i) => {
      const [x, y] = PLACE_AT[e.location]
      e.cast.forEach((r, j) => {
        if (i === index || !at.has(r) || at.get(r) === HOME_AT[r]) at.set(r, [x + (j - (e.cast.length - 1) / 2) * 52, y + 10])
      })
    })
    return [...at.entries()].map(([id, pos]) => ({ id, at: pos, highlight: !!echo && echo.cast.includes(id), flip: pos[0] > 800 }))
  }, [echoes, index, echo, state.present])

  // Sound for each new card.
  const played = useRef<string>('')
  useEffect(() => {
    if (!echo || played.current === echo.uid) return
    played.current = echo.uid
    if (echo.kind === 'happening') sfx.happening()
    else sfx.paper()
    if (echo.threads.some((t) => t.isNew)) window.setTimeout(() => sfx.thread(), motion ? 700 : 0)
  }, [echo, motion])

  const next = () => {
    if (!last) dispatch({ type: 'echoIndex', index: index + 1 })
    else if (festival) dispatch({ type: 'festival' })
    else {
      sfx.dusk()
      dispatch({ type: 'evening' })
    }
  }
  const nextLabel = last ? (festival ? 'On to the festival →' : 'Evening falls →') : 'Next →'
  const time = festival ? 'night' : echo?.time === 'night' ? 'night' : echo?.time === 'dusk' ? 'dusk' : 'day'
  const weekday = WEEKDAYS[(state.day - 1) % 7]

  return (
    <div className={`village village--${orient}`}>
      <div className="village__mapbox">
        <div className="village__map" style={{ transform: cameraTransform(echo?.location, orient), transition: motion ? undefined : 'none' }}>
          <VillageMap state={state} time={time} weather={festival ? 'sunny' : weather} figures={figures} festival={festival} />
        </div>
      </div>
      <header className="village__banner">
        <span className="village__day">
          {weekday}
          {festival ? ', Lantern Night' : echo?.time === 'night' ? ' night' : echo?.time === 'dusk' ? ' evening' : ' afternoon'}
        </span>
        <span className="village__dots" aria-hidden="true">
          {echoes.map((e, i) => (
            <i key={e.uid} className={i === index ? 'is-on' : i < index ? 'is-done' : ''} />
          ))}
        </span>
      </header>
      {echo ? (
        <div className="village__card">
          <EchoCard state={state} echo={echo} index={index} total={echoes.length} onNext={next} nextLabel={nextLabel} onCard={onCard} />
        </div>
      ) : (
        <div className="village__card">
          <article className="echo-card">
            <div className="echo-card__body">
              <h2 className="echo-card__title">A quiet afternoon</h2>
              <p className="echo-card__text">Nothing went out today, so Mosswick had a sleepy sort of afternoon. That’s allowed.</p>
              <button className="paper-button" onClick={next} data-autofocus>
                Evening falls →
              </button>
            </div>
          </article>
        </div>
      )}
      {!last && echoes.length > 1 && (
        <button className="village__skip hand" onClick={() => dispatch({ type: 'echoIndex', index: echoes.length - 1 })}>
          skip to the last
        </button>
      )}
    </div>
  )
}
