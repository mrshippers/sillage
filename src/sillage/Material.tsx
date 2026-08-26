import { useEffect } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { useReducedMotion } from './useReducedMotion'
import { radius as R, shadow, tint, veil } from './tokens'
import type { Fragrance } from './data'

/* The material system.
 *
 * The single biggest reason the old app read as amateur: every surface was one
 * flat `radial-gradient(...)` with a 1px hairline border. The brainstorm
 * prototypes build their surfaces as a stack - photo, tint, shade, grain,
 * foil, rim light - which is what makes them read as crafted objects rather
 * than as coloured rectangles.
 *
 * We have no per-scent photography (hotlinking placeholder stock was correctly
 * banned, and inventing imagery for a real wardrobe is not on). So we ship
 * every OTHER layer of that stack, which is where most of the perceived craft
 * actually lives: grain, tinted depth, directional light, rim light and a
 * whisper of foil.
 *
 * Light direction is derived from the scent's own authored axes - warm scents
 * light from a low warm angle, fresh ones from a high cool angle - so the
 * shelf reads as individuated objects rather than one template recoloured.
 */

/** Where the light comes from, from the scent's real profile. */
function lightAngle(f: Fragrance): { x: number; y: number } {
  // fresh/green scents catch a high, raking light; warm/resinous ones a low one
  const high = (f.freshness + f.green) / 2 // 0..10
  return { x: 22 + (10 - high) * 1.6, y: 8 + (10 - high) * 2.4 }
}

export interface SurfaceProps {
  scent: Fragrance
  height?: number | string
  radius?: number
  /** hero surfaces earn the foil and the heavier shadow */
  hero?: boolean
  /** how strongly the bottom veil darkens, for text legibility */
  shade?: number
  children?: ReactNode
  style?: CSSProperties
  className?: string
  onClick?: () => void
}

/** A crafted material surface tinted by one scent. */
export function Surface({
  scent,
  height,
  radius = R.md,
  hero = false,
  shade = 0.78,
  children,
  style,
  className,
  onClick,
}: SurfaceProps) {
  const L = lightAngle(scent)
  return (
    <div
      className={`surface${hero ? ' surface-hero' : ''}${onClick ? ' surface-tap' : ''}${className ? ' ' + className : ''}`}
      onClick={onClick}
      style={{
        height,
        borderRadius: radius,
        position: 'relative',
        overflow: 'hidden',
        background: veil(0.96),
        boxShadow: hero ? shadow.hero : shadow.card,
        ...style,
      }}
    >
      {/* tint - the scent's authored colour, lifted so it survives the veil */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(130% 105% at ${L.x}% ${L.y}%, ${tint(scent.color, 0.92)} 0%, ${tint(scent.color, 0.34)} 38%, transparent 72%)`,
        }}
      />
      {/* depth - a second, cooler pool opposite the light for volume */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(90% 70% at ${100 - L.x}% ${100 - L.y}%, ${tint(scent.color, 0.28, 0.35)} 0%, transparent 62%)`,
        }}
      />
      {/* shade - legibility veil, weighted to the bottom where the text sits */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(180deg, ${veil(0.1)} 0%, ${veil(0.28)} 42%, ${veil(shade)} 100%)`,
        }}
      />
      {/* grain - the layer that stops it reading as a CSS gradient */}
      <div className="grain" />
      {/* foil - a whisper of iridescence, hero surfaces only */}
      {hero && <div className="foil" />}
      {/* rim light - the crafted edge */}
      <div className="rim" style={{ borderRadius: radius }} />
      {children}
    </div>
  )
}

/** The living mesh behind Home. Six coloured nodes drift on independent
 * sine/cosine paths - the prototype's signature Home surface, which the old
 * build replaced with a static gradient (and an unmoored rainbow blur it
 * called "aurora", which was this file's sheen layer misused as a background).
 *
 * Ambient, never competing with a task, and fully stilled under
 * prefers-reduced-motion - one static frame is painted instead. */
export function Mesh({ opacity = 1 }: { opacity?: number }) {
  const reduced = useReducedMotion()

  useEffect(() => {
    const cv = document.getElementById('sil-mesh') as HTMLCanvasElement | null
    if (!cv) return
    const ctx = cv.getContext('2d')
    if (!ctx) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let W = 0
    let H = 0
    const size = () => {
      const r = cv.getBoundingClientRect()
      W = r.width
      H = r.height
      cv.width = Math.max(1, W * dpr)
      cv.height = Math.max(1, H * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    size()
    window.addEventListener('resize', size)

    const nodes = [
      { c: '#caa25f', ax: 0.32, ay: 0.22, sx: 0.13, sy: 0.17, p: 0 },
      { c: '#8b5c8f', ax: 0.28, ay: 0.3, sx: 0.11, sy: 0.14, p: 1.7 },
      { c: '#3f7f76', ax: 0.3, ay: 0.26, sx: 0.15, sy: 0.12, p: 3.1 },
      { c: '#b5577f', ax: 0.26, ay: 0.24, sx: 0.12, sy: 0.16, p: 4.4 },
      { c: '#e6cf9b', ax: 0.34, ay: 0.2, sx: 0.1, sy: 0.15, p: 5.6 },
      { c: '#2c2752', ax: 0.3, ay: 0.32, sx: 0.14, sy: 0.11, p: 2.3 },
    ]

    let raf = 0
    let t = 0
    const paint = () => {
      ctx.globalCompositeOperation = 'source-over'
      ctx.fillStyle = '#160d18'
      ctx.fillRect(0, 0, W, H)
      for (const n of nodes) {
        const x = (0.5 + Math.sin(t * n.sx + n.p) * n.ax) * W
        const y = (0.5 + Math.cos(t * n.sy + n.p) * n.ay) * H
        const rad = Math.max(W, H) * 0.6
        const g = ctx.createRadialGradient(x, y, 0, x, y, rad)
        g.addColorStop(0, n.c)
        g.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.globalAlpha = 0.55
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(x, y, rad, 0, 6.2832)
        ctx.fill()
      }
      ctx.globalAlpha = 1
    }

    if (reduced) {
      // one settled frame, no loop
      t = 2.4
      paint()
    } else {
      const loop = () => {
        t += 0.006
        paint()
        raf = requestAnimationFrame(loop)
      }
      loop()
    }

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', size)
    }
  }, [reduced])

  return (
    <div className="mesh-wrap" style={{ opacity }} aria-hidden="true">
      <canvas id="sil-mesh" className="mesh" />
      {!reduced && <div className="mesh-sheen" />}
    </div>
  )
}
