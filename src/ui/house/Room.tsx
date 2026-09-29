import { C, INK } from '../../art/palette'
import type { Orient } from '../Stage'

type Tone = 'morning' | 'day' | 'evening'

const ROOTS_WIDE = [
  'M180 40 C176 70 190 90 182 120',
  'M340 36 C346 58 336 70 342 96 C346 110 338 118 340 130',
  'M610 36 C604 52 612 64 606 80',
  'M760 36 C766 66 756 84 764 112',
  'M1010 36 C1004 60 1016 72 1008 96',
  'M1180 36 C1188 56 1178 76 1186 90',
  'M1440 40 C1432 70 1446 86 1438 118',
]
const ROOTS_TALL = ['M150 32 C146 60 158 76 152 104', 'M420 30 C426 52 416 66 422 90', 'M700 32 C694 58 706 72 700 100']

function Sconce({ x, y, lit }: { x: number; y: number; lit: boolean }) {
  return (
    <g>
      <circle className="room-lamp-glow" cx={x} cy={y - 6} r={lit ? 170 : 90} fill="url(#bb-glow)" opacity={lit ? 0.9 : 0.4} />
      <path d={`M${x - 6} ${y + 34} C${x - 6} ${y + 22} ${x - 26} ${y + 22} ${x - 26} ${y + 10}`} stroke={INK} strokeWidth={7} fill="none" strokeLinecap="round" />
      <path d={`M${x - 6} ${y + 34} C${x - 6} ${y + 22} ${x - 26} ${y + 22} ${x - 26} ${y + 10}`} stroke={C.brass} strokeWidth={3.5} fill="none" strokeLinecap="round" />
      <rect x={x - 12} y={y + 30} width={14} height={20} rx={3} fill={C.brassDark} stroke={INK} strokeWidth={2} />
      <path d={`M${x - 14} ${y + 12} L${x + 14} ${y + 12} L${x + 10} ${y + 20} L${x - 10} ${y + 20} Z`} fill={C.brass} stroke={INK} strokeWidth={2} />
      <path
        d={`M${x - 10} ${y + 12} C${x - 16} ${y} ${x - 12} ${y - 18} ${x - 7} ${y - 26} L${x + 7} ${y - 26} C${x + 12} ${y - 18} ${x + 16} ${y} ${x + 10} ${y + 12} Z`}
        fill={lit ? '#ffe7a8' : '#f6ead0'}
        fillOpacity={0.92}
        stroke={INK}
        strokeWidth={2.2}
      />
      <path d={`M${x} ${y - 10} C${x - 5} ${y - 2} ${x - 3} ${y + 6} ${x} ${y + 8} C${x + 3} ${y + 6} ${x + 5} ${y - 2} ${x} ${y - 10} Z`} fill={lit ? '#f2a33a' : '#efb85c'} />
    </g>
  )
}

function GrassCrest({ w }: { w: number }) {
  const tufts: string[] = []
  for (let x = -10; x < w + 20; x += 26) {
    const h = 12 + ((x * 7) % 11)
    tufts.push(`M${x} 26 Q${x + 5} ${26 - h} ${x + 9} 24 Q${x + 13} ${24 - h * 0.8} ${x + 18} 26`)
  }
  return (
    <g>
      <rect x={-20} y={-40} width={w + 40} height={64} fill={C.grass} />
      <path d={tufts.join(' ')} fill={C.grassLight} stroke={C.grassDark} strokeWidth={1.4} />
      {[0.12, 0.31, 0.47, 0.66, 0.83].map((f) => (
        <g key={f} transform={`translate(${f * w} 14)`}>
          <circle r={4} fill={f > 0.5 ? '#f3e1a0' : '#f6d0d6'} stroke={INK} strokeWidth={1} />
          <circle r={1.4} fill={C.saffron} />
        </g>
      ))}
    </g>
  )
}

/** The burrow in cross-section: soil, roots, a warm plastered arch and the beam. */
export function Room({ orient, tone, lanternNight }: { orient: Orient; tone: Tone; lanternNight?: boolean }) {
  const wide = orient === 'wide'
  const W = wide ? 1600 : 900
  const H = wide ? 900 : 1600
  const arch = wide
    ? 'M44 900 L44 176 C44 92 112 44 204 40 L1396 40 C1488 44 1556 92 1556 176 L1556 900 Z'
    : 'M26 1600 L26 160 C26 86 80 38 150 34 L750 34 C820 38 874 86 874 160 L874 1600 Z'
  const beamY = wide ? 78 : 70
  const lit = tone === 'evening'
  const lamps: [number, number][] = wide ? [[726, 330], [1180, 330]] : [[70, 330], [626, 330]]
  return (
    <svg className={`room room--${tone}`} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <radialGradient id="room-plaster" cx="50%" cy="42%" r="70%">
          <stop offset="0%" stopColor={lit ? '#efc27f' : '#ecc68c'} />
          <stop offset="65%" stopColor={lit ? '#cf9a57' : '#d9a764'} />
          <stop offset="100%" stopColor={lit ? '#9d6b3a' : '#b98649'} />
        </radialGradient>
        <linearGradient id="room-wainscot" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8a5a3b" />
          <stop offset="100%" stopColor="#6e4630" />
        </linearGradient>
      </defs>
      <rect width={W} height={H} fill={C.soilDark} />
      <g opacity={0.55}>
        {Array.from({ length: wide ? 26 : 18 }, (_, i) => {
          const x = (i * 137) % W
          const y = 30 + ((i * 53) % (wide ? 70 : 60))
          return <ellipse key={i} cx={x} cy={y} rx={9 + (i % 4) * 3} ry={5 + (i % 3) * 2} fill={i % 2 ? '#7a5a42' : '#5a3d2b'} />
        })}
      </g>
      <GrassCrest w={W} />
      <g filter="url(#bb-wobble-strong)">
        <path d={arch} fill={C.soil} transform="translate(0 -8)" />
        <path d={arch} fill="url(#room-plaster)" stroke={INK} strokeWidth={4} />
      </g>
      <path d={arch} fill="url(#bb-sprig)" opacity={0.9} />
      <g stroke={C.root} strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.95}>
        {(wide ? ROOTS_WIDE : ROOTS_TALL).map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
      <g stroke={INK} strokeWidth={1.2} fill="none" opacity={0.35}>
        {(wide ? ROOTS_WIDE : ROOTS_TALL).map((d) => (
          <path key={d} d={d} transform="translate(2 1)" />
        ))}
      </g>
      {wide ? (
        <g>
          <rect x={44} y={560} width={1512} height={340} fill="url(#room-wainscot)" stroke={INK} strokeWidth={3} />
          {Array.from({ length: 16 }, (_, i) => (
            <rect key={i} x={60 + i * 94} y={578} width={78} height={300} rx={6} fill="none" stroke="#5b3a28" strokeWidth={3} opacity={0.7} />
          ))}
          <rect x={44} y={552} width={1512} height={14} fill={C.woodLight} stroke={INK} strokeWidth={2.5} />
        </g>
      ) : (
        <g>
          <rect x={26} y={600} width={848} height={1000} fill="url(#room-wainscot)" stroke={INK} strokeWidth={3} />
          <rect x={26} y={592} width={848} height={14} fill={C.woodLight} stroke={INK} strokeWidth={2.5} />
        </g>
      )}
      <g>
        <rect x={wide ? 40 : 20} y={beamY} width={wide ? 1520 : 860} height={30} rx={4} fill={C.woodDark} stroke={INK} strokeWidth={3} />
        <path d={`M${wide ? 60 : 36} ${beamY + 10} H${wide ? 1540 : 860}`} stroke="#7a4f36" strokeWidth={3} strokeDasharray="60 22 30 40" />
        {(wide ? [300, 820, 1380] : [160, 450, 740]).map((x) => (
          <circle key={x} cx={x} cy={beamY + 15} r={4} fill="#3b2418" />
        ))}
      </g>
      {lamps.map(([x, y]) => (
        <Sconce key={x} x={x} y={y} lit={lit || !!lanternNight} />
      ))}
      <rect className="room-tint" width={W} height={H} fill={tone === 'evening' ? '#3a2340' : tone === 'morning' ? '#fff3d6' : 'transparent'} opacity={tone === 'evening' ? 0.18 : 0.12} style={{ mixBlendMode: 'multiply' }} />
    </svg>
  )
}
