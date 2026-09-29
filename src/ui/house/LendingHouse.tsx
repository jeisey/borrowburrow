import { useEffect, useMemo, useRef, useState, type Dispatch } from 'react'
import { sfx } from '../../audio/sfx'
import { noticeFor } from '../../game/content/notices'
import { REQUESTS_BY_ID } from '../../game/content/requests'
import { RESIDENTS } from '../../game/content/residents'
import { OBJECTS } from '../../game/content/objects'
import { WEEKDAYS } from '../../game/content/world'
import { allVisitorsServed, currentVisit, isFestivalDay, morningHints, reactionFor, weatherFor } from '../../game/engine'
import { ResidentArt } from '../../art/residents'
import { deriveThreads, shelfSize } from '../../game/query'
import type { Donation, GameState, ObjectId } from '../../game/types'
import type { GameAction } from '../../state/useGame'
import type { Orient } from '../Stage'
import { Counter, Stamp } from './Counter'
import { CounterDecor, Decorations } from './Decorations'
import { Door, DoorBell } from './Door'
import { NoticeBoard } from './NoticeBoard'
import { Room } from './Room'
import { Stacks } from './Stacks'
import { ThreadHoop } from './ThreadHoop'
import { Visitor } from './Visitor'
import { WindowView, type Tone } from './WindowView'

interface Props {
  state: GameState
  dispatch: Dispatch<GameAction>
  orient: Orient
  motion: boolean
  onCard: (id: ObjectId) => void
  onThreads: () => void
  onNotice: () => void
  onDonation: (d: Donation) => void
}

function DoorSign({ label, sub, onClick, disabled, flip }: { label: string; sub?: string; onClick?: () => void; disabled?: boolean; flip?: boolean }) {
  return (
    <button className={`door-sign ${flip ? 'door-sign--flip' : ''} ${disabled ? '' : 'door-sign--live'}`} onClick={onClick} disabled={disabled}>
      <svg className="door-sign__strings" viewBox="0 0 200 60" aria-hidden="true">
        <path d="M100 4 L30 56 M100 4 L170 56" stroke="#2b211c" strokeWidth={2.4} fill="none" />
        <circle cx={100} cy={6} r={5} fill="#c9a24a" stroke="#2b211c" strokeWidth={2} />
      </svg>
      <span className="door-sign__board">
        <span className="door-sign__label">{label}</span>
        {sub && <span className="door-sign__sub hand">{sub}</span>}
      </span>
    </button>
  )
}

/** Morning gossip, pinned to the wall: hints about what today's visitors are up to. */
function GossipNotes({ state, onNotice }: { state: GameState; onNotice: () => void }) {
  const hints = morningHints(state)
  const notes = [...hints.overheard, ...(hints.provenance ? [hints.provenance] : [])]
  if (!notes.length) return null
  return (
    <div className="gossip">
      <p className="gossip__title hand">Overheard this morning…</p>
      {notes.map((h, i) => (
        <button
          key={h.text}
          className={`gossip__note ${h.objectId ? 'gossip__note--prov' : ''}`}
          style={{ transform: `rotate(${[-2.5, 1.8, -1.2, 2.4][i % 4]}deg)` }}
          onClick={onNotice}
        >
          <span className="gossip__face" aria-hidden="true">
            <ResidentArt id={h.who} portrait />
          </span>
          <span className="hand">{h.text}</span>
        </button>
      ))}
    </div>
  )
}

/** The evening's recap, pinned where the morning gossip was. */
function Recap({ state }: { state: GameState }) {
  const items = state.report.echoes.slice(0, 5)
  if (!items.length) return null
  return (
    <ul className="recap">
      <li className="recap__title hand" style={{ border: 0 }}>
        Today in Mosswick
      </li>
      {items.map((e) => (
        <li key={e.uid}>
          <span className="recap__star" aria-hidden="true">
            {e.threads.some((t) => t.isNew) ? '✦' : '·'}
          </span>
          <span>
            <strong>{e.title}</strong>{' '}
            <span className="recap__who">— {e.cast.map((c) => RESIDENTS[c].short).join(' & ')}</span>
          </span>
        </li>
      ))}
    </ul>
  )
}

/** The inside of the Borrowburrow: morning curation, open hours at the counter, evening returns. */
export function LendingHouse({ state, dispatch, orient, motion, onCard, onThreads, onNotice, onDonation }: Props) {
  const phase = state.phase
  const weather = weatherFor(state, state.day)
  const tone: Tone = phase === 'evening' ? 'evening' : phase === 'morning' ? 'morning' : 'day'
  const visit = currentVisit(state)
  const served = allVisitorsServed(state)
  const size = shelfSize(state)
  const threads = useMemo(() => deriveThreads(state), [state])
  const freshThreads = useMemo(
    () => new Set(threads.filter((t) => t.strands.some((s) => s.day === state.day && phase === 'evening')).map((t) => t.key)),
    [threads, state.day, phase],
  )
  const notice = noticeFor(state)
  const weekday = WEEKDAYS[(state.day - 1) % 7]

  const [offered, setOffered] = useState<ObjectId>()
  const [visitorStage, setVisitorStage] = useState<'arriving' | 'here' | 'leaving'>('arriving')
  const [stamping, setStamping] = useState(false)
  const [opened, setOpened] = useState<Set<ObjectId>>(new Set())
  const [bell, setBell] = useState(false)
  const timers = useRef<number[]>([])
  const later = (ms: number, fn: () => void) => {
    timers.current.push(window.setTimeout(fn, motion ? ms : Math.min(ms, 60)))
  }
  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), [])

  // Someone comes through the door.
  const visitKey = phase === 'open' && visit ? `${state.day}-${state.visitIndex}` : ''
  useEffect(() => {
    if (!visitKey) return
    setOffered(undefined)
    setVisitorStage('arriving')
    setBell(true)
    sfx.bell()
    later(motion ? 900 : 10, () => setVisitorStage('here'))
    later(1200, () => setBell(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visitKey])

  useEffect(() => {
    if (phase === 'evening') setOpened(new Set())
  }, [phase, state.day])

  const reaction = offered ? reactionFor(state, offered) : undefined
  const request = visit ? REQUESTS_BY_ID[visit.requestId] : undefined

  function offer(id: ObjectId) {
    if (visitorStage !== 'here' || stamping) return
    sfx.tap()
    setOffered((o) => (o === id ? undefined : id))
  }

  function stamp() {
    if (!offered || stamping) return
    const id = offered
    setStamping(true)
    sfx.lend()
    later(450, () => setVisitorStage('leaving'))
    later(1250, () => {
      dispatch({ type: 'lend', id })
      setOffered(undefined)
      setStamping(false)
    })
  }

  function declineVisit() {
    setVisitorStage('leaving')
    later(900, () => dispatch({ type: 'decline' }))
  }

  function openParcel(d: Donation) {
    if (!opened.has(d.objectId)) {
      sfx.paper()
      setOpened(new Set([...opened, d.objectId]))
      onDonation(d)
    } else onCard(d.objectId)
  }

  // What stands on the counter right now.
  const items: ObjectId[] = phase === 'evening' ? state.report.returned : state.shelf
  const counterMode = phase === 'evening' ? 'returns' : phase === 'open' ? 'lend' : 'curate'
  const freshSet = new Set<ObjectId>(
    phase === 'morning' ? [...state.recentlyReturned, ...state.report.donations.map((d) => d.objectId)] : [],
  )
  const doorOpen = phase === 'open' && (visitorStage === 'arriving' || visitorStage === 'leaving')

  // The sign on the door is the day's big decision.
  let sign: { label: string; sub?: string; action?: () => void }
  if (phase === 'morning')
    sign = {
      label: 'Open the doors',
      sub: state.shelf.length ? `${state.visits.length} visitors today` : 'put a few things out first',
      action: state.shelf.length ? () => dispatch({ type: 'open' }) : undefined,
    }
  else if (phase === 'open')
    sign = served
      ? {
          label: isFestivalDay(state) ? 'To Lantern Night' : 'Close for the afternoon',
          sub: isFestivalDay(state) ? 'it’s nearly dusk' : 'and see what happens',
          action: () => dispatch({ type: 'close' }),
        }
      : { label: 'Open', sub: `visitor ${Math.min(state.visitIndex + 1, state.visits.length)} of ${state.visits.length}` }
  else sign = { label: 'Lock up for the night', sub: 'sleep, and see who comes tomorrow', action: () => dispatch({ type: 'sleep' }) }

  // A small handwritten note on the counter tells you what to do next.
  let hint = ''
  if (phase === 'morning') {
    if (!state.shelf.length)
      hint =
        state.day === 1
          ? `Choose up to ${size} things from the Collection for today’s counter. Tap a thing to put it out.`
          : `Choose what goes on the counter today (up to ${size}). The notice board has gossip.`
    else if (state.shelf.length < size && state.collection.length > state.shelf.length + state.loans.length)
      hint = `${state.shelf.length} of ${size} on the counter. Tap them to put them back. Flip the sign when you’re ready.`
    else hint = 'The counter’s full. Flip the sign on the door to open up.'
  } else if (phase === 'open') {
    if (served) hint = 'Everyone’s been. Close up, and see what the afternoon does with it all.'
    else if (!state.shelf.length) hint = 'The counter is empty — there’s nothing left to lend today.'
    else if (!offered) hint = 'Offer something from the counter. You can change your mind.'
    else hint = `Stamp it to lend the ${OBJECTS[offered].short}, or offer something else.`
  } else {
    const back = state.report.returned.length
    const gifts = state.report.donations.length
    hint = back
      ? `${back} thing${back > 1 ? 's' : ''} came home tonight${gifts ? `, and ${gifts === 1 ? 'a parcel' : `${gifts} parcels`}` : ''}. Tap them to read what happened.`
      : 'A quiet evening. Everything is still out.'
    if (freshThreads.size) hint += ` New stitches on the Threads hoop.`
  }

  return (
    <div className={`house house--${orient} house--${phase}`}>
      <Room orient={orient} tone={tone} lanternNight={state.day >= 7} />
      <Decorations state={state} orient={orient} />
      <div className="house__window">
        <WindowView weather={weather} tone={tone} />
      </div>
      <button className={`house__hoop ${freshThreads.size ? 'house__hoop--fresh' : ''}`} onClick={onThreads} aria-label={`Threads: ${threads.length} between neighbours. Open the Thread board.`}>
        <ThreadHoop threads={threads} present={state.present} fresh={freshThreads} />
        <span className="house__hoop-label hand">Threads</span>
      </button>
      <div className="house__notice">
        <NoticeBoard weekday={weekday} day={state.day} weather={weather} notice={notice} onOpen={onNotice} highlight={phase === 'morning'} />
      </div>
      <div className="house__stacks">
        <Stacks
          state={state}
          canFeature={phase === 'morning'}
          shelfFull={state.shelf.length >= size}
          fresh={freshSet}
          onCounter={new Set(phase === 'evening' ? state.report.returned : state.shelf)}
          hidden={new Set(phase === 'evening' ? state.report.donations.map((d) => d.objectId).filter((id) => !opened.has(id)) : [])}
          onFeature={(id) => {
            sfx.tap()
            dispatch({ type: 'feature', id })
          }}
          onCard={onCard}
        />
      </div>
      <div className="house__door">
        <Door open={doorOpen} weather={weather} tone={tone} />
        <div className="house__bell">
          <DoorBell ringing={bell} />
        </div>
      </div>
      {phase === 'open' && visit && request && (
        <Visitor
          key={visitKey}
          orient={orient}
          resident={visit.residentId}
          request={request}
          reaction={reaction}
          offered={offered}
          stage={visitorStage}
          motion={motion}
          onDecline={declineVisit}
        />
      )}
      <div className="house__counter-top" aria-hidden="true">
        <span className="counter-plaque">Borrowburrow · Lending Counter</span>
      </div>
      {phase === 'morning' && <GossipNotes state={state} onNotice={onNotice} />}
      {phase === 'evening' && <Recap state={state} />}
      <div className="house__counter">
        <Counter
          state={state}
          slots={phase === 'evening' ? Math.max(state.report.returned.length, 1) : size}
          items={items}
          mode={counterMode}
          offered={offered}
          freshDay={phase === 'evening' ? state.day : undefined}
          parcels={phase === 'evening' ? state.report.donations : []}
          openedParcels={opened}
          onItem={(id) => {
            if (phase === 'morning') {
              sfx.tap()
              dispatch({ type: 'unfeature', id })
            } else if (phase === 'open') offer(id)
            else onCard(id)
          }}
          onCard={onCard}
          onParcel={openParcel}
        />
      </div>
      <CounterDecor state={state} orient={orient} />
      <div className="house__stamp">
        <Stamp ready={phase === 'open' && !!offered && visitorStage === 'here'} stamping={stamping} onStamp={stamp} />
      </div>
      <div className="house__crate" aria-hidden="true">
        <svg viewBox="0 0 240 120">
          <g filter="url(#bb-wobble)">
            <path d="M10 20 L230 20 L222 116 L18 116 Z" fill="#b07a4f" stroke="#2b211c" strokeWidth={4} />
            <path d="M14 52 H226 M16 84 H224" stroke="#8a5a3b" strokeWidth={6} />
            <rect x={64} y={38} width={112} height={32} rx={3} fill="#fbf5e6" stroke="#2b211c" strokeWidth={2.4} />
          </g>
          <text x={120} y={61} textAnchor="middle" fontSize={16} className="svg-display" fontWeight={800} fill="#b5523b" letterSpacing={1}>
            RETURNS
          </text>
        </svg>
      </div>
      <p className="house__hint hand" role="status">
        {hint}
      </p>
      {state.report.notes.length > 0 && phase === 'evening' && (
        <p className="house__note hand">{state.report.notes.join(' ')}</p>
      )}
      <div className="house__sign">
        <DoorSign label={sign.label} sub={sign.sub} onClick={sign.action} disabled={!sign.action} flip={phase !== 'morning'} />
      </div>
    </div>
  )
}
