import { useId, type ReactNode } from 'react'
import { MarkShape } from '../../art/marks'
import { ObjectFigure, UmbrellaOpen } from '../../art/objects'
import { C, INK } from '../../art/palette'
import { HEAD_TOP, HOLD_POINT } from '../../art/poses'
import { ResidentFigure } from '../../art/residents'
import { RESIDENTS } from '../../game/content/residents'
import type { LocationId, MarkId, ObjectId, PropMode, ResidentId, SceneFx, TimeOfDay, Weather } from '../../game/types'
import { WeatherFx } from '../house/WindowView'

const O = { stroke: INK, strokeWidth: 2.6, strokeLinejoin: 'round' as const }
const T = { stroke: INK, strokeWidth: 1.8, strokeLinejoin: 'round' as const }
const S = 0.62 // resident scale inside a vignette
const GROUND = 288

function skyColours(time: TimeOfDay, weather: Weather): [string, string] {
  if (time === 'night') return weather === 'rainy' || weather === 'foggy' ? ['#2c3044', '#50536a'] : ['#1b2240', '#3d4a78']
  if (time === 'dusk') return weather === 'rainy' ? ['#5e5d78', '#b98a86'] : ['#58508a', '#f2a66e']
  if (weather === 'rainy') return ['#8e9aa3', '#c6cdca']
  if (weather === 'foggy') return ['#d4d6d0', '#eeebe2']
  return ['#8fc6d8', '#eef3dc']
}

function Sky({ time, weather, uid }: { time: TimeOfDay; weather: Weather; uid: string }) {
  const [a, b] = skyColours(time, weather)
  const clear = weather === 'sunny' || weather === 'windy'
  return (
    <g>
      <linearGradient id={`vg-sky-${uid}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={a} />
        <stop offset="100%" stopColor={b} />
      </linearGradient>
      <rect width={480} height={300} fill={`url(#vg-sky-${uid})`} />
      {time === 'night' && clear && (
        <g fill={C.star}>
          {Array.from({ length: 28 }, (_, i) => (
            <circle key={i} className="twinkle" cx={(i * 67) % 480} cy={(i * 41) % 150 + 8} r={i % 4 === 0 ? 2 : 1.2} />
          ))}
          <path d="M392 30 A20 20 0 1 0 412 62 A15 15 0 1 1 392 30 Z" fill="#f4e3a1" />
        </g>
      )}
      {time === 'day' && clear && <circle cx={400} cy={52} r={24} fill="#fbe7a0" stroke="#f2c86a" strokeWidth={3} />}
      {time === 'dusk' && <circle cx={390} cy={150} r={30} fill="#f7c67a" opacity={0.8} />}
      {!clear && (
        <g fill={weather === 'rainy' ? '#8d98a0' : '#f4f2ec'} opacity={0.9}>
          <ellipse cx={110} cy={50} rx={90} ry={22} />
          <ellipse cx={330} cy={40} rx={110} ry={24} />
        </g>
      )}
      {clear && time === 'day' && (
        <g className="cloud-drift" fill="#fbf8ef">
          <ellipse cx={120} cy={60} rx={40} ry={12} />
          <ellipse cx={140} cy={52} rx={24} ry={12} />
        </g>
      )}
    </g>
  )
}

const dark = (time: TimeOfDay) => time === 'night'
const lit = (time: TimeOfDay) => time !== 'day'

function Hill({ time }: { time: TimeOfDay }) {
  return (
    <g>
      <path d="M0 210 C80 170 180 160 260 170 C340 180 420 160 480 170 L480 300 L0 300 Z" fill={dark(time) ? '#34473c' : '#93b27a'} {...T} />
      <g transform="translate(70 160)">
        <rect x={-18} y={-30} width={36} height={32} fill="#bfb49e" {...O} />
        <path d="M-21 -30 A21 21 0 0 1 21 -30 Z" fill="#9aa0a6" {...O} />
        <rect x={-6} y={-18} width={12} height={20} rx={5} fill={lit(time) ? C.lamp : C.woodDark} {...T} />
      </g>
      <g transform="translate(410 206)">
        <path d="M-8 40 C-6 20 -10 6 -4 -8 L6 -8 C10 6 8 20 10 40 Z" fill={C.woodDark} {...O} />
        <path d="M0 -92 C40 -94 62 -70 58 -46 C76 -34 68 -6 44 -8 C30 6 -30 6 -44 -8 C-68 -6 -76 -34 -58 -46 C-62 -70 -40 -94 0 -92 Z" fill={dark(time) ? '#2f4432' : '#5d7650'} {...O} />
      </g>
      <path d="M0 262 C120 240 360 240 480 256 L480 300 L0 300 Z" fill={dark(time) ? '#3e5147' : '#86a04f'} {...T} />
    </g>
  )
}

function Pond({ time }: { time: TimeOfDay }) {
  return (
    <g>
      <path d="M0 150 C120 130 360 130 480 150 L480 200 L0 200 Z" fill={dark(time) ? '#2f4432' : '#6f8f45'} />
      {[40, 110, 200, 300, 390, 450].map((x, i) => (
        <path key={x} d={`M${x} 160 C${x - 20} 160 ${x - 24} ${128 - (i % 2) * 14} ${x} ${118 - (i % 2) * 14} C${x + 24} ${128 - (i % 2) * 14} ${x + 20} 160 ${x} 160 Z`} fill={dark(time) ? '#2a3b2c' : '#4f6b3a'} {...T} />
      ))}
      <rect x={0} y={160} width={480} height={140} fill={dark(time) ? '#24404a' : '#4f8a8b'} />
      <path d="M40 200 h60 M160 214 h90 M300 196 h70 M60 240 h80" stroke={dark(time) ? '#6f9aa8' : '#bfe0e0'} strokeWidth={3} strokeLinecap="round" opacity={0.7} className="ripple" />
      <ellipse cx={120} cy={226} rx={20} ry={6} fill="#6f9b45" {...T} />
      <ellipse cx={380} cy={216} rx={16} ry={5} fill="#6f9b45" {...T} />
      <path d="M300 300 L330 244 L480 244 L480 300 Z" fill={C.woodLight} {...O} />
      <path d="M340 244 V300 M380 244 V300 M420 244 V300 M460 244 V300" stroke={C.woodDark} strokeWidth={2} />
      <path d="M0 300 L0 262 C60 256 160 258 250 270 L290 300 Z" fill={dark(time) ? '#3e5147' : '#86a04f'} {...T} />
      <g stroke={C.grassDark} strokeWidth={3} strokeLinecap="round">
        <path d="M20 270 L16 236 M30 272 L34 230 M44 270 L50 240 M240 276 L236 246 M252 278 L258 244" />
      </g>
      <g transform="translate(300 160)">
        <path d="M0 0 q6 -8 14 -2 q4 -6 8 0 l-2 6 q-10 4 -20 -4 Z" fill="#8a6a4b" {...T} strokeWidth={1.2} />
      </g>
    </g>
  )
}

function Green({ time, festival }: { time: TimeOfDay; festival?: boolean }) {
  const l = lit(time)
  return (
    <g>
      <path d="M0 190 C160 176 320 176 480 190 L480 300 L0 300 Z" fill={dark(time) ? '#34473c' : '#7f9d4f'} />
      <g transform="translate(40 190)">
        <path d="M-6 -48 L50 -84 L106 -48 Z" fill={C.brick} {...O} />
        <rect x={0} y={-50} width={100} height={50} fill="#e7c9a0" {...O} />
        <rect x={36} y={-30} width={22} height={30} rx={9} fill={C.navy} {...T} />
        <rect x={8} y={-40} width={20} height={16} fill={l ? C.lamp : '#cfe3e6'} {...T} />
        <rect x={70} y={-40} width={20} height={16} fill={l ? C.lamp : '#cfe3e6'} {...T} />
        <rect x={16} y={-62} width={68} height={12} fill={C.navy} {...T} />
      </g>
      <g transform="translate(170 190)">
        <path d="M-6 -48 L50 -80 L106 -48 Z" fill="#8a5a3b" {...O} />
        <rect x={0} y={-50} width={100} height={50} fill="#f1dcc0" {...O} />
        <path d="M-2 -36 L102 -36 L96 -24 L4 -24 Z" fill={C.tomato} {...T} />
        <rect x={40} y={-22} width={20} height={22} rx={7} fill={C.woodDark} {...T} />
      </g>
      <g transform="translate(400 250)">
        {festival && <circle cx={0} cy={-40} r={120} fill="url(#bb-glow)" opacity={0.8} />}
        <rect x={-60} y={-8} width={120} height={14} fill="#e7c9a0" {...O} />
        <path d="M-50 -8 V-64 M-16 -8 V-64 M16 -8 V-64 M50 -8 V-64" stroke={INK} strokeWidth={5} />
        <path d="M-50 -8 V-64 M-16 -8 V-64 M16 -8 V-64 M50 -8 V-64" stroke="#f6f4ee" strokeWidth={2.4} />
        <path d="M-72 -62 L0 -110 L72 -62 Z" fill={C.tomato} {...O} />
      </g>
      <path d="M0 262 C120 250 360 252 480 262 L480 300 L0 300 Z" fill={dark(time) ? '#3e5147' : '#a5bf6a'} {...T} />
      {festival && (
        <g>
          <path d="M0 110 Q240 170 480 110" stroke={INK} strokeWidth={1.5} fill="none" />
          {Array.from({ length: 9 }, (_, i) => {
            const t = (i + 0.5) / 9
            const x = t * 480
            const y = 110 + Math.sin(Math.PI * t) * 30
            return (
              <g key={i} className="paper-lantern">
                <circle cx={x} cy={y + 14} r={22} fill="url(#bb-glow)" />
                <ellipse cx={x} cy={y + 14} rx={8} ry={10} fill={i % 2 ? '#f0b23e' : '#d9622b'} {...T} strokeWidth={1.2} />
              </g>
            )
          })}
        </g>
      )}
    </g>
  )
}

function Row({ time }: { time: TimeOfDay }) {
  const l = lit(time)
  const houses = [
    ['#e8c7b4', '#8a5a3b', '#2f6b4a'],
    ['#f0dca0', '#b5523b', C.tomato],
    ['#cfe0dc', '#3f7a78', C.teal],
    ['#e6d4e8', '#6d3b57', '#2f6b4a'],
  ]
  return (
    <g>
      {houses.map(([wall, roof, door], i) => (
        <g key={i} transform={`translate(${i * 124 - 10} 214)`}>
          <rect x={70} y={-150} width={14} height={26} fill={C.brick} {...T} />
          <path d="M-6 -96 L62 -150 L130 -96 Z" fill={roof} {...O} />
          <rect x={0} y={-98} width={124} height={98} fill={wall} {...O} />
          <rect x={48} y={-58} width={28} height={58} rx={12} fill={door} {...T} />
          <rect x={10} y={-80} width={26} height={24} fill={l ? C.lamp : '#cfe3e6'} {...T} />
          <rect x={88} y={-80} width={26} height={24} fill={l ? C.lamp : '#cfe3e6'} {...T} />
          <text x={62} y={-66} textAnchor="middle" fontSize={12} fill={INK} className="svg-display" fontWeight={700}>
            {i + 1}
          </text>
        </g>
      ))}
      <rect x={0} y={214} width={480} height={86} fill={dark(time) ? '#5a5048' : '#cdb58f'} />
      <g fill="none" stroke={INK} strokeWidth={1} opacity={0.25}>
        {Array.from({ length: 24 }, (_, i) => (
          <ellipse key={i} cx={(i * 43) % 480 + 10} cy={232 + ((i * 17) % 60)} rx={14} ry={6} />
        ))}
      </g>
    </g>
  )
}

function Glass({ time }: { time: TimeOfDay }) {
  return (
    <g>
      <rect width={480} height={300} fill={lit(time) ? '#f6e3b0' : '#e2eee2'} opacity={0.85} />
      <circle cx={240} cy={120} r={200} fill="url(#bb-glow)" opacity={lit(time) ? 0.7 : 0.2} />
      <g stroke="#f6f4ee" strokeWidth={6}>
        <path d="M0 60 L480 60 M80 0 V300 M200 0 V300 M320 0 V300 M440 0 V300" />
      </g>
      <g stroke={INK} strokeWidth={1.2} opacity={0.5}>
        <path d="M0 60 L480 60 M80 0 V300 M200 0 V300 M320 0 V300 M440 0 V300" />
      </g>
      {[30, 120, 260, 360, 430].map((x, i) => (
        <g key={x} transform={`translate(${x} 230)`}>
          <path d="M-18 0 L18 0 L14 30 L-14 30 Z" fill={C.brick} {...T} />
          <path d="M0 0 C-4 -30 -20 -40 -26 -60 M0 0 C4 -34 18 -44 22 -70 M0 0 C0 -24 0 -40 0 -56" stroke="#5d7650" strokeWidth={4} fill="none" />
          <circle cx={i % 2 ? -26 : 22} cy={i % 2 ? -60 : -70} r={7} fill={i % 2 ? '#d98c8f' : C.tomato} {...T} />
          <circle cx={0} cy={-56} r={6} fill="#8d78b4" {...T} />
        </g>
      ))}
      <rect x={0} y={262} width={480} height={38} fill="#8a6a4b" />
    </g>
  )
}

function Interior({ time, weather, wall }: { time: TimeOfDay; weather: Weather; wall: string }) {
  const [a, b] = skyColours(time, weather)
  return (
    <g>
      <rect width={480} height={300} fill={wall} />
      <rect width={480} height={300} fill="url(#bb-sprig)" />
      <rect x={0} y={196} width={480} height={104} fill="#8a5a3b" />
      <path d="M0 196 H480" stroke={INK} strokeWidth={3} />
      <g transform="translate(300 40)">
        <rect x={0} y={0} width={110} height={100} fill={a} {...O} />
        <rect x={0} y={50} width={110} height={50} fill={b} opacity={0.8} />
        {(weather === 'rainy' || weather === 'foggy') && (
          <svg x={0} y={0} width={110} height={100} viewBox="0 0 110 100">
            <WeatherFx weather={weather} w={110} h={100} />
          </svg>
        )}
        <path d="M55 0 V100 M0 50 H110" stroke={C.woodDark} strokeWidth={5} />
        <rect x={-8} y={96} width={126} height={10} rx={2} fill={C.woodLight} {...T} />
      </g>
      <g transform="translate(60 120)">
        <circle cx={20} cy={-50} r={50} fill="url(#bb-glow)" opacity={lit(time) ? 0.9 : 0.4} />
        <path d="M14 -40 L26 -40 L32 -66 L8 -66 Z" fill="#f0d6a0" {...T} />
        <path d="M20 -40 V70" stroke={C.woodDark} strokeWidth={4} />
      </g>
      <g transform="translate(120 206)">
        <path d="M0 0 L0 -70 C0 -86 70 -86 70 -70 L70 0 Z" fill="#b5523b" {...O} />
        <rect x={-8} y={-30} width={86} height={30} rx={8} fill="#c9643f" {...O} />
      </g>
      <ellipse cx={240} cy={268} rx={180} ry={22} fill="#c9a06a" {...T} />
      <ellipse cx={240} cy={268} rx={150} ry={16} fill="none" stroke={C.tomato} strokeWidth={4} opacity={0.6} />
    </g>
  )
}

function Fx({ fx, x, y }: { fx?: SceneFx; x: number; y: number }) {
  if (!fx) return null
  switch (fx) {
    case 'stars':
    case 'sparkle':
      return (
        <g className="vfx-sparkle" fill={fx === 'stars' ? C.star : '#fff6d0'}>
          {[
            [-60, -120],
            [40, -150],
            [90, -90],
            [-100, -60],
            [10, -60],
          ].map(([dx, dy], i) => (
            <path key={i} d={`M${x + dx} ${y + dy - 7} l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2 Z`} style={{ animationDelay: `${i * 0.3}s` }} stroke={INK} strokeWidth={0.6} />
          ))}
        </g>
      )
    case 'notes':
      return (
        <g className="vfx-rise" fill={INK}>
          {[0, 1, 2, 3].map((i) => (
            <g key={i} style={{ animationDelay: `${i * 0.6}s` }} transform={`translate(${x + (i % 2 ? 26 : -14) + i * 8} ${y - 20})`}>
              <path d="M0 0 V-18 L10 -21 V-4" stroke={INK} strokeWidth={2} fill="none" />
              <circle cx={-2} cy={0} r={4} />
              <circle cx={8} cy={-4} r={4} />
            </g>
          ))}
        </g>
      )
    case 'steam':
      return (
        <g className="vfx-rise" stroke="#fffaf0" strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.85}>
          {[0, 1, 2].map((i) => (
            <path key={i} d={`M${x - 10 + i * 10} ${y - 10} c-8 -10 8 -18 0 -28 c-8 -10 8 -18 0 -26`} style={{ animationDelay: `${i * 0.5}s` }} />
          ))}
        </g>
      )
    case 'leaves':
      return (
        <g className="vfx-blow">
          {[0, 1, 2, 3, 4].map((i) => (
            <path key={i} d={`M${40 + i * 70} ${60 + (i % 3) * 50} q6 -5 12 0 q-6 5 -12 0 Z`} fill={i % 2 ? C.saffron : C.brick} stroke={INK} strokeWidth={0.8} style={{ animationDelay: `${-i * 0.7}s` }} />
          ))}
        </g>
      )
    case 'moths':
      return (
        <g className="vfx-moths" fill="#f6eed8" stroke={INK} strokeWidth={0.8}>
          {[0, 1, 2].map((i) => (
            <g key={i} style={{ animationDelay: `${-i * 0.8}s`, transformOrigin: `${x}px ${y}px` }}>
              <path d={`M${x + 30 + i * 6} ${y - 10 - i * 8} l-5 -4 0 8 Z M${x + 30 + i * 6} ${y - 10 - i * 8} l5 -4 0 8 Z`} />
            </g>
          ))}
        </g>
      )
    case 'petals':
      return (
        <g className="vfx-fall">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <ellipse key={i} cx={40 + i * 80} cy={20 + (i % 2) * 40} rx={4} ry={2.4} fill={i % 2 ? '#e89a8a' : '#f6d0d6'} style={{ animationDelay: `${-i * 0.9}s` }} />
          ))}
        </g>
      )
    case 'confetti':
      return (
        <g className="vfx-fall">
          {Array.from({ length: 12 }, (_, i) => (
            <rect key={i} x={20 + i * 38} y={10 + (i % 3) * 20} width={6} height={9} fill={[C.tomato, C.saffron, '#5b7fb5', '#6f8f45'][i % 4]} style={{ animationDelay: `${-i * 0.4}s` }} />
          ))}
        </g>
      )
    case 'flash':
      return <circle className="vfx-flash" cx={x} cy={y} r={70} fill="#fffef6" />
    case 'hearts':
      return (
        <g className="vfx-rise" fill={C.tomato} stroke={INK} strokeWidth={1}>
          {[0, 1].map((i) => (
            <path key={i} d={`M${x + i * 20} ${y - 30} c-6 -8 -16 -2 -10 6 l10 10 10 -10 c6 -8 -4 -14 -10 -6 Z`} style={{ animationDelay: `${i * 0.8}s` }} />
          ))}
        </g>
      )
    case 'lanterns':
      return (
        <g className="vfx-rise">
          {[0, 1, 2].map((i) => (
            <g key={i} style={{ animationDelay: `${i * 0.9}s` }}>
              <circle cx={x - 60 + i * 60} cy={y - 60} r={18} fill="url(#bb-glow)" />
              <ellipse cx={x - 60 + i * 60} cy={y - 60} rx={7} ry={9} fill={C.saffron} stroke={INK} strokeWidth={1} />
            </g>
          ))}
        </g>
      )
  }
}

type Slot = { x: number; flip: boolean }
function slots(n: number): Slot[] {
  if (n <= 1) return [{ x: 210, flip: false }]
  if (n === 2) return [{ x: 150, flip: false }, { x: 320, flip: true }]
  if (n === 3) return [{ x: 110, flip: false }, { x: 240, flip: false }, { x: 360, flip: true }]
  return [
    { x: 80, flip: false },
    { x: 180, flip: false },
    { x: 290, flip: true },
    { x: 390, flip: true },
  ]
}

function Person({ id, slot, mood }: { id: ResidentId; slot: Slot; mood: 'idle' | 'happy' }) {
  const w = 200 * S
  const h = 300 * S
  const x = slot.x - w / 2
  const y = GROUND - h
  return (
    <g transform={`translate(${x} ${y}) scale(${S})`} className="v-person">
      <ellipse cx={100} cy={292} rx={60} ry={8} fill={INK} opacity={0.18} />
      <g transform={slot.flip ? 'translate(200 0) scale(-1 1)' : undefined}>
        <ResidentFigure id={id} mood={mood} />
      </g>
    </g>
  )
}

/** Where a resident's hand is, in vignette coordinates. */
function handAt(id: ResidentId, slot: Slot): [number, number] {
  const [hx, hy] = HOLD_POINT[id]
  const w = 200 * S
  const x0 = slot.x - w / 2
  const y0 = GROUND - 300 * S
  const px = slot.flip ? 200 - hx : hx
  return [x0 + px * S, y0 + hy * S]
}

function Prop({ id, mode, who, slot, photos }: { id: ObjectId; mode: PropMode; who: ResidentId; slot: Slot; photos?: number }) {
  const dir = slot.flip ? -1 : 1
  const [hx, hy] = handAt(who, slot)
  const place = (x: number, y: number, size: number, extra?: ReactNode, rot = 0) => (
    <g transform={`translate(${x - size / 2} ${y - size / 2}) rotate(${rot} ${size / 2} ${size / 2}) scale(${size / 120})`} className="v-prop">
      <g filter="url(#bb-wobble)">
        <ObjectFigure id={id} photos={photos} />
      </g>
      {extra}
    </g>
  )
  switch (mode) {
    case 'stand':
      return place(slot.x + dir * 88, GROUND - 58, 124)
    case 'sky': {
      const kx = slot.x + dir * 120
      const ky = 62
      return (
        <g>
          <path d={`M${hx} ${hy} Q${(hx + kx) / 2} ${ky + 90} ${kx} ${ky + 34}`} stroke={INK} strokeWidth={1.2} fill="none" />
          <g className="v-kite">{place(kx, ky, 78, undefined, dir * 8)}</g>
        </g>
      )
    }
    case 'overhead': {
      const top = GROUND - 300 * S + HEAD_TOP[who] * S
      const size = 150
      return (
        <g transform={`translate(${slot.x - size / 2} ${top - 96}) scale(${size / 120})`} className="v-prop">
          <g filter="url(#bb-wobble)">
            <UmbrellaOpen />
          </g>
        </g>
      )
    }
    case 'ground':
      return place(slot.x + dir * 86, GROUND - 32, 78)
    case 'lap':
      return place(hx + dir * 8, hy, 64)
    case 'easel': {
      const ex = slot.x + dir * 92
      return (
        <g>
          <path d={`M${ex - 26} ${GROUND} L${ex} ${GROUND - 120} L${ex + 26} ${GROUND} M${ex} ${GROUND - 120} L${ex + dir * 6} ${GROUND}`} stroke={C.woodDark} strokeWidth={5} fill="none" />
          <rect x={ex - 34} y={GROUND - 112} width={68} height={56} fill={C.cream} {...T} />
          <path d={`M${ex - 28} ${GROUND - 70} C${ex - 12} ${GROUND - 84} ${ex + 4} ${GROUND - 76} ${ex + 28} ${GROUND - 88} L${ex + 28} ${GROUND - 60} L${ex - 28} ${GROUND - 60} Z`} fill="#8fb06a" opacity={0.85} />
          <path d={`M${ex - 28} ${GROUND - 106} L${ex + 28} ${GROUND - 106} L${ex + 28} ${GROUND - 90} C${ex} ${GROUND - 84} ${ex - 14} ${GROUND - 88} ${ex - 28} ${GROUND - 80} Z`} fill="#a9d2d8" opacity={0.85} />
          <rect x={ex - 30} y={GROUND - 56} width={60} height={5} fill={C.woodDark} />
          {place(slot.x + dir * 40, GROUND - 26, 50)}
        </g>
      )
    }
    default:
      return place(hx + dir * 14, hy - 6, 70)
  }
}

export interface VignetteProps {
  location: LocationId
  time: TimeOfDay
  weather: Weather
  indoor: boolean
  cast: ResidentId[]
  objects: ObjectId[]
  mode: PropMode
  fx?: SceneFx
  festival?: boolean
  marks?: MarkId[]
  photos?: number
}

/** A small painted scene of an Echo: who, where, and the borrowed thing in use. */
export function Vignette({ location, time, weather, indoor, cast, objects, mode, fx, festival, marks = [], photos }: VignetteProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '')
  const people = cast.slice(0, 4)
  const sl = slots(people.length)
  const wall = RESIDENTS[people[0] ?? 'tansy'].color
  const scene = indoor ? (
    <Interior time={time} weather={weather} wall={`${wall}55`} />
  ) : location === 'hill' ? (
    <Hill time={time} />
  ) : location === 'millpond' ? (
    <Pond time={time} />
  ) : location === 'kettleRow' ? (
    <Row time={time} />
  ) : location === 'glasshouse' ? (
    <Glass time={time} />
  ) : (
    <Green time={time} festival={festival} />
  )
  const outdoors = !indoor && location !== 'glasshouse'
  const behind = (m: PropMode) => m === 'stand' || m === 'sky' || m === 'easel'
  const props = objects.slice(0, 2).map((o, i) => {
    const who = people[i] ?? people[0]
    const slot = sl[Math.min(i, sl.length - 1)]
    const m: PropMode = i === 0 ? mode : o === 'umbrella' ? 'overhead' : o === 'telescope' ? 'stand' : o === 'kite' ? 'sky' : 'held'
    if (!who || !slot) return null
    return { m, el: <Prop key={o} id={o} mode={m} who={who} slot={slot} photos={photos} /> }
  })
  const [fxX, fxY] = people[0] ? handAt(people[0], sl[0]) : [240, 200]
  return (
    <svg className="vignette" viewBox="0 0 480 300" role="img" aria-label={`Scene at ${location}`}>
      <clipPath id={`vg-clip-${uid}`}>
        <rect width={480} height={300} rx={6} />
      </clipPath>
      <g clipPath={`url(#vg-clip-${uid})`}>
        {!indoor && location !== 'glasshouse' && <Sky time={time} weather={weather} uid={uid} />}
        {scene}
        {props.map((p) => (p && behind(p.m) ? p.el : null))}
        {people.map((id, i) => (
          <Person key={id} id={id} slot={sl[i]} mood="happy" />
        ))}
        {props.map((p) => (p && !behind(p.m) ? p.el : null))}
        <Fx fx={fx} x={fxX} y={fxY} />
        {outdoors && <WeatherFx weather={weather} w={480} h={300} />}
        {time === 'night' && !indoor && <rect width={480} height={300} fill="#1a1d3a" opacity={0.18} />}
        {time === 'dusk' && !indoor && <rect width={480} height={300} fill="#6d3b57" opacity={0.1} />}
        {marks.slice(0, 2).map((m, i) => (
          <g key={i} transform={`translate(${444 - i * 34} 30) scale(1.4)`} className="v-mark">
            <MarkShape id={m} />
          </g>
        ))}
      </g>
      <rect width={480} height={300} rx={6} fill="none" stroke={INK} strokeWidth={4} />
    </svg>
  )
}
