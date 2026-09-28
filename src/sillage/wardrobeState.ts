import { useCallback, useEffect, useState } from 'react'
import { createWardrobe } from '../domain/wardrobe'
import type { Ownership } from '../domain/types'

// The collection in ./data is the owner's own, so a bottle with no entry is on
// the shelf; only a change of state (finished, wishlist) is written. One store
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
    (id: number): Ownership => entries.find(e => e.scentId === String(id))?.ownership ?? 'owned',
    [entries],
  )
  const setStatus = useCallback((id: number, status: Ownership) => {
    if (status === 'owned') wardrobe.remove(String(id))
    else wardrobe.add(String(id), status)
  }, [])
  return { statusOf, setStatus }
}

/** A setting that survives a reload. A stored value outside `allowed` is ignored. */
export function usePersisted<T>(key: string, initial: T, allowed: readonly T[]): [T, (next: T) => void] {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key)
      if (raw !== null) {
        const parsed = JSON.parse(raw) as T
        if (allowed.includes(parsed)) return parsed
      }
    } catch {
      // private mode or a corrupt value: fall back to the default
    }
    return initial
  })
  const set = useCallback(
    (next: T) => {
      setValue(next)
      try {
        localStorage.setItem(key, JSON.stringify(next))
      } catch {
        // storage refused: the choice holds for this visit only
      }
    },
    [key],
  )
  return [value, set]
}
