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

/** Static SVG string for the favicon / app icon, generated from the same
 * geometry as the React component. `npm run gen:favicon` writes this to
 * public/favicon.svg; a test asserts the two never diverge. */
export function markSvgString(): string {
  const circles = buildSpritz()
    .map(
      m =>
        `<circle cx="${m.x.toFixed(2)}" cy="${m.y.toFixed(2)}" r="${m.r.toFixed(2)}" fill="${m.fill}" opacity="${m.o.toFixed(3)}"/>`,
    )
    .join('')
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">` +
    `<defs>` +
    `<radialGradient id="sil-gold" cx="50%" cy="50%" r="50%">` +
    `<stop offset="0%" stop-color="${color.goldPale}"/>` +
    `<stop offset="55%" stop-color="${color.goldLight}"/>` +
    `<stop offset="100%" stop-color="#b78a47"/>` +
    `</radialGradient>` +
    `<radialGradient id="sil-bg" cx="32%" cy="100%" r="125%">` +
    `<stop offset="0%" stop-color="#36203a"/>` +
    `<stop offset="46%" stop-color="#211624"/>` +
    `<stop offset="100%" stop-color="#110b14"/>` +
    `</radialGradient>` +
    `<filter id="sil-soft"><feGaussianBlur stdDeviation="1.1"/></filter>` +
    `<filter id="sil-blur"><feGaussianBlur stdDeviation="1.4"/></filter>` +
    `<filter id="sil-core"><feGaussianBlur stdDeviation="4.6"/></filter>` +
    `</defs>` +
    `<rect width="200" height="200" fill="url(#sil-bg)"/>` +
    `<circle cx="40" cy="180" r="76" fill="${color.gold}" opacity="0.11"/>` +
    `<circle cx="170" cy="44" r="60" fill="${color.plum}" opacity="0.10"/>` +
    `<g fill="${color.ink}" opacity="0.4" filter="url(#sil-soft)" transform="rotate(28 160 40)">` +
    `<rect x="153" y="30" width="13" height="40" rx="6.2"/>` +
    `<rect x="156" y="23" width="7" height="8" rx="2"/>` +
    `<rect x="157" y="16" width="5.5" height="7" rx="1.8"/>` +
    `</g>` +
    `<g filter="url(#sil-blur)">${circles}</g>` +
    `<circle cx="150" cy="52" r="7.5" fill="url(#sil-gold)" filter="url(#sil-core)" opacity="0.95"/>` +
    `<circle cx="150" cy="52" r="3.6" fill="#fff7e6"/>` +
    `</svg>`
  )
}
