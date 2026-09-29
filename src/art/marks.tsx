import type { MarkId } from '../game/types'
import { C, INK } from './palette'

const hair = { stroke: INK, strokeWidth: 1.1, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const }

function star(rOut: number, rIn: number, n = 5): string {
  const pts: string[] = []
  for (let i = 0; i < n * 2; i++) {
    const r = i % 2 ? rIn : rOut
    const a = (Math.PI * i) / n - Math.PI / 2
    pts.push(`${(Math.cos(a) * r).toFixed(2)} ${(Math.sin(a) * r).toFixed(2)}`)
  }
  return `M${pts.join(' L')} Z`
}
const STAR = star(7.4, 3.2)

/** The little bits of evidence objects bring home. Drawn around (0,0), about 18 units across. */
export function MarkShape({ id }: { id: MarkId }) {
  switch (id) {
    case 'starSticker':
      return (
        <g>
          <path d={STAR} fill="#e4e8ee" {...hair} />
          <path d="M-2 -3 l2 -2" stroke="#fff" strokeWidth={1.2} strokeLinecap="round" />
        </g>
      )
    case 'saturnSticker':
      return (
        <g>
          <path d="M-8.5 2.5 A 9 2.6 -18 0 1 8.5 -2.5" stroke={C.brassDark} strokeWidth={1.8} fill="none" />
          <circle r={4.6} fill="#e8c07a" {...hair} />
          <path d="M-8.5 2.5 A 9 2.6 -18 0 0 8.5 -2.5" stroke={C.brassDark} strokeWidth={1.8} fill="none" />
        </g>
      )
    case 'moonSticker':
      return <path d="M2 -7 A7 7 0 1 0 5 5 A5.5 5.5 0 1 1 2 -7 Z" fill="#f1d36a" {...hair} />
    case 'noteSticker':
      return (
        <g>
          <circle r={6.4} fill={C.cream} {...hair} />
          <path d="M-1.5 3 V-4 L3.5 -5 V1.5" stroke={INK} strokeWidth={1.3} fill="none" />
          <circle cx={-2.6} cy={3} r={1.6} fill={INK} />
          <circle cx={2.4} cy={1.6} r={1.6} fill={INK} />
        </g>
      )
    case 'scratch':
      return (
        <g stroke="#fff8e6" strokeWidth={1.3} strokeLinecap="round" opacity={0.95}>
          <path d="M-6 -2 L5 2 M-5 1.5 L4 4.5 M-3 -4.5 L6 -1" />
          <path d="M-6 -1 L5 3" stroke={INK} strokeWidth={0.6} opacity={0.5} />
        </g>
      )
    case 'ribbon':
      return (
        <g>
          <path d="M0 0 C-4 -6 -10 -5 -9 0 C-10 5 -4 6 0 0 Z" fill="#c8463a" {...hair} />
          <path d="M0 0 C4 -6 10 -5 9 0 C10 5 4 6 0 0 Z" fill="#c8463a" {...hair} />
          <path d="M-1 1 L-4 9 M1 1 L4 9" stroke="#c8463a" strokeWidth={2.2} strokeLinecap="round" />
          <circle r={2} fill="#a8382c" {...hair} />
        </g>
      )
    case 'pressedFlower':
      return (
        <g>
          <path d="M0 3 Q1 7 -1 10" stroke="#6f8f45" strokeWidth={1.3} fill="none" />
          {[0, 72, 144, 216, 288].map((a) => (
            <ellipse key={a} cx={0} cy={-3.6} rx={2.6} ry={3.8} fill="#8d78b4" transform={`rotate(${a})`} stroke={INK} strokeWidth={0.6} />
          ))}
          <circle r={1.8} fill="#f1d36a" />
        </g>
      )
    case 'label':
      return (
        <g>
          <path d="M-9 -6 L4 -6 L9 0 L4 6 L-9 6 Z" fill={C.cream} {...hair} />
          <circle cx={4.6} cy={0} r={1.2} fill="none" {...hair} />
          <path d="M-7 -2 h8 M-7 1.5 h6" stroke={INK} strokeWidth={0.8} opacity={0.6} />
        </g>
      )
    case 'charm':
      return (
        <g>
          <path d="M0 -8 V-4" {...hair} />
          <path d="M-5 3 C-5 -4 5 -4 5 3 L6 4 L-6 4 Z" fill={C.brass} {...hair} />
          <circle cx={0} cy={5.5} r={1.6} fill={C.brassDark} />
        </g>
      )
    case 'patch':
      return (
        <g>
          <rect x={-8} y={-7} width={16} height={14} rx={2.5} fill="#e8b63a" {...hair} />
          <rect x={-6} y={-5} width={12} height={10} rx={1.5} fill="none" stroke={INK} strokeWidth={0.8} strokeDasharray="1.6 1.4" />
        </g>
      )
    case 'photo':
      return (
        <g>
          <rect x={-6.5} y={-8} width={13} height={15} rx={0.8} fill="#fffdf6" {...hair} />
          <rect x={-5} y={-6.5} width={10} height={9} fill="#7fb2ac" />
          <path d="M-5 2.5 L-1 -1 L2 1.5 L5 -2 V2.5 Z" fill="#6f8f45" />
        </g>
      )
    case 'jamStain':
      return <path d="M-5 -3 C-2 -8 5 -6 5 -1 C8 1 6 6 1 5 C-2 8 -7 5 -6 1 C-8 -1 -7 -2 -5 -3 Z" fill="#a52a35" opacity={0.78} />
    case 'grassStain':
      return <path d="M-8 2 C-6 -3 -1 -4 3 -3 C7 -3 9 0 7 3 C3 5 -3 5 -8 2 Z" fill="#5e8a3a" opacity={0.6} />
    case 'teaRing':
      return <path d="M5.5 -3 A6.5 6.5 0 1 0 6 2.6" stroke="#8a5a3b" strokeWidth={1.8} fill="none" opacity={0.65} strokeLinecap="round" />
    case 'mudSplash':
      return (
        <g fill="#5b3b27" opacity={0.8}>
          <circle cx={-3} cy={0} r={3.2} />
          <circle cx={3} cy={-3} r={1.6} />
          <circle cx={4.5} cy={2.5} r={1.3} />
          <circle cx={-7} cy={-3} r={1} />
          <circle cx={0} cy={5} r={1.1} />
        </g>
      )
    case 'paintDab':
      return (
        <g>
          <path d="M-8 1 C-5 -4 1 -4 6 -2 C8 0 6 4 1 3 C-3 5 -7 4 -8 1 Z" fill="#5b7fb5" opacity={0.9} />
          <circle cx={4} cy={4} r={2} fill="#e8b63a" opacity={0.9} />
        </g>
      )
    case 'dent':
      return (
        <g>
          <path d="M-7 2 Q0 -5 7 2" stroke={INK} strokeWidth={1.3} fill="none" opacity={0.7} />
          <path d="M-6 3.6 Q0 -2.6 6 3.6" stroke="#fff6dc" strokeWidth={1.3} fill="none" opacity={0.9} />
        </g>
      )
    case 'feather':
      return (
        <g transform="rotate(-30)">
          <path d="M0 -10 C6 -5 6 5 0 10 C-6 5 -6 -5 0 -10 Z" fill="#9aa8b8" {...hair} />
          <path d="M0 -9 L0 12" {...hair} />
          <path d="M0 -4 l3 -2 M0 0 l-3 -2 M0 4 l3 -2" stroke={INK} strokeWidth={0.6} opacity={0.6} />
        </g>
      )
    case 'button':
      return (
        <g>
          <circle r={5} fill="#c77d8f" {...hair} />
          <circle cx={-1.6} cy={-1.6} r={0.9} fill={INK} />
          <circle cx={1.6} cy={-1.6} r={0.9} fill={INK} />
          <circle cx={-1.6} cy={1.6} r={0.9} fill={INK} />
          <circle cx={1.6} cy={1.6} r={0.9} fill={INK} />
          <path d="M-1.6 -1.6 L1.6 1.6 M1.6 -1.6 L-1.6 1.6" stroke="#fbf5e6" strokeWidth={0.7} />
        </g>
      )
    case 'flourPrint':
      return (
        <g fill="#fffaf0" opacity={0.92} stroke="#d8cfbf" strokeWidth={0.5}>
          <ellipse cx={0} cy={2.5} rx={4} ry={3.4} />
          <circle cx={-4.2} cy={-2.4} r={1.6} />
          <circle cx={-1.4} cy={-4.6} r={1.6} />
          <circle cx={1.8} cy={-4.6} r={1.6} />
          <circle cx={4.4} cy={-2.2} r={1.6} />
        </g>
      )
    case 'clover':
      return (
        <g>
          <path d="M0 2 Q2 7 5 9" stroke="#4f7a3a" strokeWidth={1.2} fill="none" />
          {[0, 90, 180, 270].map((a) => (
            <path key={a} d="M0 0 C-4 -2 -4 -7 0 -5 C4 -7 4 -2 0 0 Z" fill="#6f9b45" transform={`rotate(${a})`} stroke={INK} strokeWidth={0.6} />
          ))}
        </g>
      )
    case 'doodle':
      return (
        <g stroke="#55504a" strokeWidth={1} fill="none" strokeLinecap="round">
          <circle r={5.5} />
          <circle cx={-2} cy={-1.4} r={0.5} fill="#55504a" />
          <circle cx={2} cy={-1.4} r={0.5} fill="#55504a" />
          <path d="M-2.6 1.6 Q0 3.8 2.6 1.6" />
          <path d="M5 -6 l2 -2 M6.4 -4 l2.6 -0.6" />
        </g>
      )
    case 'knot':
      return (
        <path
          d="M-8 3 C-4 3 -3 -4 1 -4 C5 -4 5 2 1 2 C-2 2 -1 -5 3 -6 C6 -6.5 8 -4 9 -2"
          stroke="#d9a441"
          strokeWidth={1.8}
          fill="none"
          strokeLinecap="round"
        />
      )
    case 'leaf':
      return (
        <g transform="rotate(20)">
          <path
            d="M0 -10 C3 -8 2 -6 4 -5 C7 -5 6 -2 4 -1 C7 0 7 3 4 3 C6 5 4 8 0 9 C-4 8 -6 5 -4 3 C-7 3 -7 0 -4 -1 C-6 -2 -7 -5 -4 -5 C-2 -6 -3 -8 0 -10 Z"
            fill="#a09a3a"
            {...hair}
          />
          <path d="M0 -8 L0 12" stroke="#6f6a26" strokeWidth={0.9} />
        </g>
      )
    case 'waxDrip':
      return <path d="M-6 -5 H6 C6 -1 3 -1 3 2 C3 6 -1 6 -1 2 C-1 0 -4 0 -4 -2 C-4 -3 -6 -3 -6 -5 Z" fill="#f6eed8" {...hair} />
  }
}

export function MarkIcon({ id, size = 24, className }: { id: MarkId; size?: number; className?: string }) {
  return (
    <svg className={`mark-icon ${className ?? ''}`} viewBox="-12 -12 24 24" width={size} height={size} aria-hidden="true">
      <MarkShape id={id} />
    </svg>
  )
}
