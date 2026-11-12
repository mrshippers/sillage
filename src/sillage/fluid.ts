/* Fluid motion, after Apple's "Designing Fluid Interfaces".
 *
 * A spring has no fixed duration: it is told where to go and settles. Give it
 * a new target mid-flight and it carries on from where it is, at the speed it
 * had, so anything on screen can be grabbed and reversed at any instant.
 *
 * `response` is how quickly it reaches the target (seconds, not a duration) and
 * `damping` is overshoot: 1 settles without bounce, under 1 bounces. Start at 1;
 * add bounce only when a flick carried momentum. */

const reduced = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches

export type SpringState = { x: number; v: number }

/** One integration step, sub-stepped so a long frame cannot blow it up. */
export function stepSpring(s: SpringState, target: number, response: number, damping: number, dt: number): SpringState {
  // a frame stamped before the spring started gives a negative step; run backwards a spring is anti-damped and flies off
  if (!(dt > 0)) return s
  const w = (2 * Math.PI) / response // natural frequency; stiffness = w², drag = 2·damping·w (unit mass)
  const k = w * w
  const c = 2 * damping * w
  const n = Math.max(1, Math.ceil(dt / (1 / 240)))
  const h = dt / n
  let { x, v } = s
  for (let i = 0; i < n; i++) {
    v += (-k * (x - target) - c * v) * h
    x += v * h
  }
  return { x, v }
}

/** Where a flick would come to rest, by scroll-style exponential decay. */
export function project(velocity: number, decelerationRate = 0.998): number {
  return ((velocity / 1000) * decelerationRate) / (1 - decelerationRate)
}

/** Resistance past an edge: the further out, the less it follows. Keeps sign. */
export function rubberband(overshoot: number, dimension: number, constant = 0.55): number {
  return (overshoot * dimension * constant) / (dimension + constant * Math.abs(overshoot))
}

export type Spring = {
  readonly value: number
  readonly velocity: number
  /** Track something 1:1 (a finger). Stops any motion in flight. */
  set(value: number): void
  /** Go to a target, from the current value, at the current speed unless one is handed in. */
  to(target: number, opts?: { velocity?: number; onRest?: () => void }): void
  stop(): void
}

export function createSpring(
  initial: number,
  opts: { response?: number; damping?: number; rest?: number },
  onUpdate: (value: number) => void,
): Spring {
  const response = opts.response ?? 0.4
  const damping = opts.damping ?? 1
  const rest = opts.rest ?? 0.01
  let s: SpringState = { x: initial, v: 0 }
  let target = initial
  let raf = 0
  let last = 0
  let done: (() => void) | undefined

  const frame = (now: number) => {
    const dt = Math.min((now - last) / 1000, 1 / 30)
    last = Math.max(last, now)
    s = stepSpring(s, target, response, damping, dt)
    if (Math.abs(s.x - target) < rest && Math.abs(s.v) < rest * 8) {
      s = { x: target, v: 0 }
      raf = 0
      onUpdate(s.x)
      const cb = done
      done = undefined
      cb?.()
      return
    }
    onUpdate(s.x)
    raf = requestAnimationFrame(frame)
  }
  const cancel = () => {
    if (raf) cancelAnimationFrame(raf)
    raf = 0
    done = undefined
  }

  return {
    get value() {
      return s.x
    },
    get velocity() {
      return s.v
    },
    set(value) {
      cancel()
      s = { x: value, v: 0 }
      target = value
      onUpdate(value)
    },
    to(t, o) {
      target = t
      if (o?.velocity !== undefined) s = { x: s.x, v: o.velocity }
      if (reduced()) {
        cancel()
        s = { x: t, v: 0 }
        onUpdate(t)
        o?.onRest?.()
        return
      }
      done = o?.onRest
      if (!raf) {
        last = performance.now()
        raf = requestAnimationFrame(frame)
      }
    },
    stop: cancel,
  }
}
