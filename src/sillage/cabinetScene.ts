import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { buildBottle, createMaterials, MAX_WIDTH } from './bottleModel'
import { specFor } from './bottleSpecs'
import { createSpring, project } from './fluid'

/* The cabinet: a lacquered turntable in a lit niche, stocked with your bottles
 * as heavy-glass luxury flacons. The juice is each bottle's own authored colour;
 * the label carries its house and name. Spin it with a finger: it turns 1:1,
 * carries the flick, and settles with a bottle at the front. Tap the front
 * bottle to open it, any other to bring it round. Frames are drawn only while
 * something moves. */

export type ShelfBottle = { id: string; house: string; name: string; stain: string | null; notes?: string[] }
export type CabinetApi = { setBottles: (b: ShelfBottle[]) => void; dispose: () => void }

/** ring radius that keeps a bottle's width plus air between neighbours */
export const ringRadius = (n: number) => Math.max(1.7, (n * (MAX_WIDTH + 0.3)) / (2 * Math.PI))

/** angle of the slot nearest the front for a ring turned by `theta` */
export function frontIndex(theta: number, n: number): number {
  if (!n) return -1
  const step = (2 * Math.PI) / n
  return (((Math.round(-theta / step) % n) + n) % n)
}

function blobTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas')
  c.width = c.height = 128
  const g = c.getContext('2d')!
  const r = g.createRadialGradient(64, 64, 4, 64, 64, 62)
  r.addColorStop(0, 'rgba(0,0,0,0.75)')
  r.addColorStop(0.55, 'rgba(0,0,0,0.3)')
  r.addColorStop(1, 'rgba(0,0,0,0)')
  g.fillStyle = r
  g.fillRect(0, 0, 128, 128)
  return new THREE.CanvasTexture(c)
}

function wallTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas')
  c.width = 512
  c.height = 512
  const g = c.getContext('2d')!
  g.fillStyle = '#120c12'
  g.fillRect(0, 0, 512, 512)
  // fluted panelling: soft vertical reeds
  for (let x = 0; x < 512; x += 16) {
    const f = g.createLinearGradient(x, 0, x + 16, 0)
    f.addColorStop(0, 'rgba(255,240,220,0.0)')
    f.addColorStop(0.5, 'rgba(255,240,220,0.045)')
    f.addColorStop(1, 'rgba(0,0,0,0.18)')
    g.fillStyle = f
    g.fillRect(x, 0, 16, 512)
  }
  // the pool of light from the downlight
  const pool = g.createRadialGradient(256, 150, 10, 256, 210, 300)
  pool.addColorStop(0, 'rgba(255,214,160,0.34)')
  pool.addColorStop(0.5, 'rgba(200,140,110,0.1)')
  pool.addColorStop(1, 'rgba(0,0,0,0)')
  g.fillStyle = pool
  g.fillRect(0, 0, 512, 512)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

function lacquerTexture(): THREE.CanvasTexture {
  // dark walnut: long soft grain, drawn once
  const c = document.createElement('canvas')
  c.width = 1024
  c.height = 64
  const g = c.getContext('2d')!
  g.fillStyle = '#2b1b14'
  g.fillRect(0, 0, 1024, 64)
  for (let i = 0; i < 140; i++) {
    const y = Math.random() * 64
    g.strokeStyle = `rgba(${Math.random() < 0.5 ? '70,44,30' : '20,12,9'},${0.25 + Math.random() * 0.35})`
    g.lineWidth = 0.6 + Math.random() * 1.8
    g.beginPath()
    g.moveTo(0, y)
    for (let x = 0; x <= 1024; x += 64) g.lineTo(x, y + Math.sin(x * 0.01 + i) * 2.2)
    g.stroke()
  }
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  return t
}

export function createCabinet(
  canvas: HTMLCanvasElement,
  opts: { onFront: (index: number) => void; onOpen: (index: number) => void },
): CabinetApi {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.05

  const scene = new THREE.Scene()
  scene.background = new THREE.Color('#0d090e')
  scene.fog = new THREE.Fog('#0d090e', 5.5, 11)
  const pmrem = new THREE.PMREMGenerator(renderer)
  const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
  scene.environment = env
  scene.environmentIntensity = 0.95

  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 40)

  // the niche
  const wallTex = wallTexture()
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(14, 9), new THREE.MeshStandardMaterial({ map: wallTex, roughness: 0.9 }))
  wall.position.set(0, 2.2, -3.2)
  scene.add(wall)
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(14, 14), new THREE.MeshStandardMaterial({ color: '#0f0a0d', roughness: 0.6, metalness: 0.1 }))
  floor.rotation.x = -Math.PI / 2
  floor.position.y = -0.25
  scene.add(floor)

  // lights: one warm downlight, cool and warm rims for the glass edges
  const key = new THREE.SpotLight('#ffd9a8', 140, 14, 0.5, 0.9, 1.4)
  key.position.set(0, 5.4, 2.2)
  key.target.position.set(0, 0, 0)
  scene.add(key, key.target)
  const rimL = new THREE.DirectionalLight('#9fb4ff', 1.1)
  rimL.position.set(-4, 2.4, -2.5)
  const rimR = new THREE.DirectionalLight('#ffc89a', 1.3)
  rimR.position.set(4, 2.2, -2)
  const fill = new THREE.DirectionalLight('#f3e6ff', 0.35)
  fill.position.set(0, 1.2, 5)
  scene.add(rimL, rimR, fill)

  // the turntable: lacquered walnut with a brass lip
  const turn = new THREE.Group()
  scene.add(turn)
  const lacquer = lacquerTexture()
  const plinthMat = new THREE.MeshPhysicalMaterial({ map: lacquer, color: '#ffffff', roughness: 0.38, clearcoat: 1, clearcoatRoughness: 0.08 })
  let plinth: THREE.Mesh | null = null
  let lip: THREE.Mesh | null = null
  const brass = new THREE.MeshStandardMaterial({ color: '#c9a35f', metalness: 1, roughness: 0.28 })

  const mats = createMaterials()
  const blob = blobTexture()
  const blobMat = new THREE.MeshBasicMaterial({ map: blob, transparent: true, depthWrite: false, opacity: 0.85 })

  type Slot = { group: THREE.Group; dispose: () => void }
  let slots: Slot[] = []
  let count = 0
  let R = ringRadius(1)

  const disposables: { dispose: () => void }[] = [wallTex, lacquer, blob, blobMat, plinthMat, brass, mats, env, pmrem]

  function stock(b: ShelfBottle): Slot {
    const spec = specFor(b.id)
    const built = buildBottle(b, spec, mats)
    const shadowGeo = new THREE.PlaneGeometry(spec.body.w * 1.9, spec.body.d * 2.6)
    const shadow = new THREE.Mesh(shadowGeo, blobMat)
    shadow.rotation.x = -Math.PI / 2
    shadow.position.y = 0.002
    built.group.add(shadow)
    return { group: built.group, dispose: () => (built.dispose(), shadowGeo.dispose()) }
  }

  function rebuildPlinth() {
    if (plinth) {
      turn.remove(plinth)
      plinth.geometry.dispose()
    }
    if (lip) {
      turn.remove(lip)
      lip.geometry.dispose()
    }
    plinth = new THREE.Mesh(new THREE.CylinderGeometry(R + 0.62, R + 0.7, 0.24, 160), plinthMat)
    plinth.position.y = -0.12
    lip = new THREE.Mesh(new THREE.TorusGeometry(R + 0.66, 0.018, 12, 200), brass)
    lip.rotation.x = Math.PI / 2
    lip.position.y = 0.001
    turn.add(plinth, lip)
  }

  // turning
  let theta = 0
  const sp = createSpring(0, { response: 0.55, damping: 0.86, rest: 0.0005 }, v => {
    theta = v
    invalidate()
  })
  const step = () => (count ? (2 * Math.PI) / count : 1)

  let lastFront = -1
  function place() {
    turn.rotation.y = theta
    const st = step()
    slots.forEach((s, i) => {
      // the bottle nearest the front lifts a touch, the rest settle back
      const d = (((i * st + theta) % (2 * Math.PI)) + 3 * Math.PI) % (2 * Math.PI) - Math.PI
      s.group.position.y = 0.075 * Math.pow(Math.max(0, Math.cos(d)), 10)
    })
    const f = frontIndex(theta, count)
    if (f !== lastFront) {
      lastFront = f
      opts.onFront(f)
    }
  }

  function frame() {
    const w = canvas.clientWidth
    const h = canvas.clientHeight
    if (canvas.width !== Math.round(w * renderer.getPixelRatio()) || canvas.height !== Math.round(h * renderer.getPixelRatio())) {
      renderer.setSize(w, h, false)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    }
    place()
    renderer.render(scene, camera)
  }
  let raf = 0
  function invalidate() {
    if (!raf) raf = requestAnimationFrame(() => ((raf = 0), frame()))
  }

  function frameCamera() {
    // close enough that the front bottle fills the lower middle, high enough to see over it
    // a cabinet, not a carousel: the front bottle large, its neighbours curving away, the back of the turntable in shadow
    camera.position.set(0, 1.55, R + 5.4)
    camera.lookAt(0, 0.42, R - 0.35)
    key.target.position.set(0, 0, R - 0.4)
    if (scene.fog instanceof THREE.Fog) {
      scene.fog.near = 5.6
      scene.fog.far = 5.6 + R * 1.7
    }
  }

  function setBottles(list: ShelfBottle[]) {
    slots.forEach(s => (turn.remove(s.group), s.dispose()))
    count = list.length
    R = ringRadius(count)
    rebuildPlinth()
    slots = list.map((b, i) => {
      const slot = stock(b)
      const a = (i * 2 * Math.PI) / count
      slot.group.position.set(Math.sin(a) * R, 0, Math.cos(a) * R)
      slot.group.rotation.y = a
      turn.add(slot.group)
      return slot
    })
    frameCamera()
    lastFront = -1
    // a new stock swings in a quarter turn and settles on the first bottle
    sp.set(reduced ? 0 : -0.9)
    sp.to(0)
    invalidate()
  }

  // a finger on the turntable
  const ray = new THREE.Raycaster()
  let id = -1
  let sx = 0
  let lastX = 0
  let moved = 0
  let dragging = false
  let hist: { x: number; t: number }[] = []
  const perPx = () => {
    // radians per pixel so the front bottle moves with the finger
    const viewW = 2 * Math.tan((camera.fov * Math.PI) / 360) * (camera.position.z - R) * camera.aspect
    return viewW / canvas.clientWidth / R
  }
  const down = (e: PointerEvent) => {
    if (id !== -1) return // one finger
    id = e.pointerId
    sx = lastX = e.clientX
    moved = 0
    dragging = false
    hist = [{ x: theta, t: e.timeStamp }]
    sp.stop()
  }
  const move = (e: PointerEvent) => {
    if (e.pointerId !== id) return
    const dx = e.clientX - lastX
    lastX = e.clientX
    moved = Math.max(moved, Math.abs(e.clientX - sx))
    if (!dragging && moved > 8) {
      dragging = true
      canvas.setPointerCapture(id)
    }
    if (!dragging) return
    sp.set(theta + dx * perPx())
    hist.push({ x: theta, t: e.timeStamp })
    while (hist.length > 2 && e.timeStamp - hist[0].t > 100) hist.shift()
  }
  const up = (e: PointerEvent) => {
    if (e.pointerId !== id) return
    id = -1
    if (dragging) {
      const a = hist[0]
      const z = hist[hist.length - 1]
      const dt = (z.t - a.t) / 1000
      const v = dt > 0.005 ? (z.x - a.x) / dt : 0
      const st = step()
      const landing = theta + project(v, 0.996)
      sp.to(Math.round(landing / st) * st, { velocity: v })
      return
    }
    // a tap: which bottle?
    const r = canvas.getBoundingClientRect()
    ray.setFromCamera(new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1), camera)
    const hit = ray.intersectObjects(slots.map(s => s.group), true)[0]
    const i = hit ? slots.findIndex(s => s.group === hit.object.userData.slot) : -1
    if (i < 0) return
    if (i === frontIndex(theta, count)) return opts.onOpen(i)
    const st = step()
    let target = -i * st
    while (target - theta > Math.PI) target -= 2 * Math.PI
    while (target - theta < -Math.PI) target += 2 * Math.PI
    sp.to(target)
  }
  canvas.addEventListener('pointerdown', down)
  canvas.addEventListener('pointermove', move)
  canvas.addEventListener('pointerup', up)
  canvas.addEventListener('pointercancel', up)
  const ro = new ResizeObserver(() => invalidate())
  ro.observe(canvas)

  return {
    setBottles,
    dispose() {
      sp.stop()
      cancelAnimationFrame(raf)
      ro.disconnect()
      canvas.removeEventListener('pointerdown', down)
      canvas.removeEventListener('pointermove', move)
      canvas.removeEventListener('pointerup', up)
      canvas.removeEventListener('pointercancel', up)
      slots.forEach(s => s.dispose())
      plinth?.geometry.dispose()
      lip?.geometry.dispose()
      wall.geometry.dispose()
      ;(wall.material as THREE.Material).dispose()
      floor.geometry.dispose()
      ;(floor.material as THREE.Material).dispose()
      disposables.forEach(d => d.dispose())
      renderer.dispose()
    },
  }
}
