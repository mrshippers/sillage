import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { buildBottle, createMaterials, type LabelSource } from './bottleModel'
import { specFor } from './bottleSpecs'

/* The welcome, shot like a fragrance advert. Tonight's bottle rises out of
 * black as the studio light travels across the glass (the environment turns,
 * so the highlights move through the real refraction), the atomiser releases
 * a slow mist, and the camera eases in. One continuous take, about three
 * seconds; the wordmark is set over it in the DOM. */

export const TIMELINE = { rise: 1.5, spritz: 1.15, mist: 2.4, total: 3.4 } as const

const ease = (t: number) => 1 - Math.pow(1 - Math.min(Math.max(t, 0), 1), 3)

function mistSprite(): THREE.CanvasTexture {
  const c = document.createElement('canvas')
  c.width = c.height = 64
  const g = c.getContext('2d')!
  const r = g.createRadialGradient(32, 32, 0, 32, 32, 32)
  r.addColorStop(0, 'rgba(255,255,255,1)')
  r.addColorStop(0.35, 'rgba(255,255,255,0.45)')
  r.addColorStop(1, 'rgba(255,255,255,0)')
  g.fillStyle = r
  g.fillRect(0, 0, 64, 64)
  return new THREE.CanvasTexture(c)
}

export function createWelcome(canvas: HTMLCanvasElement, bottle: LabelSource) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.1

  const scene = new THREE.Scene()
  const pmrem = new THREE.PMREMGenerator(renderer)
  const env = pmrem.fromScene(new RoomEnvironment(), 0.03).texture
  scene.environment = env
  scene.environmentIntensity = 0

  const mats = createMaterials()
  const spec = specFor(bottle.id)
  const built = buildBottle(bottle, spec, mats, { capless: true })
  const h = built.height
  const bw = Math.max(spec.body.w, spec.body.d)
  // stand the bottle on nothing: a soft pool of light under it is the only floor
  const pool = new THREE.Mesh(
    new THREE.CircleGeometry(1.4, 64),
    new THREE.MeshBasicMaterial({ map: (() => {
      const c = document.createElement('canvas')
      c.width = c.height = 128
      const g = c.getContext('2d')!
      const r = g.createRadialGradient(64, 64, 0, 64, 64, 64)
      r.addColorStop(0, 'rgba(255,214,160,0.35)')
      r.addColorStop(1, 'rgba(255,214,160,0)')
      g.fillStyle = r
      g.fillRect(0, 0, 128, 128)
      return new THREE.CanvasTexture(c)
    })(), transparent: true, depthWrite: false, opacity: 0 }),
  )
  pool.rotation.x = -Math.PI / 2
  scene.add(built.group, pool)

  const key = new THREE.SpotLight('#ffe2b8', 0, 10, 0.42, 1, 1.2)
  key.position.set(0.8, 4.2, 2.4)
  key.target.position.set(0, h * 0.4, 0)
  const rim = new THREE.DirectionalLight('#b9c6ff', 0)
  rim.position.set(-3, 2, -2.5)
  scene.add(key, key.target, rim)

  // the mist: a few hundred soft points, born at the atomiser over a third of a second
  const N = 900
  const pos = new Float32Array(N * 3)
  const vel = new Float32Array(N * 3)
  const born = new Float32Array(N)
  const size = new Float32Array(N)
  const alpha = new Float32Array(N)
  for (let i = 0; i < N; i++) {
    born[i] = TIMELINE.spritz + (i / N) * 0.42
    // a soft cone toward the camera and up, the way a spritz leaves the nozzle
    const a = Math.random() * Math.PI * 2
    const s = Math.random() * 0.32
    const sp = 0.9 + Math.random() * 0.9
    vel[i * 3] = (0.16 + Math.cos(a) * s) * sp
    vel[i * 3 + 1] = (0.1 + Math.sin(a) * s * 0.7) * sp
    vel[i * 3 + 2] = (0.7 + Math.random() * 0.25) * sp
    pos[i * 3] = built.nozzle.x
    pos[i * 3 + 1] = built.nozzle.y
    pos[i * 3 + 2] = built.nozzle.z
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  geo.setAttribute('size', new THREE.BufferAttribute(size, 1))
  geo.setAttribute('alpha', new THREE.BufferAttribute(alpha, 1))
  const sprite = mistSprite()
  const mistMat = new THREE.ShaderMaterial({
    uniforms: { map: { value: sprite }, tint: { value: new THREE.Color('#fff1da') }, scale: { value: 1 } },
    vertexShader: `attribute float size; attribute float alpha; varying float vA; uniform float scale;
      void main(){ vA = alpha; vec4 mv = modelViewMatrix * vec4(position,1.0); gl_PointSize = size * scale / -mv.z; gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `uniform sampler2D map; uniform vec3 tint; varying float vA;
      void main(){ vec4 t = texture2D(map, gl_PointCoord); gl_FragColor = vec4(tint, t.a * vA); }`,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  })
  const mist = new THREE.Points(geo, mistMat)
  scene.add(mist)

  const camera = new THREE.PerspectiveCamera(26, 1, 0.1, 30)
  let dist = 3
  let lookY = h * 0.5
  const resize = () => {
    const w = canvas.clientWidth
    const hh = canvas.clientHeight
    renderer.setSize(w, hh, false)
    camera.aspect = w / hh
    camera.updateProjectionMatrix()
    // the bottle takes ~44% of the width and ~40% of the height, whichever is tighter, centred at 40% from the top
    const tanV = Math.tan((camera.fov * Math.PI) / 360)
    const viewH = Math.max(h / 0.4, bw / 0.44 / camera.aspect)
    dist = viewH / (2 * tanV)
    lookY = h / 2 - viewH * 0.1
    mistMat.uniforms.scale.value = hh * renderer.getPixelRatio() * 0.9
  }
  resize()

  let raf = 0
  let t0 = 0
  let last = 0
  const frame = (now: number) => {
    if (!t0) t0 = last = now
    const t = (now - t0) / 1000
    const dt = Math.min(Math.max((now - last) / 1000, 0), 1 / 30)
    last = now
    // rise from black, the light travelling across the glass, the camera easing in
    const r = ease(t / TIMELINE.rise)
    scene.environmentIntensity = 0.95 * r
    key.intensity = 70 * r
    rim.intensity = 1.4 * r
    ;(pool.material as THREE.MeshBasicMaterial).opacity = r
    scene.environmentRotation.y = -1.2 + 1.6 * ease(t / TIMELINE.total)
    built.group.rotation.y = -0.42 + 0.47 * ease(t / TIMELINE.total)
    built.group.position.y = -0.06 * (1 - r)
    const z = dist * (1.12 - 0.12 * ease(t / TIMELINE.total))
    camera.position.set(0, lookY + h * 0.12, z)
    camera.lookAt(0, lookY, 0)
    // the mist: drag, a little lift, growing as it thins
    for (let i = 0; i < N; i++) {
      const age = t - born[i]
      if (age <= 0) continue
      const k = Math.exp(-2.4 * dt)
      vel[i * 3] *= k
      vel[i * 3 + 1] = vel[i * 3 + 1] * k + 0.04 * dt
      vel[i * 3 + 2] *= k
      pos[i * 3] += vel[i * 3] * dt
      pos[i * 3 + 1] += vel[i * 3 + 1] * dt
      pos[i * 3 + 2] += vel[i * 3 + 2] * dt
      const life = age / TIMELINE.mist
      size[i] = 0.015 + 0.3 * Math.min(life, 1)
      alpha[i] = life >= 1 ? 0 : Math.sin(Math.PI * Math.min(life * 1.4, 1)) * (1 - life) * 0.085
    }
    geo.attributes.position.needsUpdate = true
    geo.attributes.size.needsUpdate = true
    geo.attributes.alpha.needsUpdate = true
    renderer.render(scene, camera)
    raf = requestAnimationFrame(frame)
  }

  return {
    start() {
      raf = requestAnimationFrame(frame)
    },
    /** seconds since the take began (for the verify harness) */
    get elapsed() {
      return t0 ? (performance.now() - t0) / 1000 : 0
    },
    dispose() {
      cancelAnimationFrame(raf)
      built.dispose()
      mats.dispose()
      geo.dispose()
      mistMat.dispose()
      sprite.dispose()
      pool.geometry.dispose()
      ;(pool.material as THREE.MeshBasicMaterial).map?.dispose()
      ;(pool.material as THREE.Material).dispose()
      env.dispose()
      pmrem.dispose()
      renderer.dispose()
    },
  }
}
