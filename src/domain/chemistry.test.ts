import { describe, it, expect } from 'vitest'
import { calcChemistry } from './chemistry'
import type { Scent, ScentProfile } from './types'

function scent(id: string, name: string, p: ScentProfile): Scent {
  return { id, brand: 'B', name, families: ['woody'], accords: [], notes: [], ingredientKey: 'k', profile: p }
}
const heavyWarm: ScentProfile = { warmth: 9, freshness: 1, sweet: 4, dark: 8, floral: 3, spicy: 7, green: 0, woody: 6, smoky: 6, musky: 2, resinous: 5, projection: 7, longevity: 9, weight: 'heavy' }
const lightFresh: ScentProfile = { warmth: 3, freshness: 8, sweet: 5, dark: 1, floral: 3, spicy: 1, green: 3, woody: 3, smoky: 0, musky: 6, resinous: 0, projection: 6, longevity: 5, weight: 'light' }

describe('calcChemistry', () => {
  it('returns null for fewer than two profiled scents', () => {
    expect(calcChemistry([])).toBeNull()
    expect(calcChemistry([scent('a', 'A', heavyWarm)])).toBeNull()
    const noProfile: Scent = { id: 'np', brand: 'B', name: 'NP', families: ['fresh'], accords: [], notes: [], ingredientKey: 'k' }
    expect(calcChemistry([scent('a', 'A', heavyWarm), noProfile])).toBeNull()
  })

  it('scores a complementary heavy+light pairing in range with structured output', () => {
    const result = calcChemistry([scent('a', 'Ambre', heavyWarm), scent('b', 'Night', lightFresh)])
    expect(result).not.toBeNull()
    expect(result!.total).toBeGreaterThanOrEqual(0)
    expect(result!.total).toBeLessThanOrEqual(100)
    expect(result!.weight.max).toBe(20)
    expect(['Excellent', 'Good', 'Fair', 'Risky']).toContain(result!.harmony.verdict)
    expect(result!.names).toEqual(['Ambre', 'Night'])
    expect(typeof result!.opening).toBe('string')
    expect(result!.application.length).toBeGreaterThan(0)
  })

  it('rewards weight contrast over identical heavy weights', () => {
    const twoHeavy = calcChemistry([scent('a', 'A', heavyWarm), scent('b', 'B', { ...heavyWarm })])!
    const contrast = calcChemistry([scent('a', 'A', heavyWarm), scent('b', 'B', lightFresh)])!
    expect(contrast.weight.score).toBeGreaterThan(twoHeavy.weight.score)
  })
})
