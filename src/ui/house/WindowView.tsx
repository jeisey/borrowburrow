import { C, INK } from '../../art/palette'
import type { Weather } from '../../game/types'

export type Tone = 'morning' | 'day' | 'evening'

const SKY: Record<Tone, Record<Weather, [string, string]>> = {
  morning: { sunny: ['#f6d9a8', '#bfe0e0'], windy: ['#e9dcc0', '#a9cfd6'], rainy: ['#9aa6ad', '#c2c9c6'], foggy: ['#e6e3da', '#d4d6d0'] },
  day: { sunny: ['#9fd0dc', '#e4f0dc'], windy: ['#8fc0d2', '#dbeadc'], rainy: ['#8e9aa3', '#b9c2c2'], foggy: ['#d9dcd6', '#e8e6de'] },
  evening: { sunny: ['#3a3f6e', '#f1a36a'], windy: ['#353a66', '#e59a6a'], rainy: ['#3a3f52', '#6f6a78'], foggy: ['#4b4a5e', '#8e8792'] },
}

/** Rain streaks, fog banks or blowing leaves, for any small outdoor view. */
export function WeatherFx({ weather, w, h }: { weather: Weather; w: number; h: number }) {
  if (weather === 'rainy')
    return (
      <g className="fx-rain" stroke="#dfe9f0" strokeWidth={2} strokeLinecap="round" opacity={0.75}>
        {Array.from({ length: Math.round(w / 14) }, (_, i) => {
          const x = (i * 29) % w
          const y = (i * 47) % h
          return <path key={i} d={`M${x} ${y} l-7 16`} style={{ animationDelay: `${-(i % 7) * 0.13}s` }} />
        })}
      </g>
    )
  if (weather === 'foggy')
    return (
      <g className="fx-fog">
        <rect x={-w * 0.2} y={h * 0.45} width={w * 1.4} height={h * 0.22} rx={h * 0.1} fill="#f6f4ee" opacity={0.55} />
        <rect x={-w * 0.4} y={h * 0.62} width={w * 1.6} height={h * 0.3} rx={h * 0.14} fill="#f6f4ee" opacity={0.6} />
        <rect x={-w * 0.1} y={h * 0.25} width={w * 1.1} height={h * 0.16} rx={h * 0.08} fill="#f6f4ee" opacity={0.35} />
      </g>
    )
  if (weather === 'windy')
    return (
      <g className="fx-wind">
        {Array.from({ length: 6 }, (_, i) => (
          <path
            key={i}
            d={`M${(i * 53) % w} ${(i * 37) % (h * 0.8) + 10} q5 -4 10 0 q-5 4 -10 0 Z`}
            fill={i % 2 ? '#c9a24a' : '#b5523b'}
            stroke={INK}
            strokeWidth={0.8}
            style={{ animationDelay: `${-i * 0.6}s` }}
          />
        ))}
        <path d={`M10 ${h * 0.3} q${w * 0.2} -8 ${w * 0.45} 0 M${w * 0.4} ${h * 0.5} q${w * 0.2} -8 ${w * 0.5} 0`} stroke="#fff" strokeWidth={1.5} fill="none" opacity={0.5} />
      </g>
    )
  return null
}

export function WindowView({ weather, tone }: { weather: Weather; tone: Tone }) {
  const [top, bottom] = SKY[tone][weather]
  const evening = tone === 'evening'
  const clear = weather === 'sunny' || weather === 'windy'
  const inside = 'M12 190 L12 84 C12 40 52 12 100 12 C148 12 188 40 188 84 L188 190 Z'
  return (
    <svg className="window-view" viewBox="0 0 200 200" aria-hidden="true">
      <defs>
        <linearGradient id={`win-sky-${tone}-${weather}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={top} />
          <stop offset="100%" stopColor={bottom} />
        </linearGradient>
        <clipPath id="win-clip">
          <path d={inside} />
        </clipPath>
      </defs>
      <g filter="url(#bb-wobble)">
        <path d="M2 198 L2 82 C2 32 48 2 100 2 C152 2 198 32 198 82 L198 198 Z" fill={C.woodDark} stroke={INK} strokeWidth={3} />
      </g>
      <g clipPath="url(#win-clip)">
        <rect width={200} height={200} fill={`url(#win-sky-${tone}-${weather})`} />
        {evening && clear && (
          <g fill={C.star}>
            {[
              [40, 50],
              [70, 34],
              [120, 44],
              [150, 70],
              [96, 72],
              [30, 90],
            ].map(([x, y]) => (
              <circle key={`${x}`} cx={x} cy={y} r={1.8} className="twinkle" />
            ))}
            <path d="M150 34 A12 12 0 1 0 160 52 A9 9 0 1 1 150 34 Z" fill="#f4e3a1" />
          </g>
        )}
        {!evening && clear && <circle cx={150} cy={52} r={16} fill="#fbe7a0" stroke="#f2c86a" strokeWidth={3} />}
        {!clear && (
          <g fill={weather === 'rainy' ? '#8d98a0' : '#ecebe6'} opacity={0.9}>
            <ellipse cx={60} cy={56} rx={42} ry={14} />
            <ellipse cx={130} cy={44} rx={48} ry={16} />
          </g>
        )}
        {clear && !evening && (
          <g className="cloud-drift" fill="#fbf8ef" opacity={0.95}>
            <ellipse cx={58} cy={70} rx={26} ry={9} />
            <ellipse cx={72} cy={63} rx={16} ry={9} />
          </g>
        )}
        <path d="M0 142 C40 112 92 110 132 124 C162 134 182 128 200 120 L200 200 L0 200 Z" fill={evening ? '#3e5147' : '#86a04f'} stroke={INK} strokeWidth={2} />
        <path d="M78 116 a10 10 0 0 1 20 0 Z" fill={evening ? '#8d8a8a' : '#d8d2c4'} stroke={INK} strokeWidth={1.6} />
        <path d="M0 168 C60 150 130 158 200 150 L200 200 L0 200 Z" fill={evening ? '#34473c' : '#6f8f45'} />
        <WeatherFx weather={weather} w={200} h={200} />
        {evening && <rect width={200} height={200} fill="#1a1d3a" opacity={0.18} />}
      </g>
      <g stroke={INK} strokeWidth={3}>
        <path d="M100 12 L100 190 M12 108 L188 108" stroke={C.woodDark} strokeWidth={7} />
        <path d="M100 12 L100 190 M12 108 L188 108" strokeWidth={1.4} opacity={0.6} />
        <path d={inside} fill="none" />
      </g>
      <path d="M40 30 L60 20 M28 52 L52 36" stroke="#fff" strokeWidth={3} opacity={0.35} strokeLinecap="round" />
      <rect x={-2} y={186} width={204} height={14} rx={3} fill={C.woodLight} stroke={INK} strokeWidth={3} />
    </svg>
  )
}
