import { genericSpec, type BottleSpec } from './bottleModel'

/* The real bottles, by fragrance id (data.ts). Each entry is the bottle's form,
 * measured off the brand's own product photos (sources beside each, research
 * done 13 Nov 2026). Shapes, materials and colours only: no logos or artwork,
 * the label is set in the app's own type. A bottle not listed (the custom oud
 * blend, anything a user adds) gets a generic luxury flacon. Units: scene units,
 * a 50 ml bottle's body is about 0.95 tall. Widths are kept under MAX_WIDTH. */

const AESOP: BottleSpec = {
  // aesop.com FR43 / FR38 (the 2025/26 "Fragrant Fables" amber bottle)
  body: { form: 'cylinder', h: 0.95, w: 0.51, d: 0.51, corner: 0.12 },
  glass: { tint: '#7a4310', opacity: 'tinted', base: 0.14 },
  juice: { color: null, fill: 0.85 },
  neck: { h: 0.03, r: 0.07 },
  collar: { color: 'none', h: 0 },
  cap: { form: 'cylinder', h: 0.38, w: 0.3, material: 'black-matte' },
  label: { kind: 'print-white', style: 'sans', ink: '#efe6d2', w: 0.62, h: 0.2, y: 0.52 },
}
const DIOR_LCP = (juice: string): BottleSpec => ({
  // dior.com Y0840550 / Y0958160; Tatler on the Collection Privee couture caps
  body: { form: 'cylinder', h: 1.15, w: 0.55, d: 0.55, corner: 0.03 },
  glass: { tint: '#ffffff', opacity: 'clear', base: 0.15 },
  juice: { color: juice, fill: 0.9 },
  neck: { h: 0.03, r: 0.07 },
  collar: { color: 'none', h: 0 },
  cap: { form: 'ribbed', h: 0.37, w: 0.36, material: 'black-gloss' },
  label: { kind: 'paper', paper: '#ecebe7', w: 0.72, h: 0.36, y: 0.64 },
})

export const BOTTLE_SPECS: Record<string, BottleSpec> = {
  '1': AESOP, // Aesop Hwyl
  '2': AESOP, // Aesop Aurner
  // Byredo Mojave Ghost 100ml: byredo.com, notino (squat clear cylinder, glossy black bullet cap)
  '3': {
    body: { form: 'cylinder', h: 0.8, w: 0.78, d: 0.78, corner: 0.03 },
    glass: { tint: '#ffffff', opacity: 'clear', base: 0.14 },
    juice: { color: '#eef1e2', fill: 0.9 },
    neck: { h: 0.04, r: 0.07 },
    collar: { color: 'none', h: 0 },
    cap: { form: 'dome', h: 0.39, w: 0.5, material: 'black-gloss' },
    label: { kind: 'paper', style: 'sans', paper: '#f6f5f1', w: 0.85, h: 0.7, y: 0.5 },
  },
  '4': DIOR_LCP('#c7b3bf'), // Gris Dior
  '5': DIOR_LCP('#c9b55a'), // Ambre Nuit
  // Franck Olivier Night Touch 100ml: notino, fragrancenet (blue-teal square glass, blue square cap)
  '6': {
    body: { form: 'rect', h: 0.8, w: 0.8, d: 0.45, corner: 0.05 },
    glass: { tint: '#0d4a6b', opacity: 'tinted', base: 0.12 },
    juice: { color: null, fill: 0.85 },
    neck: { h: 0.03, r: 0.07 },
    collar: { color: 'silver', h: 0.06 },
    cap: { form: 'cube', h: 0.23, w: 0.4, material: 'resin', color: '#1e5fa8' },
    label: { kind: 'print-white', style: 'sans', w: 0.72, h: 0.22, y: 0.84 },
  },
  // Ibrahim Al Qurashi Spanish Tobacco 100ml: ramfabeauty, parfumo (blue fluted glass, gold fluted dome cap, gold plate)
  '7': {
    body: { form: 'cylinder', h: 1.2, w: 0.52, d: 0.52, corner: 0.04 },
    glass: { tint: '#1f5f99', opacity: 'tinted', base: 0.1 },
    juice: { color: null, fill: 0.9 },
    neck: { h: 0.02, r: 0.08 },
    collar: { color: 'gold', h: 0.07 },
    cap: { form: 'dome', h: 0.6, w: 0.5, material: 'gold' },
    label: { kind: 'plate', w: 0.5, h: 0.2, y: 0.5 },
  },
  // Le Labo standard 100ml lab bottle: lelabofragrances.com (the tobacco City Exclusive is TABAC 28)
  '8': {
    body: { form: 'cylinder', h: 1.05, w: 0.64, d: 0.64, corner: 0.08 },
    glass: { tint: '#ffffff', opacity: 'clear', base: 0.15 },
    juice: { color: null, fill: 0.88 },
    neck: { h: 0.03, r: 0.075 },
    collar: { color: 'none', h: 0 },
    cap: { form: 'cylinder', h: 0.33, w: 0.29, material: 'silver' },
    label: { kind: 'paper', style: 'typewriter', paper: '#f1efe9', ml: 100, w: 0.9, h: 0.5, y: 0.55 },
  },
  // Malin+Goetz Cannabis 50ml: malinandgoetz.co.uk, libertylondon (clear cylinder, short white cap, white print)
  '9': {
    body: { form: 'cylinder', h: 0.95, w: 0.48, d: 0.48, corner: 0.07 },
    glass: { tint: '#ffffff', opacity: 'clear', base: 0.13 },
    juice: { color: '#dcd98f', fill: 0.9 },
    neck: { h: 0.03, r: 0.07 },
    collar: { color: 'none', h: 0 },
    cap: { form: 'cylinder', h: 0.17, w: 0.19, material: 'white' },
    label: { kind: 'print-white', style: 'sans', w: 0.8, h: 0.5, y: 0.42 },
  },
  // Reef Pesca 100ml: notino, parfumo (frosted peach-orange block, stepped orange cap, tone-on-tone name)
  '10': {
    body: { form: 'rect', h: 1.05, w: 0.5, d: 0.3, corner: 0.04 },
    glass: { tint: '#f39a6a', opacity: 'opaque', base: 0.1 },
    juice: { color: null, fill: 0.9 },
    neck: { h: 0.03, r: 0.07 },
    collar: { color: 'none', h: 0 },
    cap: { form: 'slab', h: 0.42, w: 0.5, d: 0.3, material: 'resin', color: '#f26a3a' },
    label: { kind: 'print-black', style: 'sans', ink: '#c9501f', w: 0.8, h: 0.2, y: 0.55 },
  },
  // Tom Ford Noir Extreme 100ml: tomfordbeauty.com, escentual (smoked black block, full-width fluted gold cap, gold print)
  '11': {
    body: { form: 'rect', h: 0.95, w: 0.72, d: 0.4, corner: 0.05 },
    glass: { tint: '#2b2522', opacity: 'tinted', base: 0.16 },
    juice: { color: '#6b3f1c', fill: 0.85 },
    neck: { h: 0.02, r: 0.07 },
    collar: { color: 'none', h: 0 },
    cap: { form: 'slab', h: 0.34, w: 0.72, d: 0.4, material: 'gold' },
    label: { kind: 'print-white', style: 'sans', ink: '#c99a3c', w: 0.7, h: 0.28, y: 0.3 },
  },
  // CAVE Sloane Tones 50ml: cave-london.com product photo (sent by Jamal, 13 Nov 2026)
  '12': {
    body: { form: 'cylinder', h: 1.0, w: 0.56, d: 0.56, corner: 0.035 },
    glass: { tint: '#ffffff', opacity: 'clear', base: 0.13 },
    juice: { color: '#cbc47c', fill: 0.92 },
    neck: { h: 0.035, r: 0.075 },
    collar: { color: 'none', h: 0 },
    cap: { form: 'cylinder', h: 0.4, w: 0.37, material: 'black-gloss' },
    label: { kind: 'paper', style: 'typewriter', ml: 50, band: '#6b5f55', paper: '#ecebe6', w: 0.97, h: 0.62, y: 0.66 },
  },
  // Gissah Hudson II 200ml: fridaycharm, scentadvice (tall clear cylinder dressed in ornate silver, ball cap)
  '14': {
    body: { form: 'cylinder', h: 1.35, w: 0.55, d: 0.55, corner: 0.05 },
    glass: { tint: '#ffffff', opacity: 'clear', base: 0.1 },
    juice: { color: '#ece7a8', fill: 0.9 },
    neck: { h: 0.03, r: 0.085 },
    collar: { color: 'silver', h: 0.3 },
    cap: { form: 'sphere', h: 0.43, w: 0.43, material: 'silver' },
    label: { kind: 'plate', paper: '#c8c8cc', ink: '#2c3440', w: 0.5, h: 0.17, y: 0.55 },
  },
  // Diptyque Vetyverio 75ml: diptyqueparis.com, selfridges (flat oval lens, black block cap and collar, oval label)
  '15': {
    body: { form: 'oval', h: 0.85, w: 0.7, d: 0.3, corner: 0.1 },
    glass: { tint: '#ffffff', opacity: 'clear', base: 0.12 },
    juice: { color: '#efe7b5', fill: 0.9 },
    neck: { h: 0.03, r: 0.07 },
    collar: { color: 'black', h: 0.06 },
    cap: { form: 'slab', h: 0.31, w: 0.23, d: 0.16, material: 'black-matte' },
    label: { kind: 'paper', paper: '#f4f1ea', w: 0.62, h: 0.5, y: 0.5 },
  },
}

export const specFor = (id: string): BottleSpec => BOTTLE_SPECS[id] ?? genericSpec(id)
