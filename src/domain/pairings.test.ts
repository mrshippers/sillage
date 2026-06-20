import { describe, it, expect } from 'vitest'
import { suggestPairings, chemistryPairings } from './pairings'
import { SEED_SCENTS } from './catalogue.seed'

describe('pairings', () => {
  it('ranks owned scents that share base notes or families with the target', () => {
    const target = SEED_SCENTS.find(s => s.id === 'tomford-noir')!
    const owned = SEED_SCENTS.filter(s => ['lelabo-santal33','aesop-hwyl','reef-summerpeach'].includes(s.id))
    const result = suggestPairings(target, owned)
    const ids = result.map(r => r.scent.id)
    expect(ids).not.toContain('tomford-noir')      // never pairs with itself
    expect(ids).toContain('aesop-hwyl')            // shares the smoky family
    expect(ids).not.toContain('reef-summerpeach')  // shares nothing, excluded
  })
  it('excludes the target itself', () => {
    const target = SEED_SCENTS.find(s => s.id === 'lelabo-santal33')!
    const result = suggestPairings(target, [target])
    expect(result).toEqual([])
  })
})

describe('chemistryPairings', () => {
  it('ranks profiled shelf scents by chemistry and excludes the target and unprofiled scents', () => {
    const byId = new Map(SEED_SCENTS.map(s => [s.id, s]))
    const target = byId.get('dior-ambrenuit')!
    const owned = SEED_SCENTS
    const result = chemistryPairings(target, owned)
    expect(result.length).toBeGreaterThan(0)
    expect(result.every(p => p.scent.id !== target.id)).toBe(true)
    expect(result.every(p => p.scent.profile !== undefined)).toBe(true)
    for (let i = 1; i < result.length; i++) {
      expect(result[i - 1].score).toBeGreaterThanOrEqual(result[i].score)
    }
  })
})
