import { describe, it, expect } from 'vitest'
import { suggestPairings } from './pairings'
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
