/* Sillage design tokens, "atelier" (30 Sep 2026).
 *
 * Every bottle is a smelling strip: the paper blotter a perfumer dips and
 * writes on. The ground is the brand plum at night; the one light object on
 * any screen is the strip you are choosing; the only colour a scent brings is
 * the stain its juice leaves on the tip (its authored `color`, real data).
 * Gold is the liquid: active states and scores, nothing else.
 *
 * The CSS reads these as custom properties (see cssVars and atelier.css).
 */
export const color = {
  // ground: the brand plum, at night
  ground: '#110b13',
  groundRaised: '#1a121d',
  rule: '#2c2230',

  // the strip
  paper: '#ece6da',
  paperShade: '#d9d1c3',
  pencil: '#3a3330',
  pencilSoft: '#5f5853', // 4.61:1 on the paper's shade (was #6f6660 at 3.70:1),

  // ink on the ground
  ink: '#fbf8f3',
  graphite: '#a39aa0',

  // gold, the liquid (the mark's gradient uses the named stops)
  gold: '#caa25f',
  goldLight: '#e6cf9b',
  goldPale: '#fff5e0',
  goldMid: '#d8b780',
  goldDeep: '#9a7a45',
  plum: '#8b5c8f',

  // glass: the tab bar, which has the strips passing under it. The tint is the
  // raised ground, so the glass is a smoked flacon and not a grey pane; the ink
  // is the one ink, drawn at two fixed strengths (see "glass" in atelier.css).
  glassTint: '#1a121d',
  glassInk: '#fbf8f3',

  // iridescent: the logo mark's spritz (logo-v4) and the foil on the holographic card, nowhere else
  iris: ['#ff9bc4', '#8fd0c4', '#b89bff'] as const,
} as const

export const font = {
  display: "'Bodoni Moda Variable', 'Bodoni 72', Didot, Georgia, serif",
  body: "'Jost Variable', 'Futura', 'Avenir Next', system-ui, sans-serif",
} as const

export function cssVars(): Record<string, string> {
  return {
    '--ground': color.ground,
    '--ground-raised': color.groundRaised,
    '--rule': color.rule,
    '--paper': color.paper,
    '--paper-shade': color.paperShade,
    '--pencil': color.pencil,
    '--pencil-soft': color.pencilSoft,
    '--ink': color.ink,
    '--graphite': color.graphite,
    '--gold': color.gold,
    '--gold-light': color.goldLight,
    '--glass-tint': color.glassTint,
    '--glass-ink': color.glassInk,
    '--plum': color.plum,
    '--iris-1': color.iris[0],
    '--iris-2': color.iris[1],
    '--iris-3': color.iris[2],
    '--serif': font.display,
    '--sans': font.body,
  }
}

export function hexToRgb(hex: string | null | undefined): [number, number, number] | null {
  const m = /^#?([0-9a-f]{6})$/i.exec((hex ?? '').trim())
  if (!m) return null
  const n = parseInt(m[1], 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}
