import { useEffect, useRef } from 'react'
import { createSpring } from './fluid'

/* The hero strip is a physical thing under your finger: it presses in the
 * instant you touch it, leans toward where you are, and the light slides across
 * the paper. Let go and it springs back with a little life. Each axis is its
 * own spring, so a second touch mid-return takes over from where it is. */
export function useTilt<T extends HTMLElement>(on: boolean, amount = 1) {
  const ref = useRef<T>(null)
  useEffect(() => {
    const el = ref.current
    if (!on || !el) return
    const paint = () => {
      el.style.transform = `perspective(760px) rotateX(${rx.value.toFixed(3)}deg) rotateY(${ry.value.toFixed(3)}deg) scale(${sc.value.toFixed(4)})`
    }
    const lean = { response: 0.32, damping: 0.72, rest: 0.005 }
    const rx = createSpring(0, lean, paint)
    const ry = createSpring(0, lean, paint)
    const sc = createSpring(1, { response: 0.26, damping: 0.85, rest: 0.0005 }, paint)
    const aim = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      const x = (e.clientX - r.left) / r.width
      const y = (e.clientY - r.top) / r.height
      rx.to((0.5 - y) * 7 * amount)
      ry.to((x - 0.5) * 9 * amount)
      el.style.setProperty('--mx', `${(x * 100).toFixed(1)}%`)
      el.style.setProperty('--my', `${(y * 100).toFixed(1)}%`)
    }
    const press = (e: PointerEvent) => {
      aim(e)
      sc.to(0.985)
    }
    const release = () => {
      rx.to(0)
      ry.to(0)
      sc.to(1)
    }
    const move = (e: PointerEvent) => aim(e)
    el.addEventListener('pointerdown', press)
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerup', release)
    el.addEventListener('pointerleave', release)
    el.addEventListener('pointercancel', release)
    return () => {
      rx.stop()
      ry.stop()
      sc.stop()
      for (const [k, f] of [['pointerdown', press], ['pointermove', move], ['pointerup', release], ['pointerleave', release], ['pointercancel', release]] as const) el.removeEventListener(k, f as EventListener)
      el.style.transform = ''
    }
  }, [on, amount])
  return ref
}
