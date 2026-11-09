import { describe, expect, it } from 'vitest'
import { project, rubberband, stepSpring, type SpringState } from './fluid'

function run(s: SpringState, target: number, response: number, damping: number, seconds: number) {
  const xs: number[] = []
  for (let t = 0; t < seconds; t += 1 / 60) {
    s = stepSpring(s, target, response, damping, 1 / 60)
    xs.push(s.x)
  }
  return { s, xs }
}

describe('spring', () => {
  it('settles on the target', () => {
    const { s } = run({ x: 0, v: 0 }, 100, 0.4, 1, 3)
    expect(s.x).toBeCloseTo(100, 1)
    expect(Math.abs(s.v)).toBeLessThan(0.1)
  })

  it('critically damped never overshoots', () => {
    const { xs } = run({ x: 0, v: 0 }, 100, 0.4, 1, 3)
    expect(Math.max(...xs)).toBeLessThanOrEqual(100.01)
  })

  it('under-damped overshoots, then returns', () => {
    const { xs, s } = run({ x: 0, v: 0 }, 100, 0.4, 0.5, 3)
    expect(Math.max(...xs)).toBeGreaterThan(105)
    expect(s.x).toBeCloseTo(100, 1)
  })

  it('carries the speed it was handed: a flick toward the target arrives sooner', () => {
    const slow = run({ x: 0, v: 0 }, 100, 0.4, 1, 0.2).s.x
    const flicked = run({ x: 0, v: 800 }, 100, 0.4, 1, 0.2).s.x
    expect(flicked).toBeGreaterThan(slow)
  })

  it('re-targeting mid-flight starts from the live value, with no jump', () => {
    let s = run({ x: 0, v: 0 }, 100, 0.4, 1, 0.15).s
    const before = s.x
    s = stepSpring(s, 0, 0.4, 1, 1 / 240) // grab it and send it back
    expect(Math.abs(s.x - before)).toBeLessThan(2)
  })
})

describe('momentum', () => {
  it('projects a flick forward by its speed', () => {
    expect(project(1000)).toBeCloseTo(499, 0)
    expect(project(-1000)).toBeCloseTo(-499, 0)
    expect(project(0)).toBe(0)
  })

  it('rubber-bands: follows less the further out, keeps the sign, never passes the dimension', () => {
    const a = rubberband(50, 400)
    const b = rubberband(200, 400)
    expect(a).toBeLessThan(50)
    expect(b).toBeLessThan(200)
    expect(b).toBeGreaterThan(a)
    expect(rubberband(-80, 400)).toBeLessThan(0)
    expect(rubberband(10000, 400)).toBeLessThan(400)
  })
})
