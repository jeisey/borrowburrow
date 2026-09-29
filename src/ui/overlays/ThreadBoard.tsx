import { useMemo, useState } from 'react'
import { ObjectArt } from '../../art/objects'
import { C, INK } from '../../art/palette'
import { ResidentArt } from '../../art/residents'
import { OBJECTS } from '../../game/content/objects'
import { RESIDENTS } from '../../game/content/residents'
import { WEEKDAYS } from '../../game/content/world'
import { deriveThreads, partnersOf } from '../../game/query'
import type { GameState, ResidentId, Thread } from '../../game/types'
import { RESIDENT_IDS } from '../../game/types'
import { MiniPortrait } from '../house/ThreadHoop'
import { ringPositions, strandColor, yarnPath } from '../threads/layout'
import { Overlay } from './Overlay'

function ResidentProfile({ state, id, onBack }: { state: GameState; id: ResidentId; onBack: () => void }) {
  const r = RESIDENTS[id]
  const partners = partnersOf(state, id)
  const threads = deriveThreads(state).filter((t) => t.a === id || t.b === id)
  const secretOpen = partners.length >= 2
  const here = state.present.includes(id)
  return (
    <div className="profile">
      <button className="profile__back hand" onClick={onBack} data-autofocus>
        ← back to the Threads
      </button>
      <div className="profile__grid">
        <div className="profile__art">
          <ResidentArt id={id} mood="happy" title={r.name} />
        </div>
        <div className="profile__text">
          <h2>{r.name}</h2>
          <p className="profile__role">
            {r.species} · {r.role} · <span className="hand">{r.homeLabel}</span>
          </p>
          {!here ? (
            <p className="hand profile__away">Hasn’t arrived in Mosswick yet.</p>
          ) : (
            <>
              <p>{r.rhythm}</p>
              <p>
                <strong>Is:</strong> {r.traits.join(', ')}. <strong>Likes:</strong> {r.likes.join(', ')}.
              </p>
              <ul className="profile__frets">
                {r.frets.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
              {Object.entries(r.relations).length > 0 && (
                <div className="profile__relations">
                  <h3>Already knows</h3>
                  <ul>
                    {Object.entries(r.relations).map(([other, text]) => (
                      <li key={other}>
                        <strong>{RESIDENTS[other as ResidentId].short}:</strong> {text}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="profile__threads">
                <h3>Threads</h3>
                {threads.length === 0 ? (
                  <p className="hand">None yet. Lend {r.pronouns.them} something.</p>
                ) : (
                  <ul>
                    {threads.map((t) => {
                      const other = t.a === id ? t.b : t.a
                      return (
                        <li key={t.key}>
                          <strong>{RESIDENTS[other].short}</strong> — {t.strands.map((s) => s.title).join(' · ')}
                        </li>
                      )
                    })}
                  </ul>
                )}
              </div>
              <p className={`profile__secret ${secretOpen ? 'is-open' : ''}`}>
                {secretOpen ? (
                  <>
                    <span className="hand">Something you’ve learned:</span> {r.secret}
                  </>
                ) : (
                  <span className="hand">There’s more to {r.short}. Tie a couple more Threads and you might find out.</span>
                )}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function ThreadDetail({ t }: { t: Thread }) {
  return (
    <div className="thread-detail">
      <h3>
        {RESIDENTS[t.a].short} &amp; {RESIDENTS[t.b].short}
      </h3>
      <ol>
        {t.strands.map((s, i) => (
          <li key={i}>
            <span className="thread-detail__obj">
              <ObjectArt id={s.objectId} bare />
            </span>
            <span>
              <strong>{s.title}</strong>
              <small>
                {WEEKDAYS[(s.day - 1) % 7]} · the {OBJECTS[s.objectId].short}
              </small>
            </span>
          </li>
        ))}
      </ol>
    </div>
  )
}

/** The Thread board: who knows whom, and which borrowed thing tied them together. */
export function ThreadBoard({ state, onClose, initial }: { state: GameState; onClose: () => void; initial?: ResidentId }) {
  const threads = useMemo(() => deriveThreads(state), [state])
  const [person, setPerson] = useState<ResidentId | undefined>(initial)
  const [selected, setSelected] = useState<string | undefined>(threads.at(-1)?.key)
  const pos = ringPositions(300, 300, 215)
  const thread = threads.find((t) => t.key === selected)
  const strands = threads.reduce((n, t) => n + t.strands.length, 0)
  return (
    <Overlay label="The Thread board" onClose={onClose} className="sheet--threads">
      {person ? (
        <ResidentProfile state={state} id={person} onBack={() => setPerson(undefined)} />
      ) : (
        <div className="threads">
          <div className="threads__board">
            <svg viewBox="0 0 600 600" className="threads__svg">
              <rect width={600} height={600} rx={18} fill="#c49060" />
              <rect width={600} height={600} rx={18} fill="url(#bb-hatch)" opacity={0.25} />
              {threads.map((t) =>
                t.strands.map((_, i) => (
                  <g key={`${t.key}-${i}`} className={t.strands[i].day === state.day ? 'yarn yarn--fresh' : 'yarn'} opacity={selected && t.key !== selected ? 0.5 : 1}>
                    <path d={yarnPath(pos[t.a], pos[t.b], i, t.strands.length, 45, [300, 300])} stroke={INK} strokeWidth={t.key === selected ? 9 : 7} fill="none" strokeLinecap="round" opacity={0.45} />
                    <path d={yarnPath(pos[t.a], pos[t.b], i, t.strands.length, 45, [300, 300])} stroke={strandColor(t, i)} strokeWidth={t.key === selected ? 6 : 4.5} fill="none" strokeLinecap="round" />
                  </g>
                )),
              )}
              {threads.map((t) => (
                <path
                  key={`hit-${t.key}`}
                  d={yarnPath(pos[t.a], pos[t.b], 0, 1, 45, [300, 300])}
                  stroke="transparent"
                  strokeWidth={26}
                  fill="none"
                  style={{ cursor: 'pointer' }}
                  onClick={() => setSelected(t.key)}
                />
              ))}
              {RESIDENT_IDS.map((id) => (
                <g key={id}>
                  <circle cx={pos[id][0]} cy={pos[id][1] - 66} r={6} fill={C.tomato} stroke={INK} strokeWidth={2} />
                  <MiniPortrait id={id} x={pos[id][0]} y={pos[id][1]} r={56} present={state.present.includes(id)} />
                </g>
              ))}
            </svg>
            {RESIDENT_IDS.map((id) => (
              <button
                key={id}
                className="threads__person"
                style={{ left: `${(pos[id][0] / 600) * 100}%`, top: `${(pos[id][1] / 600) * 100}%` }}
                onClick={() => setPerson(id)}
              >
                <span>{RESIDENTS[id].short}</span>
              </button>
            ))}
          </div>
          <div className="threads__side">
            <h2>Threads</h2>
            <p className="threads__lede">
              {threads.length === 0
                ? 'No Threads yet. They appear when neighbours share something you’ve lent.'
                : `${threads.length} Thread${threads.length > 1 ? 's' : ''} between neighbours, ${strands} strand${strands > 1 ? 's' : ''} in all. Every one began with something borrowed.`}
            </p>
            {threads.length > 0 && (
              <ul className="threads__list">
                {threads.map((t) => (
                  <li key={t.key}>
                    <button className={t.key === selected ? 'is-on' : ''} onClick={() => setSelected(t.key)}>
                      <span className="threads__swatches">
                        {t.strands.map((_, i) => (
                          <i key={i} style={{ background: strandColor(t, i) }} />
                        ))}
                      </span>
                      {RESIDENTS[t.a].short} &amp; {RESIDENTS[t.b].short}
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {thread && <ThreadDetail t={thread} />}
            <p className="threads__tip hand">Tap a neighbour to learn about them.</p>
          </div>
        </div>
      )}
    </Overlay>
  )
}
