import type { ReactNode } from 'react'
import { STAGE, type Orient } from './viewport'

export type { Orient } from './viewport'

interface StageProps {
  orient: Orient
  scale: number
  /** Full-bleed scenery behind the stage, so letterboxing is never dead space. */
  backdrop?: ReactNode
  children: ReactNode
  className?: string
}

export function Stage({ orient, scale, backdrop, children, className }: StageProps) {
  const { w, h } = STAGE[orient]
  return (
    <div className={`stage-wrap stage-wrap--${orient} ${className ?? ''}`}>
      {backdrop}
      <div
        className={`stage stage--${orient}`}
        style={{ width: w, height: h, transform: `translate(-50%, -50%) scale(${scale})` }}
      >
        {children}
      </div>
    </div>
  )
}
