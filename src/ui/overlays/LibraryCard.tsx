import { useState } from 'react'
import { MarkIcon } from '../../art/marks'
import { ObjectArt } from '../../art/objects'
import { KEEPSAKE_KIND_LABEL } from '../../game/content/keepsakes'
import { OBJECTS } from '../../game/content/objects'
import { RESIDENTS } from '../../game/content/residents'
import { LOCATIONS, MARKS, WEEKDAYS } from '../../game/content/world'
import { borrowersOf, photos } from '../../game/query'
import type { GameState, ObjectId, ProvenanceEntry } from '../../game/types'
import { Overlay } from './Overlay'
import { Polaroid } from './Polaroid'

const dayStamp = (d: number) => `${WEEKDAYS[(d - 1) % 7].slice(0, 3).toUpperCase()} · DAY ${d}`
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

function Entry({ e, open, onToggle, fresh }: { e: ProvenanceEntry; open: boolean; onToggle: () => void; fresh: boolean }) {
  const who = RESIDENTS[e.borrower].short
  const withWhom = e.with.map((w) => RESIDENTS[w].short)
  return (
    <li className={`lc-entry ${fresh ? 'lc-entry--fresh' : ''} lc-entry--${e.kind}`}>
      <button className="lc-entry__row" onClick={onToggle} aria-expanded={open}>
        <span className="lc-entry__stamp">{dayStamp(e.day)}</span>
        <span className="lc-entry__who hand">
          {e.kind === 'mend' ? `mended by ${who}` : e.kind === 'happening' ? who : who}
          {withWhom.length > 0 && <span className="lc-entry__with"> &amp; {withWhom.join(', ')}</span>}
        </span>
        <span className="lc-entry__title">{e.title}</span>
        <span className="lc-entry__where">{cap(LOCATIONS[e.location].name)}</span>
      </button>
      {open && (
        <div className="lc-entry__text">
          <p>{e.text}</p>
          {e.mark && (
            <p className="lc-entry__mark">
              <MarkIcon id={e.mark.id} size={26} /> came back with a {MARKS[e.mark.id].label}
              {e.mark.note ? ` — “${e.mark.note}”` : ''}
            </p>
          )}
        </div>
      )}
    </li>
  )
}

/** Every object's library card: where it has been, with whom, and what it brought back. */
export function LibraryCard({ state, id, onClose }: { state: GameState; id: ObjectId; onClose: () => void }) {
  const def = OBJECTS[id]
  const obj = state.objects[id]!
  const history = obj.history
  const [open, setOpen] = useState<number | null>(history.length ? history.length - 1 : null)
  const loan = state.loans.find((l) => l.objectId === id)
  const status = loan
    ? `Out with ${RESIDENTS[loan.residentId].short} — ${loan.returnDay > state.day ? 'back tomorrow' : 'back tonight'}`
    : state.phase === 'evening' && state.report.returned.includes(id)
      ? 'Back tonight'
      : state.shelf.includes(id) && state.phase !== 'evening'
      ? 'On today’s counter'
      : 'On the shelf'
  const pics = id === 'album' || id === 'camera' ? photos(state) : []
  const keepsakes = id === 'camera' ? [] : obj.keepsakes
  const borrowers = borrowersOf(obj)
  const origin = obj.donor
    ? `Given by ${RESIDENTS[obj.donor].name} on ${WEEKDAYS[(obj.acquiredDay - 1) % 7]}.`
    : def.origin
  return (
    <Overlay label={`${def.name} — library card`} onClose={onClose} className="sheet--card">
      <div className="lc">
        <header className="lc__head">
          <div className="lc__art">
            <ObjectArt id={id} marks={obj.marks} freshDay={state.phase === 'evening' ? state.day : undefined} photos={id === 'album' ? pics.length : undefined} />
          </div>
          <div className="lc__title">
            <span className="lc__kicker">Borrowburrow · Library of Things · No. {def.catalogue}</span>
            <h2>{def.name}</h2>
            <p className="lc__blurb">{def.blurb}</p>
            <p className="lc__origin">
              {origin}
              {obj.donorNote && <span className="hand lc__note"> “{obj.donorNote}”</span>}
            </p>
            <p className="lc__status">
              <strong>{status}</strong>
              {borrowers.length > 0 && <span> · borrowed by {borrowers.map((b) => RESIDENTS[b].short).join(', ')}</span>}
            </p>
          </div>
        </header>

        <section className="lc__section">
          <h3>Borrowed</h3>
          {history.length === 0 ? (
            <p className="lc__empty hand">Nobody yet. It’s waiting for its first story.</p>
          ) : (
            <ol className="lc__entries">
              {history.map((e, i) => (
                <Entry key={i} e={e} open={open === i} fresh={e.day === state.day && state.phase === 'evening'} onToggle={() => setOpen(open === i ? null : i)} />
              ))}
            </ol>
          )}
        </section>

        {obj.marks.length > 0 && (
          <section className="lc__section">
            <h3>Marks it has picked up</h3>
            <ul className="lc__marks">
              {obj.marks.map((m, i) => (
                <li key={i}>
                  <MarkIcon id={m.id} size={30} />
                  <span>
                    {cap(MARKS[m.id].label)}
                    {m.note && <em> “{m.note}”</em>}
                    <small className="hand"> {RESIDENTS[m.by].short}, day {m.day}</small>
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {keepsakes.length > 0 && (
          <section className="lc__section">
            <h3>{def.keepsakeLabel ?? 'Left inside'}</h3>
            <ul className="lc__keepsakes">
              {keepsakes.map((k, i) => (
                <li key={i}>
                  <span className="hand lc__keepsake">{k.text}</span>
                  <small>
                    {KEEPSAKE_KIND_LABEL[k.kind]} left by {RESIDENTS[k.by].short}, day {k.day}
                    {k.foundBy?.length ? ` · found by ${k.foundBy.map((f) => RESIDENTS[f].short).join(', ')}` : ''}
                  </small>
                </li>
              ))}
            </ul>
          </section>
        )}

        {pics.length > 0 && (
          <section className="lc__section">
            <h3>{id === 'album' ? 'In the album' : 'Photographs taken'}</h3>
            <div className="lc__photos">
              {pics.map((p, i) => (
                <div key={i} className="lc__photo">
                  <Polaroid k={p} rotate={((i * 37) % 9) - 4} />
                  <small>
                    by {RESIDENTS[p.by].short}, day {p.day}
                  </small>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </Overlay>
  )
}
