import { C, INK } from '../../art/palette'
import { PORTRAIT_BOX } from '../../art/poses'
import { ResidentFigure } from '../../art/residents'
import type { Keepsake, LocationId } from '../../game/types'
import { useId } from 'react'

const PLACE: Record<LocationId, [string, string]> = {
  burrow: ['#e9c58a', '#8a5a3b'],
  green: ['#a9d2d8', '#86a04f'],
  kettleRow: ['#d9c7b2', '#9a8a78'],
  millpond: ['#bfe0e0', '#4f8a8b'],
  hill: ['#9fc6dc', '#6f8f45'],
  glasshouse: ['#e3efe4', '#7f9d4f'],
}

/** A tiny instant photograph: where it was taken, and who's in it. */
export function Polaroid({ k, rotate = 0 }: { k: Keepsake; rotate?: number }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '')
  const [sky, ground] = PLACE[k.place ?? 'green']
  const night = /moon|Gerald|night|Lantern/i.test(k.text)
  const box = k.subject ? PORTRAIT_BOX[k.subject].split(' ').map(Number) : null
  return (
    <figure className="polaroid" style={{ transform: `rotate(${rotate}deg)` }}>
      <svg viewBox="0 0 100 90" aria-hidden="true">
        <clipPath id={`pl-${uid}`}>
          <rect x={0} y={0} width={100} height={90} />
        </clipPath>
        <g clipPath={`url(#pl-${uid})`}>
          <rect width={100} height={90} fill={night ? C.night : sky} />
          {night && <circle cx={72} cy={24} r={11} fill="#f4e3a1" />}
          {night &&
            [
              [20, 20],
              [40, 12],
              [52, 30],
              [86, 44],
            ].map(([x, y]) => <circle key={`${x}`} cx={x} cy={y} r={1.3} fill={C.star} />)}
          {!night && <circle cx={80} cy={18} r={8} fill="#fbe7a0" opacity={0.8} />}
          <path d="M0 64 C30 54 70 58 100 50 L100 90 L0 90 Z" fill={night ? '#34473c' : ground} />
          {box && (
            <g transform={`translate(22 18) scale(${56 / box[2]}) translate(${-box[0]} ${-box[1]})`}>
              <ResidentFigure id={k.subject!} mood="happy" />
            </g>
          )}
        </g>
        <rect width={100} height={90} fill="none" stroke={INK} strokeWidth={1.5} />
      </svg>
      <figcaption className="hand">{k.text}</figcaption>
    </figure>
  )
}
