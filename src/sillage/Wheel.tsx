import { useEffect, useRef, type CSSProperties } from 'react'
import { FAMILIES, type Family } from './families'
import { createSpring, project, type Spring } from './fluid'

/* The scent wheel: the families orbit a hub. Turn it with a finger and it
 * turns with you; flick it and it carries on to the family the flick was
 * heading for. Tap a family to bring it to the crown. The hub counts the real
 * bottles in that family and the rack below filters to them; tap the hub to
 * see every bottle again. Membership comes from each bottle's profile. */

const N = FAMILIES.length
const STEP = 360 / N
const SIZE = 300
const ORBIT = 112

function FamilyIcon({ family }: { family: Family }) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {family.icon.map((d, i) => (
        <path key={i} d={d} />
      ))}
    </svg>
  )
}

export default function Wheel({ counts, total, sel, setSel }: { counts: number[]; total: number; sel: number | null; setSel: (i: number | null) => void }) {
  const box = useRef<HTMLDivElement>(null)
  const ring = useRef<HTMLDivElement>(null)
  const spring = useRef<Spring | null>(null)
  const dragged = useRef(false)
  const live = useRef({ sel, setSel })
  useEffect(() => {
    live.current = { sel, setSel }
  })

  useEffect(() => {
    const el = box.current
    const r = ring.current
    if (!el || !r) return
    const sp = createSpring(sel === null ? 0 : -sel * STEP, { response: 0.5, damping: 0.8, rest: 0.05 }, v => {
      r.style.setProperty('--rot', `${v.toFixed(2)}deg`)
    })
    sp.set(sp.value)
    spring.current = sp

    let id = -1
    let last = 0
    let moved = 0
    let hist: { a: number; t: number }[] = []
    let acc = 0
    const angle = (e: PointerEvent) => {
      const b = el.getBoundingClientRect()
      return (Math.atan2(e.clientY - (b.top + b.height / 2), e.clientX - (b.left + b.width / 2)) * 180) / Math.PI
    }
    const down = (e: PointerEvent) => {
      if ((e.target as Element).closest('.wheel-hub')) return
      id = e.pointerId
      last = angle(e)
      moved = 0
      acc = 0
      dragged.current = false
      hist = [{ a: 0, t: e.timeStamp }]
    }
    const move = (e: PointerEvent) => {
      if (e.pointerId !== id) return
      const a = angle(e)
      let d = a - last
      if (d > 180) d -= 360
      if (d < -180) d += 360
      last = a
      moved += Math.abs(d)
      if (!dragged.current) {
        if (moved < 4) return
        dragged.current = true
        el.setPointerCapture(id)
      }
      acc += d
      sp.set(sp.value + d) // 1:1 with the finger
      hist.push({ a: acc, t: e.timeStamp })
      while (hist.length > 2 && e.timeStamp - hist[0].t > 100) hist.shift()
    }
    const up = (e: PointerEvent) => {
      if (e.pointerId !== id) return
      id = -1
      if (!dragged.current) return
      setTimeout(() => (dragged.current = false)) // only the click that ends this drag is swallowed, never a later key press
      const a = hist[0]
      const z = hist[hist.length - 1]
      const dt = (z.t - a.t) / 1000
      const velocity = dt > 0.005 ? (z.a - a.a) / dt : 0
      const landing = sp.value + project(velocity, 0.995) // where the flick is heading
      const k = Math.round(-landing / STEP)
      sp.to(-k * STEP, { velocity })
      live.current.setSel(((k % N) + N) % N)
    }
    el.addEventListener('pointerdown', down)
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerup', up)
    el.addEventListener('pointercancel', up)
    return () => {
      sp.stop()
      el.removeEventListener('pointerdown', down)
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerup', up)
      el.removeEventListener('pointercancel', up)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // a tap (or a key) brings that family to the crown by the shorter way round
  const choose = (i: number) => {
    if (dragged.current) return void (dragged.current = false)
    const sp = spring.current
    if (sp) {
      let target = -i * STEP
      while (target - sp.value > 180) target -= 360
      while (target - sp.value < -180) target += 360
      sp.to(target)
    }
    setSel(i)
  }

  const fam = sel === null ? null : FAMILIES[sel]
  const n = sel === null ? total : counts[sel]
  return (
    <div ref={box} className="wheel" data-noswipe style={{ width: SIZE, height: SIZE }}>
      <div ref={ring} className="wheel-ring">
        {FAMILIES.map((f, i) => {
          const a = ((i * STEP - 90) * Math.PI) / 180
          return (
            <button
              key={f.key}
              type="button"
              className="wheel-node"
              aria-pressed={sel === i}
              data-empty={counts[i] ? undefined : ''}
              aria-label={`${f.name}, ${counts[i]} ${counts[i] === 1 ? 'bottle' : 'bottles'}`}
              style={{ left: SIZE / 2 + ORBIT * Math.cos(a), top: SIZE / 2 + ORBIT * Math.sin(a), '--c': f.color, '--i': i } as CSSProperties}
              onClick={() => choose(i)}
            >
              <span className="wheel-gem">
                <FamilyIcon family={f} />
              </span>
              <span className="wheel-label">{f.name}</span>
            </button>
          )
        })}
      </div>
      <button type="button" className="wheel-hub" onClick={() => setSel(null)} aria-label={fam ? `${fam.name}, ${n} bottles. Show every family` : `Every family, ${n} bottles`}>
        <span className="wheel-hub-name">{fam ? fam.name : 'Every family'}</span>
        <span className="wheel-hub-count" key={sel ?? 'all'}>
          {n ? `${n} ${n === 1 ? 'bottle' : 'bottles'}` : 'a gap to explore'}
        </span>
      </button>
    </div>
  )
}
