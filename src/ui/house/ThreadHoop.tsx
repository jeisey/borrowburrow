import { useId } from 'react'
import { C, INK } from '../../art/palette'
import { PORTRAIT_BOX } from '../../art/poses'
import { ResidentFigure } from '../../art/residents'
import { RESIDENTS } from '../../game/content/residents'
import type { ResidentId, Thread } from '../../game/types'
import { RESIDENT_IDS } from '../../game/types'
import { ringPositions, strandColor, yarnPath } from '../threads/layout'

export function MiniPortrait({ id, x, y, r, present = true }: { id: ResidentId; x: number; y: number; r: number; present?: boolean }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '')
  const [bx, by, bw] = PORTRAIT_BOX[id].split(' ').map(Number)
  const s = (r * 2) / bw
  return (
    <g opacity={present ? 1 : 0.35}>
      <circle cx={x} cy={y} r={r + 2.5} fill={RESIDENTS[id].color} stroke={INK} strokeWidth={2} />
      <clipPath id={`mp-${uid}`}>
        <circle cx={x} cy={y} r={r} />
      </clipPath>
      <g clipPath={`url(#mp-${uid})`}>
        <circle cx={x} cy={y} r={r} fill={C.cream} />
        <g transform={`translate(${x - r} ${y - r}) scale(${s}) translate(${-bx} ${-by})`}>
          <ResidentFigure id={id} />
        </g>
      </g>
    </g>
  )
}

/** An embroidery hoop on the wall: the village's Threads, stitched as they appear. */
export function ThreadHoop({ threads, present, fresh }: { threads: Thread[]; present: ResidentId[]; fresh: Set<string> }) {
  const pos = ringPositions(100, 100, 62)
  return (
    <svg className="hoop" viewBox="0 0 200 200" aria-hidden="true">
      <circle cx={100} cy={100} r={94} fill={C.woodLight} stroke={INK} strokeWidth={3} />
      <circle cx={100} cy={100} r={86} fill="#efe4cc" stroke={INK} strokeWidth={2} />
      <circle cx={100} cy={100} r={86} fill="url(#bb-hatch)" opacity={0.35} />
      <rect x={92} y={2} width={16} height={12} rx={3} fill={C.brass} stroke={INK} strokeWidth={2} />
      {threads.map((t) =>
        t.strands.slice(0, 4).map((_, i, arr) => (
          <g key={`${t.key}-${i}`} className={fresh.has(t.key) ? 'yarn yarn--fresh' : 'yarn'}>
            <path d={yarnPath(pos[t.a], pos[t.b], i, arr.length, 55, [100, 100])} stroke={INK} strokeWidth={4.4} fill="none" strokeLinecap="round" opacity={0.5} />
            <path d={yarnPath(pos[t.a], pos[t.b], i, arr.length, 55, [100, 100])} stroke={strandColor(t, i)} strokeWidth={2.8} fill="none" strokeLinecap="round" />
          </g>
        )),
      )}
      {RESIDENT_IDS.map((id) => (
        <MiniPortrait key={id} id={id} x={pos[id][0]} y={pos[id][1]} r={17} present={present.includes(id)} />
      ))}
    </svg>
  )
}
