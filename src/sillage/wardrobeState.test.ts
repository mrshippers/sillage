import { describe, it, expect, beforeEach } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { FRAGRANCES } from './data'
import { deriveNose } from './families'
import { useBottleStatus, usePersisted } from './wardrobeState'

describe('deriveNose over a list', () => {
  it('counts only the bottles it is given', () => {
    const two = FRAGRANCES.slice(0, 2)
    const nose = deriveNose(two)
    expect(nose.bottles).toBe(2)
    expect(two.map(f => f.short)).toContain(nose.anchor)
  })
  it('an empty shelf reads as empty, not a crash or a fake number', () => {
    const nose = deriveNose([])
    expect(nose).toMatchObject({ bottles: 0, anchor: '-', avgLongevity: '-', families: [], notes: [] })
  })
})

describe('bottle status', () => {
  beforeEach(() => localStorage.clear())

  it('every bottle starts on the shelf', () => {
    const { result } = renderHook(() => useBottleStatus())
    expect(FRAGRANCES.every(f => result.current.statusOf(f.id) === 'owned')).toBe(true)
  })
  it('a finished bottle stays finished across a reload', () => {
    const id = FRAGRANCES[0].id
    const first = renderHook(() => useBottleStatus())
    act(() => first.result.current.setStatus(id, 'finished'))
    expect(first.result.current.statusOf(id)).toBe('finished')
    expect(localStorage.getItem('sillage.wardrobe.v1')).toContain(`"${id}"`)
    // a second consumer reads the same store
    const second = renderHook(() => useBottleStatus())
    expect(second.result.current.statusOf(id)).toBe('finished')
  })
  it('putting a bottle back on the shelf clears its entry', () => {
    const id = FRAGRANCES[1].id
    const { result } = renderHook(() => useBottleStatus())
    act(() => result.current.setStatus(id, 'wishlist'))
    act(() => result.current.setStatus(id, 'owned'))
    expect(result.current.statusOf(id)).toBe('owned')
    expect(localStorage.getItem('sillage.wardrobe.v1')).not.toContain(`"${id}"`)
  })
})

describe('persisted setting', () => {
  beforeEach(() => localStorage.clear())

  it('remembers a choice', () => {
    const first = renderHook(() => usePersisted('sillage.test', 'a', ['a', 'b'] as const))
    act(() => first.result.current[1]('b'))
    const again = renderHook(() => usePersisted('sillage.test', 'a', ['a', 'b'] as const))
    expect(again.result.current[0]).toBe('b')
  })
  it('ignores a stored value it does not recognise', () => {
    localStorage.setItem('sillage.test', JSON.stringify('neon'))
    const { result } = renderHook(() => usePersisted('sillage.test', 'a', ['a', 'b'] as const))
    expect(result.current[0]).toBe('a')
  })
})

import { mostWorn, parseOwnBottle, useWears, todayLocal } from './wardrobeState'

describe('ratings', () => {
  beforeEach(() => localStorage.clear())
  it('a rated bottle keeps its score when it goes back on the shelf', () => {
    const id = FRAGRANCES[2].id
    const { result } = renderHook(() => useBottleStatus())
    act(() => result.current.rate(id, 8))
    act(() => result.current.setStatus(id, 'finished'))
    act(() => result.current.setStatus(id, 'owned'))
    expect(result.current.scoreOf(id)).toBe(8)
    expect(result.current.statusOf(id)).toBe('owned')
  })
  it('clears a score back to unrated', () => {
    const id = FRAGRANCES[3].id
    const { result } = renderHook(() => useBottleStatus())
    act(() => result.current.rate(id, 6))
    act(() => result.current.rate(id, null))
    expect(result.current.scoreOf(id)).toBeNull()
  })
})

describe('wear diary', () => {
  beforeEach(() => localStorage.clear())
  it('wearing it twice today is one wear, and a second tap takes it back', () => {
    const { result } = renderHook(() => useWears())
    act(() => result.current.toggleToday(1))
    expect(result.current.count(1)).toBe(1)
    expect(result.current.wornToday(1)).toBe(true)
    act(() => result.current.toggleToday(1))
    expect(result.current.count(1)).toBe(0)
  })
  it('most worn ranks by count, then the more recent', () => {
    expect(mostWorn({ a: ['2026-09-01'], b: ['2026-09-02', '2026-09-03'], c: ['2026-09-05'], d: [] })).toEqual([
      { id: 'b', count: 2 }, { id: 'c', count: 1 }, { id: 'a', count: 1 },
    ])
  })
  it('today is the local calendar day', () => {
    expect(todayLocal(new Date(2026, 8, 30, 23, 30))).toBe('2026-09-30')
  })
})

describe('a bottle you add', () => {
  it('takes your notes and never invents a profile', () => {
    const b = parseOwnBottle({ name: ' Oud Wood ', house: 'Tom Ford', notes: 'oud, rosewood,\ncardamom' }, '2026-09-30')
    expect(b).toEqual({ id: 'own-tom-ford-oud-wood', name: 'Oud Wood', house: 'Tom Ford', notes: ['Oud', 'Rosewood', 'Cardamom'], addedOn: '2026-09-30' })
    expect(Object.keys(b)).not.toContain('warmth')
  })
  it('needs a name and a house', () => {
    expect(parseOwnBottle({ name: '', house: 'Aesop', notes: '' }, '2026-09-30')).toEqual({ error: 'Give it its name.' })
    expect(parseOwnBottle({ name: 'Hwyl', house: '', notes: '' }, '2026-09-30')).toEqual({ error: 'Which house made it?' })
  })
})
