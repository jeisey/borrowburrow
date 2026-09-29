import { useState, type Dispatch } from 'react'
import { ObjectArt } from '../../art/objects'
import { festivalSegments } from '../../game/content/festival'
import { RESIDENTS } from '../../game/content/residents'
import { deriveThreads } from '../../game/query'
import type { GameState, ResidentId } from '../../game/types'
import type { GameAction } from '../../state/useGame'
import type { Orient } from '../Stage'
import { ringPositions, strandColor, yarnPath } from '../threads/layout'
import { VillageMap } from '../village/VillageMap'

/** Lantern Night on the Green, assembled from the week you made. */
export function Festival({ state, dispatch, orient }: { state: GameState; dispatch: Dispatch<GameAction>; orient: Orient }) {
  const segs = festivalSegments(state)
  const [shown, setShown] = useState(1)
  const threads = deriveThreads(state)
  const ring = ringPositions(840, 560, 190)
  const figures = state.present.map((id: ResidentId) => ({ id, at: [ring[id][0], ring[id][1] + 70] as [number, number], flip: ring[id][0] > 840 }))
  const done = shown >= segs.length
  return (
    <div className={`festival festival--${orient}`}>
      <div className="festival__map">
        <VillageMap state={state} time="night" weather="sunny" festival figures={figures} showSigns={false}>
          <g className="festival__threads">
            {threads.map((t) =>
              t.strands.slice(0, 3).map((_, i) => (
                <path
                  key={`${t.key}-${i}`}
                  d={yarnPath([ring[t.a][0], ring[t.a][1] - 10], [ring[t.b][0], ring[t.b][1] - 10], i, Math.min(3, t.strands.length), 40, [840, 470])}
                  stroke={strandColor(t, i)}
                  strokeWidth={4}
                  fill="none"
                  strokeLinecap="round"
                  className="yarn yarn--glow"
                />
              )),
            )}
          </g>
        </VillageMap>
      </div>
      <section className="festival__scroll" aria-live="polite">
        <p className="festival__kicker">Sunday · Lantern Night</p>
        <h2>What happened at Lantern Night</h2>
        <ol className="festival__segs">
          {segs.slice(0, shown).map((s) => (
            <li key={s.id} className="festival__seg">
              <h3>{s.title}</h3>
              <p>{s.text}</p>
              {s.objects.length > 0 && (
                <span className="festival__objs">
                  {s.objects
                    .filter((o) => state.objects[o])
                    .map((o) => (
                      <span key={o} className="festival__obj">
                        <ObjectArt id={o} marks={state.objects[o]!.marks} />
                      </span>
                    ))}
                </span>
              )}
              {s.cast.length > 0 && s.cast.length < 6 && <small className="hand">{s.cast.map((c) => RESIDENTS[c].short).join(', ')}</small>}
            </li>
          ))}
        </ol>
        <div className="festival__actions">
          {!done ? (
            <button className="paper-button" onClick={() => setShown((n) => n + 1)} data-autofocus>
              And then… ({segs.length - shown} more)
            </button>
          ) : (
            <>
              <p className="festival__last hand">Every Thread in Mosswick began with something borrowed.</p>
              <button className="paper-button" onClick={() => dispatch({ type: 'finishFestival' })} data-autofocus>
                The week in Mosswick →
              </button>
            </>
          )}
        </div>
      </section>
    </div>
  )
}
