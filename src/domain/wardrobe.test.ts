import { describe, it, expect, beforeEach } from 'vitest'
import { createWardrobe } from './wardrobe'

function memoryStorage(): Storage {
  const m = new Map<string, string>()
  return {
    getItem: k => m.get(k) ?? null,
    setItem: (k, v) => void m.set(k, v),
    removeItem: k => void m.delete(k),
    clear: () => m.clear(),
    key: i => [...m.keys()][i] ?? null,
    get length() { return m.size },
  } as Storage
}

describe('wardrobe', () => {
  let store: ReturnType<typeof createWardrobe>
  beforeEach(() => { store = createWardrobe(memoryStorage(), () => '2026-06-15T00:00:00.000Z') })

  it('starts empty', () => {
    expect(store.list()).toEqual([])
  })
  it('adds an owned scent with addedAt timestamp', () => {
    store.add('tomford-noir', 'owned')
    const e = store.get('tomford-noir')
    expect(e?.ownership).toBe('owned')
    expect(e?.addedAt).toBe('2026-06-15T00:00:00.000Z')
  })
  it('rates a scent and clamps to 0..10', () => {
    store.add('tomford-noir', 'owned')
    store.rate('tomford-noir', 8.4)
    expect(store.get('tomford-noir')?.score).toBe(8.4)
    store.rate('tomford-noir', 99)
    expect(store.get('tomford-noir')?.score).toBe(10)
  })
  it('removes a scent', () => {
    store.add('tomford-noir', 'owned')
    store.remove('tomford-noir')
    expect(store.get('tomford-noir')).toBeUndefined()
  })
  it('notifies subscribers on change', () => {
    let calls = 0
    store.subscribe(() => { calls++ })
    store.add('tomford-noir', 'owned')
    expect(calls).toBe(1)
  })
  it('rate on a scent not in the wardrobe is a no-op', () => {
    store.rate('not-added', 5)
    expect(store.get('not-added')).toBeUndefined()
  })
  it('get returns a copy that cannot mutate the store', () => {
    store.add('tomford-noir', 'owned')
    const e = store.get('tomford-noir')!
    e.score = 99
    expect(store.get('tomford-noir')?.score).toBeUndefined()
  })
  it('unsubscribe stops notifications', () => {
    let calls = 0
    const unsub = store.subscribe(() => { calls++ })
    unsub()
    store.add('tomford-noir', 'owned')
    expect(calls).toBe(0)
  })
  it('persists across instances using the same storage', () => {
    const storage = memoryStorage()
    const a = createWardrobe(storage)
    a.add('lelabo-santal33', 'owned')
    const b = createWardrobe(storage)
    expect(b.get('lelabo-santal33')?.ownership).toBe('owned')
  })
})
