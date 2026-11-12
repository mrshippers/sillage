import { describe, expect, it } from 'vitest'
import { fromRows, merge, removedKeys, toRows, type Snapshot } from './snapshot'

const local: Snapshot = {
  wardrobe: [{ scentId: '12', ownership: 'owned', score: 8 }, { scentId: '3', ownership: 'wishlist' }],
  wears: { '12': ['2026-11-12'] },
  own: [{ id: 'own-a', name: 'Aa', house: 'Hh', notes: [], addedOn: '2026-11-01' }],
}
const remote: Snapshot = {
  wardrobe: [{ scentId: '12', ownership: 'finished', score: 9 }],
  wears: { '12': ['2026-11-10', '2026-11-12'] },
  own: [],
}

describe('sync', () => {
  it('round-trips through rows without losing anything', () => {
    expect(fromRows(toRows(local))).toEqual(local)
  })

  it('merges on sign-in: the account wins on a shared bottle, nothing is dropped, wear days union', () => {
    const m = merge(local, remote)
    expect(m.wardrobe.find(e => e.scentId === '12')).toMatchObject({ ownership: 'finished', score: 9 })
    expect(m.wardrobe.find(e => e.scentId === '3')?.ownership).toBe('wishlist')
    expect(m.wears['12']).toEqual(['2026-11-10', '2026-11-12'])
    expect(m.own.map(b => b.id)).toEqual(['own-a'])
  })

  it('knows which rows to delete when you take something off', () => {
    const before = toRows(local)
    const after = toRows({ ...local, wardrobe: local.wardrobe.filter(e => e.scentId !== '3'), wears: {} })
    const gone = removedKeys(before, after)
    expect(gone.wardrobe.map(r => r.scent_id)).toEqual(['3'])
    expect(gone.wears).toHaveLength(1)
    expect(gone.own_bottles).toHaveLength(0)
  })
})
