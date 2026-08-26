// Scent families + "your nose" profile, derived ENTIRELY from the real,
// hand-profiled axes on each Fragrance. Nothing here is invented — family
// membership falls out of the numeric profile (woody/floral/smoky/...).
import { FRAGRANCES } from './data'
import type { Fragrance } from './data'

export interface Family {
  key: string
  name: string
  /** SVG path data, drawn on a 24x24 grid, stroked not filled. Replaces the
   * typographic dingbats (❀ ◈ ❖ ✦ ❧ ❥ ⬤) that were the loudest amateur tell
   * on the Wheel: at one font-size they had wildly different optical weights
   * and cap-heights, and their meanings were arbitrary. These are drawn to a
   * common grid and stroke weight, and each one depicts its actual family. */
  icon: string[]
  color: string
  test: (f: Fragrance) => boolean
}

export const FAMILIES: Family[] = [
  {
    key: 'floral',
    name: 'Floral',
    // blossom: five petals around a seed
    icon: [
      'M12 12m-2 0a2 2 0 104 0a2 2 0 10-4 0',
      'M12 10V6.2M13.9 11.4l3-2.6M13.2 14l2.3 3.3M10.8 14l-2.3 3.3M10.1 11.4l-3-2.6',
      'M12 6.2a2.6 2.6 0 10-.1 0M16.9 8.8a2.6 2.6 0 10.1.1M15.5 17.3a2.6 2.6 0 10-.1-.1M8.5 17.3a2.6 2.6 0 10.1-.1M7.1 8.8a2.6 2.6 0 10-.1.1',
    ],
    color: '#ff8fae',
    test: f => f.floral >= 5,
  },
  {
    key: 'amber',
    name: 'Amber',
    // a faceted drop of resin
    icon: ['M12 4.6c3.4 4.1 5.2 6.8 5.2 9.2a5.2 5.2 0 11-10.4 0c0-2.4 1.8-5.1 5.2-9.2z', 'M12 9.4l2.6 4.4-2.6 4.4-2.6-4.4z'],
    color: '#caa25f',
    test: f => f.resinous >= 6,
  },
  {
    key: 'woody',
    name: 'Woody',
    // heartwood: offset growth rings
    icon: [
      'M12 12m-8 0a8 8 0 1016 0a8 8 0 10-16 0',
      'M11.2 12m-5.1 0a5.1 5.1 0 1010.2 0a5.1 5.1 0 10-10.2 0',
      'M10.6 12m-2.4 0a2.4 2.4 0 104.8 0a2.4 2.4 0 10-4.8 0',
    ],
    color: '#b07a4a',
    test: f => f.woody >= 6,
  },
  {
    key: 'fresh',
    name: 'Fresh',
    // citrus segment
    icon: ['M12 12m-8 0a8 8 0 1016 0a8 8 0 10-16 0', 'M12 4v16M4 12h16M6.3 6.3l11.4 11.4M17.7 6.3L6.3 17.7'],
    color: '#5fb0a0',
    test: f => f.freshness >= 6,
  },
  {
    key: 'aromatic',
    name: 'Aromatic',
    // a herb sprig, paired leaves off a stem
    icon: [
      'M12 20V7',
      'M12 16.4c-2.9 0-4.4-1.3-4.4-3.6 2.9 0 4.4 1.2 4.4 3.6zM12 16.4c2.9 0 4.4-1.3 4.4-3.6-2.9 0-4.4 1.2-4.4 3.6z',
      'M12 11c-2.4 0-3.7-1.1-3.7-3 2.4 0 3.7 1 3.7 3zM12 11c2.4 0 3.7-1.1 3.7-3-2.4 0-3.7 1-3.7 3z',
    ],
    color: '#9fb46a',
    test: f => f.green >= 5,
  },
  {
    key: 'gourmand',
    name: 'Gourmand',
    // vanilla pod with its seam
    icon: ['M8.6 4.4c4.8 2.1 7.6 7.6 6.8 15.2-4.8-2.1-7.6-7.6-6.8-15.2z', 'M9.4 6.8c3.2 2.5 4.9 6.4 4.8 10.9'],
    color: '#d18a4a',
    test: f => f.sweet >= 6,
  },
  {
    key: 'smoky',
    name: 'Smoky',
    // a curl of smoke rising off an ember
    icon: [
      'M9.5 19.5c0-2.4 5-2.9 5-5.6 0-1.9-2.2-2.3-2.2-4.1 0-2 2.6-2.6 2.6-5.3',
      'M6.6 19.5c0-1.7 2.6-2.2 2.6-4',
    ],
    color: '#a487a0',
    test: f => f.smoky >= 6,
  },
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
