import { color } from './tokens'

/* Geometry for the Sillage mark, kept free of JSX so the React component, the
 * favicon generator and the drift test can all read the SAME source. A second
 * hand-maintained copy of this maths in a build script would drift silently -
 * the tab icon and the in-app mark would slowly stop being the same logo. */

/** Seeded PRNG so the mark is byte-identical on every render and every reload.
 * An unseeded Math.random() would make the spritz shimmer between renders. */
export function seeded(seed: number) {
  let s = seed
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}

/** Cubic Bezier: nozzle -> down and across to the lower left. */
export function bezier(t: number): [number, number] {
  const p = [
    [150, 52],
    [120, 78],
    [80, 108],
    [34, 172],
  ]
  const u = 1 - t
  const x = u * u * u * p[0][0] + 3 * u * u * t * p[1][0] + 3 * u * t * t * p[2][0] + t * t * t * p[3][0]
  const y = u * u * u * p[0][1] + 3 * u * u * t * p[1][1] + 3 * u * t * t * p[2][1] + t * t * t * p[3][1]
  return [x, y]
}

export interface Mote {
  x: number
  y: number
  r: number
  o: number
  fill: string
}

export function buildSpritz(count = 82): Mote[] {
  const rand = seeded(11)
  const motes: Mote[] = []
  for (let i = 0; i < count; i++) {
    const t = i / count
    const [bx, by] = bezier(t)
    const spread = 6 + t * 46 // the cone widens along the trail
    const x = bx + (rand() - 0.5) * spread
    const y = by + (rand() - 0.5) * spread * 0.9
    const r = Math.max(0.4, 2.1 * (1 - t * 0.55) + (rand() - 0.5) * 0.55) // motes shrink
    const o = Math.max(0.07, 0.9 - t * 0.84) // and fade
    // ~15% of the trail catches the light as iridescence, the rest is gold
    const fill = rand() < 0.15 ? color.iris[Math.floor(rand() * color.iris.length)] : 'url(#sil-gold)'
    motes.push({ x, y, r, o, fill })
  }
  return motes
}
