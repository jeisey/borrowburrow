import { ObjectArt } from '../../art/objects'
import { OBJECTS } from '../../game/content/objects'
import { RESIDENTS } from '../../game/content/residents'
import { photos } from '../../game/query'
import type { GameState, ObjectId } from '../../game/types'

export const STACK_SLOTS = 21

interface StacksProps {
  state: GameState
  /** Morning: a click puts the thing on the counter. Otherwise it opens its card. */
  canFeature: boolean
  shelfFull: boolean
  fresh: Set<ObjectId>
  /** Things standing on the counter right now: their shelf spot shows a faint outline. */
  onCounter: Set<ObjectId>
  /** Gifts still wrapped on the counter. */
  hidden: Set<ObjectId>
  onFeature: (id: ObjectId) => void
  onCard: (id: ObjectId) => void
}

function CardTab({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button className="card-tab" onClick={onClick} aria-label={label} title={label}>
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x={4} y={3} width={16} height={19} rx={2} fill="#fbf5e6" stroke="#2b211c" strokeWidth={1.6} />
        <path d="M8 9 h8 M8 13 h8 M8 17 h5" stroke="#b5523b" strokeWidth={1.6} strokeLinecap="round" />
      </svg>
    </button>
  )
}

/** The big shelf of everything the Borrowburrow owns. */
export function Stacks({ state, canFeature, shelfFull, fresh, onCounter, hidden, onFeature, onCard }: StacksProps) {
  const loans = new Map(state.loans.map((l) => [l.objectId, l]))
  const photoCount = photos(state).length
  const slots = Array.from({ length: STACK_SLOTS }, (_, i) => state.collection[i])
  return (
    <div className="stacks">
      <div className="stacks__frame" aria-hidden="true">
        <div className="stacks__plaque">The Collection</div>
      </div>
      <ul className="stacks__grid" aria-label="The collection">
        {slots.map((id, i) => {
          if (!id || hidden.has(id)) return <li key={`empty-${i}`} className="slot slot--empty" aria-hidden="true" />
          const def = OBJECTS[id]
          const obj = state.objects[id]!
          const loan = loans.get(id)
          const featured = onCounter.has(id)
          if (loan) {
            const who = RESIDENTS[loan.residentId].short
            const back = loan.returnDay > state.day ? 'back tomorrow' : state.phase === 'evening' ? 'back soon' : 'back tonight'
            return (
              <li key={id} className="slot slot--out">
                <button className="slot__out-tag" onClick={() => onCard(id)} aria-label={`${def.name}: out with ${who}, ${back}. Read its card.`}>
                  <span className="hand">Out with {who}</span>
                  <small>{back}</small>
                </button>
              </li>
            )
          }
          if (featured)
            return (
              <li key={id} className="slot slot--featured">
                <button className="slot__obj slot__obj--ghost" onClick={() => onCard(id)} aria-label={`${def.name} is out on the counter. Read its card.`}>
                  <ObjectArt id={id} bare />
                  <span className="slot__name">on the counter</span>
                </button>
              </li>
            )
          const isFresh = fresh.has(id)
          const label = canFeature
            ? shelfFull
              ? `${def.name} — the counter is full`
              : `Put the ${def.name} on today’s counter`
            : `${def.name} — read its card`
          return (
            <li key={id} className={`slot ${isFresh ? 'slot--fresh' : ''}`}>
              <button
                className="slot__obj"
                onClick={() => (canFeature ? onFeature(id) : onCard(id))}
                aria-label={label}
                aria-disabled={canFeature && shelfFull ? true : undefined}
              >
                <ObjectArt id={id} marks={obj.marks} freshDay={isFresh ? obj.marks.at(-1)?.day : undefined} photos={id === 'album' ? photoCount : undefined} />
                <span className="slot__name">{def.name}</span>
              </button>
              {isFresh && <span className="slot__ribbon hand">{obj.history.length ? 'just back' : 'new!'}</span>}
              <CardTab onClick={() => onCard(id)} label={`Read the ${def.name}’s library card`} />
            </li>
          )
        })}
      </ul>
    </div>
  )
}
