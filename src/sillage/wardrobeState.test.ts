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
