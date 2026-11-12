import { describe, expect, it } from 'vitest'
import { MAX_WIDTH, seedOf } from './bottleModel'
import { frontIndex, ringRadius } from './cabinetScene'

describe('the cabinet', () => {
  it('names the bottle at the front for any turn, either way round', () => {
    const n = 15
    const step = (2 * Math.PI) / n
    expect(frontIndex(0, n)).toBe(0)
    expect(frontIndex(-step, n)).toBe(1) // turning the ring brings the next bottle forward
    expect(frontIndex(step, n)).toBe(n - 1)
    expect(frontIndex(-step * 3.4, n)).toBe(3) // nearest slot wins
    expect(frontIndex(-2 * Math.PI * 5 - step * 2, n)).toBe(2) // many turns later
    expect(frontIndex(0, 0)).toBe(-1)
  })

  it('spaces the ring so neighbours never touch', () => {
    for (const n of [1, 3, 7, 15, 30]) {
      const gap = (2 * Math.PI * ringRadius(n)) / n
      expect(gap).toBeGreaterThan(MAX_WIDTH + 0.15)
    }
  })

  it('gives a bottle the same shape every visit', () => {
    expect(seedOf('8')).toBe(seedOf('8'))
    expect(seedOf('8')).not.toBe(seedOf('9'))
  })
})

describe('the real bottles', () => {
  it('every named bottle has its own form, and none is wider than the shelf allows', async () => {
    const { BOTTLE_SPECS } = await import('./bottleSpecs')
    const { MAX_WIDTH } = await import('./bottleModel')
    const ids = Object.keys(BOTTLE_SPECS)
    expect(ids.length).toBe(14) // every curated bottle except the custom oud blend
    const forms = new Set(ids.map(id => JSON.stringify({ b: BOTTLE_SPECS[id].body, c: BOTTLE_SPECS[id].cap, g: BOTTLE_SPECS[id].glass.tint })))
    expect(forms.size).toBeGreaterThanOrEqual(11) // Hwyl/Aurner and the two Dior LCPs truly share a bottle
    for (const id of ids) expect(Math.max(BOTTLE_SPECS[id].body.w, BOTTLE_SPECS[id].body.d)).toBeLessThanOrEqual(MAX_WIDTH)
  })
})
