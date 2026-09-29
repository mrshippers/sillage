/* One shape for every bottle on screen. The hand-profiled collection carries
 * its profile; a bottle you add carries none, so no engine, chart or score can
 * run on numbers that do not exist. Pure. */
import { FRAGRANCES, type Fragrance } from './data'
import type { OwnBottle } from './wardrobeState'

export type Bottle = {
  id: string
  name: string
  house: string
  short: string
  notes: string[]
  family: string | null
  /** the juice's colour, authored in the profile; null = plain paper */
  stain: string | null
  profile: Fragrance | null
}

export const AXES = [
  ['woody', 'Woody'],
  ['smoky', 'Smoky'],
  ['resinous', 'Resinous'],
  ['warmth', 'Warm'],
  ['spicy', 'Spicy'],
  ['sweet', 'Sweet'],
  ['musky', 'Musky'],
  ['floral', 'Floral'],
  ['green', 'Green'],
  ['freshness', 'Fresh'],
  ['dark', 'Dark'],
] as const satisfies readonly (readonly [keyof Fragrance, string])[]

export function fromProfile(f: Fragrance): Bottle {
  return { id: String(f.id), name: f.name, house: f.house, short: f.short, notes: f.notes, family: f.family, stain: f.color, profile: f }
}

export function fromOwn(b: OwnBottle): Bottle {
  return { id: b.id, name: `${b.house} ${b.name}`, house: b.house, short: b.name, notes: b.notes, family: null, stain: null, profile: null }
}

export function allBottles(own: readonly OwnBottle[]): Bottle[] {
  return [...FRAGRANCES.map(fromProfile), ...own.map(fromOwn)]
}

/** axes in the fixed display order, 0 to 10; empty for an unprofiled bottle */
export function axisValues(b: Bottle): { key: string; label: string; value: number }[] {
  if (!b.profile) return []
  const p = b.profile
  return AXES.map(([key, label]) => ({ key, label, value: Number(p[key]) }))
}

/** every note across the given bottles, most carried first, then A to Z */
export function noteIndex(bottles: readonly Bottle[]): { note: string; ids: string[] }[] {
  const m = new Map<string, string[]>()
  for (const b of bottles) for (const n of b.notes) m.set(n, [...(m.get(n) ?? []), b.id])
  return [...m].map(([note, ids]) => ({ note, ids })).sort((a, b) => b.ids.length - a.ids.length || a.note.localeCompare(b.note))
}
