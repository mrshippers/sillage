import { useEffect, useMemo, useRef } from 'react'
import { radiusFor, seedBodies, stepField, type Body } from './notesPhysics'

/* Notes floating free: sized by how many of your bottles carry them, drifting
 * and nudging each other. Pick one up and it follows your finger from where
 * you grabbed it; let go and it keeps the speed you gave it. A tap opens it. */

const SHOWN = 20 // the field holds the most carried; the full list sits under it

export default function NotesField({ index, pick }: { index: { note: string; ids: string[] }[]; pick: (note: string) => void }) {
  // keyed on what the notes are, not on the array: the field must not reseed because a parent re-rendered
  const sig = index.slice(0, SHOWN).map(n => `${n.note}:${n.ids.length}`).join('|')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const notes = useMemo(() => index.slice(0, SHOWN), [sig])
  const max = notes[0]?.ids.length ?? 1
  const box = useRef<HTMLDivElement>(null)
  const dragged = useRef(false)

  useEffect(() => {
    const el = box.current
    if (!el || !notes.length) return
    const w = el.clientWidth
    const h = el.clientHeight
    const bodies: Body[] = seedBodies(notes.map(n => radiusFor(n.ids.length, max, w)), w, h)
    const nodes = [...el.querySelectorAll<HTMLElement>('.nf-note')]
    const paint = () =>
      bodies.forEach((b, i) => {
        const n = nodes[i]
        if (!n) return
        n.style.width = n.style.height = `${b.r * 2}px`
        n.style.transform = `translate(${(b.x - b.r).toFixed(1)}px, ${(b.y - b.r).toFixed(1)}px)`
      })

    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
    let t = 0
    for (; t < (reduced ? 900 : 240); t++) stepField(bodies, w, h, t, 0) // open already apart, not in a pile
    paint()
    el.dataset.ready = ''

    let raf = 0
    const frame = () => {
      stepField(bodies, w, h, t++)
      paint()
      raf = requestAnimationFrame(frame)
    }
    const vis = () => {
      cancelAnimationFrame(raf)
      raf = 0
      if (!document.hidden && !reduced) raf = requestAnimationFrame(frame)
    }
    vis()
    document.addEventListener('visibilitychange', vis)

    // one finger, one note
    let id = -1
    let held = -1
    let ox = 0
    let oy = 0
    let sx = 0
    let sy = 0
    let hist: { x: number; y: number; t: number }[] = []
    const local = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      return { x: e.clientX - r.left, y: e.clientY - r.top }
    }
    const down = (e: PointerEvent) => {
      const i = nodes.indexOf((e.target as Element).closest<HTMLElement>('.nf-note')!)
      if (i < 0) return
      const p = local(e)
      id = e.pointerId
      held = i
      dragged.current = false
      ox = bodies[i].x - p.x // keep the offset from where it was grabbed
      oy = bodies[i].y - p.y
      sx = p.x
      sy = p.y
      hist = [{ ...p, t: e.timeStamp }]
      nodes[i].setPointerCapture(id)
    }
    const move = (e: PointerEvent) => {
      if (e.pointerId !== id || held < 0) return
      const p = local(e)
      if (!dragged.current && Math.hypot(p.x - sx, p.y - sy) < 8) return
      dragged.current = true
      const b = bodies[held]
      b.held = true
      b.x = p.x + ox
      b.y = p.y + oy
      hist.push({ ...p, t: e.timeStamp })
      while (hist.length > 2 && e.timeStamp - hist[0].t > 100) hist.shift()
      if (reduced) paint()
    }
    const up = (e: PointerEvent) => {
      if (e.pointerId !== id || held < 0) return
      const b = bodies[held]
      if (b.held) {
        const a = hist[0]
        const z = hist[hist.length - 1]
        const dt = (z.t - a.t) / 1000
        const cap = (v: number) => Math.max(-28, Math.min(28, v))
        b.vx = dt > 0.005 ? cap((z.x - a.x) / dt / 60) : 0 // its speed per frame is the finger's
        b.vy = dt > 0.005 ? cap((z.y - a.y) / dt / 60) : 0
        b.held = false
      }
      id = -1
      held = -1
      setTimeout(() => (dragged.current = false)) // swallow only the click that ends this drag
    }
    el.addEventListener('pointerdown', down)
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerup', up)
    el.addEventListener('pointercancel', up)
    return () => {
      cancelAnimationFrame(raf)
      document.removeEventListener('visibilitychange', vis)
      el.removeEventListener('pointerdown', down)
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerup', up)
      el.removeEventListener('pointercancel', up)
    }
  }, [notes, max])

  if (!notes.length) return null
  return (
    <div ref={box} className="nf" data-noswipe role="group" aria-label="Your most carried notes">
      {notes.map(n => (
        <button
          key={n.note}
          type="button"
          className="nf-note"
          style={{ '--w': n.ids.length / max } as React.CSSProperties}
          aria-label={`${n.note}, in ${n.ids.length} ${n.ids.length === 1 ? 'bottle' : 'bottles'}`}
          onClick={() => {
            if (!dragged.current) pick(n.note)
            dragged.current = false
          }}
        >
          <span className="nf-name">{n.note}</span>
          {n.ids.length > 1 ? <span className="nf-count">{n.ids.length}</span> : null}
        </button>
      ))}
    </div>
  )
}
