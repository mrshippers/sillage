import { describe, it, expect } from 'vitest'
import { scoreScent, rankDaily, layerPartner, WEATHER_MAP, OCCASION_MAP } from './selector'
import type { Scent, ScentProfile, ScentTags } from './types'

function mk(id: string, name: string, profile: ScentProfile, tags: ScentTags): Scent {
  return { id, brand: 'B', name, families: ['woody'], accords: [], notes: [{ name: 'X', layer: 'base' }], ingredientKey: 'k', profile, tags }
}
const coldBeast: ScentProfile = { warmth: 9, freshness: 1, sweet: 4, dark: 8, floral: 3, spicy: 7, green: 0, woody: 6, smoky: 6, musky: 2, resinous: 5, projection: 7, longevity: 9, weight: 'heavy' }
const summerSplash: ScentProfile = { warmth: 3, freshness: 9, sweet: 6, dark: 0, floral: 2, spicy: 0, green: 6, woody: 1, smoky: 0, musky: 1, resinous: 0, projection: 3, longevity: 4, weight: 'light' }
const coldTags: ScentTags = { occasions: ['dinner', 'event'], weather: ['cold', 'cool'], energy: ['bold', 'confident'], time: ['evening', 'night'] }
const hotTags: ScentTags = { occasions: ['brunch', 'beach', 'daytime'], weather: ['hot', 'warm', 'sunny'], energy: ['light', 'energetic'], time: ['morning', 'afternoon'] }

describe('scoreScent', () => {
  it('maps the legacy condition keys', () => {
    expect(WEATHER_MAP['Hot (26°C+)']).toBe('hot')
    expect(OCCASION_MAP['Night Out']).toContain('night out')
  })

  it('scores a warm beast higher on a cold night than a summer splash', () => {
    const conditions = { weather: ['Cold (< 8°C)'], occasion: 'Dinner Out', energy: 'Confident & Sharp', time: 'Night' }
    const beast = scoreScent(mk('beast', 'Beast', coldBeast, coldTags), conditions)
    const splash = scoreScent(mk('splash', 'Splash', summerSplash, hotTags), conditions)
    expect(beast).toBeGreaterThan(splash)
    expect(beast).toBeLessThanOrEqual(100)
  })

  it('returns 0 for a scent with no profile or tags', () => {
    const bare: Scent = { id: 'b', brand: 'B', name: 'Bare', families: ['fresh'], accords: [], notes: [], ingredientKey: 'k' }
    expect(scoreScent(bare, { weather: ['Hot (26°C+)'], occasion: '', energy: '', time: '' })).toBe(0)
  })
})

describe('rankDaily', () => {
  it('ranks the better-matched scent first and applies a recency nudge', () => {
    const beast = mk('beast', 'Beast', coldBeast, coldTags)
    const splash = mk('splash', 'Splash', summerSplash, hotTags)
    const conditions = { weather: ['Cold (< 8°C)'], occasion: 'Dinner Out', energy: '', time: 'Night' }
    const ranked = rankDaily([splash, beast], conditions)
    expect(ranked[0].scent.id).toBe('beast')
    expect(ranked[0].score).toBeGreaterThanOrEqual(ranked[1].score)
  })
})

describe('layerPartner', () => {
  it('suggests a chemistry-viable partner excluding the primary', () => {
    const beast = mk('beast', 'Beast', coldBeast, coldTags)
    const splash = mk('splash', 'Splash', summerSplash, hotTags)
    const partner = layerPartner(beast, [beast.id], [beast, splash])
    expect(partner?.scent.id).toBe('splash')
    expect(partner?.chemistry).toBeGreaterThanOrEqual(0)
  })
})
