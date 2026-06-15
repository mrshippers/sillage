export const FAMILIES = [
  'floral', 'amber', 'woody', 'fresh',
  'aromatic', 'spicy', 'smoky', 'gourmand',
] as const
export type Family = (typeof FAMILIES)[number]
export function isFamily(value: string): value is Family {
  return (FAMILIES as readonly string[]).includes(value)
}

export type Layer = 'top' | 'heart' | 'base'
export interface Note { name: string; layer: Layer }
export interface Accord { name: string; strength: number } // 0..1

export interface Scent {
  id: string
  brand: string
  name: string
  year?: number
  families: Family[]
  accords: Accord[]
  notes: Note[]
  ingredientKey: string
  blurb?: string
  needsEnrichment?: boolean
}

export type Ownership = 'owned' | 'wishlist' | 'finished'
export interface WardrobeEntry {
  scentId: string
  ownership: Ownership
  score?: number
  notes?: string
  lastWornAt?: string
  addedAt: string
}
