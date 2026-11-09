import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react'
import { axisValues, type Bottle } from './bottles'
import { createSpring } from './fluid'

/* The smelling strip. Paper, the name pencilled on it, the juice's stain at
 * the dipped tip. A bottle with no authored colour is plain paper. */
export function Strip({
  bottle,
  size,
  onClick,
  children,
}: {
  bottle: Bottle
  size: 'hero' | 'row'
  onClick?: () => void
  children?: ReactNode
}) {
  const style = bottle.stain ? ({ '--stain': bottle.stain } as CSSProperties) : undefined
  const cls = `strip strip--${size}${bottle.stain ? '' : ' strip--blank'}`
  const ref = useTilt<HTMLElement>(size === 'hero')
  const inner = (
    <span className="strip-in">
      <span className="strip-house">{bottle.house}</span>
      <span className="strip-name">{bottle.short}</span>
      {size === 'hero' && (bottle.family || !bottle.profile) ? (
        <span className="strip-family">{bottle.family ?? 'Not profiled yet'}</span>
      ) : null}
      {children}
    </span>
  )
  return onClick ? (
    <button type="button" className={cls} style={style} data-bottle={bottle.id} onClick={onClick} aria-label={`Open ${bottle.name}`} ref={ref as React.RefObject<HTMLButtonElement>}>
      {inner}
    </button>
  ) : (
    <div className={cls} style={style} data-bottle={bottle.id} ref={ref as React.RefObject<HTMLDivElement>}>
      {inner}
    </div>
  )
}

/* The hero strip is a physical thing under your finger: it presses in the
 * instant you touch it, leans toward where you are, and the light slides across
 * the paper. Let go and it springs back with a little life. Each axis is its
 * own spring, so a second touch mid-return takes over from where it is. */
function useTilt<T extends HTMLElement>(on: boolean) {
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
      rx.to((0.5 - y) * 7)
      ry.to((x - 0.5) * 9)
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
  }, [on])
  return ref
}

/* The trail it leaves: length is longevity, spread is projection, both from
 * the profile (0 to 10). No profile, no trail. */
export function Trail({ bottle }: { bottle: Bottle }) {
  const p = bottle.profile
  if (!p) return null
  const W = 400
  const len = 40 + (p.longevity / 10) * (W - 60)
  const spread = 3 + (p.projection / 10) * 17
  const cy = 23
  // a wake: widest just off the tip, thinning to nothing at its length
  const d = `M0 ${cy} C ${len * 0.18} ${cy - spread}, ${len * 0.55} ${cy - spread * 0.55}, ${len} ${cy} C ${len * 0.55} ${cy + spread * 0.55}, ${len * 0.18} ${cy + spread}, 0 ${cy} Z`
  return (
    <figure style={{ margin: 0 }}>
      <svg className="trail" viewBox={`0 0 ${W} 46`} preserveAspectRatio="none" role="img" aria-label={`Lasts ${p.longevity} of 10, carries ${p.projection} of 10`}>
        <defs>
          <linearGradient id={`t-${bottle.id}`} x1="0" x2="1">
            <stop offset="0" stopColor="var(--gold)" stopOpacity="0.9" />
            <stop offset="1" stopColor="var(--gold)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path className="trail-wake" d={d} fill={`url(#t-${bottle.id})`} />
        <line x1="0" x2={W} y1={cy} y2={cy} stroke="var(--rule)" strokeWidth="1" />
      </svg>
      <figcaption className="trail-cap">
        <span>Carries {p.projection}/10</span>
        <span>Lasts {p.longevity}/10</span>
      </figcaption>
    </figure>
  )
}

/* The profile in one line: eleven axes as gold density. */
export function Chroma({ bottle }: { bottle: Bottle }) {
  const axes = axisValues(bottle)
  if (!axes.length) return null
  return (
    <span className="chroma" aria-hidden>
      {axes.map((a, k) => (
        <i key={a.key} style={{ opacity: 0.08 + (a.value / 10) * 0.92, '--k': k } as CSSProperties} />
      ))}
    </span>
  )
}
