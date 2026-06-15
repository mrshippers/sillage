import type { WardrobeEntry, Ownership } from './types'

const KEY = 'sillage.wardrobe.v1'
type Listener = () => void
const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n))

export interface Wardrobe {
  list(): WardrobeEntry[]
  get(scentId: string): WardrobeEntry | undefined
  add(scentId: string, ownership: Ownership): void
  remove(scentId: string): void
  rate(scentId: string, score: number): void
  subscribe(fn: Listener): () => void
}

export function createWardrobe(
  storage: Storage = localStorage,
  now: () => string = () => new Date().toISOString(),
): Wardrobe {
  function load(): WardrobeEntry[] {
    try { return JSON.parse(storage.getItem(KEY) ?? '[]') } catch { return [] }
  }

  let entries: WardrobeEntry[] = load()
  const listeners = new Set<Listener>()

  function persist() {
    storage.setItem(KEY, JSON.stringify(entries))
    listeners.forEach(fn => fn())
  }
  function upsert(scentId: string, patch: Partial<WardrobeEntry>) {
    const i = entries.findIndex(e => e.scentId === scentId)
    if (i === -1) entries = [...entries, { scentId, ownership: 'owned', addedAt: now(), ...patch }]
    else entries = entries.map(e => e.scentId === scentId ? { ...e, ...patch } : e)
    persist()
  }

  return {
    list: () => [...entries],
    get: (id) => { const e = entries.find(e => e.scentId === id); return e ? { ...e } : undefined },
    add: (id, ownership) => upsert(id, { ownership }),
    remove: (id) => { entries = entries.filter(e => e.scentId !== id); persist() },
    rate: (id, score) => {
      if (!entries.some(e => e.scentId === id)) return
      upsert(id, { score: clamp(score, 0, 10) })
    },
    subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn) },
  }
}
