import { MarkIcon } from '../../art/marks'
import { ObjectArt } from '../../art/objects'
import { C, INK } from '../../art/palette'
import { ResidentArt } from '../../art/residents'
import { OBJECTS } from '../../game/content/objects'
import { RESIDENTS } from '../../game/content/residents'
import { LOCATIONS, MARKS } from '../../game/content/world'
import { photos } from '../../game/query'
import type { EchoResult, GameState } from '../../game/types'
import { Vignette } from './Vignette'

const TIME_WORD = { day: 'afternoon', dusk: 'at dusk', night: 'that night' } as const

function Yarn({ colour }: { colour: string }) {
  return (
    <svg className="echo-yarn" viewBox="0 0 120 30" aria-hidden="true">
      <path d="M4 15 C30 30 90 0 116 15" stroke={colour} strokeWidth={4} fill="none" strokeLinecap="round" className="yarn yarn--fresh" />
      <path d="M4 15 C30 30 90 0 116 15" stroke={INK} strokeWidth={1} fill="none" opacity={0.3} />
    </svg>
  )
}

interface Props {
  state: GameState
  echo: EchoResult
  index: number
  total: number
  onNext: () => void
  nextLabel: string
  onCard: (id: EchoResult['objects'][number]) => void
}

export function EchoCard({ state, echo, index, total, onNext, nextLabel, onCard }: Props) {
  const lead = echo.cast[0]
  const place = LOCATIONS[echo.location].name
  const happening = echo.kind === 'happening'
  const kicker = happening
    ? 'Meanwhile, in Mosswick'
    : echo.kind === 'festival'
      ? 'Lantern Night'
      : `${place.replace(/^./, (c) => c.toUpperCase())}, ${TIME_WORD[echo.time]}`
  const threadColour = echo.objects[0] ? OBJECTS[echo.objects[0]].color : C.saffron
  return (
    <article className={`echo-card echo-card--${echo.kind}`} key={echo.uid} aria-live="polite">
      <div className="echo-card__frame">
        <Vignette
          location={echo.location}
          time={echo.time}
          weather={echo.weather}
          indoor={echo.indoor}
          cast={echo.cast}
          objects={echo.objects}
          mode={echo.mode}
          fx={echo.fx}
          festival={echo.kind === 'festival'}
          marks={echo.marks.map((m) => m.mark.id)}
          photos={photos(state).length}
        />
      </div>
      <div className="echo-card__body">
        <div className="echo-card__scroll">
        <p className="echo-card__kicker">
          <span>{kicker}</span>
          <span className="echo-card__count">
            {index + 1} / {total}
          </span>
        </p>
        <h2 className="echo-card__title">{echo.title}</h2>
        {echo.gist && lead && (
          <p className="echo-card__gist hand">
            {RESIDENTS[lead].short} {echo.gist}
            {echo.objects[0] && !happening ? ` — so you lent ${RESIDENTS[lead].pronouns.them} the ${OBJECTS[echo.objects[0]].short}.` : '.'}
          </p>
        )}
        <p className="echo-card__text">{echo.text}</p>

        {(echo.marks.length > 0 || echo.threads.length > 0 || echo.unlocks.length > 0) && (
          <ul className="echo-card__results">
            {echo.unlocks.map((u) => (
              <li key={u} className="echo-result echo-result--unlock">
                <span className="echo-result__star" aria-hidden="true">
                  ✦
                </span>
                <span>{u}</span>
              </li>
            ))}
            {echo.marks.map((m, i) => (
              <li key={`m${i}`} className="echo-result echo-result--mark">
                <button className="echo-result__obj" onClick={() => onCard(m.objectId)} aria-label={`Read the ${OBJECTS[m.objectId].name}’s card`}>
                  <ObjectArt id={m.objectId} marks={state.objects[m.objectId]?.marks} freshDay={state.day} />
                </button>
                <MarkIcon id={m.mark.id} size={34} />
                <span>
                  The {OBJECTS[m.objectId].short} will come home with a <strong>{MARKS[m.mark.id].label}</strong>
                  {m.mark.note ? <em> — “{m.mark.note}”</em> : null}.
                </span>
              </li>
            ))}
            {echo.threads.map((t) => (
              <li key={`${t.a}${t.b}`} className={`echo-result echo-result--thread ${t.isNew ? 'is-new' : ''}`}>
                <span className="echo-result__faces">
                  <span className="echo-face">
                    <ResidentArt id={t.a} portrait mood="happy" />
                  </span>
                  <Yarn colour={threadColour} />
                  <span className="echo-face">
                    <ResidentArt id={t.b} portrait mood="happy" />
                  </span>
                </span>
                <span>
                  <strong>{t.isNew ? 'A new Thread' : 'A Thread grows stronger'}</strong>: {RESIDENTS[t.a].short} &amp; {RESIDENTS[t.b].short}
                </span>
              </li>
            ))}
          </ul>
        )}
        </div>
        <div className="echo-card__actions">
          <button className="paper-button echo-card__next" onClick={onNext} data-autofocus>
            {nextLabel}
          </button>
        </div>
      </div>
    </article>
  )
}
