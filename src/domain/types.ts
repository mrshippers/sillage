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

export type Weight = 'light' | 'medium' | 'heavy'
export type Season = 'spring' | 'summer' | 'autumn' | 'winter'

// 0..10 axes recovered from the original Sillage scent model.
export interface ScentProfile {
  warmth: number
  freshness: number
  sweet: number
  dark: number
  floral: number
  spicy: number
  green: number
  woody: number
  smoky: number
  musky: number
  resinous: number
  projection: number
  longevity: number
  weight: Weight
}

// Matching tags used by the daily selector engine.
export interface ScentTags {
  occasions: string[]
  weather: string[]
  energy: string[]
  time: string[]
}

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
  profile?: ScentProfile
  tags?: ScentTags
  season?: Season[]
  mood?: string
  aura?: string       // hex colour for the scent's visual aura
  application?: string // how/where to apply (legacy pulsePoints)
  effect?: string      // the social effect (legacy effect)
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
