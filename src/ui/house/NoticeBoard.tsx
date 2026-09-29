import { INK } from '../../art/palette'
import type { NoticeDef } from '../../game/content/notices'
import { WEATHER_TEXT } from '../../game/content/world'
import type { Weather } from '../../game/types'

export function WeatherGlyph({ weather, night }: { weather: Weather; night?: boolean }) {
  return (
    <svg className="weather-glyph" viewBox="0 0 40 40" aria-hidden="true">
      {weather === 'sunny' &&
        (night ? (
          <path d="M22 8 A12 12 0 1 0 32 26 A9 9 0 1 1 22 8 Z" fill="#f1d36a" stroke={INK} strokeWidth={1.6} />
        ) : (
          <g>
            <circle cx={20} cy={20} r={8} fill="#f2c86a" stroke={INK} strokeWidth={1.6} />
            {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
              <path key={a} d="M20 6 V2" stroke={INK} strokeWidth={1.6} strokeLinecap="round" transform={`rotate(${a} 20 20)`} />
            ))}
          </g>
        ))}
      {weather === 'windy' && (
        <g fill="none" stroke={INK} strokeWidth={2} strokeLinecap="round">
          <path d="M4 14 H24 C30 14 30 6 25 7" />
          <path d="M4 22 H32 C38 22 38 30 33 29" />
          <path d="M8 30 H20" />
        </g>
      )}
      {weather === 'rainy' && (
        <g>
          <path d="M8 22 C4 22 4 14 10 14 C11 8 20 6 23 12 C30 10 34 16 30 22 Z" fill="#c9d2d8" stroke={INK} strokeWidth={1.6} />
          <path d="M12 26 l-2 6 M20 26 l-2 6 M28 26 l-2 6" stroke="#5b7fb5" strokeWidth={2} strokeLinecap="round" />
        </g>
      )}
      {weather === 'foggy' && (
        <g stroke={INK} strokeWidth={2} strokeLinecap="round" opacity={0.8}>
          <path d="M6 12 H34 M4 20 H30 M10 28 H36" />
        </g>
      )}
    </svg>
  )
}

interface NoticeBoardProps {
  weekday: string
  day: number
  weather: Weather
  notice: NoticeDef
  onOpen: () => void
  highlight: boolean
}

/** The cork board by the door: the date, the weather, and whatever Mosswick has pinned up. */
export function NoticeBoard({ weekday, day, weather, notice, onOpen, highlight }: NoticeBoardProps) {
  return (
    <button className={`notice ${highlight ? 'notice--highlight' : ''}`} onClick={onOpen} aria-label={`Notice board: ${weekday}, day ${day}. ${WEATHER_TEXT[weather].name}. ${notice.title}. Read the notices.`}>
      <span className="notice__cork" aria-hidden="true" />
      <span className="notice__date">
        <WeatherGlyph weather={weather} />
        <span>
          <strong>{weekday}</strong>
          <small>Day {day} · {WEATHER_TEXT[weather].name}</small>
        </span>
      </span>
      <span className="notice__paper">
        <span className="notice__pin" aria-hidden="true" />
        <strong>{notice.title}</strong>
        <span className="notice__more hand">read more…</span>
      </span>
    </button>
  )
}
