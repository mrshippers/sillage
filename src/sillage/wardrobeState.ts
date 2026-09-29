import { useCallback, useEffect, useState } from 'react'
import { createWardrobe } from '../domain/wardrobe'
import type { Ownership } from '../domain/types'

// The collection in ./data is the owner's own, so a bottle with no entry is on
// the shelf; only a change (finished, wishlist, a rating) is written. One store
// per tab, on localStorage, through the typed domain wardrobe.
const wardrobe = createWardrobe()

export const STATUS_LABEL: Record<Ownership, string> = {
  owned: 'On the shelf',
  finished: 'Finished',
  wishlist: 'Wishlist',
}

export function useBottleStatus() {
  const [entries, setEntries] = useState(() => wardrobe.list())
  useEffect(() => {
    const off = wardrobe.subscribe(() => setEntries(wardrobe.list()))
    return () => void off()
  }, [])
  const statusOf = useCallback(
    (id: number | string): Ownership => entries.find(e => e.scentId === String(id))?.ownership ?? 'owned',
    [entries],
  )
  /** your 0-10 score, or null if you have not rated it */
  const scoreOf = useCallback(
    (id: number | string): number | null => entries.find(e => e.scentId === String(id))?.score ?? null,
    [entries],
  )
  const setStatus = useCallback((id: number | string, status: Ownership) => {
    const key = String(id)
    const has = wardrobe.get(key)
    // back on the shelf with nothing else recorded: forget the entry; a rating keeps it
    if (status === 'owned' && (!has || has.score === undefined)) wardrobe.remove(key)
    else wardrobe.add(key, status)
  }, [])
  const rate = useCallback((id: number | string, score: number | null) => {
    const key = String(id)
    if (score === null) {
      const has = wardrobe.get(key)
      if (!has) return
      if (has.ownership === 'owned') wardrobe.remove(key)
      else wardrobe.add(key, has.ownership) // keeps status, drops nothing else we store
      return
    }
    if (!wardrobe.get(key)) wardrobe.add(key, 'owned')
    wardrobe.rate(key, score)
  }, [])
  return { statusOf, scoreOf, setStatus, rate }
}

/* ── storage helpers: every read and write survives a refused storage ───── */

function read<T>(key: string, fallback: T, ok: (v: unknown) => v is T): T {
  try {
    const raw = localStorage.getItem(key)
    if (raw === null) return fallback
    const v = JSON.parse(raw) as unknown
    return ok(v) ? v : fallback
  } catch {
    return fallback
  }
}
function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // storage refused: holds for this visit only
  }
}

/** A setting that survives a reload. A stored value outside `allowed` is ignored. */
export function usePersisted<T>(key: string, initial: T, allowed: readonly T[]): [T, (next: T) => void] {
  const [value, setValue] = useState<T>(() => read(key, initial, (v): v is T => allowed.includes(v as T)))
  const set = useCallback(
    (next: T) => {
      setValue(next)
      write(key, next)
    },
    [key],
  )
  return [value, set]
}

/* ── the wear diary: the dates you wore each bottle ─────────────────────── */

export const WEARS_KEY = 'sillage.wears.v1'
type Wears = Record<string, string[]>
const isWears = (v: unknown): v is Wears =>
  !!v && typeof v === 'object' && Object.values(v as object).every(a => Array.isArray(a) && a.every(d => typeof d === 'string'))

export function todayLocal(d = new Date()): string {
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

export function useWears() {
  const [wears, setWears] = useState<Wears>(() => read(WEARS_KEY, {}, isWears))
  const save = (next: Wears) => {
    setWears(next)
    write(WEARS_KEY, next)
  }
  /** toggle today for a bottle: wearing it twice in a day is still one wear */
  const toggleToday = (id: number | string) => {
    const key = String(id)
    const today = todayLocal()
    const list = wears[key] ?? []
    const next = list.includes(today) ? list.filter(d => d !== today) : [...list, today].sort()
    save({ ...wears, [key]: next })
  }
  const wornToday = (id: number | string) => (wears[String(id)] ?? []).includes(todayLocal())
  const count = (id: number | string) => (wears[String(id)] ?? []).length
  const last = (id: number | string) => (wears[String(id)] ?? []).at(-1) ?? null
  return { wears, toggleToday, wornToday, count, last }
}

/** most worn first; ties by the more recent wear. Only bottles actually worn. */
export function mostWorn(wears: Wears, limit = 3): { id: string; count: number }[] {
  return Object.entries(wears)
    .filter(([, d]) => d.length > 0)
    .sort((a, b) => b[1].length - a[1].length || (b[1].at(-1) ?? '').localeCompare(a[1].at(-1) ?? ''))
    .slice(0, limit)
    .map(([id, d]) => ({ id, count: d.length }))
}

/* ── bottles you add: entered by you, never profiled by guess ───────────── */

export type OwnBottle = { id: string; name: string; house: string; notes: string[]; addedOn: string }
export const OWN_KEY = 'sillage.own.v1'
const isOwn = (v: unknown): v is OwnBottle[] =>
  Array.isArray(v) && v.every(b => b && typeof b.id === 'string' && typeof b.name === 'string' && Array.isArray(b.notes))

export function parseOwnBottle(input: { name: string; house: string; notes: string }, today: string): OwnBottle | { error: string } {
  const clean = (s: string) => s.trim().replace(/\s+/g, ' ')
  const name = clean(input.name ?? '')
  const house = clean(input.house ?? '')
  if (name.length < 2 || name.length > 60) return { error: 'Give it its name.' }
  if (house.length < 2 || house.length > 40) return { error: 'Which house made it?' }
  const notes = (input.notes ?? '')
    .split(/[,\n]/)
    .map(clean)
    .filter(Boolean)
    .map(n => n.charAt(0).toUpperCase() + n.slice(1))
    .slice(0, 12)
  const id = `own-${house}-${name}`.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  return { id, name, house, notes, addedOn: today }
}

export function useOwnBottles() {
  const [own, setOwn] = useState<OwnBottle[]>(() => read(OWN_KEY, [], isOwn))
  const add = (b: OwnBottle) => {
    const next = [...own.filter(x => x.id !== b.id), b]
    setOwn(next)
    write(OWN_KEY, next)
  }
  const remove = (id: string) => {
    const next = own.filter(x => x.id !== id)
    setOwn(next)
    write(OWN_KEY, next)
  }
  return { own, add, remove }
}
