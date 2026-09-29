import { useEffect, useRef, useState } from 'react'
import { sfx } from './audio/sfx'
import { WEATHER_TEXT, WEEKDAYS } from './game/content/world'
import { weatherFor } from './game/engine'
import { loadSettings, saveSettings, type Settings } from './game/persistence'
import type { Donation, ObjectId } from './game/types'
import { useGame } from './state/useGame'
import { LendingHouse } from './ui/house/LendingHouse'
import { WeatherGlyph } from './ui/house/NoticeBoard'
import { LibraryCard } from './ui/overlays/LibraryCard'
import { DonationNote, NoticeSheet, SettingsSheet, WelcomeLetter } from './ui/overlays/Sheets'
import { ThreadBoard } from './ui/overlays/ThreadBoard'
import { Epilogue } from './ui/screens/Epilogue'
import { Festival } from './ui/screens/Festival'
import { Title } from './ui/screens/Title'
import { Stage } from './ui/Stage'
import { useFocusRescue } from './ui/focus'
import { useViewport } from './ui/viewport'
import { Village } from './ui/village/Village'

type OverlayState =
  | { kind: 'card'; id: ObjectId }
  | { kind: 'threads' }
  | { kind: 'notice' }
  | { kind: 'settings' }
  | { kind: 'donation'; d: Donation }
  | { kind: 'welcome' }
  | null

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false)
  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)')
    if (!mq) return
    const on = () => setReduced(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return reduced
}

function MetaControls({ muted, onToggleSound, onDrawer }: { muted: boolean; onToggleSound: () => void; onDrawer: () => void }) {
  return (
    <div className="meta">
      <button onClick={onToggleSound} aria-label={muted ? 'Turn sound on' : 'Turn sound off'} aria-pressed={!muted} title={muted ? 'Sound off' : 'Sound on'}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6 16 C6 9 8 5 12 5 C16 5 18 9 18 16 L20 18 H4 Z" fill="currentColor" stroke="#2b211c" strokeWidth={1.4} strokeLinejoin="round" />
          <circle cx={12} cy={20} r={1.8} fill="currentColor" />
          {muted && <path d="M3 3 L21 21" stroke="#2b211c" strokeWidth={2.6} strokeLinecap="round" />}
        </svg>
      </button>
      <button onClick={onDrawer} aria-label="Open the Keeper’s drawer (settings)" title="Settings">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx={8} cy={12} r={5} fill="none" stroke="currentColor" strokeWidth={2.6} />
          <path d="M13 12 H22 M18 12 V16 M21 12 V15" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" />
        </svg>
      </button>
    </div>
  )
}

export default function App() {
  const [state, dispatch] = useGame()
  const [settings, setSettings] = useState<Settings>(loadSettings)
  const [started, setStarted] = useState(false)
  const [overlay, setOverlay] = useState<OverlayState>(null)
  const [confirmReset, setConfirmReset] = useState(false)
  const [dayCard, setDayCard] = useState<number | null>(null)
  const { orient, scale } = useViewport()
  const appRef = useRef<HTMLDivElement>(null)
  useFocusRescue(appRef)
  const systemReduced = usePrefersReducedMotion()
  const motion = settings.reducedMotion === 'off' ? true : settings.reducedMotion === 'on' ? false : !systemReduced

  useEffect(() => {
    sfx.muted = settings.muted
    saveSettings(settings)
  }, [settings])

  // A little card for each new morning.
  const lastDay = useRef<number | null>(null)
  useEffect(() => {
    if (!started || !state) return
    if (state.phase === 'morning' && lastDay.current !== null && lastDay.current !== state.day) {
      setDayCard(state.day)
      sfx.day()
      const t = window.setTimeout(() => setDayCard(null), 2600)
      lastDay.current = state.day
      return () => window.clearTimeout(t)
    }
    lastDay.current = state.day
  }, [state, started])

  const newGame = () => {
    dispatch({ type: 'new' })
    setStarted(true)
    setOverlay({ kind: 'welcome' })
    setConfirmReset(false)
    lastDay.current = 1
  }

  const openCard = (id: ObjectId) => setOverlay({ kind: 'card', id })
  const phase = state?.phase
  const screen = !started || !state ? 'title' : phase === 'echoes' ? 'village' : phase === 'festival' ? 'festival' : phase === 'epilogue' ? 'epilogue' : 'house'
  const night = screen === 'festival' || screen === 'epilogue'
  const backdrop = <div className={`stage-backdrop ${screen === 'house' ? 'stage-backdrop--soil' : night ? 'stage-backdrop--night' : 'stage-backdrop--sky'}`} />

  return (
    <div ref={appRef} className={motion ? 'app' : 'app motion-off'}>
      <Stage orient={orient} scale={scale} backdrop={backdrop}>
        {screen === 'title' && (
          <Title
            orient={orient}
            save={state}
            onNew={newGame}
            onContinue={() => {
              setStarted(true)
              lastDay.current = state?.day ?? null
            }}
          />
        )}
        {screen === 'house' && state && (
          <LendingHouse
            state={state}
            dispatch={dispatch}
            orient={orient}
            motion={motion}
            onCard={openCard}
            onThreads={() => setOverlay({ kind: 'threads' })}
            onNotice={() => setOverlay({ kind: 'notice' })}
            onDonation={(d) => setOverlay({ kind: 'donation', d })}
          />
        )}
        {screen === 'village' && state && <Village state={state} dispatch={dispatch} orient={orient} motion={motion} onCard={openCard} />}
        {screen === 'festival' && state && <Festival state={state} dispatch={dispatch} orient={orient} />}
        {screen === 'epilogue' && state && (
          <Epilogue
            state={state}
            orient={orient}
            onCard={openCard}
            onKeepGoing={() => dispatch({ type: 'sleep' })}
            onNewWeek={newGame}
          />
        )}

        {started && state && (
          <MetaControls
            muted={settings.muted}
            onToggleSound={() => setSettings((s) => ({ ...s, muted: !s.muted }))}
            onDrawer={() => setOverlay({ kind: 'settings' })}
          />
        )}

        {dayCard !== null && state && (
          <div className="daycard" onClick={() => setDayCard(null)} role="status">
            <div className="daycard__paper">
              <WeatherGlyph weather={weatherFor(state, dayCard)} />
              <strong>{WEEKDAYS[(dayCard - 1) % 7]}</strong>
              <span className="hand">
                Day {dayCard} · {WEATHER_TEXT[weatherFor(state, dayCard)].line}
              </span>
            </div>
          </div>
        )}

        {overlay?.kind === 'card' && state && <LibraryCard state={state} id={overlay.id} onClose={() => setOverlay(null)} />}
        {overlay?.kind === 'threads' && state && <ThreadBoard state={state} onClose={() => setOverlay(null)} />}
        {overlay?.kind === 'notice' && state && <NoticeSheet state={state} onClose={() => setOverlay(null)} />}
        {overlay?.kind === 'donation' && <DonationNote donation={overlay.d} onClose={() => setOverlay(null)} />}
        {overlay?.kind === 'welcome' && <WelcomeLetter onClose={() => setOverlay(null)} />}
        {overlay?.kind === 'settings' && (
          <SettingsSheet
            settings={settings}
            onChange={setSettings}
            confirmReset={confirmReset}
            setConfirmReset={setConfirmReset}
            onClose={() => {
              setOverlay(null)
              setConfirmReset(false)
            }}
            onTitle={() => {
              setOverlay(null)
              setStarted(false)
            }}
            onReset={() => {
              dispatch({ type: 'reset' })
              setOverlay(null)
              setConfirmReset(false)
              setStarted(false)
            }}
          />
        )}
      </Stage>
      <div className="grain" aria-hidden="true" />
    </div>
  )
}
