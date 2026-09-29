import type { ReactNode } from 'react'
import { C, INK } from '../../art/palette'
import { ResidentFigure } from '../../art/residents'
import { LOCATIONS } from '../../game/content/world'
import { hasFlag } from '../../game/query'
import type { GameState, LocationId, ResidentId, TimeOfDay, Weather } from '../../game/types'
import { PLACE_SIGN } from './mapGeo'

const O = { stroke: INK, strokeWidth: 3, strokeLinejoin: 'round' as const }
const T = { stroke: INK, strokeWidth: 2, strokeLinejoin: 'round' as const }

function Tree({ x, y, s = 1, tone = 0 }: { x: number; y: number; s?: number; tone?: number }) {
  const greens = ['#5d7650', '#6f8f45', '#4f6b3a']
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-6 0 L-4 -40 L4 -40 L6 0 Z" fill={C.woodDark} {...T} />
      <path d="M0 -118 C34 -118 50 -90 44 -66 C58 -54 52 -26 30 -26 L-30 -26 C-52 -26 -58 -54 -44 -66 C-50 -90 -34 -118 0 -118 Z" fill={greens[tone % 3]} {...O} />
      <path d="M-18 -86 C-8 -96 10 -96 18 -88" stroke="#8fb06a" strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.7} />
    </g>
  )
}

function Smoke({ x, y }: { x: number; y: number }) {
  return (
    <g className="smoke" transform={`translate(${x} ${y})`}>
      <circle cx={0} cy={-10} r={7} fill="#efece4" opacity={0.7} />
      <circle cx={6} cy={-26} r={9} fill="#efece4" opacity={0.55} />
      <circle cx={2} cy={-46} r={11} fill="#efece4" opacity={0.4} />
    </g>
  )
}

function Cottage({ x, y, wall, roof, n, lit, door = '#2f6b4a' }: { x: number; y: number; wall: string; roof: string; n: number; lit: boolean; door?: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={58} y={-110} width={14} height={30} fill={C.brick} {...T} />
      <path d="M-6 -60 L50 -118 L106 -60 Z" fill={roof} {...O} />
      <rect x={0} y={-62} width={100} height={62} fill={wall} {...O} />
      <rect x={38} y={-38} width={24} height={38} rx={10} fill={door} {...T} />
      <circle cx={57} cy={-18} r={2} fill={C.brass} />
      <rect x={10} y={-50} width={20} height={18} fill={lit ? C.lamp : '#cfe3e6'} {...T} className={lit ? 'win-lit' : undefined} />
      <rect x={70} y={-50} width={20} height={18} fill={lit ? C.lamp : '#cfe3e6'} {...T} className={lit ? 'win-lit' : undefined} />
      <path d="M20 -50 V-32 M80 -50 V-32" stroke={INK} strokeWidth={1.4} />
      <text x={50} y={-44} textAnchor="middle" fontSize={11} className="svg-display" fontWeight={700} fill={INK}>
        {n}
      </text>
    </g>
  )
}

function Flowers({ x, y, n, colour, tall }: { x: number; y: number; n: number; colour: string; tall?: boolean }) {
  return (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const fx = x + i * (tall ? 16 : 11)
        const h = tall ? 46 + ((i * 7) % 12) : 12 + ((i * 5) % 6)
        return (
          <g key={i}>
            <path d={`M${fx} ${y} L${fx} ${y - h}`} stroke={C.grassDark} strokeWidth={tall ? 3 : 2} />
            <circle cx={fx} cy={y - h} r={tall ? 8 : 4} fill={colour} stroke={INK} strokeWidth={1.3} />
            {tall && <circle cx={fx} cy={y - h} r={3.4} fill="#6b4630" />}
          </g>
        )
      })}
    </g>
  )
}

function Sign({ at, label }: { at: [number, number]; label: string }) {
  const [x, y] = at
  const w = label.length * 9.5 + 26
  return (
    <g className="map-sign" transform={`translate(${x} ${y}) rotate(-2)`}>
      <path d="M0 0 V36" stroke={C.woodDark} strokeWidth={6} />
      <rect x={-w / 2} y={-26} width={w} height={28} rx={4} fill={C.woodLight} {...T} />
      <text x={0} y={-6} textAnchor="middle" fontSize={17} className="svg-display" fontWeight={700} fill={C.cream}>
        {label}
      </text>
    </g>
  )
}

export interface MapFigure {
  id: ResidentId
  at: [number, number]
  flip?: boolean
  highlight?: boolean
}

interface VillageMapProps {
  state?: GameState | null
  time: TimeOfDay
  weather: Weather
  figures?: MapFigure[]
  festival?: boolean
  showSigns?: boolean
  children?: ReactNode
}

/** Mosswick, laid out like a paper diorama. */
export function VillageMap({ state, time, weather, figures = [], festival, showSigns = true, children }: VillageMapProps) {
  const night = time === 'night'
  const dusk = time === 'dusk'
  const lit = night || dusk
  const f = (flag: string) => (state ? hasFlag(state, flag) : false)
  const glassOpen = f('glasshouse_open')
  const club = f('club')
  const hollisHere = !!state && state.present.includes('hollis')
  const bunting = festival || (!!state && state.day >= 6)
  const skyTop = night ? '#1d2440' : dusk ? '#5b5488' : weather === 'rainy' ? '#8e9aa3' : weather === 'foggy' ? '#cfd3cd' : '#8fc6d8'
  const skyBottom = night ? '#3a4470' : dusk ? '#f1a36a' : weather === 'rainy' ? '#c3cac8' : weather === 'foggy' ? '#ebe8e0' : '#e8f1dc'
  const clear = weather === 'sunny' || weather === 'windy'
  return (
    <svg className={`village-map ${night ? 'is-night' : ''}`} viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice" role="img" aria-label="A map of Mosswick">
      <defs>
        <linearGradient id="map-sky" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="1000">
          <stop offset="0%" stopColor={skyTop} />
          <stop offset="100%" stopColor={skyBottom} />
        </linearGradient>
        <radialGradient id="map-pond" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor={night ? '#2f4f5a' : '#7fb2ac'} />
          <stop offset="100%" stopColor={night ? '#1f3440' : '#4f8a8b'} />
        </radialGradient>
      </defs>
      <rect x={-900} y={-300} width={3400} height={1400} fill="url(#map-sky)" />
      {/* the countryside beyond the village, so the camera never finds an edge */}
      <g className="map-outskirts">
        <path d="M-900 420 C-700 330 -420 360 -160 370 C0 376 80 400 120 420 L120 1400 L-900 1400 Z" fill={night ? '#3b4b5a' : '#a8c3a2'} />
        <path d="M1500 420 C1700 340 1980 360 2200 350 C2360 344 2440 380 2500 400 L2500 1400 L1500 1400 Z" fill={night ? '#3b4b5a' : '#a8c3a2'} />
        <rect x={-900} y={520} width={3400} height={900} fill={night ? '#34473c' : '#7f9d4f'} />
        <path d="M-900 540 C-600 500 -300 520 -20 540 L-20 1400 L-900 1400 Z" fill={night ? '#2f4436' : '#76954a'} />
        <path d="M1620 540 C1900 510 2200 520 2500 540 L2500 1400 L1620 1400 Z" fill={night ? '#2f4436' : '#76954a'} />
        <Tree x={-140} y={620} s={1.1} tone={1} />
        <Tree x={-360} y={700} s={1.3} tone={0} />
        <Tree x={1760} y={640} s={1.2} tone={2} />
        <Tree x={1980} y={720} s={1.4} tone={1} />
        <Tree x={-240} y={960} s={1.6} tone={2} />
        <Tree x={1860} y={980} s={1.5} tone={0} />
      </g>
      {night && clear && (
        <g fill={C.star}>
          {Array.from({ length: 70 }, (_, i) => (
            <circle key={i} className="twinkle" cx={(i * 211) % 1600} cy={(i * 97) % 330 + 10} r={i % 5 === 0 ? 2.6 : 1.5} />
          ))}
        </g>
      )}
      {(night || dusk) && <path d="M1350 90 A40 40 0 1 0 1392 150 A31 31 0 1 1 1350 90 Z" fill="#f4e3a1" opacity={night ? 1 : 0.7} />}
      {!night && !dusk && clear && <circle cx={1360} cy={110} r={46} fill="#fbe7a0" stroke="#f2c86a" strokeWidth={5} />}
      <g className="cloud-drift" opacity={clear ? 0.9 : 1} fill={weather === 'rainy' ? '#9ea8ae' : night ? '#4a5378' : '#fbf8ef'}>
        <ellipse cx={260} cy={120} rx={90} ry={26} />
        <ellipse cx={320} cy={104} rx={60} ry={26} />
        <ellipse cx={900} cy={80} rx={110} ry={24} />
        {!clear && <ellipse cx={1200} cy={130} rx={160} ry={34} />}
        {!clear && <ellipse cx={560} cy={150} rx={170} ry={30} />}
      </g>

      {/* far hills */}
      <path d="M-20 400 C160 300 360 330 560 360 C760 390 960 300 1180 320 C1380 338 1500 300 1620 330 L1620 520 L-20 520 Z" fill={night ? '#3b4b5a' : '#a8c3a2'} {...T} />
      <path d="M-20 440 C220 380 460 420 700 410 C940 400 1160 360 1620 400 L1620 560 L-20 560 Z" fill={night ? '#34473c' : '#93b27a'} {...T} />

      {/* Observatory Hill */}
      <g className="map-layer">
        <path d="M-40 560 C60 380 180 240 320 236 C460 232 560 330 700 470 C720 490 730 520 740 560 Z" fill={night ? '#3e5147' : '#86a04f'} {...O} />
        <path d="M120 420 C200 330 260 300 320 290" stroke="#a5bf6a" strokeWidth={8} fill="none" strokeLinecap="round" opacity={night ? 0.2 : 0.6} />
        <path d="M600 520 C520 470 470 420 420 370 C390 340 350 320 330 300" stroke="#d9bf8c" strokeWidth={10} fill="none" strokeDasharray="18 10" opacity={0.8} />
        {/* observatory */}
        <g transform="translate(300 238)">
          {club && <circle cx={0} cy={-30} r={90} fill="url(#bb-glow)" opacity={0.8} />}
          <rect x={-26} y={-44} width={52} height={46} fill="#bfb49e" {...O} />
          <path d={club ? 'M-30 -44 A30 30 0 0 1 30 -44 Z' : 'M-30 -44 A30 30 0 0 1 30 -44 Z'} fill={club ? '#8fa0b4' : '#9aa0a6'} {...O} />
          {club && <path d="M-4 -72 L4 -72 L14 -46 L6 -46 Z" fill="#2b3a5a" {...T} />}
          <rect x={-8} y={-26} width={16} height={28} rx={7} fill={club ? C.lamp : C.woodDark} {...T} />
          <path d="M-20 -40 h12 M8 -40 h12" stroke={INK} strokeWidth={1.4} opacity={0.5} />
        </g>
        {club &&
          [180, 220, 260, 340, 380, 420].map((x, i) => (
            <g key={x}>
              <circle cx={x} cy={286 + (i % 3) * 6 + Math.abs(300 - x) * 0.25} r={16} fill="url(#bb-glow)" />
              <circle cx={x} cy={286 + (i % 3) * 6 + Math.abs(300 - x) * 0.25} r={5} fill={C.lamp} {...T} strokeWidth={1.2} />
            </g>
          ))}
        {/* bench */}
        <g transform="translate(372 290)">
          <rect x={0} y={0} width={46} height={8} fill={C.wood} {...T} />
          <path d="M4 8 V18 M42 8 V18" stroke={INK} strokeWidth={3} />
        </g>
        {/* the Old Oak */}
        <g transform="translate(520 330)">
          <path d="M-10 60 C-8 30 -14 10 -6 -10 L8 -10 C14 10 10 30 12 60 Z" fill={C.woodDark} {...O} />
          <path d="M0 -118 C50 -122 80 -90 74 -58 C98 -44 88 -6 56 -8 C40 10 -40 10 -56 -8 C-88 -6 -98 -44 -74 -58 C-80 -90 -50 -122 0 -118 Z" fill={night ? '#2f4432' : '#5d7650'} {...O} />
          <path d="M-40 -80 C-20 -96 20 -98 40 -84" stroke="#8fb06a" strokeWidth={6} fill="none" opacity={night ? 0.2 : 0.6} strokeLinecap="round" />
        </g>
      </g>

      {/* Glasshouse + Margo's cottage */}
      <g className="map-layer">
        <path d="M1140 470 C1260 440 1500 440 1620 460 L1620 560 L1140 560 Z" fill={night ? '#3e5147' : '#86a04f'} />
        <g transform="translate(1180 330)">
          <path d="M0 120 L0 40 L60 0 L200 0 L260 40 L260 120 Z" fill={glassOpen ? (lit ? '#fff1c2' : '#e6f2e6') : '#b8c6c0'} fillOpacity={0.9} {...O} />
          {glassOpen && <circle cx={130} cy={70} r={120} fill="url(#bb-glow)" opacity={lit ? 0.7 : 0.25} />}
          <path d="M0 40 L260 40 M60 0 L60 120 M130 0 L130 120 M200 0 L200 120 M30 20 L30 120 M230 20 L230 120" stroke="#f6f4ee" strokeWidth={4} />
          <path d="M0 40 L260 40 M60 0 L60 120 M130 0 L130 120 M200 0 L200 120" stroke={INK} strokeWidth={1.2} opacity={0.6} />
          {glassOpen ? (
            <>
              <Flowers x={20} y={118} n={6} colour="#d98c8f" />
              <Flowers x={150} y={118} n={6} colour="#8d78b4" />
              <path d="M112 120 L112 64 L148 64 L148 120" fill="none" {...O} />
              <path d="M112 64 L96 70 L96 124 L112 120" fill="#e6f2e6" {...T} />
              {f('truce') && <ellipse cx={200} cy={110} rx={34} ry={14} fill="#6f8f45" {...O} />}
            </>
          ) : (
            <>
              <rect x={112} y={64} width={36} height={56} fill="#9aa8a0" {...T} />
              <path d="M104 74 L156 92 M104 100 L156 84" stroke={C.woodLight} strokeWidth={7} />
              <path d="M104 74 L156 92 M104 100 L156 84" stroke={INK} strokeWidth={1.3} />
            </>
          )}
        </g>
        <g transform="translate(1460 470)">
          <rect x={48} y={-104} width={12} height={26} fill={C.brick} {...T} />
          <path d="M-6 -56 L44 -104 L96 -56 Z" fill="#58704a" {...O} />
          <rect x={0} y={-58} width={90} height={58} fill="#efe2c0" {...O} />
          <rect x={34} y={-36} width={22} height={36} rx={9} fill={C.brick} {...T} />
          <rect x={8} y={-46} width={18} height={16} fill={lit ? C.lamp : '#cfe3e6'} {...T} />
          <Smoke x={54} y={-106} />
        </g>
      </g>

      {/* The Green, the post office and the bakery */}
      <g className="map-layer">
        <path d="M-20 520 C300 500 600 460 900 470 C1200 480 1400 500 1620 520 L1620 1000 L-20 1000 Z" fill={night ? '#34473c' : '#7f9d4f'} {...T} />
        <ellipse cx={840} cy={610} rx={250} ry={100} fill={night ? '#3e5147' : '#a5bf6a'} {...T} />
        {/* paths */}
        <g stroke="#d9bf8c" strokeWidth={18} fill="none" strokeLinecap="round" opacity={night ? 0.5 : 0.95}>
          <path d="M820 880 C820 800 830 740 840 700" />
          <path d="M1060 640 C1140 670 1200 690 1300 700" />
          <path d="M620 650 C540 680 480 700 420 720" />
          <path d="M660 540 C620 520 600 500 590 480" />
          <path d="M1250 680 C1270 600 1290 530 1300 460" />
        </g>
        {/* post office */}
        <g transform="translate(620 500)">
          <rect x={60} y={-128} width={14} height={30} fill={C.brick} {...T} />
          <path d="M-8 -80 L70 -134 L148 -80 Z" fill={C.brick} {...O} />
          <rect x={0} y={-82} width={140} height={82} fill="#e7c9a0" {...O} />
          <rect x={20} y={-100} width={100} height={20} fill={C.navy} {...T} />
          <text x={70} y={-85} textAnchor="middle" fontSize={14} fill={C.cream} className="svg-display" fontWeight={800}>
            POST OFFICE
          </text>
          <rect x={56} y={-50} width={28} height={50} rx={12} fill={C.navy} {...T} />
          <rect x={14} y={-64} width={28} height={24} fill={lit ? C.lamp : '#cfe3e6'} {...T} className={lit ? 'win-lit' : undefined} />
          <rect x={98} y={-64} width={28} height={24} fill={lit ? C.lamp : '#cfe3e6'} {...T} className={lit ? 'win-lit' : undefined} />
          <rect x={150} y={-30} width={14} height={30} rx={5} fill={C.tomato} {...T} />
          {f('lavender_bloomed') && <Flowers x={144} y={2} n={4} colour="#9a84c4" />}
          {f('sunflowers_planted') && !f('sunflowers_bloomed') && <Flowers x={6} y={2} n={6} colour="#8fb06a" />}
          {f('sunflowers_bloomed') && <Flowers x={-2} y={2} n={7} colour="#f0b23e" tall />}
        </g>
        {/* bakery */}
        <g transform="translate(930 500)">
          <rect x={20} y={-126} width={14} height={30} fill={C.brick} {...T} />
          <Smoke x={27} y={-128} />
          <path d="M-8 -80 L70 -130 L148 -80 Z" fill="#8a5a3b" {...O} />
          <rect x={0} y={-82} width={140} height={82} fill="#f1dcc0" {...O} />
          <path d="M-4 -58 L144 -58 L136 -40 L4 -40 Z" fill={C.tomato} {...T} />
          <path d="M22 -58 L18 -40 M48 -58 L46 -40 M74 -58 L74 -40 M100 -58 L102 -40 M124 -58 L128 -40" stroke={C.cream} strokeWidth={6} />
          <text x={70} y={-64} textAnchor="middle" fontSize={13} fill={INK} className="svg-display" fontWeight={800}>
            THE OVEN DOOR
          </text>
          <rect x={56} y={-36} width={28} height={36} rx={10} fill={C.woodDark} {...T} />
          <rect x={10} y={-34} width={36} height={22} fill={lit ? C.lamp : '#f3e3c6'} {...T} className={lit ? 'win-lit' : undefined} />
          <rect x={96} y={-34} width={36} height={22} fill={lit ? C.lamp : '#f3e3c6'} {...T} className={lit ? 'win-lit' : undefined} />
          {f('rosemary_loaf') && (
            <g>
              <rect x={96} y={-14} width={36} height={8} fill={C.wood} {...T} />
              <Flowers x={100} y={-14} n={3} colour="#6f9b45" />
            </g>
          )}
        </g>
        {/* bandstand */}
        <g transform="translate(840 610)">
          {festival && <circle cx={0} cy={-30} r={170} fill="url(#bb-glow)" opacity={0.85} />}
          <rect x={-60} y={-10} width={120} height={16} fill="#e7c9a0" {...O} />
          <path d="M-52 -10 V-62 M-18 -10 V-62 M18 -10 V-62 M52 -10 V-62" stroke={INK} strokeWidth={5} />
          <path d="M-52 -10 V-62 M-18 -10 V-62 M18 -10 V-62 M52 -10 V-62" stroke="#f6f4ee" strokeWidth={2.4} />
          <path d="M-74 -60 L0 -104 L74 -60 Z" fill={C.tomato} {...O} />
          <path d="M-40 -80 L0 -104 L-8 -60 Z M40 -80 L0 -104 L22 -60 Z" fill={C.cream} opacity={0.85} />
          <path d="M0 -104 V-118" stroke={INK} strokeWidth={3} />
          <circle cx={0} cy={-120} r={4} fill={C.brass} {...T} />
        </g>
        {bunting && (
          <g>
            <path d="M600 520 Q840 600 1080 520" stroke={INK} strokeWidth={2} fill="none" />
            {Array.from({ length: 16 }, (_, i) => {
              const t = (i + 0.5) / 16
              const x = 600 + t * 480
              const y = 520 + Math.sin(Math.PI * t) * 40
              return <path key={i} d={`M${x - 10} ${y} L${x + 10} ${y} L${x} ${y + 18} Z`} fill={[C.tomato, C.saffron, '#5b7fb5', '#6f8f45'][i % 4]} {...T} strokeWidth={1.2} />
            })}
          </g>
        )}
        {festival &&
          Array.from({ length: 12 }, (_, i) => {
            const a = (i / 12) * Math.PI * 2
            const x = 840 + Math.cos(a) * 230
            const y = 616 + Math.sin(a) * 88
            return (
              <g key={i} className="paper-lantern">
                <circle cx={x} cy={y - 40} r={30} fill="url(#bb-glow)" />
                <ellipse cx={x} cy={y - 40} rx={9} ry={11} fill={i % 2 ? '#f0b23e' : '#d9622b'} {...T} strokeWidth={1.4} />
                <path d={`M${x} ${y - 28} V${y}`} stroke={INK} strokeWidth={1.4} />
              </g>
            )
          })}
        {/* the well */}
        <g transform="translate(700 660)">
          <ellipse cx={0} cy={0} rx={22} ry={9} fill={C.stone} {...T} />
          <rect x={-22} y={-18} width={44} height={18} fill={C.stone} {...T} />
          <path d="M-18 -18 V-44 M18 -18 V-44 M-26 -44 L26 -44" stroke={C.woodDark} strokeWidth={4} />
        </g>
        {f('truce') && festival && <ellipse cx={980} cy={680} rx={40} ry={16} fill="#6f8f45" {...O} />}
      </g>

      {/* Kettle Row */}
      <g className="map-layer">
        <Cottage x={1100} y={740} wall="#e8c7b4" roof="#8a5a3b" n={1} lit={lit} />
        <Cottage x={1212} y={740} wall="#f0dca0" roof="#b5523b" n={2} lit={lit} door={C.tomato} />
        <Cottage x={1324} y={740} wall={hollisHere ? '#cfe0dc' : '#d8d2c4'} roof={hollisHere ? '#3f7a78' : '#8d8a86'} n={3} lit={lit && hollisHere} door={hollisHere ? C.teal : '#8d8a86'} />
        <Cottage x={1436} y={740} wall="#e6d4e8" roof="#6d3b57" n={4} lit={lit} />
        <Smoke x={1165} y={632} />
        <Smoke x={1277} y={632} />
        {hollisHere && <Smoke x={1389} y={632} />}
        {f('sweetpeas_bloomed') && <Flowers x={1102} y={744} n={8} colour="#d98ccf" />}
        {f('bulbs_bloomed') && <Flowers x={1326} y={744} n={8} colour={C.tomato} />}
        {f('housewarming') && (
          <path d="M1328 668 Q1374 690 1420 668" stroke={C.saffron} strokeWidth={4} fill="none" strokeDasharray="2 8" strokeLinecap="round" />
        )}
        {f('signpost') && (
          <g transform="translate(1560 760)">
            <path d="M0 0 V-60" stroke={C.woodDark} strokeWidth={6} />
            <path d="M-4 -56 L-40 -52 L-44 -46 L-4 -44 Z M4 -40 L40 -38 L44 -32 L4 -30 Z" fill={C.woodLight} {...T} />
          </g>
        )}
        <path d="M1090 760 L1560 760" stroke="#d9bf8c" strokeWidth={14} strokeLinecap="round" opacity={0.8} />
      </g>

      {/* Millpond */}
      <g className="map-layer">
        <path d="M60 760 C60 660 200 610 330 630 C460 650 540 720 520 790 C500 860 360 890 240 880 C120 870 60 840 60 760 Z" fill="url(#map-pond)" {...O} />
        <path d="M140 700 C200 690 240 700 280 690 M320 760 C360 750 400 760 440 752" stroke="#bfe0e0" strokeWidth={4} fill="none" opacity={0.7} strokeLinecap="round" className="ripple" />
        {[
          [200, 800],
          [240, 820],
          [420, 700],
        ].map(([x, y]) => (
          <ellipse key={`${x}`} cx={x} cy={y} rx={16} ry={6} fill="#6f9b45" {...T} strokeWidth={1.4} />
        ))}
        <g transform="translate(90 660)">
          <rect x={-30} y={-90} width={90} height={80} fill="#d8c7a8" {...O} />
          <path d="M-40 -88 L15 -130 L70 -88 Z" fill="#8a5a3b" {...O} />
          <g className="mill-wheel" style={{ transformOrigin: '70px -20px' }}>
            <circle cx={70} cy={-20} r={38} fill="none" stroke={C.woodDark} strokeWidth={8} />
            <path d="M70 -58 V18 M32 -20 H108 M43 -47 L97 7 M97 -47 L43 7" stroke={C.woodDark} strokeWidth={5} />
          </g>
        </g>
        <path d="M360 760 L470 720" stroke={C.woodDark} strokeWidth={12} strokeLinecap="round" />
        <path d="M360 760 L470 720" stroke={C.woodLight} strokeWidth={7} strokeLinecap="round" />
        <g stroke={C.grassDark} strokeWidth={4} strokeLinecap="round">
          <path d="M470 820 L466 780 M480 824 L482 776 M492 822 L500 786 M118 830 L112 794 M128 834 L130 788" />
        </g>
      </g>

      {/* The Borrowburrow */}
      <g className="map-layer">
        <path d="M580 1010 C600 860 700 800 820 800 C940 800 1040 860 1060 1010 Z" fill={night ? '#3e5147' : '#86a04f'} {...O} />
        <path d="M640 900 C680 860 740 840 800 836" stroke="#a5bf6a" strokeWidth={10} fill="none" strokeLinecap="round" opacity={night ? 0.2 : 0.7} />
        <rect x={930} y={790} width={20} height={44} fill={C.brick} {...T} />
        <Smoke x={940} y={786} />
        <path d="M770 960 L770 900 C770 866 870 866 870 900 L870 960 Z" fill="#2f6b4a" {...O} />
        <circle cx={855} cy={930} r={4} fill={C.brass} />
        <circle cx={712} cy={900} r={22} fill={lit ? C.lamp : '#cfe3e6'} {...O} className={lit ? 'win-lit' : undefined} />
        <path d="M712 878 V922 M690 900 H734" stroke={INK} strokeWidth={2} />
        {lit && <circle cx={712} cy={900} r={70} fill="url(#bb-glow)" opacity={0.7} />}
        <g transform="translate(900 872) rotate(4)">
          <rect x={-4} y={0} width={8} height={40} fill={C.woodDark} />
          <rect x={-70} y={-30} width={140} height={32} rx={4} fill={C.woodLight} {...T} />
          <text x={0} y={-8} textAnchor="middle" fontSize={15} className="svg-display" fontWeight={800} fill={C.cream}>
            BORROWBURROW
          </text>
        </g>
      </g>

      {/* foreground framing */}
      <Tree x={40} y={1000} s={1.6} tone={2} />
      <Tree x={1560} y={1000} s={1.7} tone={0} />
      <Tree x={560} y={560} s={0.8} tone={1} />
      <Tree x={1080} y={520} s={0.75} tone={2} />
      <Tree x={20} y={560} s={1} tone={0} />

      {showSigns &&
        (Object.keys(PLACE_SIGN) as LocationId[])
          .filter((l) => l !== 'burrow')
          .map((l) => <Sign key={l} at={PLACE_SIGN[l]} label={LOCATIONS[l].name.replace(/^the /, '').replace(/^./, (c) => c.toUpperCase())} />)}

      {/* neighbours out and about */}
      {figures.map((fig) => (
        <g
          key={fig.id}
          className={`map-figure ${fig.highlight ? 'map-figure--hl' : ''}`}
          transform={`translate(${fig.at[0] - 30} ${fig.at[1] - 90}) scale(0.3)`}
        >
          {fig.highlight && <ellipse cx={100} cy={292} rx={80} ry={16} fill={C.lamp} opacity={0.6} />}
          <g transform={fig.flip ? 'translate(200 0) scale(-1 1)' : undefined}>
            <ResidentFigure id={fig.id} />
          </g>
        </g>
      ))}

      {children}

      {/* weather & light over everything */}
      {weather === 'rainy' && (
        <g className="fx-rain" stroke="#dfe9f0" strokeWidth={2} opacity={0.6} strokeLinecap="round">
          {Array.from({ length: 90 }, (_, i) => (
            <path key={i} d={`M${(i * 173) % 1600} ${(i * 89) % 1000} l-10 24`} style={{ animationDelay: `${-(i % 9) * 0.09}s` }} />
          ))}
        </g>
      )}
      {weather === 'foggy' && (
        <g className="fx-fog">
          <rect x={-200} y={420} width={2000} height={140} rx={70} fill="#f6f4ee" opacity={0.55} />
          <rect x={-300} y={640} width={2200} height={180} rx={90} fill="#f6f4ee" opacity={0.5} />
          <rect x={-100} y={300} width={1800} height={100} rx={50} fill="#f6f4ee" opacity={0.35} />
        </g>
      )}
      {weather === 'windy' && (
        <g className="fx-wind">
          {Array.from({ length: 16 }, (_, i) => (
            <path
              key={i}
              d={`M${(i * 211) % 1600} ${(i * 131) % 800 + 80} q10 -8 20 0 q-10 8 -20 0 Z`}
              fill={i % 2 ? C.saffron : C.brick}
              stroke={INK}
              strokeWidth={1.2}
              style={{ animationDelay: `${-i * 0.35}s`, animationDuration: '5s' }}
            />
          ))}
        </g>
      )}
      {dusk && <rect width={1600} height={1000} fill="#6d3b57" opacity={0.18} style={{ mixBlendMode: 'multiply' }} />}
      {night && <rect width={1600} height={1000} fill="#1a1d3a" opacity={0.28} style={{ mixBlendMode: 'multiply' }} />}
    </svg>
  )
}
