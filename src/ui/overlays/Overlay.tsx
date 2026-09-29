import { useEffect, useRef, type ReactNode } from 'react'
import { sfx } from '../../audio/sfx'

interface OverlayProps {
  label: string
  onClose: () => void
  children: ReactNode
  className?: string
}

/** A modal sheet laid over the scene: Escape closes it, focus stays inside, and returns after. */
export function Overlay({ label, onClose, children, className }: OverlayProps) {
  const ref = useRef<HTMLDivElement>(null)
  const closeRef = useRef(onClose)
  useEffect(() => {
    closeRef.current = onClose
  }, [onClose])
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null
    sfx.paper()
    const first = ref.current?.querySelector<HTMLElement>('[data-autofocus]') ?? ref.current?.querySelector<HTMLElement>('button')
    first?.focus({ preventScroll: true })
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        closeRef.current()
      }
      if (e.key === 'Tab' && ref.current) {
        const items = [...ref.current.querySelectorAll<HTMLElement>('button, [href], [tabindex]:not([tabindex="-1"])')].filter((el) => !el.hasAttribute('disabled'))
        if (!items.length) return
        const firstEl = items[0]
        const lastEl = items[items.length - 1]
        if (e.shiftKey && document.activeElement === firstEl) {
          e.preventDefault()
          lastEl.focus()
        } else if (!e.shiftKey && document.activeElement === lastEl) {
          e.preventDefault()
          firstEl.focus()
        }
      }
    }
    window.addEventListener('keydown', onKey, true)
    return () => {
      window.removeEventListener('keydown', onKey, true)
      prev?.focus?.({ preventScroll: true })
    }
  }, [])
  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={ref} className={`sheet ${className ?? ''}`} role="dialog" aria-modal="true" aria-label={label}>
        <button className="sheet__close" onClick={onClose} aria-label="Close">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M5 6 L19 18 M18 5 L6 19" stroke="currentColor" strokeWidth={3} strokeLinecap="round" />
          </svg>
        </button>
        {children}
      </div>
    </div>
  )
}
