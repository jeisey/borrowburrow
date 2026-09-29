import type { ReactElement } from 'react'
import type { MarkInstance, ObjectId } from '../game/types'
import { MarkShape } from './marks'
import { C, HAIR, INK, OUTLINE, THIN } from './palette'

/** An outlined stroke: ink underneath, colour on top. */
function Rod({ d, w, color }: { d: string; w: number; color: string }) {
  return (
    <>
      <path d={d} stroke={INK} strokeWidth={w + 4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d={d} stroke={color} strokeWidth={w} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </>
  )
}

function Telescope() {
  return (
    <g>
      <Rod d="M58 74 L30 112" w={4} color={C.wood} />
      <Rod d="M58 74 L90 111" w={4} color={C.wood} />
      <Rod d="M58 74 L61 114" w={4} color={C.woodLight} />
      <path d="M42 96 L78 96" stroke={C.woodDark} strokeWidth={2.4} />
      <rect x={51} y={65} width={14} height={11} rx={2} fill={C.woodDark} {...THIN} />
      <g transform="rotate(-32 58 64)">
        <rect x={7} y={59.5} width={9} height={8} rx={1.5} fill="#3a3230" {...THIN} />
        <rect x={14} y={57.5} width={26} height={12} rx={2} fill={C.brassDark} {...OUTLINE} strokeWidth={2.4} />
        <rect x={38} y={55} width={34} height={17} rx={2} fill={C.brass} {...OUTLINE} strokeWidth={2.4} />
        <rect x={70} y={51.5} width={36} height={24} rx={3} fill={C.brass} {...OUTLINE} strokeWidth={2.4} />
        <rect x={68} y={50.5} width={5.5} height={26} rx={1.5} fill={C.brassDark} {...THIN} />
        <rect x={35.5} y={54} width={4.5} height={19} rx={1.2} fill={C.brassDark} {...THIN} />
        <path d="M42 59 L69 59 M75 56.5 L103 56.5" stroke={C.brassLight} strokeWidth={2.6} strokeLinecap="round" />
        <ellipse cx={106} cy={63.5} rx={4.2} ry={11.5} fill="#2f4050" {...THIN} />
        <path d="M105 57 q2 2 1.5 5" stroke="#cfe3ea" strokeWidth={1.4} fill="none" strokeLinecap="round" />
      </g>
    </g>
  )
}

function Blanket() {
  return (
    <g>
      <path d="M13 72 L107 69 L109 99 C80 104 40 104 13 101 Z" fill="url(#bb-gingham)" {...OUTLINE} />
      <path d="M13 93 L109 91 L109 99 C80 104 40 104 13 101 Z" fill="#7a2418" opacity={0.28} />
      <path d="M18 44 L102 40 C106 40 108 42 108 46 L106 72 L14 76 L16 48 C16 46 17 44 18 44 Z" fill="url(#bb-gingham)" {...OUTLINE} />
      <path d="M16 70 C40 74 80 72 106 67" stroke="#7a2418" strokeWidth={4} opacity={0.22} fill="none" />
      <path d="M22 76 l2 5 M34 76 l1 5 M46 76 l2 5 M58 75 l1 5 M70 75 l2 5 M82 74 l1 5 M94 73 l2 5" stroke={INK} strokeWidth={1.2} strokeLinecap="round" opacity={0.6} />
      <Rod d="M58 40 L60 102" w={6} color="#7a4b2c" />
      <rect x={53} y={64} width={13} height={11} rx={2} fill={C.brass} {...THIN} />
      <rect x={56.5} y={67} width={6} height={5} rx={1} fill="#7a4b2c" />
    </g>
  )
}

function Camera() {
  return (
    <g>
      <rect x={35} y={92} width={50} height={18} rx={1.5} fill="#fffdf6" {...OUTLINE} strokeWidth={2.4} transform="rotate(4 60 100)" />
      <rect x={40} y={95} width={40} height={10} fill="#7fb2ac" transform="rotate(4 60 100)" />
      <rect x={16} y={38} width={88} height={62} rx={11} fill="#4f8a8b" {...OUTLINE} />
      <path d="M16 60 L16 49 C16 43 21 38 27 38 L93 38 C99 38 104 43 104 49 L104 60 Z" fill="#efe4cf" {...OUTLINE} />
      <path d="M96 60 L104 60 L104 89 C104 95 99 100 93 100 L88 100 C96 88 97 72 96 60 Z" fill="#3f7475" />
      <rect x={22} y={44} width={19} height={10} rx={2} fill="#f6f0dc" {...THIN} />
      <path d="M26 46 v6 M30 46 v6 M34 46 v6 M38 46 v6" {...HAIR} opacity={0.4} />
      <rect x={80} y={44} width={15} height={10} rx={2.5} fill="#2f3a40" {...THIN} />
      <circle cx={85} cy={48} r={1.6} fill="#9ec4cc" />
      <circle cx={70} cy={36} r={4.5} fill={C.tomato} {...THIN} />
      <circle cx={60} cy={73} r={20} fill="#2f3a40" {...OUTLINE} />
      <circle cx={60} cy={73} r={13.5} fill="#1d2428" stroke="#5b6b72" strokeWidth={2} />
      <circle cx={60} cy={73} r={7} fill="#3d5a66" />
      <circle cx={55} cy={68} r={3} fill="#fff" opacity={0.7} />
      <circle cx={16} cy={66} r={3} fill={C.brass} {...HAIR} />
      <circle cx={104} cy={66} r={3} fill={C.brass} {...HAIR} />
    </g>
  )
}

function RecordPlayer({ sleeve }: { sleeve?: string }) {
  return (
    <g>
      <path d="M18 16 L102 16 C105 16 106 18 106 20 L104 58 L16 58 L14 20 C14 18 16 16 18 16 Z" fill="#9b4a3c" {...OUTLINE} />
      <path d="M22 22 L98 22 L96 54 L24 54 Z" fill="#e3cfa8" {...THIN} />
      <path d="M26 26 L94 26" stroke="#cdb487" strokeWidth={2} />
      {sleeve && (
        <g transform="rotate(-7 44 38)">
          <rect x={30} y={26} width={27} height={26} rx={1} fill={sleeve} {...THIN} />
          <circle cx={43.5} cy={39} r={7} fill="#1d1a1a" opacity={0.85} />
          <circle cx={43.5} cy={39} r={2.4} fill={C.cream} />
        </g>
      )}
      <path d="M18 56 L102 56 L110 76 L10 76 Z" fill="#c9b08a" {...OUTLINE} />
      <ellipse cx={56} cy={66} rx={31} ry={8.5} fill="#1d1a1a" {...THIN} />
      <ellipse cx={56} cy={66} rx={23} ry={6.2} fill="none" stroke="#3a3434" strokeWidth={1} />
      <ellipse cx={56} cy={66} rx={15} ry={4} fill="none" stroke="#3a3434" strokeWidth={1} />
      <ellipse cx={56} cy={66} rx={8.5} ry={2.6} fill={C.tomato} />
      <circle cx={56} cy={66} r={1} fill={C.cream} />
      <path d="M96 60 L80 67" stroke={INK} strokeWidth={4.2} strokeLinecap="round" />
      <path d="M96 60 L80 67" stroke="#d6d8dc" strokeWidth={2.2} strokeLinecap="round" />
      <circle cx={96} cy={60} r={3.4} fill="#d6d8dc" {...HAIR} />
      <path d="M10 76 L110 76 L108 104 L12 104 Z" fill="#9b4a3c" {...OUTLINE} />
      <path d="M16 82 L104 82 L103 99 L17 99 Z" fill="none" stroke="#f1e2c5" strokeWidth={1.2} strokeDasharray="3 2.4" />
      <rect x={52} y={86} width={16} height={6} rx={1.5} fill={C.brass} {...HAIR} />
      <path d="M22 88 h14 M22 92 h14 M84 88 h14 M84 92 h14" stroke="#6f2e24" strokeWidth={1.6} strokeLinecap="round" />
    </g>
  )
}

function CakeTin() {
  return (
    <g>
      <path d="M16 60 L16 93 C16 104 104 104 104 93 L104 60 Z" fill="#6d8fc0" {...OUTLINE} />
      <path d="M88 62 L104 60 L104 93 C104 98 98 101 90 102 C94 90 92 74 88 62 Z" fill="#577aac" />
      {[
        [32, 80],
        [58, 88],
        [82, 78],
      ].map(([x, y]) => (
        <g key={`${x}`} transform={`translate(${x} ${y})`}>
          {[0, 72, 144, 216, 288].map((a) => (
            <circle key={a} cx={0} cy={-3.2} r={2.4} fill="#fbf5e6" transform={`rotate(${a})`} />
          ))}
          <circle r={1.8} fill="#e8a93a" />
        </g>
      ))}
      <path d="M43 70 q2 3 6 3 M68 94 q3 -1 5 -4" stroke="#8fb06a" strokeWidth={1.6} fill="none" strokeLinecap="round" />
      <path d="M16 93 C16 104 104 104 104 93" stroke={C.brass} strokeWidth={3} fill="none" />
      <path d="M92 68 q4 6 0 13" stroke={INK} strokeWidth={1.4} fill="none" opacity={0.6} />
      <path d="M94 69 q4 6 0 12" stroke="#c6d7ef" strokeWidth={1.3} fill="none" />
      <ellipse cx={60} cy={60} rx={47} ry={13} fill="#7da0cf" {...OUTLINE} />
      <path d="M13 60 C13 68 107 68 107 60" stroke={C.brass} strokeWidth={3} fill="none" />
      <ellipse cx={60} cy={57} rx={10} ry={3.6} fill="none" stroke="#fbf5e6" strokeWidth={1.6} opacity={0.8} />
      <ellipse cx={60} cy={52} rx={8} ry={4} fill={C.brass} {...THIN} />
      <path d="M36 56 q6 -4 12 -1 M72 56 q6 -4 12 0" stroke="#fbf5e6" strokeWidth={1.5} fill="none" opacity={0.7} />
    </g>
  )
}

function Kite() {
  return (
    <g>
      <path d="M60 96 C70 104 80 100 88 108 S104 113 113 105" stroke={INK} strokeWidth={1.4} fill="none" />
      {[
        [73, 103, C.tomato],
        [91, 109, C.saffron],
        [107, 108, C.tomato],
      ].map(([x, y, c]) => (
        <path key={`${x}`} d={`M${x} ${y} l-5 -4 l0 8 Z M${x} ${y} l5 -4 l0 8 Z`} fill={c as string} {...HAIR} />
      ))}
      <path d="M60 58 C44 76 32 92 24 102" stroke={INK} strokeWidth={1} fill="none" opacity={0.7} />
      <rect x={12} y={98} width={18} height={11} rx={2.5} fill={C.woodLight} {...THIN} />
      <path d="M15 103.5 h12" stroke={C.cream} strokeWidth={2.2} />
      <path d="M60 9 L24 48 L60 48 Z" fill="#d9622b" />
      <path d="M60 9 L96 48 L60 48 Z" fill="#f0b23e" />
      <path d="M24 48 L60 98 L60 48 Z" fill="#f0b23e" />
      <path d="M96 48 L60 98 L60 48 Z" fill="#d9622b" />
      <path d="M60 9 L96 48 L60 98 L24 48 Z" fill="none" {...OUTLINE} />
      <path d="M60 9 L60 98 M24 48 L96 48" stroke={C.woodDark} strokeWidth={2} />
      <path d="M60 9 L96 48 L60 98 L24 48 Z" fill="url(#bb-hatch)" opacity={0.5} />
    </g>
  )
}

function BoardGame() {
  return (
    <g>
      <path d="M12 84 L108 84 L106 100 L14 100 Z" fill="#4f6b30" {...OUTLINE} />
      <path d="M18 40 L102 40 L108 84 L12 84 Z" fill="#6f8f45" {...OUTLINE} />
      <path d="M24 46 L96 46 L100 78 L20 78 Z" fill="#efe4cf" {...THIN} />
      <text x={60} y={55} textAnchor="middle" fontSize={6.6} fontWeight={800} fill={C.brick} className="svg-display" textLength={64} lengthAdjust="spacingAndGlyphs">
        SNAILS &amp; LADDERS
      </text>
      <path d="M36 76 L44 58 M46 76 L54 58" stroke={C.wood} strokeWidth={2.2} strokeLinecap="round" />
      <path d="M38 71 h10 M40 66 h10 M42 61 h10" stroke={C.wood} strokeWidth={1.8} />
      <path d="M64 75 C66 70 86 70 92 75 Z" fill="#a3a98a" {...HAIR} />
      <circle cx={80} cy={66} r={7.5} fill="#d9a441" {...HAIR} />
      <path d="M80 66 m0 -4 a4 4 0 1 1 -4 4 a2.5 2.5 0 1 1 2.5 2.5" stroke={INK} strokeWidth={1} fill="none" />
      <path d="M66 72 L64 64 M68 72 L68 64" {...HAIR} />
      <g transform="rotate(14 98 96)">
        <rect x={90} y={88} width={15} height={15} rx={2.5} fill={C.cream} {...THIN} />
        <circle cx={94} cy={92} r={1.3} fill={INK} />
        <circle cx={97.5} cy={95.5} r={1.3} fill={INK} />
        <circle cx={101} cy={99} r={1.3} fill={INK} />
      </g>
      <path d="M16 104 C16 94 26 94 26 104 Z" fill={C.tomato} {...THIN} />
      <circle cx={21} cy={92} r={3.4} fill={C.tomato} {...THIN} />
    </g>
  )
}

function Thermos() {
  return (
    <g>
      <rect x={40} y={30} width={40} height={76} rx={8} fill="url(#bb-tartan)" {...OUTLINE} />
      <rect x={45} y={36} width={5} height={62} rx={2.5} fill="#fff" opacity={0.2} />
      <rect x={37} y={26} width={46} height={11} rx={3} fill="#c9ccd0" {...OUTLINE} strokeWidth={2.4} />
      <path d="M40 26 L44 11 L76 11 L80 26 Z" fill="#dcd8cf" {...OUTLINE} strokeWidth={2.4} />
      <rect x={42} y={7} width={36} height={6} rx={2} fill="#c9ccd0" {...THIN} />
      <path d="M48 16 v8" stroke="#fff" strokeWidth={2} strokeLinecap="round" opacity={0.7} />
      <rect x={37} y={100} width={46} height={9} rx={3} fill="#c9ccd0" {...OUTLINE} strokeWidth={2.4} />
    </g>
  )
}

function Lantern() {
  return (
    <g>
      <circle className="lantern-glow" cx={60} cy={64} r={38} fill="url(#bb-glow)" opacity={0.65} />
      <Rod d="M40 32 C40 8 80 8 80 32" w={2.5} color={C.brass} />
      <path d="M38 36 L82 36 L75 26 L45 26 Z" fill={C.brass} {...OUTLINE} strokeWidth={2.4} />
      <circle cx={60} cy={23} r={4} fill={C.brassDark} {...THIN} />
      <rect x={38} y={35} width={44} height={6} rx={1.5} fill={C.brassDark} {...THIN} />
      <path d="M42 41 C36 56 36 76 44 90 L76 90 C84 76 84 56 78 41 Z" fill="#fff3d0" fillOpacity={0.88} {...OUTLINE} strokeWidth={2.4} />
      <path className="lantern-flame" d="M60 51 C52 63 54 75 60 79 C66 75 68 63 60 51 Z" fill="#f2a33a" />
      <path d="M60 61 C56 67 57 73 60 75 C63 73 64 67 60 61 Z" fill="#ffe08a" />
      <path d="M50 41 L48 90 M60 41 L60 90 M70 41 L72 90" stroke={C.brassDark} strokeWidth={1.5} opacity={0.7} />
      <path d="M38 90 L82 90 L87 105 L33 105 Z" fill={C.brass} {...OUTLINE} strokeWidth={2.4} />
      <path d="M36 97 L84 97" stroke={C.brassDark} strokeWidth={2} />
    </g>
  )
}

function Umbrella() {
  return (
    <g>
      <Rod d="M40 26 C28 18 20 30 28 38" w={3.5} color={C.wood} />
      <Rod d="M40 26 L46 32" w={3} color="#6b6b6b" />
      <path d="M44 28 C54 30 64 38 67 50 L97 104 L91 107 L53 58 C45 50 41 38 44 28 Z" fill="#2f6b4a" {...OUTLINE} />
      <path d="M52 34 C60 44 72 64 94 104 M48 42 C56 54 70 72 92 105" stroke="#23523a" strokeWidth={1.6} fill="none" />
      <path d="M58 60 L72 52 L76 58 L62 67 Z" fill="#245a3c" {...THIN} />
      <circle cx={69} cy={58} r={2} fill={C.brass} {...HAIR} />
      <path d="M94 105 L99 112" stroke={INK} strokeWidth={3} strokeLinecap="round" />
    </g>
  )
}

/** The umbrella open, for scenes where someone is standing under it. */
export function UmbrellaOpen() {
  return (
    <g>
      <Rod d="M60 22 L60 108 C60 116 50 116 50 110" w={3} color={C.wood} />
      <path
        d="M6 54 C14 16 106 16 114 54 C104 47 94 47 87 54 C79 47 68 47 60 54 C52 47 41 47 33 54 C26 47 15 47 6 54 Z"
        fill="#2f6b4a"
        {...OUTLINE}
      />
      <path d="M60 20 L33 54 M60 20 L60 54 M60 20 L87 54" stroke="#23523a" strokeWidth={1.8} />
      <circle cx={60} cy={19} r={3} fill={C.woodDark} {...HAIR} />
    </g>
  )
}

function Paints() {
  const pans = ['#d0553a', '#e8a93a', '#f2d06b', '#7f9d4f', '#4f8a8b', '#5b7fb5', '#8d78b4', '#b5523b', '#8a5a3b', '#2b211c', '#e89a8a', '#fbf5e6']
  return (
    <g>
      <g transform="rotate(7 62 54)">
        <rect x={30} y={22} width={66} height={58} rx={3} fill={C.cream} {...OUTLINE} />
        <rect x={26} y={22} width={7} height={58} rx={2} fill={C.woodDark} {...THIN} />
        <path d="M38 62 C48 50 58 56 66 50 C74 44 82 50 90 46 L90 74 L38 74 Z" fill="#8fb06a" opacity={0.85} />
        <path d="M38 30 L90 30 L90 48 C80 44 60 48 38 52 Z" fill="#a9d2d8" opacity={0.8} />
        <circle cx={80} cy={36} r={4.5} fill="#f2d06b" opacity={0.9} />
      </g>
      <rect x={10} y={74} width={80} height={27} rx={4} fill="#2b2b30" {...OUTLINE} />
      {pans.map((c, i) => (
        <rect key={c} x={15 + (i % 6) * 12.2} y={78 + Math.floor(i / 6) * 10.5} width={9.5} height={8} rx={1.6} fill={c} stroke="#111" strokeWidth={0.8} />
      ))}
      <Rod d="M86 98 L110 62" w={2.6} color={C.woodLight} />
      <path d="M108 65 L113 57" stroke="#c9ccd0" strokeWidth={4} />
      <path d="M112 58 L115 53" stroke="#5b7fb5" strokeWidth={3.4} strokeLinecap="round" />
    </g>
  )
}

function GardenKit() {
  return (
    <g>
      <Rod d="M22 62 C30 22 90 22 98 62" w={4} color={C.woodLight} />
      <g transform="rotate(-12 44 50)">
        <rect x={34} y={38} width={20} height={26} rx={1.5} fill="#f2d06b" {...THIN} />
        <circle cx={44} cy={48} r={5} fill={C.tomato} />
        <circle cx={44} cy={48} r={2} fill={C.woodDark} />
      </g>
      <g transform="rotate(10 64 48)">
        <rect x={56} y={36} width={18} height={24} rx={1.5} fill="#a9d2d8" {...THIN} />
        <path d="M65 54 v-8 M65 46 c-3 -1 -4 -4 -2 -6 M65 46 c3 -1 4 -4 2 -6" stroke="#4f7a3a" strokeWidth={1.6} fill="none" />
      </g>
      <Rod d="M82 60 L96 30" w={3.2} color={C.wood} />
      <path d="M93 34 L101 18 L104 30 Z" fill="#b8bcc2" {...THIN} />
      <path d="M10 60 L110 60 C104 86 88 100 60 100 C32 100 16 86 10 60 Z" fill={C.wood} {...OUTLINE} />
      <path d="M14 70 C30 78 90 78 106 70 M20 82 C36 90 84 90 100 82" stroke={C.woodDark} strokeWidth={1.6} fill="none" />
      <path d="M8 58 L112 58 L110 64 L10 64 Z" fill={C.woodLight} {...THIN} />
      <path d="M16 58 C12 70 20 78 26 74 C28 68 24 62 24 58 Z" fill="#7f9d4f" {...THIN} />
      <circle cx={92} cy={86} r={7} fill="#d9c08a" {...THIN} />
      <path d="M86 84 q6 4 12 0 M86 88 q6 3 12 -1" stroke={C.wood} strokeWidth={1} fill="none" />
    </g>
  )
}

function Toolbox() {
  return (
    <g>
      <Rod d="M30 50 L20 14" w={4} color={C.woodLight} />
      <rect x={10} y={6} width={22} height={10} rx={2} fill="#6b6b6b" {...THIN} transform="rotate(-18 21 11)" />
      <Rod d="M84 50 L98 20" w={3.2} color="#b8bcc2" />
      <path d="M95 22 C92 14 102 10 106 16 L101 20 Z" fill="#b8bcc2" {...THIN} />
      <Rod d="M42 46 C42 32 78 32 78 46" w={4} color="#c9ccd0" />
      <path d="M12 58 L108 58 L104 106 L16 106 Z" fill="#b8433a" {...OUTLINE} />
      <path d="M94 60 L108 58 L104 106 L96 106 C100 90 98 72 94 60 Z" fill="#9c362f" />
      <rect x={9} y={48} width={102} height={15} rx={3} fill="#c9543a" {...OUTLINE} />
      <rect x={30} y={58} width={10} height={9} rx={1.5} fill={C.brass} {...THIN} />
      <rect x={80} y={58} width={10} height={9} rx={1.5} fill={C.brass} {...THIN} />
      <circle cx={20} cy={96} r={1.6} fill="#e9c2b9" />
      <circle cx={100} cy={96} r={1.6} fill="#e9c2b9" />
      <path d="M26 80 h60" stroke="#8e312a" strokeWidth={2} strokeLinecap="round" />
    </g>
  )
}

function BirdGuide() {
  return (
    <g>
      <path d="M92 12 L99 16 L104 104 L97 102 Z" fill={C.cream} {...THIN} />
      <path d="M95 22 L100 96 M97 20 L102 98" {...HAIR} opacity={0.4} />
      <path d="M26 18 L20 22 L26 110 L32 108 Z" fill="#355a44" {...THIN} />
      <path d="M26 18 L92 12 L97 102 L32 108 Z" fill="#4c7a5c" {...OUTLINE} />
      <path d="M36 28 L84 24 L85 35 L37 39 Z" fill={C.mustard} opacity={0.92} />
      <path d="M42 32 h18 M44 35.5 h26" stroke="#7a5a1c" strokeWidth={1.2} strokeLinecap="round" />
      <g transform="translate(64 68)" fill={C.mustard} stroke="#7a5a1c" strokeWidth={0.8}>
        <ellipse cx={0} cy={0} rx={12} ry={8.5} />
        <circle cx={10} cy={-8} r={6} />
        <path d="M15 -9 L22 -7 L15 -6 Z" />
        <path d="M-10 -2 L-22 -8 L-18 2 Z" />
        <path d="M-2 8 L-4 16 M3 8 L3 16" strokeWidth={1.4} />
        <circle cx={11.5} cy={-9} r={1.1} fill="#3a2a10" />
      </g>
      <path d="M70 104 L72 117 L76 111 L80 116 L78 103" fill="#c8463a" {...THIN} />
    </g>
  )
}

function Binoculars() {
  return (
    <g>
      <path d="M22 44 C6 70 18 100 60 104 C102 100 114 70 98 44" stroke={INK} strokeWidth={5.5} fill="none" />
      <path d="M22 44 C6 70 18 100 60 104 C102 100 114 70 98 44" stroke="#7a4b2c" strokeWidth={3} fill="none" />
      <rect x={48} y={44} width={24} height={16} rx={3} fill="#2a2624" {...THIN} />
      <rect x={53} y={36} width={14} height={9} rx={3.5} fill={C.brass} {...THIN} />
      <path d="M55 38 v5 M58.5 38 v5 M62 38 v5 M65 38 v5" stroke={C.brassDark} strokeWidth={1} />
      <rect x={14} y={32} width={40} height={48} rx={12} fill="#3a3632" {...OUTLINE} />
      <rect x={66} y={32} width={40} height={48} rx={12} fill="#3a3632" {...OUTLINE} />
      <circle cx={34} cy={72} r={17} fill="#2f4050" stroke={C.brass} strokeWidth={4.5} />
      <circle cx={86} cy={72} r={17} fill="#2f4050" stroke={C.brass} strokeWidth={4.5} />
      <circle cx={34} cy={72} r={17} fill="none" stroke={INK} strokeWidth={1.6} transform="scale(1)" />
      <circle cx={86} cy={72} r={19.4} fill="none" stroke={INK} strokeWidth={1.6} />
      <circle cx={34} cy={72} r={19.4} fill="none" stroke={INK} strokeWidth={1.6} />
      <path d="M26 66 q4 -5 9 -5 M78 66 q4 -5 9 -5" stroke="#cfe3ea" strokeWidth={2} fill="none" strokeLinecap="round" />
    </g>
  )
}

function Album({ photos = 3 }: { photos?: number }) {
  const shown = Math.min(photos, 4)
  return (
    <g>
      {Array.from({ length: shown }, (_, i) => (
        <g key={i} transform={`rotate(${-14 + i * 11} ${40 + i * 14} 30)`}>
          <rect x={30 + i * 14} y={16} width={16} height={19} fill="#fffdf6" {...THIN} />
          <rect x={32 + i * 14} y={18} width={12} height={11} fill={['#7fb2ac', '#e8a93a', '#8fb06a', '#a9d2d8'][i]} />
        </g>
      ))}
      <rect x={21} y={30} width={82} height={72} rx={3} fill={C.cream} {...OUTLINE} />
      <path d="M100 34 v64 M97 34 v64" {...HAIR} opacity={0.4} />
      <rect x={16} y={26} width={82} height={72} rx={4} fill="#7a4b2c" {...OUTLINE} />
      <rect x={22} y={32} width={70} height={60} rx={3} fill="none" stroke="#c9a06a" strokeWidth={1.4} />
      <path d="M16 38 L16 30 C16 28 18 26 20 26 L28 26 Z M98 38 L98 30 C98 28 96 26 94 26 L86 26 Z M16 86 L16 94 C16 96 18 98 20 98 L28 98 Z M98 86 L98 94 C98 96 96 98 94 98 L86 98 Z" fill={C.brass} {...HAIR} />
      <rect x={38} y={48} width={38} height={18} rx={2} fill={C.cream} {...THIN} />
      <path d="M44 54 h26 M47 60 h20" stroke={INK} strokeWidth={1.2} opacity={0.5} />
    </g>
  )
}

function SewingBasket() {
  return (
    <g>
      <path d="M20 60 C26 30 94 30 100 60" fill="url(#bb-wicker)" {...OUTLINE} />
      <g>
        <rect x={28} y={42} width={12} height={17} rx={2} fill={C.tomato} {...THIN} />
        <rect x={26} y={40} width={16} height={4} rx={1.5} fill={C.woodLight} {...HAIR} />
        <rect x={26} y={57} width={16} height={4} rx={1.5} fill={C.woodLight} {...HAIR} />
        <rect x={44} y={46} width={11} height={14} rx={2} fill="#5b7fb5" {...THIN} />
        <rect x={42} y={44} width={15} height={4} rx={1.5} fill={C.woodLight} {...HAIR} />
      </g>
      <g>
        <path d="M68 60 C68 44 94 44 94 60 Z" fill="#8a5a3b" {...THIN} />
        {[72, 77, 82, 87, 91].map((x, i) => (
          <g key={x}>
            <path d={`M${x} ${52 - (i % 2) * 3} l${-1 + i * 0.5} -7`} stroke="#9aa0a6" strokeWidth={1} />
            <circle cx={x - 1 + i * 0.5} cy={45 - (i % 2) * 3} r={1.6} fill={[C.tomato, C.saffron, '#5b7fb5', '#c77d8f', '#7f9d4f'][i]} />
          </g>
        ))}
        <circle cx={93} cy={56} r={1} fill={INK} />
      </g>
      <path d="M14 64 L106 64 L98 104 C80 110 40 110 22 104 Z" fill="url(#bb-wicker)" {...OUTLINE} />
      <rect x={10} y={58} width={100} height={10} rx={4} fill="#a8804a" {...OUTLINE} strokeWidth={2.4} />
      <path d="M60 68 C54 78 58 88 70 92" stroke={C.tomato} strokeWidth={1.4} fill="none" />
    </g>
  )
}

function FlowerPress() {
  return (
    <g>
      <path d="M14 82 L96 82 L108 72 L26 72 Z" fill={C.woodLight} {...THIN} />
      <path d="M14 82 L96 82 L96 96 L14 96 Z" fill={C.wood} {...OUTLINE} />
      <path d="M96 82 L108 72 L108 86 L96 96 Z" fill={C.woodDark} {...THIN} />
      {[64, 68, 72, 76].map((y, i) => (
        <path key={y} d={`M16 ${y} L96 ${y} L106 ${y - 8} L28 ${y - 8} Z`} fill={i % 2 ? '#efe2c4' : C.cream} stroke={INK} strokeWidth={0.9} />
      ))}
      <g transform="translate(100 64) rotate(-20)">
        <path d="M0 0 L10 -4" stroke="#6f8f45" strokeWidth={1.4} />
        {[0, 72, 144, 216, 288].map((a) => (
          <ellipse key={a} cx={12} cy={-8} rx={2} ry={3.2} fill="#8d78b4" transform={`rotate(${a} 12 -5)`} />
        ))}
      </g>
      <path d="M14 54 L96 54 L108 44 L26 44 Z" fill={C.woodLight} {...OUTLINE} />
      <path d="M14 54 L96 54 L96 64 L14 64 Z" fill={C.wood} {...OUTLINE} />
      <path d="M96 54 L108 44 L108 54 L96 64 Z" fill={C.woodDark} {...THIN} />
      <path d="M52 49 c-3 -3 -1 -6 2 -4 c1 -4 5 -3 4 0 c3 -1 4 3 1 4 c2 3 -2 5 -3 2 c-2 3 -6 1 -4 -2 Z" fill={C.rose} opacity={0.8} />
      {[
        [20, 50],
        [90, 50],
        [32, 40],
        [102, 40],
      ].map(([x, y]) => (
        <g key={`${x}`}>
          <path d={`M${x} ${y} L${x} ${y + 44}`} stroke="#8d9096" strokeWidth={1.4} />
          <path d={`M${x - 6} ${y - 3} L${x} ${y} L${x + 6} ${y - 3} L${x + 4} ${y + 2} L${x - 4} ${y + 2} Z`} fill="#b8bcc2" {...HAIR} />
        </g>
      ))}
    </g>
  )
}

function StarChart() {
  const stars = [
    [30, 42],
    [42, 50],
    [52, 44],
    [64, 56],
    [76, 48],
    [40, 68],
    [58, 72],
    [84, 66],
    [92, 54],
    [26, 58],
  ]
  return (
    <g>
      <rect x={18} y={30} width={84} height={56} fill="#34466b" {...OUTLINE} />
      <path d="M30 42 L42 50 L52 44 L64 56 L76 48 M40 68 L58 72 L84 66" stroke={C.star} strokeWidth={0.9} opacity={0.6} fill="none" />
      {stars.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 2 : 1.3} fill={C.star} />
      ))}
      <path d="M88 36 A6 6 0 1 0 92 46 A4.6 4.6 0 1 1 88 36 Z" fill="#f1d36a" />
      <rect x={13} y={22} width={94} height={13} rx={6.5} fill="#2b3a5a" {...OUTLINE} />
      <rect x={13} y={81} width={94} height={15} rx={7.5} fill="#2b3a5a" {...OUTLINE} />
      <path d="M20 26 h80 M20 86 h80" stroke="#46598a" strokeWidth={1.6} />
      <path d="M60 96 C54 104 50 108 46 112 M60 96 C66 104 70 108 74 112" stroke="#c8463a" strokeWidth={2.2} fill="none" strokeLinecap="round" />
      <path d="M54 92 C50 86 58 86 60 92 C62 86 70 86 66 92 C62 96 58 96 54 92 Z" fill="#c8463a" {...HAIR} />
    </g>
  )
}

interface DrawOpts {
  sleeve?: string
  photos?: number
}

const DRAW: Record<ObjectId, (o: DrawOpts) => ReactElement> = {
  telescope: () => <Telescope />,
  blanket: () => <Blanket />,
  camera: () => <Camera />,
  recordPlayer: (o) => <RecordPlayer sleeve={o.sleeve} />,
  cakeTin: () => <CakeTin />,
  kite: () => <Kite />,
  boardGame: () => <BoardGame />,
  thermos: () => <Thermos />,
  lantern: () => <Lantern />,
  umbrella: () => <Umbrella />,
  paints: () => <Paints />,
  gardenKit: () => <GardenKit />,
  toolbox: () => <Toolbox />,
  birdGuide: () => <BirdGuide />,
  binoculars: () => <Binoculars />,
  album: (o) => <Album photos={o.photos} />,
  sewingBasket: () => <SewingBasket />,
  flowerPress: () => <FlowerPress />,
  starChart: () => <StarChart />,
}

/** Where marks settle on each object: [x, y, rotation]. */
const ANCHORS: Record<ObjectId, [number, number, number][]> = {
  telescope: [
    [50, 69, -32],
    [82, 49, -32],
    [66, 59, -32],
    [36, 102, 10],
    [85, 104, -8],
    [96, 43, -32],
  ],
  blanket: [
    [30, 56, -8],
    [88, 54, 10],
    [32, 90, 4],
    [90, 88, -6],
    [44, 64, 0],
    [76, 92, 8],
  ],
  camera: [
    [26, 86, -6],
    [94, 84, 8],
    [30, 64, 0],
    [92, 70, -4],
    [50, 42, 0],
    [100, 50, 10],
  ],
  recordPlayer: [
    [80, 36, 8],
    [28, 92, -6],
    [94, 92, 6],
    [72, 26, -4],
    [20, 40, 0],
    [60, 98, 0],
  ],
  cakeTin: [
    [38, 56, -6],
    [84, 58, 8],
    [26, 80, -4],
    [96, 86, 6],
    [46, 94, 0],
    [72, 76, 0],
  ],
  kite: [
    [44, 34, -10],
    [76, 34, 10],
    [44, 62, 6],
    [76, 62, -6],
    [60, 26, 0],
    [60, 78, 0],
  ],
  boardGame: [
    [22, 50, -8],
    [98, 50, 8],
    [22, 90, 0],
    [98, 92, 0],
    [60, 92, 0],
    [60, 44, 0],
  ],
  thermos: [
    [52, 50, -6],
    [68, 66, 6],
    [52, 84, 0],
    [68, 92, -4],
    [60, 18, 0],
    [60, 38, 0],
  ],
  lantern: [
    [44, 98, -6],
    [76, 98, 6],
    [48, 30, -4],
    [72, 30, 4],
    [60, 98, 0],
    [42, 64, 0],
  ],
  umbrella: [
    [56, 44, -30],
    [72, 66, -30],
    [84, 84, -30],
    [30, 30, 0],
    [66, 78, -30],
    [90, 96, -30],
  ],
  paints: [
    [40, 32, 6],
    [86, 44, 6],
    [20, 92, 0],
    [72, 96, 0],
    [58, 30, 6],
    [44, 88, 0],
  ],
  gardenKit: [
    [30, 78, -6],
    [60, 90, 0],
    [90, 76, 8],
    [44, 70, 0],
    [74, 70, 0],
    [16, 70, 0],
  ],
  toolbox: [
    [26, 80, -6],
    [60, 90, 0],
    [92, 78, 6],
    [48, 56, 0],
    [70, 98, 0],
    [16, 56, 0],
  ],
  birdGuide: [
    [42, 50, -6],
    [80, 48, -6],
    [46, 92, -6],
    [84, 88, -6],
    [62, 102, 0],
    [28, 60, 0],
  ],
  binoculars: [
    [26, 46, -6],
    [94, 46, 6],
    [34, 90, 0],
    [86, 90, 0],
    [60, 52, 0],
    [60, 100, 0],
  ],
  album: [
    [26, 40, -6],
    [88, 40, 6],
    [28, 86, -4],
    [88, 86, 4],
    [58, 80, 0],
    [58, 36, 0],
  ],
  sewingBasket: [
    [26, 84, -6],
    [60, 94, 0],
    [94, 84, 6],
    [42, 74, 0],
    [78, 76, 0],
    [60, 40, 0],
  ],
  flowerPress: [
    [40, 50, 0],
    [74, 50, 0],
    [28, 90, 0],
    [80, 90, 0],
    [56, 60, 0],
    [60, 76, 0],
  ],
  starChart: [
    [28, 40, -6],
    [92, 72, 6],
    [42, 78, 0],
    [74, 38, 0],
    [24, 90, 0],
    [96, 28, 0],
  ],
}

const SLEEVES = ['#d9a441', '#5b7fb5', '#c8463a', '#6f8f45', '#8d78b4', '#e89a8a']

interface ObjectArtProps {
  id: ObjectId
  marks?: MarkInstance[]
  /** Marks from this day get a fresh little glint. */
  freshDay?: number
  className?: string
  title?: string
  /** For the record player: which resident's record is in the lid (colour index). */
  sleeveIndex?: number
  photos?: number
  bare?: boolean
}

/** A lendable thing, with every mark it has collected on its travels. */
export function ObjectArt({ id, marks = [], freshDay, className, title, sleeveIndex, photos, bare }: ObjectArtProps) {
  const anchors = ANCHORS[id]
  const Draw = DRAW[id]
  return (
    <svg
      className={`obj obj--${id} ${className ?? ''}`}
      viewBox="0 0 120 120"
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <g filter={bare ? undefined : 'url(#bb-wobble)'}>
        <Draw sleeve={sleeveIndex !== undefined ? SLEEVES[sleeveIndex % SLEEVES.length] : undefined} photos={photos} />
      </g>
      <g className="obj-marks">
        {marks.map((m, i) => {
          const [x, y, r] = anchors[i % anchors.length]
          const lap = Math.floor(i / anchors.length)
          const fresh = freshDay !== undefined && m.day === freshDay
          return (
            <g
              key={`${m.id}-${i}`}
              className={fresh ? 'mark mark--fresh' : 'mark'}
              transform={`translate(${x + lap * 7} ${y + lap * 5}) rotate(${r + ((i * 37) % 17) - 8}) scale(1.08)`}
            >
              <MarkShape id={m.id} />
            </g>
          )
        })}
      </g>
    </svg>
  )
}

/** Just the drawing (for embedding inside a larger scene). */
export function ObjectFigure({ id, photos }: { id: ObjectId; photos?: number }) {
  const Draw = DRAW[id]
  return <Draw photos={photos} />
}
