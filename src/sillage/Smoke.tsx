import { useEffect, useRef } from 'react'
import { color, hexToRgb } from './tokens'

/* The smoke field: soft plumes rising behind every page, like sillage hanging
 * in a room. New plumes take the colour of the strip in front of you, so the
 * room changes colour as the old smoke clears. Drawn at a quarter resolution
 * and stretched, which is both the blur and the reason it is cheap. It stops
 * when the tab is hidden; under reduced motion it paints one still frame. */

const SCALE = 0.25

type Plume = { x: number; y: number; vx: number; vy: number; r: number; life: number; max: number; seed: number; col: [number, number, number] }

export default function Smoke({ tint }: { tint: string | null }) {
  const ref = useRef<HTMLCanvasElement>(null)
  const tintRef = useRef(tint)
  useEffect(() => {
    tintRef.current = tint
  }, [tint])

  useEffect(() => {
    const c = ref.current
    const ctx = c?.getContext('2d')
    if (!c || !ctx) return
    const plum = hexToRgb(color.plum)!
    const gold = hexToRgb(color.gold)!
    let W = 0
    let H = 0
    let raf = 0
    let t = 0
    const ps: Plume[] = []
    const resize = () => {
      W = Math.max(1, Math.round(window.innerWidth * SCALE))
      H = Math.max(1, Math.round(window.innerHeight * SCALE))
      c.width = W
      c.height = H
    }
    const spawn = (): Plume => {
      const k = Math.random()
      const own = hexToRgb(tintRef.current)
      return {
        x: W * Math.random(),
        y: H * 1.08,
        vx: (Math.random() - 0.5) * 0.08,
        vy: -(0.07 + Math.random() * 0.1),
        r: W * (0.16 + Math.random() * 0.2),
        life: 0,
        max: 520 + Math.random() * 380,
        seed: Math.random() * 6.28,
        col: own && k < 0.55 ? own : k < 0.8 ? plum : gold,
      }
    }
    const step = () => {
      t++
      for (let i = ps.length - 1; i >= 0; i--) {
        const p = ps[i]
        p.life++
        p.vx += Math.sin(p.y * 0.05 + p.seed + t * 0.006) * 0.004 // the curl
        p.vx *= 0.985
        p.x += p.vx
        p.y += p.vy
        p.r += 0.02
        if (p.life >= p.max || p.y < -p.r) ps[i] = spawn()
      }
    }
    const draw = () => {
      ctx.clearRect(0, 0, W, H)
      ctx.globalCompositeOperation = 'lighter'
      for (const p of ps) {
        const a = Math.sin(Math.min(p.life / p.max, 1) * Math.PI) * 0.3
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r)
        g.addColorStop(0, `rgba(${p.col[0]},${p.col[1]},${p.col[2]},${a})`)
        g.addColorStop(1, `rgba(${p.col[0]},${p.col[1]},${p.col[2]},0)`)
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, 6.2832)
        ctx.fill()
      }
    }
    const frame = () => {
      step()
      draw()
      raf = requestAnimationFrame(frame)
    }
    const start = () => {
      if (!raf && !document.hidden) raf = requestAnimationFrame(frame)
    }
    const stop = () => {
      cancelAnimationFrame(raf)
      raf = 0
    }
    const vis = () => (document.hidden ? stop() : start())

    resize()
    for (let i = 0; i < 14; i++) {
      const p = spawn()
      p.y = Math.random() * H
      p.life = Math.random() * p.max
      ps.push(p)
    }
    window.addEventListener('resize', resize)
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) draw()
    else {
      document.addEventListener('visibilitychange', vis)
      start()
    }
    return () => {
      stop()
      window.removeEventListener('resize', resize)
      document.removeEventListener('visibilitychange', vis)
    }
  }, [])

  return <canvas ref={ref} className="smoke" aria-hidden />
}
