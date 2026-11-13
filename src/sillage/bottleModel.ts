import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'

/* One bottle, built from a spec. A spec describes a real bottle's form (from
 * the brand's own product photos, see bottleSpecs.ts) without its artwork: no
 * logos, only the house and name set in the app's own type, the way a
 * collector's label would read. Units are scene units, 1 = the body height of
 * a typical 50 ml bottle. */

export type LabelSource = { id: string; house: string; name: string; stain: string | null; notes?: string[] }

export type BottleSpec = {
  body: { form: 'rect' | 'cylinder' | 'oval'; h: number; w: number; d: number; corner: number }
  glass: { tint: string; opacity: 'clear' | 'tinted' | 'opaque'; base: number }
  juice: { color: string | null; fill: number }
  neck: { h: number; r: number }
  collar: { color: 'gold' | 'silver' | 'black' | 'none'; h: number }
  cap: { form: 'cylinder' | 'cube' | 'sphere' | 'disc' | 'dome' | 'slab' | 'ribbed'; h: number; w: number; d?: number; material: CapMaterial; color?: string }
  label: { kind: 'paper' | 'print-white' | 'print-black' | 'plate' | 'none'; w: number; h: number; y: number; paper?: string; ink?: string; style?: 'classic' | 'typewriter' | 'sans'; ml?: number; band?: string }
}
export type CapMaterial = 'gold' | 'silver' | 'gunmetal' | 'black-matte' | 'black-gloss' | 'white' | 'wood' | 'crystal' | 'bronze' | 'resin'

const GENERIC: BottleSpec[] = [
  {
    body: { form: 'rect', h: 0.78, w: 0.6, d: 0.42, corner: 0.075 },
    glass: { tint: '#ffffff', opacity: 'clear', base: 0.09 },
    juice: { color: null, fill: 0.76 },
    neck: { h: 0.07, r: 0.06 },
    collar: { color: 'gold', h: 0.03 },
    cap: { form: 'cube', h: 0.24, w: 0.24, material: 'gunmetal' },
    label: { kind: 'paper', w: 0.72, h: 0.56, y: 0.5 },
  },
  {
    body: { form: 'rect', h: 0.96, w: 0.5, d: 0.4, corner: 0.07 },
    glass: { tint: '#ffffff', opacity: 'clear', base: 0.09 },
    juice: { color: null, fill: 0.76 },
    neck: { h: 0.07, r: 0.06 },
    collar: { color: 'gold', h: 0.03 },
    cap: { form: 'cylinder', h: 0.3, w: 0.24, material: 'gold' },
    label: { kind: 'paper', w: 0.72, h: 0.56, y: 0.5 },
  },
  {
    body: { form: 'rect', h: 0.66, w: 0.7, d: 0.36, corner: 0.08 },
    glass: { tint: '#ffffff', opacity: 'clear', base: 0.09 },
    juice: { color: null, fill: 0.76 },
    neck: { h: 0.07, r: 0.06 },
    collar: { color: 'gold', h: 0.03 },
    cap: { form: 'cube', h: 0.24, w: 0.24, material: 'black-gloss' },
    label: { kind: 'paper', w: 0.72, h: 0.56, y: 0.5 },
  },
]

/** a stable small number from an id, so a bottle keeps its shape and cap */
export function seedOf(id: string): number {
  let h = 2166136261
  for (let i = 0; i < id.length; i++) h = Math.imul(h ^ id.charCodeAt(i), 16777619)
  return (h >>> 0) % 997
}

export const genericSpec = (id: string): BottleSpec => GENERIC[seedOf(id) % GENERIC.length]

/** the widest a bottle gets, for spacing them on a shelf */
export const MAX_WIDTH = 0.82

const DISPLAY = "'Bodoni Moda Variable', Didot, serif"
const LABEL_SANS = "'Jost Variable', 'Futura', sans-serif"

/** the apothecary label a few houses use (Le Labo, Cave): typed lines between rules, left aligned.
 * Only real data is typed on it: the name, the volume, the house, and the bottle's own notes. */
function typewriterLabel(g: CanvasRenderingContext2D, c: HTMLCanvasElement, b: LabelSource, spec: BottleSpec['label'], W: number, H: number): THREE.CanvasTexture {
  const TYPE = "'American Typewriter', 'Courier New', Courier, monospace"
  const pad = W * 0.07
  const band = spec.band ? W * 0.035 : 0
  if (spec.band) {
    g.fillStyle = spec.band
    g.fillRect(0, 0, band, H)
  }
  g.fillStyle = spec.ink ?? '#26221f'
  g.strokeStyle = spec.ink ?? '#26221f'
  g.textAlign = 'left'
  const x = band + pad
  const maxW = W - x - pad * 0.6
  const line = (y: number) => {
    g.lineWidth = 3
    g.beginPath()
    g.moveTo(band, y)
    g.lineTo(W, y)
    g.stroke()
  }
  let size = Math.round(H * 0.085)
  g.font = `700 ${size}px ${TYPE}`
  while (g.measureText(b.name.toUpperCase()).width > maxW && size > 18) g.font = `700 ${(size -= 2)}px ${TYPE}`
  g.fillText(b.name.toUpperCase(), x, H * 0.13, maxW)
  g.font = `400 ${Math.round(H * 0.05)}px ${TYPE}`
  if (spec.ml) g.fillText(`${spec.ml}ml`, x, H * 0.21, maxW)
  line(H * 0.25)
  g.fillText('eau de parfum / vaporisateur', x, H * 0.33, maxW)
  g.fillText('natural spray', x, H * 0.4, maxW)
  line(H * 0.45)
  const notes = (b.notes ?? []).slice(0, 4).map(n => n.toLowerCase()).join(', ')
  if (notes) {
    g.fillText('key notes:', x, H * 0.54, maxW)
    g.fillText(notes, x, H * 0.61, maxW)
  }
  line(H * 0.68)
  g.font = `700 ${Math.round(H * 0.08)}px ${TYPE}`
  g.fillText(b.house.toLowerCase(), x, H * 0.8, maxW)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 4
  return t
}

function labelTexture(b: LabelSource, spec: BottleSpec['label'], aspect: number): THREE.CanvasTexture {
  const W = 512
  const H = Math.round(W * aspect)
  const c = document.createElement('canvas')
  c.width = W
  c.height = H
  const g = c.getContext('2d')!
  const printed = spec.kind === 'print-white' || spec.kind === 'print-black'
  if (!printed) {
    const paper = g.createLinearGradient(0, 0, 0, H)
    const base = spec.paper ?? (spec.kind === 'plate' ? '#c9a35f' : '#f1ebdf')
    paper.addColorStop(0, base)
    paper.addColorStop(1, new THREE.Color(base).multiplyScalar(0.9).getStyle())
    g.fillStyle = paper
    g.fillRect(0, 0, W, H)
  }
  if (spec.style === 'typewriter') return typewriterLabel(g, c, b, spec, W, H)
  const ink = spec.ink ?? (spec.kind === 'print-white' ? '#f6f2ea' : spec.kind === 'plate' ? '#2a1f12' : '#2a2420')
  g.fillStyle = ink
  g.strokeStyle = ink
  g.globalAlpha = 0.45
  if (!printed) {
    g.lineWidth = 3
    g.strokeRect(20, 20, W - 40, H - 40)
  }
  g.globalAlpha = 0.7
  g.textAlign = 'center'
  g.font = `500 ${Math.round(H * 0.085)}px ${LABEL_SANS}`
  g.fillText(b.house.toUpperCase().split('').join(' '), W / 2, H * 0.3, W - 70)
  g.globalAlpha = 1
  const face = spec.style === 'sans' ? `500 SIZEpx ${LABEL_SANS}` : `400 SIZEpx ${DISPLAY}`
  const text = spec.style === 'sans' ? b.name.toUpperCase() : b.name
  let size = Math.round(H * (spec.style === 'sans' ? 0.17 : 0.24))
  g.font = face.replace('SIZE', String(size))
  while (g.measureText(text).width > W - 80 && size > 24) g.font = face.replace('SIZE', String((size -= 3)))
  g.fillText(text, W / 2, H * 0.6)
  g.globalAlpha = 0.6
  g.fillRect(W / 2 - 50, H * 0.7, 100, 2)
  g.font = `500 ${Math.round(H * 0.06)}px ${LABEL_SANS}`
  g.fillText('E A U   D E   P A R F U M', W / 2, H * 0.84)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 4
  return t
}

/** a round bottle drawn as a lathe: flat base, soft heel, straight wall, rounded shoulder */
function latheBody(h: number, r: number, corner: number): THREE.BufferGeometry {
  const pts: THREE.Vector2[] = [new THREE.Vector2(0, 0)]
  const k = Math.min(corner, r * 0.5, h * 0.25)
  for (let i = 0; i <= 8; i++) {
    const a = (i / 8) * (Math.PI / 2)
    pts.push(new THREE.Vector2(r - k + Math.sin(a) * k, k - Math.cos(a) * k))
  }
  for (let i = 0; i <= 8; i++) {
    const a = (i / 8) * (Math.PI / 2)
    pts.push(new THREE.Vector2(r - k + Math.cos(a) * k, h - k + Math.sin(a) * k))
  }
  pts.push(new THREE.Vector2(0, h))
  return new THREE.LatheGeometry(pts, 72)
}

/** a flat oval (Diptyque-like) bottle: an ellipse extruded front to back, edges rounded */
function ovalBody(h: number, w: number, d: number, corner: number): THREE.BufferGeometry {
  const s = new THREE.Shape()
  s.absellipse(0, h / 2, w / 2, h / 2, 0, Math.PI * 2, false, 0)
  const bevel = Math.min(corner, d * 0.45)
  const g = new THREE.ExtrudeGeometry(s, { depth: d - 2 * bevel, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel * 0.9, bevelSegments: 8, curveSegments: 64 })
  g.translate(0, 0, -(d - 2 * bevel) / 2)
  return g
}

function bodyGeometry(b: BottleSpec['body'], inset = 0): THREE.BufferGeometry {
  const h = b.h - inset * 2
  if (b.form === 'cylinder') {
    const g = latheBody(h, b.w / 2 - inset, b.corner)
    g.translate(0, inset, 0)
    return g
  }
  if (b.form === 'oval') {
    const g = ovalBody(h, b.w - inset * 2, b.d - inset * 2, b.corner)
    g.translate(0, inset, 0)
    return g
  }
  const g = new RoundedBoxGeometry(b.w - inset * 2, h, b.d - inset * 2, 5, Math.max(0.005, b.corner - inset * 0.5))
  g.translate(0, h / 2 + inset, 0)
  return g
}

export type Materials = ReturnType<typeof createMaterials>

export function createMaterials() {
  // the wall of the bottle: a thin, highly reflective shell. The liquid inside does the refracting
  // (see juice below); a transmissive wall would hide it, because transmission only sees opaque things.
  const glass = (tint: string, opacity: BottleSpec['glass']['opacity']) =>
    opacity === 'opaque'
      ? new THREE.MeshPhysicalMaterial({ color: tint, roughness: 0.16, clearcoat: 1, clearcoatRoughness: 0.03, envMapIntensity: 1.4 })
      : new THREE.MeshPhysicalMaterial({
          color: tint,
          metalness: 0,
          roughness: 0.015,
          transparent: true,
          opacity: opacity === 'tinted' ? 0.42 : 0.12,
          depthWrite: false,
          clearcoat: 1,
          clearcoatRoughness: 0.01,
          ior: 1.5,
          specularIntensity: 1,
          envMapIntensity: 2.4,
        })
  const caps: Record<CapMaterial, THREE.Material> = {
    gold: new THREE.MeshStandardMaterial({ color: '#c9a35f', metalness: 1, roughness: 0.22 }),
    bronze: new THREE.MeshStandardMaterial({ color: '#8a6440', metalness: 1, roughness: 0.3 }),
    silver: new THREE.MeshStandardMaterial({ color: '#d7d7d4', metalness: 1, roughness: 0.18 }),
    gunmetal: new THREE.MeshStandardMaterial({ color: '#8d8a86', metalness: 1, roughness: 0.3 }),
    'black-matte': new THREE.MeshStandardMaterial({ color: '#141214', roughness: 0.62 }),
    'black-gloss': new THREE.MeshPhysicalMaterial({ color: '#121012', roughness: 0.25, clearcoat: 1, clearcoatRoughness: 0.08 }),
    white: new THREE.MeshPhysicalMaterial({ color: '#efeae2', roughness: 0.4, clearcoat: 0.4 }),
    wood: new THREE.MeshStandardMaterial({ color: '#6b4a32', roughness: 0.55 }),
    crystal: glass('#ffffff', 'clear'),
    resin: new THREE.MeshPhysicalMaterial({ color: '#ffffff', roughness: 0.3, clearcoat: 0.8, clearcoatRoughness: 0.1 }),
  }
  const collars = {
    gold: new THREE.MeshStandardMaterial({ color: '#c9a35f', metalness: 1, roughness: 0.28 }),
    silver: new THREE.MeshStandardMaterial({ color: '#d0d0cc', metalness: 1, roughness: 0.25 }),
    black: new THREE.MeshStandardMaterial({ color: '#151315', roughness: 0.4 }),
  }
  const glassCache = new Map<string, THREE.MeshPhysicalMaterial>()
  return {
    glassFor(tint: string, opacity: BottleSpec['glass']['opacity']) {
      const k = tint + opacity
      if (!glassCache.has(k)) glassCache.set(k, glass(tint, opacity))
      return glassCache.get(k)!
    },
    caps,
    collars,
    dispose() {
      glassCache.forEach(m => m.dispose())
      Object.values(caps).forEach(m => m.dispose())
      Object.values(collars).forEach(m => m.dispose())
    },
  }
}

/** the authored juice colour with its lightness lifted so it reads as liquid through glass; the hue is kept */
function juiceColour(stain: string | null, override: string | null): THREE.Color {
  // a colour measured off the real bottle is used as it is
  if (override) return new THREE.Color(override)
  const c = new THREE.Color(stain ?? '#cdbf9f')
  const hsl = { h: 0, s: 0, l: 0 }
  c.getHSL(hsl)
  // a liquid, not a paint: saturated, mid-light, so it glows when light passes through it
  return c.setHSL(hsl.h, Math.min(1, hsl.s * 1.2 + 0.12), Math.min(Math.max(hsl.l, 0.38), 0.62))
}

export type BuiltBottle = { group: THREE.Group; height: number; nozzle: THREE.Vector3; dispose: () => void }

export function buildBottle(b: LabelSource, spec: BottleSpec, m: Materials, opts: { capless?: boolean } = {}): BuiltBottle {
  const group = new THREE.Group()
  const owned: { dispose: () => void }[] = []
  const geo = <T extends THREE.BufferGeometry>(g: T) => (owned.push(g), g)
  const S = spec.body

  const glass = m.glassFor(spec.glass.tint, spec.glass.opacity)
  const body = new THREE.Mesh(geo(bodyGeometry(S)), glass)
  body.renderOrder = 2

  // the juice: a refracting liquid tinted by its own colour, so the label and the light bend through it
  if (spec.glass.opacity !== 'opaque') {
    const jc = juiceColour(b.stain, spec.juice.color)
    const juiceMat = new THREE.MeshPhysicalMaterial({
      color: jc, roughness: 0.04, metalness: 0, transmission: 1, thickness: 0.7, ior: 1.36,
      attenuationColor: jc, attenuationDistance: 0.95, envMapIntensity: 1.2, specularIntensity: 0.8,
      emissive: jc, emissiveIntensity: 0.22, // the backlight a studio shot gives the juice, so pale juice still reads as its colour
    })
    owned.push(juiceMat)
    const wall = Math.min(0.02, S.w * 0.045) // thick glass, but the liquid sits close to it
    const jh = (S.h - spec.glass.base - wall) * spec.juice.fill
    const juiceSpec = { ...S, h: jh + wall * 2, corner: Math.max(0.01, S.corner * 0.7) }
    const juice = new THREE.Mesh(geo(bodyGeometry(juiceSpec, wall)), juiceMat)
    juice.position.y = spec.glass.base - wall
    group.add(juice)
  }

  const neck = new THREE.Mesh(geo(new THREE.CylinderGeometry(spec.neck.r * 0.92, spec.neck.r, spec.neck.h, 32)), m.glassFor('#ffffff', 'clear'))
  neck.position.y = S.h + spec.neck.h / 2
  group.add(body, neck)
  let top = S.h + spec.neck.h
  if (spec.collar.color !== 'none') {
    const collar = new THREE.Mesh(geo(new THREE.CylinderGeometry(spec.neck.r * 1.35, spec.neck.r * 1.35, spec.collar.h, 40)), m.collars[spec.collar.color])
    collar.position.y = top + spec.collar.h / 2 - 0.01
    group.add(collar)
    top += spec.collar.h - 0.01
  }
  if (spec.label.kind !== 'none') {
    const tex = labelTexture(b, spec.label, (S.h * spec.label.h) / (S.w * spec.label.w))
    const printed = spec.label.kind === 'print-white' || spec.label.kind === 'print-black'
    // printed straight on the glass: only the type shows (alpha-tested, so no box behind it)
    const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: spec.label.kind === 'plate' ? 0.3 : 0.7, metalness: spec.label.kind === 'plate' ? 0.8 : 0, alphaTest: printed ? 0.35 : 0, transparent: true, depthWrite: true })
    owned.push(tex, mat)
    const lw = S.w * spec.label.w
    const lh = S.h * spec.label.h
    const label = new THREE.Mesh(geo(S.form === 'cylinder' ? new THREE.CylinderGeometry(S.w / 2 + 0.002, S.w / 2 + 0.002, lh, 64, 1, true, -lw / S.w, (2 * lw) / S.w) : new THREE.PlaneGeometry(lw, lh)), mat)
    label.position.set(0, S.h * spec.label.y, S.form === 'cylinder' ? 0 : S.d / 2 + 0.003)
    if (S.form === 'cylinder') label.rotation.y = 0
    label.renderOrder = 1
    group.add(label)
  }
  if (opts.capless) {
    // the atomiser, cap off: a metal actuator with its orifice facing front
    const act = new THREE.Mesh(geo(new THREE.CylinderGeometry(spec.neck.r * 1.15, spec.neck.r * 1.15, 0.075, 40)), m.caps.silver)
    act.position.y = top + 0.0375
    group.add(act)
    const tipY = top + 0.045
    group.traverse(o => (o.userData.slot = group))
    return { group, height: top + 0.075, nozzle: new THREE.Vector3(0, tipY, spec.neck.r * 1.15), dispose: () => owned.forEach(o => o.dispose()) }
  }
  const nozzle = new THREE.Vector3(0, top, 0)

  const C = spec.cap
  let capMat = m.caps[C.material]
  if (C.color) {
    capMat = (capMat as THREE.MeshStandardMaterial).clone()
    ;(capMat as THREE.MeshStandardMaterial).color.set(C.color)
    owned.push(capMat)
  }
  let capGeo: THREE.BufferGeometry
  if (C.form === 'sphere') capGeo = new THREE.SphereGeometry(C.w / 2, 48, 32)
  else if (C.form === 'cube') capGeo = new RoundedBoxGeometry(C.w, C.h, C.d ?? C.w, 4, Math.min(C.w, C.h) * 0.12)
  else if (C.form === 'slab') capGeo = new RoundedBoxGeometry(C.w, C.h, C.d ?? C.w * 0.5, 4, Math.min(C.w, C.h) * 0.12)
  else if (C.form === 'disc') capGeo = new THREE.CylinderGeometry(C.w / 2, C.w / 2, C.h, 64)
  else if (C.form === 'dome') capGeo = new THREE.SphereGeometry(C.w / 2, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2)
  else if (C.form === 'ribbed') {
    // a column of stacked bands, each with a soft groove between (Dior's Collection Privee cap)
    const pts: THREE.Vector2[] = [new THREE.Vector2(0, -C.h / 2)]
    const bands = 4
    for (let i = 0; i < bands; i++) {
      const y0 = -C.h / 2 + (i * C.h) / bands
      const y1 = y0 + C.h / bands
      pts.push(new THREE.Vector2(C.w / 2 - 0.012, y0 + 0.004), new THREE.Vector2(C.w / 2, y0 + 0.014), new THREE.Vector2(C.w / 2, y1 - 0.014), new THREE.Vector2(C.w / 2 - 0.012, y1 - 0.004))
    }
    pts.push(new THREE.Vector2(0, C.h / 2))
    capGeo = new THREE.LatheGeometry(pts, 64)
  }
  else capGeo = new THREE.CylinderGeometry(C.w / 2, C.w / 2, C.h, 64)
  const cap = new THREE.Mesh(geo(capGeo), capMat)
  cap.position.y = top + (C.form === 'sphere' ? C.w / 2 : C.form === 'dome' ? 0 : C.h / 2)
  if (C.form === 'dome') cap.scale.y = C.h / (C.w / 2)
  group.add(cap)
  const height = top + (C.form === 'sphere' ? C.w : C.h)

  group.traverse(o => (o.userData.slot = group))
  return { group, height, nozzle, dispose: () => owned.forEach(o => o.dispose()) }
}
