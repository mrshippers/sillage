import { describe, it, expect } from 'vitest'
import { createCatalogue } from './catalogue'
import { SEED_SCENTS } from './catalogue.seed'

const cat = createCatalogue(SEED_SCENTS)

describe('catalogue', () => {
  it('gets all and by id', () => {
    expect(cat.getAll()).toHaveLength(SEED_SCENTS.length)
    expect(cat.getById('tomford-noir')?.name).toBe('Noir')
    expect(cat.getById('missing')).toBeUndefined()
  })
  it('searches by name and brand, case-insensitive', () => {
    expect(cat.search('noir').map(s => s.id)).toEqual(['tomford-noir'])
    expect(cat.search('aesop').length).toBe(2)
  })
  it('filters by family and brand', () => {
    expect(cat.filter({ family: 'woody' }).every(s => s.families.includes('woody'))).toBe(true)
    expect(cat.filter({ brand: 'Dior' }).length).toBe(2)
  })
  it('sorts by name ascending', () => {
    const names = cat.sort(cat.getAll(), 'name').map(s => s.name)
    const sorted = [...names].sort((a, b) => a.localeCompare(b))
    expect(names).toEqual(sorted)
  })
})
