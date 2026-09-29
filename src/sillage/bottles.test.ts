import { describe, expect, it } from 'vitest'
import { FRAGRANCES } from './data'
import { allBottles, axisValues, noteIndex } from './bottles'

const own = [{ id: 'own-x', name: 'Oud Wood', house: 'Tom Ford', notes: ['Oud', 'Cedar'], addedOn: '2026-09-30' }]

describe('bottles', () => {
  it('your collection keeps its profile; an added bottle has none and no stain', () => {
    const all = allBottles(own)
    expect(all).toHaveLength(FRAGRANCES.length + 1)
    const added = all.at(-1)!
    expect(added).toMatchObject({ profile: null, stain: null, family: null })
    expect(axisValues(added)).toEqual([])
  })
  it('reads eleven axes from a real profile, in the fixed order', () => {
    const v = axisValues(allBottles([])[0])
    expect(v).toHaveLength(11)
    expect(v[0]).toEqual({ key: 'woody', label: 'Woody', value: FRAGRANCES[0].woody })
  })
  it('indexes notes by how many bottles carry them', () => {
    const idx = noteIndex(allBottles(own))
    const cedar = idx.find(n => n.note === 'Cedar')!
    expect(cedar.ids).toContain('own-x')
    expect(idx[0].ids.length).toBeGreaterThanOrEqual(idx.at(-1)!.ids.length)
  })
})
