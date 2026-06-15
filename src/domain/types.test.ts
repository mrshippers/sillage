import { describe, it, expect } from 'vitest'
import { FAMILIES, isFamily } from './types'

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
