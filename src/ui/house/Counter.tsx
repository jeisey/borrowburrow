import type { Ref } from 'react'
import { ObjectArt } from '../../art/objects'
import { C, INK } from '../../art/palette'
import { OBJECTS } from '../../game/content/objects'
import type { Donation, GameState, ObjectId } from '../../game/types'

interface CounterProps {
  state: GameState
  slots: number
  /** What's displayed on the counter right now (featured things, or tonight's returns). */
  items: ObjectId[]
  mode: 'curate' | 'lend' | 'returns'
  offered?: ObjectId
  freshDay?: number
  parcels: Donation[]
  onItem: (id: ObjectId) => void
  onCard: (id: ObjectId) => void
  onParcel: (d: Donation) => void
  openedParcels: Set<ObjectId>
  /** Keyboard focus lands on the first thing here when the scene changes. */
  focusFirst?: boolean
}

function Parcel() {
  return (
    <svg viewBox="0 0 120 120" aria-hidden="true">
      <g filter="url(#bb-wobble)">
        <path d="M16 50 L104 50 L100 106 L20 106 Z" fill="#c9a06a" stroke={INK} strokeWidth={3} />
        <path d="M12 38 L108 38 L106 54 L14 54 Z" fill="#d9b27a" stroke={INK} strokeWidth={3} />
        <path d="M60 38 V106 M14 46 H106" stroke={C.tomato} strokeWidth={5} />
        <path d="M60 38 C44 18 30 30 44 38 M60 38 C76 18 90 30 76 38" stroke={C.tomato} strokeWidth={4} fill="none" />
        <rect x={68} y={70} width={26} height={18} rx={2} fill={C.cream} stroke={INK} strokeWidth={2} transform="rotate(-8 81 79)" />
      </g>
    </svg>
  )
}

/** The lending counter: today's things stand on it; tonight's returns come back to it. */
export function Counter({ state, slots, items, mode, offered, freshDay, parcels, onItem, onCard, onParcel, openedParcels, focusFirst }: CounterProps) {
  const cells = Array.from({ length: Math.max(slots, items.length) }, (_, i) => items[i])
  const label = (id: ObjectId) => {
    const name = OBJECTS[id].name
    if (mode === 'curate') return `${name} — take it back off the counter`
    if (mode === 'lend') return offered === id ? `${name} — take it back` : `Offer the ${name}`
    return `${name} — back tonight. Read its card.`
  }
  return (
    <div className={`counter counter--${mode}`}>
      <ul className="counter__display" aria-label={mode === 'returns' ? 'Back tonight' : 'Today’s counter'}>
        {cells.map((id, i) =>
          id ? (
            <li key={id} className={`counter__cell ${offered === id ? 'counter__cell--offered' : ''}`}>
              <button
                className="counter__obj"
                onClick={() => onItem(id)}
                aria-label={label(id)}
                aria-pressed={mode === 'lend' ? offered === id : undefined}
                data-autofocus={(focusFirst && i === 0) || undefined}
              >
                <ObjectArt id={id} marks={state.objects[id]?.marks} freshDay={freshDay} />
                <span className="counter__name">{OBJECTS[id].name}</span>
              </button>
              {mode !== 'returns' && (
                <button className="card-tab card-tab--counter" onClick={() => onCard(id)} aria-label={`Read the ${OBJECTS[id].name}’s library card`}>
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <rect x={4} y={3} width={16} height={19} rx={2} fill="#fbf5e6" stroke="#2b211c" strokeWidth={1.6} />
                    <path d="M8 9 h8 M8 13 h8 M8 17 h5" stroke="#b5523b" strokeWidth={1.6} strokeLinecap="round" />
                  </svg>
                </button>
              )}
              {mode === 'returns' && <span className="counter__new hand" aria-hidden="true">new mark!</span>}
              <span className="counter__coaster" aria-hidden="true" />
            </li>
          ) : (
            <li key={`free-${i}`} className="counter__cell counter__cell--free" aria-hidden="true">
              <span className="counter__coaster" />
            </li>
          ),
        )}
        {parcels.map((d) => (
          <li key={d.objectId} className="counter__cell counter__cell--parcel">
            <button
              className={`counter__obj ${openedParcels.has(d.objectId) ? 'is-open' : ''}`}
              onClick={() => onParcel(d)}
              aria-label={openedParcels.has(d.objectId) ? `${OBJECTS[d.objectId].name} — a gift. Read its card.` : 'A parcel on the doorstep — open it'}
            >
              {openedParcels.has(d.objectId) ? <ObjectArt id={d.objectId} /> : <Parcel />}
              <span className="counter__name">{openedParcels.has(d.objectId) ? OBJECTS[d.objectId].name : 'A parcel!'}</span>
            </button>
            <span className="counter__coaster" aria-hidden="true" />
          </li>
        ))}
      </ul>
    </div>
  )
}

/** The rubber stamp on its ink pad — the “lend” button, once something is offered. */
export function Stamp({ ready, onStamp, stamping, buttonRef }: { ready: boolean; onStamp: () => void; stamping: boolean; buttonRef?: Ref<HTMLButtonElement> }) {
  return (
    <button
      ref={buttonRef}
      className={`stamp ${ready ? 'stamp--ready' : ''} ${stamping ? 'stamp--down' : ''}`}
      onClick={onStamp}
      disabled={!ready}
      aria-label="Stamp the card and lend it"
      data-autofocus={ready || undefined}
    >
      <svg viewBox="0 0 160 150" aria-hidden="true">
        <g filter="url(#bb-wobble)">
          <rect x={14} y={112} width={132} height={30} rx={6} fill="#3a2a2a" stroke={INK} strokeWidth={3} />
          <rect x={22} y={108} width={116} height={14} rx={4} fill="#7a2a2a" stroke={INK} strokeWidth={2.4} />
          <g className="stamp__handle">
            <rect x={48} y={78} width={64} height={24} rx={4} fill={C.woodDark} stroke={INK} strokeWidth={3} />
            <rect x={44} y={98} width={72} height={10} rx={2} fill={C.brick} stroke={INK} strokeWidth={2.4} />
            <path d="M80 78 C80 60 66 56 66 38 C66 20 94 20 94 38 C94 56 80 60 80 78 Z" fill={C.wood} stroke={INK} strokeWidth={3} />
            <ellipse cx={80} cy={34} rx={10} ry={6} fill={C.woodLight} opacity={0.6} />
          </g>
        </g>
      </svg>
      <span className="stamp__label">{ready ? 'Stamp it out' : 'Stamp'}</span>
    </button>
  )
}
