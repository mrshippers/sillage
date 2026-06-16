import { describe, it, expect } from 'vitest'
import { SEED_SCENTS } from './catalogue.seed'

describe('SEED_SCENTS', () => {
  it('has the expected number of scents', () => {
    expect(SEED_SCENTS).toHaveLength(18)
  })

  it('gives every profiled scent all 14 profile fields and matching tags', () => {
    for (const s of SEED_SCENTS) {
      if (!s.profile) continue
      expect(Object.keys(s.profile)).toHaveLength(14)
      expect(['light', 'medium', 'heavy']).toContain(s.profile.weight)
      expect(s.tags, `${s.id} has a profile but no tags`).toBeDefined()
    }
  })

  it('enriches the known wardrobe scents and adds the legacy-only ones', () => {
    const byId = new Map(SEED_SCENTS.map(s => [s.id, s]))
    expect(byId.get('aesop-hwyl')?.profile?.smoky).toBe(9)
    expect(byId.get('aesop-hwyl')?.aura).toBe('#4a5240')
    expect(byId.get('byredo-mojaveghost')?.mood).toBe('Ethereal')
    expect(byId.get('iaq-spanishtobacco')?.profile?.longevity).toBe(10)
    expect(byId.get('lelabo-tabac26')).toBeDefined()
    expect(byId.get('tomford-noirextreme')?.profile?.warmth).toBe(10)
  })

  it('leaves scents with no legacy data unprofiled', () => {
    const byId = new Map(SEED_SCENTS.map(s => [s.id, s]))
    expect(byId.get('lelabo-santal33')?.profile).toBeUndefined()
    expect(byId.get('aramic-heart')?.profile).toBeUndefined()
  })
})
