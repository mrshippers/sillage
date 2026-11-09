import { flushSync } from 'react-dom'

type VT = Document & { startViewTransition?: (cb: () => void) => unknown }

/* Run a state change as a view transition, so the page glides instead of
 * snapping. With `id`, the strip for that bottle is named on both sides, so the
 * row you tapped becomes the hero of the page (and back again). Where view
 * transitions are missing, or motion is reduced, the change just happens. */
export function morph(update: () => void, id?: string) {
  const doc = document as VT
  if (!doc.startViewTransition || matchMedia('(prefers-reduced-motion: reduce)').matches) return update()
  const name = () => {
    const el = id ? document.querySelector<HTMLElement>(`[data-bottle="${CSS.escape(id)}"]`) : null
    if (el) el.style.viewTransitionName = 'bottle'
  }
  name()
  doc.startViewTransition(() => {
    flushSync(update)
    name()
  })
}
