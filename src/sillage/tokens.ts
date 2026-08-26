/* Sillage design tokens - the single source of truth for every colour, size,
 * radius, duration and easing in the app. Nothing downstream hardcodes a
 * literal; components read from here and the CSS layer reads the custom
 * properties emitted by cssVars() below.
 *
 * Direction (from .superpowers/brainstorm/.../art-direction.html): "A as the
 * calm shell, C's living visualiser as the signature surface." The shell is
 * restrained and editorial; the crafted material is spent on the hero surfaces
 * only. Letterboxd is restrained - the magic is one layer in.
 */

export const color = {
  // ground
  ground: '#050407',
  groundLift: '#0a0710',
  groundPlum: '#170f1c',
  device: '#08060c',
  bezel: '#16131c',

  // ink
  ink: '#fbf8f3',
  inkWarm: '#f3e7d2',

  // gold - the one accent
  gold: '#caa25f',
  goldLight: '#e6cf9b',
  goldPale: '#fff5e0',
  goldMid: '#d8b780',
  goldDeep: '#9a7a45',

  // family / atmosphere
  plum: '#8b5c8f',
  plumDeep: '#5b2a52',
  plumNode: '#2c2752',
  teal: '#3f7f76',
  tealNode: '#5f9e8e',
  ember: '#b5577f',
  spice: '#b5572e',

  // iridescent flecks (logo + foil only)
  iris: ['#ff9bc4', '#8fd0c4', '#b89bff'] as const,

  // verdict scale
  good: '#7ab87a',
  fair: '#c49a6a',
  poor: '#a06060',
} as const

/** Ink at an alpha. Never write rgba(251,248,243,x) by hand. */
export const ink = (a: number) => `rgba(251,248,243,${a})`
/** Gold at an alpha. */
export const gold = (a: number) => `rgba(202,162,95,${a})`
/** Pure white at an alpha - hairlines, rim light, specular only. */
export const white = (a: number) => `rgba(255,255,255,${a})`
/** The ground at an alpha - veils over material. */
export const veil = (a: number) => `rgba(8,6,9,${a})`

export const font = {
  display: "'Fraunces', Georgia, serif",
  body: "'Archivo', 'Helvetica Neue', system-ui, sans-serif",
} as const

/* Type scale - 8 steps, no fractional sizes. Replaces the 19 hand-tuned sizes
 * (six of them fractional) that made the old hierarchy read as unsystematic. */
export const type = {
  hero: 40,   // scent name on a hero surface
  title: 30,  // page title
  sub: 22,    // section hero / stat value
  lead: 17,   // scent name in a row
  body: 14,
  small: 12,
  micro: 10,  // tracked caps
  tiny: 9,    // tracked caps, the floor - nothing smaller ships
} as const

/* Tracked-caps recipe. Used for every eyebrow/label so they are identical. */
export const caps = (size: number = type.tiny, alpha = 0.5) => ({
  fontFamily: font.body,
  fontSize: size,
  letterSpacing: '0.2em',
  textTransform: 'uppercase' as const,
  color: ink(alpha),
})

/* Radius scale - 5 steps, replaces 13 ad-hoc radii.
 * NOTE: `tag` is 2px by house rule. Pill / lozenge / fully-rounded capsule
 * shapes are BANNED across every build (feedback_no_ai_pill_shapes). There is
 * deliberately no `full` value here so one cannot be reached for. */
export const radius = {
  tag: 2,
  sm: 8,
  md: 14,
  lg: 20,
  phone: 44,
} as const

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, huge: 48 } as const

/* Motion - durations and easings live here, never inline (UI/motion doctrine
 * §10). Product UI stays under 300ms; exits are ~0.7x the enter. */
export const motion = {
  press: 80,
  fast: 120,
  base: 160,
  slow: 240,
  exit: 110,
  /** entering / appearing */
  enter: 'cubic-bezier(0.16, 1, 0.3, 1)',
  /** exiting / disappearing */
  leave: 'cubic-bezier(0.4, 0, 1, 1)',
  /** moving between two on-screen states */
  move: 'cubic-bezier(0.4, 0, 0.2, 1)',
} as const

export const shadow = {
  card: `0 24px 56px ${veil(0.55)}`,
  hero: `0 32px 72px ${veil(0.6)}`,
  device: `0 50px 100px rgba(0,0,0,.7), inset 0 1px 0 ${white(0.1)}`,
  lift: `0 8px 22px ${veil(0.5)}`,
} as const

/* Film grain - inline SVG feTurbulence, no network asset. This is the single
 * biggest reason the prototype surfaces read as material rather than as a flat
 * CSS gradient. Applied via .grain in the style layer. */
export const GRAIN_URI =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='90' height='90'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")"

/* Iridescent foil ramp - logo flecks, card foil, splash sheen. */
export const FOIL = 'linear-gradient(115deg,#ff6ec4,#7873f5,#4ade80,#fef08a,#ff9b54,#ff6ec4)'

/* ---------------------------------------------------------------------------
 * Colour maths. The 15 authored f.color values are honest scent colours but
 * they are all mid-tone and muddy, so pushed through a heavy veil every card
 * collapsed to the same near-black rectangle. We do NOT edit the data (colour
 * is authored, like every other field). Instead the render lifts chroma so the
 * same datum is legible as a surface.
 * ------------------------------------------------------------------------- */

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  const n = parseInt(h.length === 3 ? h.split('').map(c => c + c).join('') : h, 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

const clamp = (n: number, lo = 0, hi = 255) => Math.min(hi, Math.max(lo, n))

/** Lift a scent's authored colour toward legibility: raise value, push chroma
 * away from grey. `amount` 0 = untouched, 1 = fully lifted. */
export function lift(hex: string, amount = 1): string {
  const [r, g, b] = hexToRgb(hex)
  const mean = (r + g + b) / 3
  const push = (c: number) => clamp(Math.round(c + (c - mean) * 0.85 * amount + 42 * amount))
  return `rgb(${push(r)},${push(g)},${push(b)})`
}

/** A scent's colour at an alpha, lifted - the tint layer of a material card. */
export function tint(hex: string, alpha: number, amount = 1): string {
  const [r, g, b] = hexToRgb(hex)
  const mean = (r + g + b) / 3
  const push = (c: number) => clamp(Math.round(c + (c - mean) * 0.85 * amount + 42 * amount))
  return `rgba(${push(r)},${push(g)},${push(b)},${alpha})`
}

/* ---------------------------------------------------------------------------
 * CSS custom properties, emitted from the objects above so the CSS layer and
 * the TSX layer can never drift apart.
 * ------------------------------------------------------------------------- */
export function cssVars(): string {
  return `
    --ground:${color.ground}; --ground-lift:${color.groundLift}; --ground-plum:${color.groundPlum};
    --device:${color.device}; --bezel:${color.bezel};
    --ink:${color.ink}; --ink-warm:${color.inkWarm};
    --gold:${color.gold}; --gold-light:${color.goldLight}; --gold-pale:${color.goldPale};
    --gold-mid:${color.goldMid}; --gold-deep:${color.goldDeep};
    --plum:${color.plum}; --teal:${color.teal};
    --serif:${font.display}; --sans:${font.body};
    --t-hero:${type.hero}px; --t-title:${type.title}px; --t-sub:${type.sub}px;
    --t-lead:${type.lead}px; --t-body:${type.body}px; --t-small:${type.small}px;
    --t-micro:${type.micro}px; --t-tiny:${type.tiny}px;
    --r-tag:${radius.tag}px; --r-sm:${radius.sm}px; --r-md:${radius.md}px;
    --r-lg:${radius.lg}px; --r-phone:${radius.phone}px;
    --s-xs:${space.xs}px; --s-sm:${space.sm}px; --s-md:${space.md}px; --s-lg:${space.lg}px;
    --s-xl:${space.xl}px; --s-xxl:${space.xxl}px; --s-huge:${space.huge}px;
    --d-press:${motion.press}ms; --d-fast:${motion.fast}ms; --d-base:${motion.base}ms;
    --d-slow:${motion.slow}ms; --d-exit:${motion.exit}ms;
    --e-enter:${motion.enter}; --e-leave:${motion.leave}; --e-move:${motion.move};
    --grain:${GRAIN_URI}; --foil:${FOIL};
    --sh-card:${shadow.card}; --sh-hero:${shadow.hero}; --sh-lift:${shadow.lift};
  `
}
