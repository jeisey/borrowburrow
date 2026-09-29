import { C, INK } from '../../art/palette'
import type { Weather } from '../../game/types'
import { WeatherFx, type Tone } from './WindowView'

const OUTSIDE: Record<Tone, string> = { morning: '#f3dcae', day: '#cfe3d6', evening: '#465078' }

/** The round-topped green door. It swings open when someone arrives. */
export function Door({ open, weather, tone }: { open: boolean; weather: Weather; tone: Tone }) {
  const arch = 'M10 600 L10 110 C10 50 60 10 125 10 C190 10 240 50 240 110 L240 600 Z'
  return (
    <svg className={`door ${open ? 'door--open' : ''}`} viewBox="0 0 250 600" aria-hidden="true">
      <defs>
        <clipPath id="door-clip">
          <path d={arch} />
        </clipPath>
      </defs>
      <g filter="url(#bb-wobble)">
        <path d="M0 600 L0 106 C0 42 56 0 125 0 C194 0 250 42 250 106 L250 600 Z" fill="#6b4630" stroke={INK} strokeWidth={4} />
      </g>
      <g clipPath="url(#door-clip)">
        <rect width={250} height={600} fill={OUTSIDE[tone]} />
        <path d="M0 470 C60 440 180 450 250 430 L250 600 L0 600 Z" fill={tone === 'evening' ? '#3e5147' : '#86a04f'} />
        <path d="M90 600 C100 540 130 500 125 470 L150 470 C150 510 170 550 190 600 Z" fill="#d9bf8c" opacity={0.9} />
        <circle cx={60} cy={120} r={tone === 'evening' ? 0 : 28} fill="#fbe7a0" opacity={weather === 'sunny' ? 0.9 : 0} />
        <WeatherFx weather={weather} w={250} h={600} />
        <g className="door-leaf">
          <path d={arch} fill="#2f6b4a" stroke={INK} strokeWidth={4} />
          <path d={arch} fill="url(#bb-hatch)" opacity={0.4} />
          {[60, 100, 140, 180].map((x) => (
            <path key={x} d={`M${x} ${x === 60 || x === 180 ? 40 : 18} L${x} 600`} stroke="#23523a" strokeWidth={4} />
          ))}
          <path d="M16 250 H234 M16 470 H234" stroke="#23523a" strokeWidth={6} />
          <rect x={20} y={240} width={210} height={20} fill={C.woodDark} stroke={INK} strokeWidth={2} opacity={0.35} />
          <path d="M90 90 C90 66 160 66 160 90 L160 150 L90 150 Z" fill={tone === 'evening' ? '#ffd48a' : '#cfe3e6'} stroke={INK} strokeWidth={3} />
          <path d="M125 70 V150 M90 110 H160" stroke={C.woodDark} strokeWidth={4} />
          <circle cx={200} cy={330} r={11} fill={C.brass} stroke={INK} strokeWidth={3} />
          <circle cx={197} cy={327} r={3} fill={C.brassLight} />
          <rect x={186} y={352} width={26} height={34} rx={4} fill={C.brassDark} stroke={INK} strokeWidth={2.4} />
          <rect x={196} y={362} width={6} height={14} rx={2} fill={INK} />
        </g>
      </g>
      <path d={arch} fill="none" stroke={INK} strokeWidth={4} />
    </svg>
  )
}

/** The little brass shop bell over the door. */
export function DoorBell({ ringing }: { ringing: boolean }) {
  return (
    <svg className={`door-bell ${ringing ? 'door-bell--ring' : ''}`} viewBox="0 0 60 70" aria-hidden="true">
      <path d="M4 8 H56" stroke={C.woodDark} strokeWidth={6} strokeLinecap="round" />
      <path d="M30 8 C30 16 30 16 30 20" stroke={INK} strokeWidth={2} />
      <g className="door-bell-body">
        <path d="M14 50 C14 28 20 20 30 20 C40 20 46 28 46 50 L50 54 L10 54 Z" fill={C.brass} stroke={INK} strokeWidth={3} />
        <path d="M22 30 C22 40 22 44 20 50" stroke={C.brassLight} strokeWidth={3} fill="none" strokeLinecap="round" />
        <circle cx={30} cy={59} r={4.5} fill={C.brassDark} stroke={INK} strokeWidth={2} />
      </g>
    </svg>
  )
}
