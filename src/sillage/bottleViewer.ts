import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { buildBottle, createMaterials, type LabelSource } from './bottleModel'
import { specFor } from './bottleSpecs'
import { createSpring, project } from './fluid'

/* The opened bottle, in your hand: the real bottle, capped, lit like the
 * welcome. Turn it with a finger and it turns 1:1; let go and it carries the
 * spin, then settles back to face you. Frames are drawn only while it moves. */
export function createViewer(canvas: HTMLCanvasElement, bottle: LabelSource) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.1
  const scene = new THREE.Scene()
  const pmrem = new THREE.PMREMGenerator(renderer)
  const env = pmrem.fromScene(new RoomEnvironment(), 0.03).texture
  scene.environment = env
  scene.environmentIntensity = 0.95
  scene.environmentRotation.y = -0.6
  const key = new THREE.SpotLight('#ffe2b8', 70, 10, 0.45, 1, 1.2)
  key.position.set(0.8, 4, 2.6)
  const rim = new THREE.DirectionalLight('#b9c6ff', 1.3)
  rim.position.set(-3, 2, -2.5)
  scene.add(key, rim)

  const mats = createMaterials()
  const spec = specFor(bottle.id)
  const built = buildBottle(bottle, spec, mats)
  key.target = built.group
  scene.add(built.group)
  const h = built.height
  const bw = Math.max(spec.body.w, spec.body.d)

  const camera = new THREE.PerspectiveCamera(26, 1, 0.1, 30)
  const frame = () => {
    const w = canvas.clientWidth
    const hh = canvas.clientHeight
    if (canvas.width !== Math.round(w * renderer.getPixelRatio()) || canvas.height !== Math.round(hh * renderer.getPixelRatio())) {
      renderer.setSize(w, hh, false)
      camera.aspect = w / hh
      camera.updateProjectionMatrix()
      const tanV = Math.tan((camera.fov * Math.PI) / 360)
      const viewH = Math.max(h / 0.8, bw / 0.5 / camera.aspect)
      const dist = viewH / (2 * tanV)
      camera.position.set(0, h * 0.62, dist)
      camera.lookAt(0, h * 0.48, 0)
    }
    renderer.render(scene, camera)
  }
  let raf = 0
  const invalidate = () => {
    if (!raf) raf = requestAnimationFrame(() => ((raf = 0), frame()))
  }
  // the spin: a gentle settle back to the front after a throw
  const turn = createSpring(-0.35, { response: 0.9, damping: 0.85, rest: 0.0008 }, v => {
    built.group.rotation.y = v
    invalidate()
  })
  turn.to(0.08)

  let id = -1
  let lastX = 0
  let hist: { a: number; t: number }[] = []
  const perPx = () => (Math.PI * 1.4) / canvas.clientWidth
  const down = (e: PointerEvent) => {
    if (id !== -1) return
    id = e.pointerId
    lastX = e.clientX
    turn.stop()
    hist = [{ a: turn.value, t: e.timeStamp }]
    canvas.setPointerCapture(id)
  }
  const move = (e: PointerEvent) => {
    if (e.pointerId !== id) return
    turn.set(turn.value + (e.clientX - lastX) * perPx())
    lastX = e.clientX
    hist.push({ a: turn.value, t: e.timeStamp })
    while (hist.length > 2 && e.timeStamp - hist[0].t > 100) hist.shift()
  }
  const up = (e: PointerEvent) => {
    if (e.pointerId !== id) return
    id = -1
    const a = hist[0]
    const z = hist[hist.length - 1]
    const dt = (z.t - a.t) / 1000
    const v = dt > 0.005 ? (z.a - a.a) / dt : 0
    // carry the throw, then come home to the nearest front-facing turn
    const landing = turn.value + project(v, 0.994)
    const home = Math.round(landing / (Math.PI * 2)) * Math.PI * 2 + 0.08
    turn.to(home, { velocity: v })
  }
  canvas.addEventListener('pointerdown', down)
  canvas.addEventListener('pointermove', move)
  canvas.addEventListener('pointerup', up)
  canvas.addEventListener('pointercancel', up)
  const ro = new ResizeObserver(invalidate)
  ro.observe(canvas)

  return {
    dispose() {
      turn.stop()
      cancelAnimationFrame(raf)
      ro.disconnect()
      canvas.removeEventListener('pointerdown', down)
      canvas.removeEventListener('pointermove', move)
      canvas.removeEventListener('pointerup', up)
      canvas.removeEventListener('pointercancel', up)
      built.dispose()
      mats.dispose()
      env.dispose()
      pmrem.dispose()
      renderer.dispose()
    },
  }
}
