import { ObjectArt } from '../../art/objects'
import { ResidentArt } from '../../art/residents'
import { noticeFor } from '../../game/content/notices'
import { OBJECTS } from '../../game/content/objects'
import { RESIDENTS } from '../../game/content/residents'
import { WEATHER_TEXT, WEEKDAYS } from '../../game/content/world'
import { morningHints, weatherFor } from '../../game/engine'
import { hasFlag } from '../../game/query'
import type { Settings } from '../../game/persistence'
import type { Donation, GameState } from '../../game/types'
import { WeatherGlyph } from '../house/NoticeBoard'
import { Overlay } from './Overlay'

/** The full notice board: the day, the sky, the village notice and the gossip. */
export function NoticeSheet({ state, onClose }: { state: GameState; onClose: () => void }) {
  const weather = weatherFor(state, state.day)
  const notice = noticeFor(state)
  const hints = morningHints(state)
  const w = WEATHER_TEXT[weather]
  return (
    <Overlay label="The notice board" onClose={onClose} className="sheet--notice">
      <div className="ns">
        <div className="ns__date">
          <WeatherGlyph weather={weather} />
          <div>
            <h2>{WEEKDAYS[(state.day - 1) % 7]}</h2>
            <p>
              Day {state.day} in Mosswick · {w.line}
            </p>
            <p className="ns__night">{w.night}</p>
          </div>
        </div>
        <article className="ns__notice">
          <h3>{notice.title}</h3>
          <p>{notice.text}</p>
        </article>
        {hints.overheard.length > 0 && state.phase === 'morning' && (
          <section className="ns__gossip">
            <h3 className="hand">Overheard this morning…</h3>
            <ul>
              {hints.overheard.map((h) => (
                <li key={h.text}>{h.text}</li>
              ))}
            </ul>
            {hints.provenance && <p className="ns__prov hand">{hints.provenance.text}</p>}
          </section>
        )}
        {hasFlag(state, 'moon_letter') && (
          <aside className="ns__letter">
            <p className="hand">
              Dear Tansy, Thank you for your letters. I am doing well. It is quite dark up here too, and I manage. Yours, The Moon.
              P.S. Please use more stamps.
            </p>
            <small>(pinned here by Tansy, “for safekeeping”)</small>
          </aside>
        )}
      </div>
    </Overlay>
  )
}

/** Opening a parcel left on the doorstep. */
export function DonationNote({ donation, onClose }: { donation: Donation; onClose: () => void }) {
  const r = RESIDENTS[donation.from]
  const def = OBJECTS[donation.objectId]
  return (
    <Overlay label={`A gift: the ${def.name}`} onClose={onClose} className="sheet--gift">
      <div className="gift">
        <div className="gift__art">
          <ObjectArt id={donation.objectId} />
        </div>
        <div className="gift__text">
          <p className="gift__kicker">A parcel on the doorstep</p>
          <h2>{def.name}</h2>
          <p className="gift__note hand">“{donation.note}”</p>
          <div className="gift__from">
            <div className="gift__face">
              <ResidentArt id={donation.from} portrait mood="happy" />
            </div>
            <span>
              from <strong>{r.name}</strong>
            </span>
          </div>
          <p className="gift__after">It’s on the shelf now, with a fresh library card, waiting for its first story.</p>
          <button className="paper-button" onClick={onClose} data-autofocus>
            Put it on the shelf
          </button>
        </div>
      </div>
    </Overlay>
  )
}

/** The welcome letter on the very first morning. */
export function WelcomeLetter({ onClose }: { onClose: () => void }) {
  return (
    <Overlay label="A letter on the counter" onClose={onClose} className="sheet--letter">
      <div className="letter">
        <p className="letter__kicker">A letter, left on the counter</p>
        <p className="hand letter__body">
          Dear Keeper,
          <br />
          The Borrowburrow is yours now. The rules are simple: put a few things out on the counter, open the door, and lend them to
          whoever asks. Everything comes back — usually with a story, sometimes with a sticker.
          <br />
          Mind the cards. Things remember where they’ve been.
        </p>
        <p className="hand letter__sign">— the last Keeper</p>
        <button className="paper-button" onClick={onClose} data-autofocus>
          Roll up my sleeves
        </button>
      </div>
    </Overlay>
  )
}

interface SettingsProps {
  settings: Settings
  onChange: (s: Settings) => void
  onReset: () => void
  onTitle: () => void
  onClose: () => void
  confirmReset: boolean
  setConfirmReset: (v: boolean) => void
}

export function SettingsSheet({ settings, onChange, onReset, onTitle, onClose, confirmReset, setConfirmReset }: SettingsProps) {
  return (
    <Overlay label="Settings" onClose={onClose} className="sheet--settings">
      <div className="settings">
        <h2>The Keeper’s drawer</h2>
        <label className="settings__row">
          <input type="checkbox" checked={!settings.muted} onChange={(e) => onChange({ ...settings, muted: !e.target.checked })} />
          <span>Sound (little bells and paper)</span>
        </label>
        <fieldset className="settings__row settings__motion">
          <legend>Motion</legend>
          {(['system', 'on', 'off'] as const).map((m) => (
            <label key={m}>
              <input type="radio" name="motion" checked={settings.reducedMotion === m} onChange={() => onChange({ ...settings, reducedMotion: m })} />
              <span>{m === 'system' ? 'Follow my device' : m === 'on' ? 'Calm (reduce motion)' : 'Full motion'}</span>
            </label>
          ))}
        </fieldset>
        <div className="settings__actions">
          <button className="paper-button" onClick={onTitle}>
            Back to the title
          </button>
          {confirmReset ? (
            <span className="settings__confirm">
              Forget this whole week?{' '}
              <button className="paper-button paper-button--danger" onClick={onReset}>
                Yes, start a new week
              </button>{' '}
              <button className="paper-button" onClick={() => setConfirmReset(false)} autoFocus>
                Keep it
              </button>
            </span>
          ) : (
            // Coming back from “Keep it” puts focus back here; on opening, the sheet's own focus wins.
            <button className="paper-button paper-button--quiet" onClick={() => setConfirmReset(true)} autoFocus>
              Reset save…
            </button>
          )}
        </div>
        <p className="settings__note">Your week is saved in this browser as you play.</p>
      </div>
    </Overlay>
  )
}
