import { describe, expect, it } from 'vitest'
import { radiusFor, seedBodies, stepField } from './notesPhysics'
import { hexToRgb } from './tokens'

const W = 350
const H = 560

function settled(n: number) {
  const radii = Array.from({ length: n }, (_, i) => radiusFor((i % 4) + 1, 4, W))
  const bodies = seedBodies(radii, W, H)
  for (let t = 0; t < 1500; t++) stepField(bodies, W, H, t, 0)
  return bodies
}

describe('notes field', () => {
  it('sizes a note by how many bottles carry it', () => {
    expect(radiusFor(4, 4, W)).toBeGreaterThan(radiusFor(1, 4, W))
    expect(radiusFor(1, 1, W)).toBeGreaterThan(0)
  })

  it('settles with every note inside the field', () => {
    for (const b of settled(20)) {
      expect(b.x).toBeGreaterThan(b.r - 6)
      expect(b.x).toBeLessThan(W - b.r + 6)
      expect(b.y).toBeGreaterThan(b.r - 6)
      expect(b.y).toBeLessThan(H - b.r + 6)
    }
  })

  it('nudges notes apart: nothing is left sitting on top of another', () => {
    const bodies = settled(20)
    for (let i = 0; i < bodies.length; i++)
      for (let j = i + 1; j < bodies.length; j++) {
        const d = Math.hypot(bodies[i].x - bodies[j].x, bodies[i].y - bodies[j].y)
        expect(d).toBeGreaterThan((bodies[i].r + bodies[j].r) * 0.8)
      }
  })

  it('a held note does not move, its neighbours do', () => {
    const bodies = seedBodies([40, 40], W, H)
    bodies[0].held = true
    bodies[1].x = bodies[0].x + 10
    bodies[1].y = bodies[0].y
    const { x, y } = bodies[0]
    for (let t = 0; t < 200; t++) stepField(bodies, W, H, t, 0)
    expect(bodies[0].x).toBe(x)
    expect(bodies[0].y).toBe(y)
    expect(Math.hypot(bodies[1].x - x, bodies[1].y - y)).toBeGreaterThan(60)
  })
})

describe('smoke colour', () => {
  it('reads a hex stain and refuses anything else', () => {
    expect(hexToRgb('#caa25f')).toEqual([202, 162, 95])
    expect(hexToRgb('rgb(1,2,3)')).toBeNull()
    expect(hexToRgb(null)).toBeNull()
  })
})
