import { useEffect, type RefObject } from 'react'

let keyboard = false

/** Is the player driving with the keyboard right now (rather than a pointer)? */
export const usingKeyboard = () => keyboard

/**
 * Keyboard players keep their place. Scenes change under the player all the time — a
 * visitor leaves, a card turns over, evening falls — and when that drops focus on the
 * floor it is picked up and put on the scene's main action, marked `data-autofocus`.
 * Pointer players are left alone.
 */
export function useFocusRescue(root: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = root.current
    if (!el) return
    let frame = 0
    const lost = () => {
      const a = document.activeElement
      return !a || a === document.body || !a.isConnected || (a instanceof HTMLButtonElement && a.disabled)
    }
    const rescue = () => {
      frame = 0
      // Open sheets look after their own focus.
      if (!keyboard || !lost() || el.querySelector('[role="dialog"]')) return
      el.querySelector<HTMLElement>('[data-autofocus]:not(:disabled)')?.focus({ preventScroll: true })
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(rescue)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      keyboard = true
      schedule()
    }
    const onPointer = () => {
      keyboard = false
    }
    const watcher = new MutationObserver(schedule)
    watcher.observe(el, { childList: true, subtree: true, attributes: true, attributeFilter: ['disabled'] })
    window.addEventListener('keydown', onKey, true)
    window.addEventListener('pointerdown', onPointer, true)
    return () => {
      cancelAnimationFrame(frame)
      watcher.disconnect()
      window.removeEventListener('keydown', onKey, true)
      window.removeEventListener('pointerdown', onPointer, true)
    }
  }, [root])
}
