import type { CSSProperties, ReactNode } from 'react'
import { axisValues, type Bottle } from './bottles'

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
    <button type="button" className={cls} style={style} onClick={onClick} aria-label={`Open ${bottle.name}`}>
      {inner}
    </button>
  ) : (
    <div className={cls} style={style}>
      {inner}
    </div>
  )
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
        <path d={d} fill={`url(#t-${bottle.id})`} />
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
      {axes.map(a => (
        <i key={a.key} style={{ opacity: 0.08 + (a.value / 10) * 0.92 }} />
      ))}
    </span>
  )
}
