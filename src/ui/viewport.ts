import { useEffect, useState } from 'react'

export type Orient = 'wide' | 'tall'

/** Two hand-composed diorama sizes, in logical units. The stage scales to fit the window. */
export const STAGE: Record<Orient, { w: number; h: number }> = {
  wide: { w: 1600, h: 900 },
  tall: { w: 900, h: 1600 },
}

function measure() {
  const vv = typeof window !== 'undefined' ? window.visualViewport : null
  const vw = vv?.width ?? window.innerWidth
  const vh = vv?.height ?? window.innerHeight
  return { vw, vh }
}

export function useViewport() {
  const [dims, setDims] = useState(measure)
  useEffect(() => {
    const on = () => setDims(measure())
    window.addEventListener('resize', on)
    window.visualViewport?.addEventListener('resize', on)
    return () => {
      window.removeEventListener('resize', on)
      window.visualViewport?.removeEventListener('resize', on)
    }
  }, [])
  const orient: Orient = dims.vw / dims.vh < 0.92 ? 'tall' : 'wide'
  const { w, h } = STAGE[orient]
  const scale = Math.min(dims.vw / w, dims.vh / h)
  return { ...dims, orient, scale }
}
