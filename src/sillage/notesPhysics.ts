/* The notes field: every note is a body that drifts, is drawn gently to the
 * middle, and nudges its neighbours apart. Pure, so it can be tested and so a
 * still layout (reduced motion) is just the same step run until it settles. */

export type Body = { x: number; y: number; vx: number; vy: number; r: number; held?: boolean; seed: number }

/** radius from how many bottles carry the note; the most carried is the biggest */
export function radiusFor(count: number, max: number, width: number): number {
  const lo = width * 0.108 // wide enough that the longest single word sits on one line
  const hi = width * 0.17
  return max <= 1 ? (lo + hi) / 2 : lo + ((count - 1) / (max - 1)) * (hi - lo)
}

export function seedBodies(radii: number[], w: number, h: number): Body[] {
  // a deterministic spiral, so the field opens the same way each time
  return radii.map((r, i) => {
    const a = i * 2.4
    const d = Math.sqrt(i + 0.5) * Math.min(w, h) * 0.11
    return { x: w / 2 + Math.cos(a) * d, y: h / 2 + Math.sin(a) * d, vx: 0, vy: 0, r, seed: i * 1.7 }
  })
}

export function stepField(bodies: Body[], w: number, h: number, t: number, drift = 1): void {
  const pad = 3
  for (const b of bodies) {
    if (b.held) continue
    b.vx += (w / 2 - b.x) * 0.0006 + Math.cos(t * 0.011 + b.seed) * 0.012 * drift
    b.vy += (h / 2 - b.y) * 0.0006 + Math.sin(t * 0.013 + b.seed * 1.3) * 0.012 * drift
  }
  for (let i = 0; i < bodies.length; i++) {
    for (let j = i + 1; j < bodies.length; j++) {
      const a = bodies[i]
      const b = bodies[j]
      const dx = b.x - a.x
      const dy = b.y - a.y
      const d = Math.hypot(dx, dy) || 0.01
      const overlap = a.r + b.r + pad - d
      if (overlap <= 0) continue
      const nx = dx / d
      const ny = dy / d
      const push = overlap * 0.08
      // a held note is immovable: the other takes the whole nudge
      const wa = a.held ? 0 : b.held ? 1 : 0.5
      const wb = b.held ? 0 : a.held ? 1 : 0.5
      a.vx -= nx * push * wa * 2
      a.vy -= ny * push * wa * 2
      b.vx += nx * push * wb * 2
      b.vy += ny * push * wb * 2
    }
  }
  for (const b of bodies) {
    if (b.held) continue
    b.vx *= 0.94
    b.vy *= 0.94
    b.x += b.vx
    b.y += b.vy
    // soft walls
    if (b.x < b.r) b.vx += (b.r - b.x) * 0.2
    if (b.x > w - b.r) b.vx -= (b.x - (w - b.r)) * 0.2
    if (b.y < b.r) b.vy += (b.r - b.y) * 0.2
    if (b.y > h - b.r) b.vy -= (b.y - (h - b.r)) * 0.2
  }
}
