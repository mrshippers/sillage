// Scent families + "your nose" profile, derived ENTIRELY from the real,
// hand-profiled axes on each Fragrance. Nothing here is invented — family
// membership falls out of the numeric profile (woody/floral/smoky/...).
import { FRAGRANCES } from './data'
import type { Fragrance } from './data'

export interface Family {
  key: string
  name: string
  glyph: string
  color: string
  test: (f: Fragrance) => boolean
}

export const FAMILIES: Family[] = [
  { key: 'floral', name: 'Floral', glyph: '❀', color: '#ff8fae', test: f => f.floral >= 5 },
  { key: 'amber', name: 'Amber', glyph: '◈', color: '#caa25f', test: f => f.resinous >= 6 },
  { key: 'woody', name: 'Woody', glyph: '❖', color: '#b07a4a', test: f => f.woody >= 6 },
  { key: 'fresh', name: 'Fresh', glyph: '✦', color: '#5fb0a0', test: f => f.freshness >= 6 },
  { key: 'aromatic', name: 'Aromatic', glyph: '❧', color: '#9fb46a', test: f => f.green >= 5 },
  { key: 'gourmand', name: 'Gourmand', glyph: '❥', color: '#d18a4a', test: f => f.sweet >= 6 },
  { key: 'smoky', name: 'Smoky', glyph: '⬤', color: '#a487a0', test: f => f.smoky >= 6 },
]

// Woody is Joa's home territory; default the wheel there if present.
export const DEFAULT_FAMILY = Math.max(0, FAMILIES.findIndex(f => f.key === 'woody'))

export function familyMembers(key: string): Fragrance[] {
  const fam = FAMILIES.find(x => x.key === key)
  return fam ? FRAGRANCES.filter(fam.test) : []
}

export function familyCount(key: string): number {
  return familyMembers(key).length
}

export interface NoseProfile {
  families: { name: string; color: string; pct: number }[]
  notes: string[]
  bottles: number
  avgLongevity: string
  anchor: string
}

// "Your Nose" — dominant families, signature notes and stats from the shelf.
export function deriveNose(): NoseProfile {
  const counts = FAMILIES
    .map(fam => ({ name: fam.name, color: fam.color, n: FRAGRANCES.filter(fam.test).length }))
    .filter(x => x.n > 0)
    .sort((a, b) => b.n - a.n)
  const total = counts.reduce((s, x) => s + x.n, 0) || 1
  const families = counts.map(x => ({ name: x.name, color: x.color, pct: Math.round((x.n / total) * 100) }))

  const noteCount = new Map<string, number>()
  FRAGRANCES.forEach(f => f.notes.forEach(n => noteCount.set(n, (noteCount.get(n) || 0) + 1)))
  const notes = [...noteCount.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6).map(e => e[0])

  const bottles = FRAGRANCES.length
  const avgLongevity = (FRAGRANCES.reduce((s, f) => s + f.longevity, 0) / bottles).toFixed(1)
  const anchor = [...FRAGRANCES].sort((a, b) => (b.projection + b.longevity) - (a.projection + a.longevity))[0].short
  return { families, notes, bottles, avgLongevity, anchor }
}

export function currentSeason(d = new Date()): 'Winter' | 'Spring' | 'Summer' | 'Autumn' {
  const m = d.getMonth()
  if (m <= 1 || m === 11) return 'Winter'
  if (m <= 4) return 'Spring'
  if (m <= 7) return 'Summer'
  return 'Autumn'
}

// Deterministic scent of the day: season-weighted, indexed by day-of-year so it
// is stable for the whole day and rotates honestly through the real shelf.
export function scentOfDay(d = new Date()): Fragrance {
  const season = currentSeason(d)
  const pool = FRAGRANCES.filter(f => f.season.includes(season))
  const list = pool.length ? pool : FRAGRANCES
  const start = new Date(d.getFullYear(), 0, 0)
  const doy = Math.floor((d.getTime() - start.getTime()) / 86400000)
  return list[doy % list.length]
}

export function greeting(d = new Date()): { hello: string; meta: string } {
  const h = d.getHours()
  const hello = h < 5 ? 'Still up' : h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : h < 21 ? 'Good evening' : 'Good night'
  const hh = `${String(h).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  const sky = h < 6 ? 'before dawn' : h < 12 ? 'morning light' : h < 17 ? 'afternoon' : h < 20 ? 'dusk' : 'after dark'
  return { hello, meta: `${hh} · ${sky} · ${currentSeason(d).toLowerCase()}` }
}

// A one-line reason for the scent of the day, built from its real fields.
export function reasonFor(f: Fragrance, season: string): string {
  const seasonal = f.season.includes(season) ? `It belongs to ${season.toLowerCase()}.` : 'A change of register from the season.'
  return `${f.description} ${seasonal}`
}
