import { useEffect, useRef } from 'react'
import type { CSSProperties } from 'react'

// Ambient drifting smoke, vanilla canvas, no deps. Used behind the phone and
// inside the splash. Colours are the Sillage palette (gold / plum / ember).
export default function Smoke({ opacity = 0.5, count = 16, centered = false, style }: {
  opacity?: number
  count?: number
  centered?: boolean
  style?: CSSProperties
}) {
  const ref = useRef<HTMLCanvasElement | null>(null)
  useEffect(() => {
    const c = ref.current
    if (!c) return
    const ctx = c.getContext('2d')
    if (!ctx) return
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let W = 0, H = 0, raf = 0
    const cols = [[202, 162, 95], [139, 92, 143], [181, 87, 46]]
    type P = { x: number; y: number; vx: number; vy: number; r: number; life: number; max: number; seed: number; col: number[] }
    const ps: P[] = []
    const resize = () => {
      const r = c.getBoundingClientRect()
      W = r.width; H = r.height
      c.width = W * dpr; c.height = H * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    const spawn = (): P => ({
      x: centered ? W * (0.3 + Math.random() * 0.4) : W * Math.random(),
      y: H * 1.04, vx: (Math.random() - 0.5) * 0.25, vy: -(0.25 + Math.random() * 0.4),
      r: 28 + Math.random() * 44, life: Math.random() * 180, max: 320 + Math.random() * 180,
      seed: Math.random() * 6.28, col: cols[(Math.random() * cols.length) | 0],
    })
    resize()
    window.addEventListener('resize', resize)
    for (let i = 0; i < count; i++) { const p = spawn(); p.y = Math.random() * H; ps.push(p) }
    let t = 0
    const peak = opacity * 0.18
    const frame = () => {
      t++
      ctx.clearRect(0, 0, W, H)
      ctx.globalCompositeOperation = 'lighter'
      for (let i = ps.length - 1; i >= 0; i--) {
        const p = ps[i]
        p.life++
        const n = Math.sin(p.y * 0.012 + p.seed + t * 0.01) * 0.4
        p.vx += n * 0.02; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.r += 0.28
        const pr = p.life / p.max
        const a = Math.sin(Math.min(pr, 1) * Math.PI) * peak
        if (pr >= 1 || p.y < -90) { ps.splice(i, 1); ps.push(spawn()); continue }
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r)
        g.addColorStop(0, `rgba(${p.col[0]},${p.col[1]},${p.col[2]},${a})`)
        g.addColorStop(1, `rgba(${p.col[0]},${p.col[1]},${p.col[2]},0)`)
        ctx.fillStyle = g
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.2832); ctx.fill()
      }
      raf = requestAnimationFrame(frame)
    }
    frame()
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [opacity, count, centered])
  return <canvas ref={ref} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', filter: 'blur(22px)', pointerEvents: 'none', ...style }} />
}
