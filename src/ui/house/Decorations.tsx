import { C, INK } from '../../art/palette'
import { hasFlag, photos } from '../../game/query'
import type { GameState } from '../../game/types'
import type { Orient } from '../Stage'

/** Little things the village leaves in the Borrowburrow as the week goes on. */
export function Decorations({ state, orient }: { state: GameState; orient: Orient }) {
  const wide = orient === 'wide'
  const W = wide ? 1600 : 900
  const H = wide ? 900 : 1600
  const beam = wide ? 108 : 100
  const pics = photos(state).slice(-6)
  const showBunting = state.day >= 6
  const lanterns = state.day >= 7
  const colours = [C.tomato, C.saffron, '#5b7fb5', '#6f8f45', '#c77d8f']
  return (
    <svg className="decor" viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
      {showBunting && (
        <g>
          <path d={`M${wide ? 50 : 30} ${beam + 4} Q${W / 2} ${beam + 40} ${W - (wide ? 50 : 30)} ${beam + 4}`} stroke={INK} strokeWidth={2} fill="none" />
          {Array.from({ length: wide ? 30 : 16 }, (_, i) => {
            const t = (i + 0.5) / (wide ? 30 : 16)
            const x = (wide ? 50 : 30) + t * (W - (wide ? 100 : 60))
            const y = beam + 4 + Math.sin(Math.PI * t) * 34
            return <path key={i} d={`M${x - 14} ${y} L${x + 14} ${y} L${x} ${y + 26} Z`} fill={colours[i % colours.length]} stroke={INK} strokeWidth={1.6} />
          })}
        </g>
      )}
      {lanterns &&
        (wide ? [200, 440, 930, 1450] : [120, 380, 620]).map((x, i) => (
          <g key={x} className="paper-lantern" style={{ animationDelay: `${-i * 0.7}s` }}>
            <path d={`M${x} ${beam} V${beam + 40}`} stroke={INK} strokeWidth={1.6} />
            <circle cx={x} cy={beam + 64} r={46} fill="url(#bb-glow)" opacity={0.7} />
            <ellipse cx={x} cy={beam + 64} rx={20} ry={24} fill={i % 2 ? '#f0b23e' : '#d9622b'} stroke={INK} strokeWidth={2} />
            <path d={`M${x - 20} ${beam + 64} H${x + 20} M${x - 17} ${beam + 52} H${x + 17} M${x - 17} ${beam + 76} H${x + 17}`} stroke={INK} strokeWidth={1} opacity={0.5} />
            <rect x={x - 8} y={beam + 38} width={16} height={5} fill={INK} />
          </g>
        ))}
      {pics.length >= 3 && (
        <g>
          <path d={`M${wide ? 70 : 60} ${beam + 2} Q${wide ? 380 : 450} ${beam + 36} ${wide ? 690 : 840} ${beam + 2}`} stroke={INK} strokeWidth={1.6} fill="none" />
          {pics.map((p, i) => {
            const t = (i + 0.5) / pics.length
            const x0 = wide ? 70 : 60
            const x1 = wide ? 690 : 840
            const x = x0 + t * (x1 - x0)
            const y = beam + 2 + Math.sin(Math.PI * t) * 34 - 4
            const hue = ['#7fb2ac', '#e8a93a', '#8fb06a', '#a9d2d8', '#e89a8a', '#8d78b4'][i % 6]
            return (
              <g key={`${p.day}-${i}`} transform={`rotate(${(i % 2 ? 6 : -5)} ${x} ${y})`}>
                <rect x={x - 17} y={y} width={34} height={40} fill="#fffdf6" stroke={INK} strokeWidth={1.6} />
                <rect x={x - 13} y={y + 4} width={26} height={24} fill={hue} />
                <path d={`M${x - 13} ${y + 28} L${x - 4} ${y + 18} L${x + 3} ${y + 24} L${x + 13} ${y + 14} V${y + 28} Z`} fill="#6f8f45" opacity={0.8} />
                <rect x={x - 3} y={y - 6} width={6} height={10} fill={C.woodLight} stroke={INK} strokeWidth={1} />
              </g>
            )
          })}
        </g>
      )}
      {hasFlag(state, 'club') && (
        <g transform={wide ? 'translate(1262 108)' : 'translate(690 100)'}>
          <path d="M0 0 V26" stroke={INK} strokeWidth={1.6} />
          <path d="M-4 26 L44 26 L20 92 Z" fill={C.navy} stroke={INK} strokeWidth={2} />
          <path d="M20 40 l3 7 7 1 -5 5 1 7 -6 -3 -6 3 1 -7 -5 -5 7 -1 Z" fill={C.star} />
          <text x={20} y={70} textAnchor="middle" fontSize={9} fill={C.star} className="svg-display" fontWeight={700}>
            M.A.C.
          </text>
        </g>
      )}
      {hasFlag(state, 'housewarming') && (
        <g transform={wide ? 'translate(1206 330) rotate(3)' : 'translate(30 300) rotate(-3)'}>
          <path d="M40 -30 L10 0 M40 -30 L70 0" stroke={INK} strokeWidth={1.4} />
          <rect x={0} y={0} width={80} height={62} fill={C.woodDark} stroke={INK} strokeWidth={2.4} />
          <rect x={6} y={6} width={68} height={50} fill="#efe2c0" />
          <path d="M12 44 C24 30 40 40 52 26 C58 20 66 22 70 16" stroke={C.brick} strokeWidth={1.6} strokeDasharray="3 2" fill="none" />
          <circle cx={22} cy={40} r={3} fill={C.grass} />
          <circle cx={46} cy={30} r={3} fill={C.water} />
          <path d="M60 18 l4 -6 4 6 Z" fill={C.moss} />
          <text x={40} y={16} textAnchor="middle" fontSize={7} className="svg-display" fill={INK}>
            MOSSWICK
          </text>
        </g>
      )}
    </svg>
  )
}

/** Things that sit on the counter: gifts from the village. */
export function CounterDecor({ state, orient }: { state: GameState; orient: Orient }) {
  const wide = orient === 'wide'
  return (
    <div className={`counter-decor counter-decor--${orient}`} aria-hidden="true">
      {hasFlag(state, 'glasshouse_open') && (
        <svg className="deco-fern" viewBox="0 0 100 120">
          <g filter="url(#bb-wobble)">
            {[-60, -35, -12, 12, 35, 60].map((a) => (
              <path key={a} d="M50 80 C46 50 50 30 50 8" stroke={C.grassDark} strokeWidth={5} fill="none" strokeLinecap="round" transform={`rotate(${a} 50 80)`} />
            ))}
            {[-60, -35, -12, 12, 35, 60].map((a) => (
              <path key={`l${a}`} d="M50 72 C42 56 44 36 50 14 C56 36 58 56 50 72 Z" fill={C.grass} transform={`rotate(${a} 50 80)`} opacity={0.9} />
            ))}
            <path d="M28 78 L72 78 L66 116 L34 116 Z" fill={C.brick} stroke={INK} strokeWidth={3} />
            <rect x={24} y={74} width={52} height={10} rx={2} fill="#c9643f" stroke={INK} strokeWidth={2.4} />
          </g>
        </svg>
      )}
      {hasFlag(state, 'four_oclock') && (
        <svg className="deco-biscuits" viewBox="0 0 100 80">
          <g filter="url(#bb-wobble)">
            <rect x={10} y={28} width={80} height={46} rx={6} fill="#c8463a" stroke={INK} strokeWidth={3} />
            <rect x={6} y={20} width={88} height={14} rx={5} fill="#d9622b" stroke={INK} strokeWidth={3} />
            <text x={50} y={58} textAnchor="middle" fontSize={11} fill={C.cream} className="svg-display" fontWeight={800}>
              4 o’clock
            </text>
            <circle cx={30} cy={16} r={9} fill="#e3b46a" stroke={INK} strokeWidth={2} />
          </g>
        </svg>
      )}
      {hasFlag(state, 'sunflowers_bloomed') && (
        <svg className="deco-sunflower" viewBox="0 0 100 160">
          <g filter="url(#bb-wobble)">
            <path d="M50 150 C50 110 54 80 50 50" stroke={C.grassDark} strokeWidth={5} fill="none" />
            <path d="M50 110 C34 100 30 92 34 88 C42 90 48 98 50 110 Z" fill={C.grass} stroke={INK} strokeWidth={2} />
            {Array.from({ length: 14 }, (_, i) => (
              <ellipse key={i} cx={50} cy={24} rx={6} ry={16} fill="#f0b23e" stroke={INK} strokeWidth={1.4} transform={`rotate(${i * 25.7} 50 44)`} />
            ))}
            <circle cx={50} cy={44} r={13} fill="#6b4630" stroke={INK} strokeWidth={2.4} />
            <path d="M28 118 L72 118 L68 156 L32 156 Z" fill="#cfe3e6" fillOpacity={0.75} stroke={INK} strokeWidth={3} />
            <rect x={26} y={112} width={48} height={9} rx={2} fill={C.brass} stroke={INK} strokeWidth={2} />
          </g>
        </svg>
      )}
      {!wide && null}
    </div>
  )
}
