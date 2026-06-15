import { describe, it, expect } from 'vitest'
import { SEED_SCENTS } from './catalogue.seed'
import { isFamily } from './types'

describe('seed catalogue', () => {
  it('has 15 scents with unique ids', () => {
    expect(SEED_SCENTS).toHaveLength(15)
    const ids = new Set(SEED_SCENTS.map(s => s.id))
    expect(ids.size).toBe(15)
  })
  it('every scent has a brand, name, and valid families', () => {
    for (const s of SEED_SCENTS) {
      expect(s.brand.length).toBeGreaterThan(0)
      expect(s.name.length).toBeGreaterThan(0)
      expect(s.families.length).toBeGreaterThan(0)
      expect(s.families.every(isFamily)).toBe(true)
    }
  })
  it('includes Mojave Ghost and NOT Gypsy Water', () => {
    const names = SEED_SCENTS.map(s => s.name)
    expect(names).toContain('Mojave Ghost')
    expect(names).not.toContain('Gypsy Water')
  })
})
