import { useEffect, useRef, type RefObject } from 'react'
import { flushSync } from 'react-dom'
import { createSpring, project, rubberband } from './fluid'

/* Swipe between pages with a finger.
 *
 * The page follows the finger 1:1 from where it was grabbed. On release the
 * flick is projected forward (not the release point) to decide whether it
 * commits, and the page carries the finger's own speed into the settle. A page
 * still settling can be grabbed again and sent back. Past the first or last
 * page it resists instead of stopping. Touch and pen only: a mouse drag on a
 * desktop is text selection. */

type Live = {
  hasPrev: boolean // a swipe to the right goes here (a previous tab, or back from a bottle)
  hasNext: boolean // a swipe to the left goes here
  prev: () => void
  next: () => void
  /** how far the page has travelled, as a fraction of its width, + toward `next` */
  onProgress?: (fraction: number) => void
}

const SKIP = '.chips, .rate, .range, input, textarea, select, [data-noswipe]'

export function useSwipePages(root: RefObject<HTMLElement | null>, page: RefObject<HTMLElement | null>, live: Live) {
  const L = useRef(live)
  useEffect(() => {
    L.current = live // handlers read the latest tab and callbacks, not the ones from first render
  })

  useEffect(() => {
    const el = root.current
    if (!el) return
    const width = () => Math.min(window.innerWidth, 460)
    const paint = (v: number, progress = true) => {
      const p = page.current
      if (p) {
        p.style.translate = v ? `${v}px 0` : ''
        p.style.opacity = v ? String(1 - Math.min(Math.abs(v) / (width() * 0.8), 1) * 0.85) : ''
      }
      if (progress) L.current.onProgress?.(-v / width())
    }
    let quiet = false // while the next page slides in, the indicator must stay where the commit put it
    const x = createSpring(0, { response: 0.38, damping: 0.88, rest: 0.4 }, v => paint(v, !quiet))

    let id = -1
    let sx = 0
    let sy = 0
    let off = 0
    let lock: '' | 'x' | 'y' = ''
    let hist: { x: number; t: number }[] = []

    const down = (e: PointerEvent) => {
      if (e.pointerType === 'mouse' || (e.target as Element).closest(SKIP)) return
      id = e.pointerId
      quiet = false
      sx = e.clientX
      sy = e.clientY
      lock = ''
      off = x.value // grabbing a settling page continues from where it is
      x.stop()
      hist = [{ x: e.clientX, t: e.timeStamp }]
    }
    const move = (e: PointerEvent) => {
      if (e.pointerId !== id) return
      if (!lock) {
        const dx = e.clientX - sx
        const dy = e.clientY - sy
        if (Math.hypot(dx, dy) < 10) return
        lock = Math.abs(dx) > Math.abs(dy) * 1.2 ? 'x' : 'y'
        if (lock === 'x') {
          el.setPointerCapture(id)
          sx = e.clientX // 1:1 starts here, so crossing the threshold does not jump the page
        }
      }
      if (lock !== 'x') return
      hist.push({ x: e.clientX, t: e.timeStamp })
      while (hist.length > 2 && e.timeStamp - hist[0].t > 100) hist.shift()
      const raw = off + (e.clientX - sx)
      const { hasPrev, hasNext } = L.current
      x.set((raw > 0 ? hasPrev : hasNext) ? raw : rubberband(raw, width()))
    }
    const up = (e: PointerEvent) => {
      if (e.pointerId !== id) return
      id = -1
      if (lock !== 'x') return
      const a = hist[0]
      const b = hist[hist.length - 1]
      const span = (b.t - a.t) / 1000
      const velocity = span > 0.005 ? (b.x - a.x) / span : 0
      const w = width()
      const { hasPrev, hasNext } = L.current
      const landing = x.value + project(velocity) // where the flick is heading, not where the finger lifted
      const dir = landing > w * 0.33 && hasPrev ? 1 : landing < -w * 0.33 && hasNext ? -1 : 0
      if (!dir) return void x.to(0, { velocity })
      x.to(dir * w, {
        velocity,
        onRest: () => {
          flushSync(() => (dir > 0 ? L.current.prev() : L.current.next()))
          // the next page carries the motion on: it comes in from the side the finger was heading away from
          quiet = true
          x.set(-dir * w * 0.42)
          x.to(0, { onRest: () => (quiet = false) })
        },
      })
    }

    el.addEventListener('pointerdown', down)
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerup', up)
    el.addEventListener('pointercancel', up)
    return () => {
      x.stop()
      el.removeEventListener('pointerdown', down)
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerup', up)
      el.removeEventListener('pointercancel', up)
    }
  }, [root, page])
}
