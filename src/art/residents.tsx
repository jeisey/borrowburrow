import type { ReactElement } from 'react'
import type { ResidentId } from '../game/types'
import { C, HAIR, INK, OUTLINE, THIN } from './palette'
import { PORTRAIT_BOX } from './poses'

export type Mood = 'idle' | 'happy' | 'talk' | 'surprised'

interface EyeProps {
  cx: number
  cy: number
  r: number
  mood: Mood
  iris?: string
  goat?: boolean
}

/** Shared eye: blinks on its own, closes into a happy arc, widens in surprise. */
function Eye({ cx, cy, r, mood, iris, goat }: EyeProps) {
  if (mood === 'happy')
    return (
      <path
        d={`M${cx - r * 1.1} ${cy + r * 0.3} Q${cx} ${cy - r * 1.1} ${cx + r * 1.1} ${cy + r * 0.3}`}
        stroke={INK}
        strokeWidth={2.2}
        fill="none"
        strokeLinecap="round"
      />
    )
  const rr = mood === 'surprised' ? r * 1.22 : r
  return (
    <g className="ch-eye">
      {iris && <ellipse cx={cx} cy={cy} rx={rr} ry={rr * (goat ? 0.86 : 1)} fill={iris} stroke={INK} strokeWidth={1.3} />}
      {goat ? (
        <rect x={cx - rr * 0.72} y={cy - rr * 0.26} width={rr * 1.44} height={rr * 0.52} rx={rr * 0.2} fill={INK} />
      ) : (
        <circle cx={cx} cy={cy} r={iris ? rr * 0.52 : rr} fill={INK} />
      )}
      <circle cx={cx - rr * 0.3} cy={cy - rr * 0.36} r={Math.max(0.9, rr * 0.28)} fill="#fff" />
    </g>
  )
}

/** Draw a limb or neck as an outlined stroke: ink underneath, colour on top. */
function Limb({ d, w, color, cap = 'round' }: { d: string; w: number; color: string; cap?: 'round' | 'butt' }) {
  return (
    <>
      <path d={d} stroke={INK} strokeWidth={w + 5} fill="none" strokeLinecap={cap} strokeLinejoin="round" />
      <path d={d} stroke={color} strokeWidth={w} fill="none" strokeLinecap={cap} strokeLinejoin="round" />
    </>
  )
}

function Mouth({ d, mood, open }: { d: string; mood: Mood; open: [number, number] }) {
  if (mood === 'talk' || mood === 'surprised')
    return (
      <ellipse
        className={mood === 'talk' ? 'ch-mouth-talk' : undefined}
        cx={open[0]}
        cy={open[1]}
        rx={mood === 'surprised' ? 3.4 : 3}
        ry={mood === 'surprised' ? 4 : 2.6}
        fill="#6b2f2a"
        stroke={INK}
        strokeWidth={1.4}
      />
    )
  return <path d={d} stroke={INK} strokeWidth={2} fill="none" strokeLinecap="round" />
}

// ——————————————————————————————————————————————————— Odile, grey heron

function Odile({ mood }: { mood: Mood }) {
  return (
    <g className="ch ch-odile">
      <g className="ch-leg-l">
        <Limb d="M93 204 L90 246 L95 287" w={4.5} color="#c9a04f" />
        <path d="M95 287 L82 292 M95 287 L96 294 M95 287 L106 292" {...THIN} strokeWidth={2.6} />
      </g>
      <g className="ch-leg-r">
        <Limb d="M110 204 L114 246 L109 287" w={4.5} color="#c9a04f" />
        <path d="M109 287 L97 292 M109 287 L111 294 M109 287 L121 292" {...THIN} strokeWidth={2.6} />
      </g>
      <path d="M124 194 C136 208 142 224 134 236 C128 224 118 212 112 206 Z" fill="#4f5d70" {...OUTLINE} />
      <path
        d="M74 132 C72 108 116 100 132 124 C146 146 150 180 138 200 C128 214 104 216 88 206 C72 196 68 162 74 132 Z"
        fill="#8fa1b4"
        {...OUTLINE}
      />
      <path d="M118 114 C136 126 148 160 140 196 C132 208 118 212 108 210 C126 188 130 150 118 114 Z" fill="#7589a1" />
      <path d="M104 130 C128 132 144 162 138 198 C124 194 110 176 104 152 Z" fill="#687a93" {...THIN} />
      <path d="M114 150 C122 162 128 176 130 190 M109 161 C115 171 119 181 121 191" {...HAIR} fill="none" opacity={0.45} />
      <path d="M80 138 C84 152 84 172 90 190" stroke="#eceae3" strokeWidth={5} strokeLinecap="round" fill="none" />
      <Limb d="M83 125 L128 176" w={3.5} color="#b98530" />
      <g className="ch-satchel">
        <path d="M118 164 L123 152 L141 157 L138 168 Z" fill={C.cream} {...THIN} />
        <rect x={112} y={166} width={40} height={32} rx={5} fill="#d9a441" {...OUTLINE} />
        <path d="M112 171 C124 184 140 184 152 171 L152 170 C152 167 150 166 148 166 L116 166 C114 166 112 167 112 170 Z" fill="#b98530" {...THIN} />
        <rect x={128} y={176} width={8} height={7} rx={1.5} fill={C.brassLight} {...THIN} />
      </g>
      <Limb d="M96 126 C78 104 104 86 90 60" w={16} color="#eceae3" />
      <path d="M92 118 C80 100 100 88 88 68" stroke="#3b3f4a" strokeWidth={2.4} strokeDasharray="2 6" strokeLinecap="round" fill="none" />
      <path d="M85 121 L100 128 L113 119 L105 135 L100 128 L95 137 Z" fill={C.navy} {...THIN} />
      <g className="ch-head">
        <path className="ch-plume" d="M104 44 C124 36 144 38 160 50" stroke={INK} strokeWidth={3.2} fill="none" strokeLinecap="round" />
        <path className="ch-plume" d="M104 47 C122 44 138 48 150 58" stroke={INK} strokeWidth={2.4} fill="none" strokeLinecap="round" />
        <ellipse cx={90} cy={52} rx={18} ry={15} fill="#eceae3" {...OUTLINE} />
        <path d="M86 44 C96 38 110 40 118 48 C108 49 96 49 87 50 Z" fill="#2b2b30" />
        <path d="M76 47 L27 56 L76 55 Z" fill="#e2a93b" {...OUTLINE} strokeWidth={2.4} />
        <path className={mood === 'talk' ? 'ch-beak-talk' : undefined} d="M76 55 L31 57.5 L76 60 Z" fill="#cf9530" {...OUTLINE} strokeWidth={2.4} />
        <Eye cx={84} cy={48} r={4.4} iris="#f1d36a" mood={mood} />
        <circle cx={92} cy={58} r={4} fill={C.blush} opacity={0.35} />
      </g>
    </g>
  )
}

// ——————————————————————————————————————————————————— Barnaby, badger

function Barnaby({ mood }: { mood: Mood }) {
  return (
    <g className="ch ch-barnaby">
      <ellipse cx={80} cy={287} rx={15} ry={7} fill="#2f2a28" {...THIN} />
      <ellipse cx={120} cy={287} rx={15} ry={7} fill="#2f2a28" {...THIN} />
      <path
        d="M48 246 C44 210 60 180 100 176 C140 180 156 210 152 246 C150 272 130 286 100 286 C70 286 50 272 48 246 Z"
        fill="#6a6360"
        {...OUTLINE}
      />
      <path d="M128 184 C148 204 156 234 150 260 C144 278 126 286 110 286 C136 266 140 222 128 184 Z" fill="#57504d" />
      <path d="M72 205 L64 184 M128 205 L136 184" {...THIN} />
      <path d="M70 204 C84 198 116 198 130 204 L134 266 C118 278 82 278 66 266 Z" fill="#f1e8d6" {...OUTLINE} />
      <path d="M67 259 C82 270 118 270 133 259 L134 266 C118 278 82 278 66 266 Z" fill={C.brick} />
      <path d="M88 234 h24 v15 h-24 Z" fill="#e6dac3" {...THIN} />
      <path d="M92 234 v-3" {...HAIR} />
      <circle cx={80} cy={222} r={3} fill="#fffaf0" />
      <circle cx={117} cy={248} r={2.5} fill="#fffaf0" />
      <circle cx={96} cy={214} r={2} fill="#fffaf0" />
      <Limb d="M60 206 C46 216 42 234 50 246" w={13} color="#3d3634" />
      <Limb d="M140 206 C154 216 158 234 150 246" w={13} color="#3d3634" />
      <circle cx={50} cy={249} r={8} fill="#3d3634" {...THIN} />
      <circle cx={150} cy={249} r={8} fill="#3d3634" {...THIN} />
      <circle cx={148} cy={247} r={2.4} fill="#fffaf0" opacity={0.9} />
      <g className="ch-head">
        <circle cx={70} cy={128} r={9} fill="#2e2928" {...THIN} />
        <circle cx={130} cy={128} r={9} fill="#2e2928" {...THIN} />
        <circle cx={70} cy={129} r={4.5} fill="#d8cfbf" />
        <circle cx={130} cy={129} r={4.5} fill="#d8cfbf" />
        <path
          d="M58 150 C58 128 80 116 100 116 C120 116 142 128 142 150 C142 170 118 196 100 200 C82 196 58 170 58 150 Z"
          fill="#ece5d8"
          {...OUTLINE}
        />
        <path d="M94 186 C92 170 91 146 94 121 L84 121 C75 129 71 142 75 157 C79 170 86 180 94 186 Z" fill="#2e2928" />
        <path d="M106 186 C108 170 109 146 106 121 L116 121 C125 129 129 142 125 157 C121 170 114 180 106 186 Z" fill="#2e2928" />
        {mood !== 'happy' && <circle cx={86} cy={150} r={5.4} fill="#f4efe6" stroke={INK} strokeWidth={1} />}
        {mood !== 'happy' && <circle cx={114} cy={150} r={5.4} fill="#f4efe6" stroke={INK} strokeWidth={1} />}
        <Eye cx={86} cy={150} r={3.4} mood={mood} />
        <Eye cx={114} cy={150} r={3.4} mood={mood} />
        <ellipse cx={100} cy={189} rx={6.5} ry={4.6} fill="#1d1818" />
        <circle cx={98} cy={187.5} r={1.4} fill="#fff" opacity={0.8} />
        <Mouth d="M95 196 Q100 200 105 196" mood={mood} open={[100, 197]} />
        <circle cx={70} cy={168} r={5} fill={C.blush} opacity={0.3} />
        <circle cx={130} cy={168} r={5} fill={C.blush} opacity={0.3} />
        <g className="ch-hat">
          <path
            d="M80 126 C76 110 84 97 95 99 C99 88 116 88 118 100 C128 100 131 112 124 121 C110 116 93 118 80 126 Z"
            fill="#fbf7ef"
            {...OUTLINE}
          />
          <path d="M80 126 C93 118 110 116 124 121 L123 127 C110 123 94 124 81 131 Z" fill="#e6dac3" {...THIN} />
        </g>
      </g>
    </g>
  )
}

// ——————————————————————————————————————————————————— Tansy, hedgehog (aged nine)

function spikes(cx: number, cy: number, rIn: number, rOut: number, from: number, to: number, n: number): string {
  const pts: string[] = []
  for (let i = 0; i <= n; i++) {
    const t = from + ((to - from) * i) / n
    const a1 = (t * Math.PI) / 180
    pts.push(`${(cx + Math.cos(a1) * rIn).toFixed(1)} ${(cy + Math.sin(a1) * rIn).toFixed(1)}`)
    if (i < n) {
      const tm = from + ((to - from) * (i + 0.5)) / n
      const a2 = (tm * Math.PI) / 180
      const wob = i % 2 ? 1 : 0.86
      pts.push(`${(cx + Math.cos(a2) * rOut * wob).toFixed(1)} ${(cy + Math.sin(a2) * rOut * wob).toFixed(1)}`)
    }
  }
  return `M${pts.join(' L')} Z`
}

const TANSY_SPIKES = spikes(100, 178, 22, 44, 150, 390, 13)
const TANSY_SPIKES_BACK = spikes(100, 182, 24, 36, 160, 380, 11)

function Tansy({ mood }: { mood: Mood }) {
  return (
    <g className="ch ch-tansy">
      <path d="M78 270 h14 v14 c6 0 9 3 9 8 h-23 Z" fill="#c4473a" {...OUTLINE} />
      <path d="M108 270 h14 v14 c6 0 9 3 9 8 h-23 Z" fill="#c4473a" {...OUTLINE} />
      <g className="ch-spikes">
        <path d={TANSY_SPIKES} fill="#7d5236" {...OUTLINE} />
        <path d={TANSY_SPIKES_BACK} fill="#5e3c27" />
      </g>
      <path d="M76 206 C72 230 66 256 62 278 L138 278 C134 256 128 230 124 206 C114 196 86 196 76 206 Z" fill="#e8b63a" {...OUTLINE} />
      <path d="M112 200 C124 214 132 250 137 277 L119 277 C124 250 121 222 112 200 Z" fill="#cf9c28" />
      <path d="M100 206 L100 277" {...HAIR} />
      <rect x={97} y={222} width={7} height={3.4} rx={1.2} fill={C.wood} />
      <rect x={97} y={240} width={7} height={3.4} rx={1.2} fill={C.wood} />
      <rect x={97} y={258} width={7} height={3.4} rx={1.2} fill={C.wood} />
      <path d="M110 250 h15 v11 h-15 Z" fill="#dba830" {...THIN} />
      <Limb d="M78 212 C66 226 62 240 64 252" w={11} color="#e8b63a" />
      <Limb d="M122 212 C134 226 138 240 136 252" w={11} color="#e8b63a" />
      <circle cx={64} cy={256} r={6} fill="#c79a78" {...THIN} />
      <circle cx={136} cy={256} r={6} fill="#c79a78" {...THIN} />
      <path d="M77 207 C71 192 83 182 100 184 C117 182 129 192 123 207 C113 201 87 201 77 207 Z" fill="#d9a52e" {...THIN} />
      <g className="ch-head">
        <circle cx={80} cy={160} r={6} fill="#d9b894" {...THIN} />
        <circle cx={120} cy={160} r={6} fill="#d9b894" {...THIN} />
        <path
          d="M76 176 C76 160 88 152 100 152 C112 152 124 160 124 176 C124 190 112 198 100 200 C88 198 76 190 76 176 Z"
          fill="#efd9bb"
          {...OUTLINE}
        />
        <path d="M84 160 L88 150 L92 158 L97 148 L101 157 L106 148 L109 158 L114 151 L116 161 C108 156 92 156 84 160 Z" fill="#7d5236" {...THIN} />
        <Eye cx={90} cy={175} r={4.8} mood={mood} />
        <Eye cx={110} cy={175} r={4.8} mood={mood} />
        <ellipse cx={100} cy={187} rx={6} ry={4.5} fill="#e7c7a2" />
        <circle cx={100} cy={185.6} r={3.2} fill="#1d1818" />
        <Mouth d="M96 193 Q100 196.5 104 193" mood={mood} open={[100, 194]} />
        <circle cx={84} cy={185} r={4.5} fill={C.blush} opacity={0.45} />
        <circle cx={116} cy={185} r={4.5} fill={C.blush} opacity={0.45} />
      </g>
    </g>
  )
}

// ——————————————————————————————————————————————————— Tobias, tortoise (ninety-four)

function Tobias({ mood }: { mood: Mood }) {
  const happy = mood === 'happy'
  return (
    <g className="ch ch-tobias">
      <path d="M44 262 C38 204 70 170 108 168 C148 168 176 202 170 262 Z" fill="#7b8448" {...OUTLINE} />
      <g fill="#a8964f" {...THIN} strokeWidth={1.8}>
        <path d="M92 182 L112 178 L124 190 L116 206 L96 208 L86 196 Z" />
        <path d="M130 186 L150 196 L152 216 L134 220 L124 208 Z" />
        <path d="M62 206 L80 196 L90 210 L84 228 L64 230 Z" />
        <path d="M150 226 L164 236 L164 256 L146 254 Z" />
        <path d="M52 238 L66 236 L70 256 L52 258 Z" />
      </g>
      <path d="M44 262 C80 274 136 274 170 262 L168 271 C136 283 80 283 46 271 Z" fill="#9c8a4a" {...OUTLINE} />
      <path d="M70 266 L66 290 L90 290 L88 266 Z" fill="#a9a57c" {...OUTLINE} />
      <path d="M118 266 L116 290 L140 290 L136 266 Z" fill="#a9a57c" {...OUTLINE} />
      <path d="M70 290 q3 -4 6 0 M78 290 q3 -4 6 0 M120 290 q3 -4 6 0 M128 290 q3 -4 6 0" {...HAIR} fill="none" />
      <path d="M68 204 C72 190 128 188 134 204 L138 268 C120 276 84 276 66 268 Z" fill="#d8c3a0" {...OUTLINE} />
      <path d="M118 196 C130 204 134 240 136 266 C130 270 124 272 118 273 C124 246 124 218 118 196 Z" fill="#c4ad86" />
      <path d="M100 206 L100 272" {...HAIR} />
      <circle cx={104} cy={220} r={2.6} fill="#7c3a3a" {...HAIR} />
      <circle cx={104} cy={238} r={2.6} fill="#7c3a3a" {...HAIR} />
      <circle cx={104} cy={256} r={2.6} fill="#7c3a3a" {...HAIR} />
      <path d="M76 244 h16 v12 h-16 Z" fill="#cdb58f" {...THIN} />
      <Limb d="M70 210 C60 222 56 238 58 252" w={11} color="#cdb58f" />
      <Limb d="M132 210 C142 222 144 238 140 250" w={11} color="#cdb58f" />
      <path d="M58 256 C58 246 67 243 69 251" stroke={C.woodDark} strokeWidth={4} fill="none" strokeLinecap="round" />
      <Limb d="M58 256 L52 291" w={3.5} color={C.wood} />
      <circle cx={58} cy={256} r={7} fill="#b3ae84" {...THIN} />
      <circle cx={140} cy={254} r={7} fill="#b3ae84" {...THIN} />
      <path d="M88 198 C86 184 90 176 96 172 L108 172 C112 178 114 186 112 198 Z" fill="#b3ae84" {...OUTLINE} />
      <path d="M92 184 q8 3 16 0 M91 190 q9 3 18 0" {...HAIR} fill="none" opacity={0.6} />
      <path d="M76 198 C86 190 114 190 124 198 C116 206 84 206 76 198 Z" fill="#7c3a3a" {...OUTLINE} />
      <path d="M110 202 L118 230 L109 232 L104 204 Z" fill="#7c3a3a" {...THIN} />
      <path d="M110 226 l2 6 M114 225 l2 6" {...HAIR} />
      <g className="ch-head">
        <path
          d="M76 156 C76 138 90 128 100 128 C114 128 126 138 126 154 C126 168 114 178 100 178 C86 178 76 168 76 156 Z"
          fill="#b3ae84"
          {...OUTLINE}
        />
        <path d="M112 132 C122 138 126 152 122 166 C118 172 112 176 106 177 C118 164 118 146 112 132 Z" fill="#9d9870" />
        <path d="M84 142 q6 -5 12 -1 M104 141 q6 -4 12 1" stroke="#f6f1e6" strokeWidth={3.2} fill="none" strokeLinecap="round" />
        {happy ? (
          <>
            <path d="M86 153 q4 -4 8 0 M106 153 q4 -4 8 0" stroke={INK} strokeWidth={2} fill="none" strokeLinecap="round" />
          </>
        ) : (
          <g className="ch-eye">
            <circle cx={90} cy={153} r={mood === 'surprised' ? 3 : 2.4} fill={INK} />
            <circle cx={110} cy={153} r={mood === 'surprised' ? 3 : 2.4} fill={INK} />
            {mood !== 'surprised' && <path d="M85.5 151 q4.5 -2.4 9 0 M105.5 151 q4.5 -2.4 9 0" stroke={INK} strokeWidth={1.8} fill="none" />}
          </g>
        )}
        <g fill="rgba(255,255,255,0.28)" stroke={C.brass} strokeWidth={2}>
          <circle cx={90} cy={153} r={7.5} />
          <circle cx={110} cy={153} r={7.5} />
        </g>
        <path d="M97.5 152 q2.5 -2 5 0" stroke={C.brass} strokeWidth={2} fill="none" />
        {mood === 'talk' || mood === 'surprised' ? (
          <ellipse className="ch-mouth-talk" cx={100} cy={168} rx={5} ry={2.6} fill="#5a3a30" stroke={INK} strokeWidth={1.5} />
        ) : (
          <path d="M86 166 Q100 173 114 166" stroke={INK} strokeWidth={2} fill="none" strokeLinecap="round" />
        )}
        <circle cx={84} cy={163} r={4} fill={C.blush} opacity={0.3} />
        <circle cx={116} cy={163} r={4} fill={C.blush} opacity={0.3} />
      </g>
    </g>
  )
}

// ——————————————————————————————————————————————————— Margo, goat

function Margo({ mood }: { mood: Mood }) {
  return (
    <g className="ch ch-margo">
      <path d="M72 280 L94 280 L93 292 L73 292 Z" fill="#3a302a" {...OUTLINE} />
      <path d="M106 280 L128 280 L127 292 L107 292 Z" fill="#3a302a" {...OUTLINE} />
      <path d="M70 176 C80 168 120 168 130 176 L132 226 L68 226 Z" fill="#c46a3f" {...OUTLINE} />
      <path d="M70 222 L130 222 L132 282 L104 282 L100 244 L96 282 L68 282 Z" fill="#58704a" {...OUTLINE} />
      <path d="M116 226 L130 226 L131 280 L112 280 C118 260 118 240 116 226 Z" fill="#4a613d" />
      <path d="M78 190 L122 190 L124 226 L76 226 Z" fill="#58704a" {...OUTLINE} />
      <path d="M78 190 L73 172 M122 190 L127 172" stroke={INK} strokeWidth={7} strokeLinecap="round" />
      <path d="M78 190 L73 172 M122 190 L127 172" stroke="#58704a" strokeWidth={3.6} strokeLinecap="round" />
      <circle cx={79} cy={193} r={2.6} fill={C.brass} {...HAIR} />
      <circle cx={121} cy={193} r={2.6} fill={C.brass} {...HAIR} />
      <path d="M103 196 L111 182" stroke={INK} strokeWidth={6} strokeLinecap="round" />
      <path d="M103 196 L111 182" stroke={C.wood} strokeWidth={3} strokeLinecap="round" />
      <path d="M88 200 h24 v15 h-24 Z" fill="#4f6542" {...THIN} />
      <path d="M92 204 h16" {...HAIR} opacity={0.5} />
      <Limb d="M70 180 C58 196 56 214 60 230" w={11} color="#c46a3f" />
      <Limb d="M130 180 C142 196 144 214 140 230" w={11} color="#c46a3f" />
      <path d="M55 214 l12 3 M145 214 l-12 3" stroke="#a9552e" strokeWidth={3} />
      <circle cx={60} cy={234} r={6.5} fill="#ece2d2" {...THIN} />
      <circle cx={140} cy={234} r={6.5} fill="#ece2d2" {...THIN} />
      <path d="M91 174 L109 174 L110 160 L90 160 Z" fill="#ece2d2" {...THIN} />
      <g className="ch-head">
        <path d="M92 118 C84 100 90 86 104 82 C98 92 96 104 100 116 Z" fill="#8c7b64" {...OUTLINE} />
        <path d="M110 116 C114 100 124 90 138 92 C127 98 119 106 116 118 Z" fill="#8c7b64" {...OUTLINE} />
        <path d="M94 104 l5 -2 M96 96 l5 -1 M117 106 l4 3 M121 99 l4 3" {...HAIR} />
        <g className="ch-ear-l">
          <path d="M87 132 C72 127 62 133 59 140 C69 145 80 143 89 138 Z" fill="#ece2d2" {...OUTLINE} />
          <path d="M84 134 C74 132 68 136 66 139 C73 141 80 140 85 137 Z" fill="#e3b4a4" />
        </g>
        <g className="ch-ear-r">
          <path d="M117 132 C132 127 142 133 145 140 C135 145 124 143 115 138 Z" fill="#ece2d2" {...OUTLINE} />
          <path d="M120 134 C130 132 136 136 138 139 C131 141 124 140 119 137 Z" fill="#e3b4a4" />
        </g>
        <path
          d="M84 142 C82 124 92 112 102 112 C114 112 122 124 120 142 C118 158 112 170 104 172 C96 172 88 160 84 142 Z"
          fill="#ece2d2"
          {...OUTLINE}
        />
        <path d="M110 116 C118 124 121 138 118 150 C116 160 111 168 105 171 C112 156 114 134 110 116 Z" fill="#ddd1bf" />
        <path d="M89 156 C91 167 113 167 115 156 C111 162 93 162 89 156 Z" fill="#dcc2ad" />
        <circle cx={98} cy={159} r={1.4} fill={INK} />
        <circle cx={106} cy={159} r={1.4} fill={INK} />
        <path d="M96 171 C97 181 104 188 107 178 C106 174 104 172 102 171 Z" fill="#d8cbb4" {...THIN} />
        <Eye cx={95} cy={137} r={4.4} iris="#d9a441" goat mood={mood} />
        <Eye cx={111} cy={137} r={4.4} iris="#d9a441" goat mood={mood} />
        {mood !== 'happy' && <path d="M89 129 l9 2 M117 129 l-9 2" stroke={INK} strokeWidth={1.8} strokeLinecap="round" />}
        <Mouth d="M98 165.5 Q102 167.5 106 165.5" mood={mood} open={[102, 166]} />
        <circle cx={90} cy={150} r={3.6} fill={C.blush} opacity={0.3} />
        <circle cx={115} cy={150} r={3.6} fill={C.blush} opacity={0.3} />
      </g>
    </g>
  )
}

// ——————————————————————————————————————————————————— Hollis, mole

function Hollis({ mood }: { mood: Mood }) {
  return (
    <g className="ch ch-hollis">
      <ellipse cx={84} cy={289} rx={12} ry={5} fill="#e39a9b" {...THIN} />
      <ellipse cx={116} cy={289} rx={12} ry={5} fill="#e39a9b" {...THIN} />
      <path d="M64 284 C50 246 54 202 74 184 C86 172 114 172 126 184 C146 202 150 246 136 284 C118 292 82 292 64 284 Z" fill="#4d4353" {...OUTLINE} />
      <path d="M78 214 C76 230 78 250 84 266" stroke="#6a5d72" strokeWidth={5} strokeLinecap="round" fill="none" opacity={0.7} />
      <path d="M69 226 C74 214 88 210 100 222 C112 210 126 214 131 226 L133 270 C117 281 83 281 67 270 Z" fill="#3f7a78" {...OUTLINE} />
      <path d="M88 214 L100 232 L112 214" stroke={INK} strokeWidth={2} fill="#f4efe6" strokeLinejoin="round" />
      <g fill="#e9dcc0" opacity={0.75}>
        <path d="M84 238 l6 8 l-6 8 l-6 -8 Z" />
        <path d="M100 250 l6 8 l-6 8 l-6 -8 Z" />
        <path d="M116 238 l6 8 l-6 8 l-6 -8 Z" />
      </g>
      <path d="M72 250 L128 262 M72 262 L128 250" stroke="#2f5e5c" strokeWidth={1.2} opacity={0.7} />
      <path d="M117 232 L121 214" stroke={INK} strokeWidth={5.5} strokeLinecap="round" />
      <path d="M117 232 L121 214" stroke="#e8b63a" strokeWidth={3} strokeLinecap="round" />
      <path d="M120.6 216 L121.2 213.6" stroke="#e39a9b" strokeWidth={3} strokeLinecap="round" />
      <g className="ch-hand-l">
        <path d="M66 220 C48 218 38 234 44 248 C50 258 64 256 70 244 Z" fill="#e39a9b" {...OUTLINE} />
        <path d="M44 236 l-6 -2 M44 243 l-6 1 M47 250 l-5 4" stroke="#f6e8dc" strokeWidth={3} strokeLinecap="round" />
      </g>
      <g className="ch-hand-r">
        <path d="M134 220 C152 218 162 234 156 248 C150 258 136 256 130 244 Z" fill="#e39a9b" {...OUTLINE} />
        <path d="M156 236 l6 -2 M156 243 l6 1 M153 250 l5 4" stroke="#f6e8dc" strokeWidth={3} strokeLinecap="round" />
      </g>
      <g className="ch-head">
        <path d="M82 182 C92 176 108 176 118 182" stroke="#6a5d72" strokeWidth={3} fill="none" strokeLinecap="round" opacity={0.7} />
        <g className="ch-snout">
          <path d="M88 196 C89 212 93 224 100 233 C107 224 111 212 112 196 Z" fill="#e39a9b" {...OUTLINE} />
          <path d="M92 204 q8 3 16 0 M94 212 q6 2.4 12 0" stroke="#c97c80" strokeWidth={1.3} fill="none" />
          <ellipse cx={100} cy={232} rx={7} ry={5} fill="#d4787e" {...THIN} />
          <circle cx={97.5} cy={232} r={1.1} fill={INK} />
          <circle cx={102.5} cy={232} r={1.1} fill={INK} />
        </g>
        <path d="M66 190 L76 190 M124 190 L134 190" stroke="#3a2a22" strokeWidth={2.6} strokeLinecap="round" />
        <circle cx={86} cy={190} r={10} fill="#dfeef0" fillOpacity={0.55} stroke="#3a2a22" strokeWidth={3.2} />
        <circle cx={114} cy={190} r={10} fill="#dfeef0" fillOpacity={0.55} stroke="#3a2a22" strokeWidth={3.2} />
        <path d="M97 190 q3 -3 6 0" stroke="#3a2a22" strokeWidth={2.6} fill="none" />
        <Eye cx={86} cy={191} r={3.6} mood={mood} />
        <Eye cx={114} cy={191} r={3.6} mood={mood} />
        <path d="M80 184 l3 -3 M108 184 l3 -3" stroke="#fff" strokeWidth={1.6} strokeLinecap="round" opacity={0.8} />
        <circle cx={79} cy={204} r={4} fill={C.blush} opacity={0.35} />
        <circle cx={121} cy={204} r={4} fill={C.blush} opacity={0.35} />
      </g>
    </g>
  )
}

const DRAW: Record<ResidentId, (p: { mood: Mood }) => ReactElement> = { odile: Odile, barnaby: Barnaby, tansy: Tansy, tobias: Tobias, margo: Margo, hollis: Hollis }

export function ResidentFigure({ id, mood = 'idle' }: { id: ResidentId; mood?: Mood }) {
  const Draw = DRAW[id]
  return <Draw mood={mood} />
}

interface ResidentArtProps {
  id: ResidentId
  mood?: Mood
  className?: string
  title?: string
  /** Crop the view box to the head and shoulders (for portraits). */
  portrait?: boolean
  flip?: boolean
}

/** A standalone resident illustration. */
export function ResidentArt({ id, mood = 'idle', className, title, portrait, flip }: ResidentArtProps) {
  const vb = portrait ? PORTRAIT_BOX[id] : '0 0 200 300'
  return (
    <svg
      className={`resident resident--${id} ${className ?? ''}`}
      viewBox={vb}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <g filter="url(#bb-wobble)" transform={flip ? 'translate(200 0) scale(-1 1)' : undefined}>
        <ResidentFigure id={id} mood={mood} />
      </g>
    </svg>
  )
}
