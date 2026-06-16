import { describe, it, expect } from 'vitest'
import { FAMILIES, isFamily } from './types'
import type { Scent, ScentProfile, ScentTags } from './types'

describe('families', () => {
  it('lists the eight families', () => {
    expect(FAMILIES).toHaveLength(8)
    expect(FAMILIES).toContain('woody')
  })
  it('validates family strings', () => {
    expect(isFamily('amber')).toBe(true)
    expect(isFamily('nonsense')).toBe(false)
  })
})

describe('Scent profile extensions', () => {
  it('accepts a fully enriched scent without type errors', () => {
    const profile: ScentProfile = {
      warmth: 7, freshness: 3, sweet: 1, dark: 8, floral: 0, spicy: 3,
      green: 5, woody: 9, smoky: 9, musky: 2, resinous: 7,
      projection: 5, longevity: 8, weight: 'heavy',
    }
    const tags: ScentTags = {
      occasions: ['solo'], weather: ['cold'], energy: ['calm'], time: ['evening'],
    }
    const scent: Scent = {
      id: 'x', brand: 'Y', name: 'Z', families: ['woody'],
      accords: [], notes: [], ingredientKey: 'k',
      profile, tags, season: ['autumn', 'winter'], mood: 'Meditative',
      aura: '#4a5240', application: 'Wrists.', effect: 'Quiet authority.',
    }
    expect(scent.profile?.weight).toBe('heavy')
    expect(scent.season).toContain('winter')
  })

  it('still accepts a bare scent with no profile', () => {
    const scent: Scent = {
      id: 'bare', brand: 'B', name: 'N', families: ['fresh'],
      accords: [], notes: [], ingredientKey: 'k',
    }
    expect(scent.profile).toBeUndefined()
  })
})
