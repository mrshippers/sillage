# Sillage Phase 1.5 — Domain Depth Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transplant the original Sillage's quantitative scent model and its two working engines (Chemistry + Daily Selector) into the typed, tested rebuild domain, so later surfaces have a real brain to render.

**Architecture:** Pure framework-free domain modules under `src/domain`, same as Phase 1. Extend the `Scent` type with an optional numeric `profile`, `tags`, and editorial fields (all optional, so existing data and tests keep passing). Port `calcChemistry` and `scoreFragrance` from the legacy `App.jsx` as typed, unit-tested modules that operate on `Scent.profile`. Enrich the seed catalogue with the real per-scent data recovered from the original source. No UI in this phase.

**Tech Stack:** TypeScript, Vitest. No new dependencies.

**Source of truth for the ported data:** the original app at `git show origin/main:src/App.jsx` (the `FRAGRANCES` array, `calcChemistry`, `scoreFragrance`, `getLayerPartner`). All numbers, tag arrays, and editorial copy in this plan are transcribed verbatim from there. Do not invent values.

**Non-fabrication rule:** Only scents that have real data in the legacy source get a `profile`. Four scents have no legacy equivalent (`lelabo-santal33`, `tomford-noir` 2012, `aramic-heart`, `aramic-heaven`) and MUST be left without a `profile` — the engines guard for that. Three legacy-only scents with full real data are added (`iaq-spanishtobacco`, `lelabo-tabac26`, `tomford-noirextreme`).

---

## File Structure

- `src/domain/types.ts` — **modify**: add `Weight`, `Season`, `ScentProfile`, `ScentTags`; extend `Scent` with optional `profile`, `season`, `mood`, `aura`, `tags`, `application`, `effect`.
- `src/domain/chemistry.ts` — **create**: `calcChemistry(scents)` → `ChemistryResult | null`. The Perfumery Lab brain.
- `src/domain/chemistry.test.ts` — **create**.
- `src/domain/selector.ts` — **create**: condition maps + `scoreScent`, `rankDaily`, `layerPartner`. The Daily brain.
- `src/domain/selector.test.ts` — **create**.
- `src/domain/catalogue.seed.ts` — **modify (full rewrite)**: enrich existing scents with profile/tags/copy, add the 3 legacy-only scents.
- `src/domain/catalogue.seed.test.ts` — **modify**: update any count assertion to the new total (18) and add a profile-coverage assertion.
- `src/domain/pairings.ts` — **modify**: add `chemistryPairings(target, owned)` alongside the existing `suggestPairings` (existing function unchanged).
- `src/domain/pairings.test.ts` — **modify**: add a test for `chemistryPairings`.

---

## Task 1: Extend the type system

**Files:**
- Modify: `src/domain/types.ts`
- Test: `src/domain/types.test.ts`

- [ ] **Step 1: Write the failing test**

Append to `src/domain/types.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import type { Scent, ScentProfile, ScentTags } from './types'

describe('Scent profile extensions', () => {
  it('accepts a fully enriched scent without type errors', () => {
    const profile: ScentProfile = {
      warmth: 7, freshness: 3, sweet: 1, dark: 8, floral: 0, spicy: 3,
      green: 5, woody: 9, smoky: 9, musky: 2, resinous: 7,
      projection: 5, longevity: 8, weight: 'heavy',
    }
    const tags: ScentTags = {
      occasions: ['solo'], weather: ['cold'], energy: ['calm'], time: ['evening'],
    }
    const scent: Scent = {
      id: 'x', brand: 'Y', name: 'Z', families: ['woody'],
      accords: [], notes: [], ingredientKey: 'k',
      profile, tags, season: ['autumn', 'winter'], mood: 'Meditative',
      aura: '#4a5240', application: 'Wrists.', effect: 'Quiet authority.',
    }
    expect(scent.profile?.weight).toBe('heavy')
    expect(scent.season).toContain('winter')
  })

  it('still accepts a bare scent with no profile', () => {
    const scent: Scent = {
      id: 'bare', brand: 'B', name: 'N', families: ['fresh'],
      accords: [], notes: [], ingredientKey: 'k',
    }
    expect(scent.profile).toBeUndefined()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /Users/joa/Documents/AI/sillage && npx vitest run src/domain/types.test.ts`
Expected: FAIL — `ScentProfile` / `ScentTags` not exported.

- [ ] **Step 3: Write minimal implementation**

In `src/domain/types.ts`, add after the `Accord` interface and before `Scent`:

```typescript
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
```

Then extend the `Scent` interface — add these optional fields after `needsEnrichment?: boolean`:

```typescript
  profile?: ScentProfile
  tags?: ScentTags
  season?: Season[]
  mood?: string
  aura?: string       // hex colour for the scent's visual aura
  application?: string // how/where to apply (legacy pulsePoints)
  effect?: string      // the social effect (legacy effect)
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd /Users/joa/Documents/AI/sillage && npx vitest run src/domain/types.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
cd /Users/joa/Documents/AI/sillage
git add src/domain/types.ts src/domain/types.test.ts
git commit -m "feat: extend Scent with numeric profile, tags, and editorial fields"
```

---

## Task 2: Chemistry engine

**Files:**
- Create: `src/domain/chemistry.ts`
- Test: `src/domain/chemistry.test.ts`

**Context:** This is a faithful port of `calcChemistry` from the legacy source. It scores how well 2-3 scents layer together: note harmony (profile distance), weight balance, temperature spread, projection spread, plus a clash adjustment, summed to a 0-100 total with per-axis verdicts and a humanised opening/heart/drydown journey + application note. It now operates on `Scent.profile` and returns `null` if fewer than two of the supplied scents have a profile.

- [ ] **Step 1: Write the failing test**

Create `src/domain/chemistry.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { calcChemistry } from './chemistry'
import type { Scent, ScentProfile } from './types'

function scent(id: string, name: string, p: ScentProfile): Scent {
  return { id, brand: 'B', name, families: ['woody'], accords: [], notes: [], ingredientKey: 'k', profile: p }
}
const heavyWarm: ScentProfile = { warmth: 9, freshness: 1, sweet: 4, dark: 8, floral: 3, spicy: 7, green: 0, woody: 6, smoky: 6, musky: 2, resinous: 5, projection: 7, longevity: 9, weight: 'heavy' }
const lightFresh: ScentProfile = { warmth: 3, freshness: 8, sweet: 5, dark: 1, floral: 3, spicy: 1, green: 3, woody: 3, smoky: 0, musky: 6, resinous: 0, projection: 6, longevity: 5, weight: 'light' }

describe('calcChemistry', () => {
  it('returns null for fewer than two profiled scents', () => {
    expect(calcChemistry([])).toBeNull()
    expect(calcChemistry([scent('a', 'A', heavyWarm)])).toBeNull()
    const noProfile: Scent = { id: 'np', brand: 'B', name: 'NP', families: ['fresh'], accords: [], notes: [], ingredientKey: 'k' }
    expect(calcChemistry([scent('a', 'A', heavyWarm), noProfile])).toBeNull()
  })

  it('scores a complementary heavy+light pairing in range with structured output', () => {
    const result = calcChemistry([scent('a', 'Ambre', heavyWarm), scent('b', 'Night', lightFresh)])
    expect(result).not.toBeNull()
    expect(result!.total).toBeGreaterThanOrEqual(0)
    expect(result!.total).toBeLessThanOrEqual(100)
    expect(result!.weight.max).toBe(20)
    expect(['Excellent', 'Good', 'Fair', 'Risky']).toContain(result!.harmony.verdict)
    expect(result!.names).toEqual(['Ambre', 'Night'])
    expect(typeof result!.opening).toBe('string')
    expect(result!.application.length).toBeGreaterThan(0)
  })

  it('rewards weight contrast over identical heavy weights', () => {
    const twoHeavy = calcChemistry([scent('a', 'A', heavyWarm), scent('b', 'B', { ...heavyWarm })])!
    const contrast = calcChemistry([scent('a', 'A', heavyWarm), scent('b', 'B', lightFresh)])!
    expect(contrast.weight.score).toBeGreaterThan(twoHeavy.weight.score)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /Users/joa/Documents/AI/sillage && npx vitest run src/domain/chemistry.test.ts`
Expected: FAIL — cannot find module `./chemistry`.

- [ ] **Step 3: Write minimal implementation**

Create `src/domain/chemistry.ts`:

```typescript
import type { Scent } from './types'

const PROFILE_KEYS = [
  'warmth', 'freshness', 'sweet', 'dark', 'floral', 'spicy',
  'green', 'woody', 'smoky', 'musky', 'resinous',
] as const

export interface AxisScore { score: number; max: number; verdict: string }
export interface ChemistryResult {
  total: number
  harmony: AxisScore
  weight: AxisScore
  temperature: AxisScore
  projection: AxisScore
  opening: string
  heart: string
  drydown: string
  application: string
  names: string[]
}

function verdict(score: number, max: number): string {
  const pct = score / max
  return pct >= 0.85 ? 'Excellent' : pct >= 0.65 ? 'Good' : pct >= 0.4 ? 'Fair' : 'Risky'
}

export function calcChemistry(scents: Scent[]): ChemistryResult | null {
  const frags = scents.filter(s => s.profile)
  if (frags.length < 2) return null
  const p = frags.map(f => f.profile!)

  let harmony = 35
  for (let i = 0; i < p.length; i++) {
    for (let j = i + 1; j < p.length; j++) {
      let totalDiff = 0
      PROFILE_KEYS.forEach(k => { totalDiff += Math.abs(p[i][k] - p[j][k]) })
      const avgDiff = totalDiff / PROFILE_KEYS.length
      if (avgDiff < 1.5) harmony -= 8
      else if (avgDiff <= 5) harmony += 0
      else if (avgDiff <= 7) harmony -= 6
      else harmony -= 14
    }
  }
  harmony = Math.max(0, Math.min(35, harmony))

  const weights = p.map(f => f.weight)
  const allSame = weights.every(w => w === weights[0])
  const hasLight = weights.includes('light')
  const hasHeavy = weights.includes('heavy')
  const hasMed = weights.includes('medium')
  let weightScore = 10
  if (hasLight && hasHeavy) weightScore = 20
  else if (hasMed && (hasLight || hasHeavy)) weightScore = 16
  else if (allSame && weights[0] === 'heavy') weightScore = 5
  else if (allSame && weights[0] === 'light') weightScore = 8

  const warmths = p.map(f => f.warmth)
  const warmRange = Math.max(...warmths) - Math.min(...warmths)
  const tempScore = warmRange >= 3 && warmRange <= 6 ? 20 : warmRange < 3 ? 12 : warmRange <= 8 ? 14 : 6

  const projections = p.map(f => f.projection)
  const projRange = Math.max(...projections) - Math.min(...projections)
  const projScore = projRange <= 2 ? 15 : projRange <= 4 ? 12 : projRange <= 6 ? 9 : 5

  let clashBonus = 0
  const allNotes = frags.flatMap(f => f.notes.map(n => n.name.toLowerCase()))
  const uniqueNotes = new Set(allNotes)
  clashBonus += Math.min((allNotes.length - uniqueNotes.size) * 2, 6)
  const maxSweet = Math.max(...p.map(f => f.sweet))
  const maxSmoky = Math.max(...p.map(f => f.smoky))
  if (maxSweet >= 7 && maxSmoky >= 7) clashBonus -= 4
  if (Math.max(...p.map(f => f.floral)) >= 5 && maxSmoky >= 6) clashBonus -= 3

  const total = Math.max(0, Math.min(100, harmony + weightScore + tempScore + projScore + clashBonus))

  const avg = (k: typeof PROFILE_KEYS[number]) => p.reduce((s, f) => s + f[k], 0) / p.length
  const avgFresh = avg('freshness'), avgWarm = avg('warmth'), avgDark = avg('dark'), avgSp = avg('spicy'), avgFl = avg('floral')
  const opening = avgFresh >= 5 ? 'Bright and lifted, the fresher notes lead'
    : avgSp >= 5 ? 'Spiced and immediate, hits with intent'
    : 'Warm and enveloping from the first breath'
  const heart = avgFl >= 4 ? 'Floral complexity emerges as it settles'
    : avgWarm >= 7 ? 'Rich amber and resinous warmth take centre stage'
    : 'Woody depth anchors the middle hours'
  const drydown = avgDark >= 6 ? 'Dark, lasting, close to skin, lingers for hours'
    : avgWarm >= 6 ? 'Warm vanilla-amber trail, intimate and enduring'
    : 'Soft musk and clean wood, fading gracefully'

  const names = frags.map(f => f.name)
  let application = ''
  if (frags.length === 2) {
    const [base, top] = p[0].warmth >= p[1].warmth ? [frags[0], frags[1]] : [frags[1], frags[0]]
    const bp = base.profile!, tp = top.profile!
    application = `Apply ${base.name} to chest and pulse points first, it is your foundation. Then ${top.name} on wrists and neck to give the opening its character. ${bp.weight === 'heavy' && tp.weight === 'light' ? 'The weight contrast here is ideal, depth meets lift.' : 'Let them blend naturally at body temperature.'}`
  } else if (frags.length === 3) {
    const sorted = [...frags].sort((a, b) => b.profile!.warmth - a.profile!.warmth)
    application = `Layer heaviest first: ${sorted[0].name} on chest, ${sorted[1].name} on inner wrists, ${sorted[2].name} on neck and behind ears. Three layers means restraint, one spray each maximum.`
  }

  return {
    total,
    harmony: { score: harmony, max: 35, verdict: verdict(harmony, 35) },
    weight: { score: weightScore, max: 20, verdict: verdict(weightScore, 20) },
    temperature: { score: tempScore, max: 20, verdict: verdict(tempScore, 20) },
    projection: { score: projScore, max: 15, verdict: verdict(projScore, 15) },
    opening, heart, drydown, application, names,
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd /Users/joa/Documents/AI/sillage && npx vitest run src/domain/chemistry.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
cd /Users/joa/Documents/AI/sillage
git add src/domain/chemistry.ts src/domain/chemistry.test.ts
git commit -m "feat: port chemistry engine (Chemistry Score) into typed domain"
```

---

## Task 3: Daily selector engine

**Files:**
- Create: `src/domain/selector.ts`
- Test: `src/domain/selector.test.ts`

**Context:** A faithful port of `scoreFragrance` + `getLayerPartner` from the legacy source. `scoreScent` scores a single scent against chosen conditions (weather, occasion, energy, time) using both tag matching and profile physics (heat suppresses heavy scents, cold rewards warmth, humidity blooms woods, etc.), normalised to 0-100. `rankDaily` returns the top matches; `layerPartner` uses `calcChemistry` to suggest a layering partner. Scents without a `profile` or `tags` score 0 (they can't be reasoned about), so they fall to the bottom rather than crashing. An optional `recencyDays` map adds a small bonus for neglected scents, per the spec's "haven't worn it in N days" intent.

- [ ] **Step 1: Write the failing test**

Create `src/domain/selector.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { scoreScent, rankDaily, layerPartner, WEATHER_MAP, OCCASION_MAP } from './selector'
import type { Scent, ScentProfile, ScentTags } from './types'

function mk(id: string, name: string, profile: ScentProfile, tags: ScentTags): Scent {
  return { id, brand: 'B', name, families: ['woody'], accords: [], notes: [{ name: 'X', layer: 'base' }], ingredientKey: 'k', profile, tags }
}
const coldBeast: ScentProfile = { warmth: 9, freshness: 1, sweet: 4, dark: 8, floral: 3, spicy: 7, green: 0, woody: 6, smoky: 6, musky: 2, resinous: 5, projection: 7, longevity: 9, weight: 'heavy' }
const summerSplash: ScentProfile = { warmth: 3, freshness: 9, sweet: 6, dark: 0, floral: 2, spicy: 0, green: 6, woody: 1, smoky: 0, musky: 1, resinous: 0, projection: 3, longevity: 4, weight: 'light' }
const coldTags: ScentTags = { occasions: ['dinner', 'event'], weather: ['cold', 'cool'], energy: ['bold', 'confident'], time: ['evening', 'night'] }
const hotTags: ScentTags = { occasions: ['brunch', 'beach', 'daytime'], weather: ['hot', 'warm', 'sunny'], energy: ['light', 'energetic'], time: ['morning', 'afternoon'] }

describe('scoreScent', () => {
  it('maps the legacy condition keys', () => {
    expect(WEATHER_MAP['Hot (26°C+)']).toBe('hot')
    expect(OCCASION_MAP['Night Out']).toContain('night out')
  })

  it('scores a warm beast higher on a cold night than a summer splash', () => {
    const conditions = { weather: ['Cold (< 8°C)'], occasion: 'Dinner Out', energy: 'Confident & Sharp', time: 'Night' }
    const beast = scoreScent(mk('beast', 'Beast', coldBeast, coldTags), conditions)
    const splash = scoreScent(mk('splash', 'Splash', summerSplash, hotTags), conditions)
    expect(beast).toBeGreaterThan(splash)
    expect(beast).toBeLessThanOrEqual(100)
  })

  it('returns 0 for a scent with no profile or tags', () => {
    const bare: Scent = { id: 'b', brand: 'B', name: 'Bare', families: ['fresh'], accords: [], notes: [], ingredientKey: 'k' }
    expect(scoreScent(bare, { weather: ['Hot (26°C+)'], occasion: '', energy: '', time: '' })).toBe(0)
  })
})

describe('rankDaily', () => {
  it('ranks the better-matched scent first and applies a recency nudge', () => {
    const beast = mk('beast', 'Beast', coldBeast, coldTags)
    const splash = mk('splash', 'Splash', summerSplash, hotTags)
    const conditions = { weather: ['Cold (< 8°C)'], occasion: 'Dinner Out', energy: '', time: 'Night' }
    const ranked = rankDaily([splash, beast], conditions)
    expect(ranked[0].scent.id).toBe('beast')
    expect(ranked[0].score).toBeGreaterThanOrEqual(ranked[1].score)
  })
})

describe('layerPartner', () => {
  it('suggests a chemistry-viable partner excluding the primary', () => {
    const beast = mk('beast', 'Beast', coldBeast, coldTags)
    const splash = mk('splash', 'Splash', summerSplash, hotTags)
    const partner = layerPartner(beast, [beast.id], [beast, splash])
    expect(partner?.scent.id).toBe('splash')
    expect(partner?.chemistry).toBeGreaterThanOrEqual(0)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /Users/joa/Documents/AI/sillage && npx vitest run src/domain/selector.test.ts`
Expected: FAIL — cannot find module `./selector`.

- [ ] **Step 3: Write minimal implementation**

Create `src/domain/selector.ts`:

```typescript
import type { Scent } from './types'
import { calcChemistry } from './chemistry'

export const WEATHER_MAP: Record<string, string> = {
  'Cold (< 8°C)': 'cold', 'Cool (8–14°C)': 'cool', 'Mild (14–20°C)': 'mild',
  'Warm (20–26°C)': 'warm', 'Hot (26°C+)': 'hot', 'Rainy': 'rainy',
  'Overcast': 'overcast', 'Sunny': 'sunny', 'Humid': 'humid', 'Fog': 'fog',
}
export const OCCASION_MAP: Record<string, string[]> = {
  'Work / Office': ['work', 'meeting'], 'Date': ['date', 'romantic'],
  'Dinner Out': ['dinner', 'evening out'], 'Casual / Weekend': ['casual', 'weekend'],
  'Event / Occasion': ['event', 'occasion'], 'Travel': ['travel'],
  'Night Out': ['night out', 'party', 'club', 'social'],
  'Solo / Reflection': ['solo', 'reading', 'reflection', 'gallery'],
  'Brunch': ['brunch', 'daytime'],
}
export const ENERGY_MAP: Record<string, string[]> = {
  'Calm & Centred': ['calm', 'introspective', 'focused'],
  'Confident & Sharp': ['confident', 'sharp', 'bold', 'commanding'],
  'Relaxed & Easy': ['relaxed', 'light', 'nonchalant', 'social'],
  'Romantic': ['romantic', 'bold', 'confident'],
  'Energetic': ['energetic', 'bold', 'social'],
}
export const TIME_MAP: Record<string, string> = {
  'Morning': 'morning', 'Afternoon': 'afternoon', 'Evening': 'evening', 'Night': 'night',
}

export interface Conditions {
  weather: string[]
  occasion: string
  energy: string
  time: string
}

export function scoreScent(scent: Scent, c: Conditions): number {
  const f = scent.profile
  const t = scent.tags
  if (!f || !t) return 0

  let score = 0
  let maxScore = 0

  if (c.weather.length) {
    maxScore += 35
    const wKeys = c.weather.map(w => WEATHER_MAP[w]).filter(Boolean)
    const tagMatch = wKeys.filter(w => t.weather.includes(w)).length
    score += (tagMatch / wKeys.length) * 15
    const isHot = wKeys.some(w => ['hot', 'warm', 'humid', 'sunny'].includes(w))
    const isCold = wKeys.some(w => ['cold', 'cool', 'fog'].includes(w))
    const isWet = wKeys.some(w => ['rainy', 'overcast', 'fog'].includes(w))
    if (isHot) {
      score += f.freshness >= 7 ? 12 : f.freshness >= 5 ? 6 : 0
      if (f.weight === 'heavy') score -= 12
      if (f.weight === 'light') score += 4
      if (f.projection >= 7) score -= 3
    }
    if (isCold) {
      score += f.warmth >= 8 ? 14 : f.warmth >= 6 ? 8 : f.warmth >= 4 ? 3 : 0
      if (f.weight === 'light' && f.warmth <= 4) score -= 8
      if (f.longevity >= 8) score += 3
    }
    if (isWet) {
      if (f.woody >= 6 || f.resinous >= 4) score += 4
      if (f.projection <= 3) score -= 3
    }
    if (tagMatch === 0 && !isHot && !isCold) score -= 10
  }

  if (c.occasion) {
    maxScore += 30
    const oKeys = OCCASION_MAP[c.occasion] || []
    const oMatch = oKeys.filter(o => t.occasions.includes(o)).length
    score += oKeys.length ? (oMatch / oKeys.length) * 12 : 0
    if (c.occasion === 'Date') {
      if (f.sweet >= 5) score += 4
      if (f.warmth >= 6) score += 4
      if (f.projection >= 5) score += 3
      if (f.dark >= 5) score += 2
      if (f.freshness >= 8 && f.warmth <= 3) score -= 3
    } else if (c.occasion === 'Work / Office') {
      if (f.projection <= 5) score += 5
      if (f.dark <= 5) score += 3
      if (f.freshness >= 5) score += 3
      if (f.projection >= 8) score -= 6
      if (f.sweet >= 7) score -= 3
    } else if (c.occasion === 'Night Out') {
      if (f.projection >= 6) score += 5
      if (f.freshness >= 5) score += 3
      if (f.longevity >= 6) score += 3
      if (f.projection <= 3) score -= 5
    } else if (c.occasion === 'Brunch') {
      if (f.freshness >= 6) score += 5
      if (f.weight === 'light') score += 4
      if (f.sweet >= 3 && f.sweet <= 6) score += 3
      if (f.dark >= 7) score -= 6
    } else if (c.occasion === 'Event / Occasion') {
      if (f.projection >= 6) score += 4
      if (f.longevity >= 7) score += 4
      if (f.dark >= 5) score += 2
    } else if (c.occasion === 'Solo / Reflection') {
      if (f.projection <= 5) score += 4
      if (f.woody >= 6 || f.resinous >= 4) score += 4
      if (f.dark >= 5) score += 2
    } else if (c.occasion === 'Dinner Out') {
      if (f.warmth >= 6) score += 4
      if (f.projection >= 5 && f.projection <= 7) score += 4
      if (f.longevity >= 7) score += 3
    } else if (c.occasion === 'Travel') {
      if (f.freshness >= 5) score += 4
      if (f.weight !== 'heavy') score += 3
      if (f.longevity >= 6) score += 3
    } else if (c.occasion === 'Casual / Weekend') {
      if (f.weight !== 'heavy') score += 4
      if (f.projection <= 6) score += 3
      if (f.freshness >= 4) score += 3
    }
    if (oMatch === 0) score -= 5
  }

  if (c.energy) {
    maxScore += 20
    const eKeys = ENERGY_MAP[c.energy] || []
    const eMatch = eKeys.filter(e => t.energy.includes(e)).length
    score += eKeys.length ? (eMatch / eKeys.length) * 10 : 0
    if (c.energy === 'Romantic') { if (f.sweet >= 5) score += 3; if (f.warmth >= 6) score += 3; if (f.floral >= 3) score += 2 }
    if (c.energy === 'Calm & Centred') { if (f.projection <= 5) score += 3; if (f.woody >= 5) score += 2; if (f.dark <= 5) score += 2 }
    if (c.energy === 'Energetic') { if (f.freshness >= 6) score += 4; if (f.projection >= 5) score += 2 }
    if (c.energy === 'Confident & Sharp') { if (f.projection >= 6) score += 3; if (f.longevity >= 7) score += 2; if (f.dark >= 4) score += 2 }
    if (c.energy === 'Relaxed & Easy') { if (f.weight !== 'heavy') score += 3; if (f.freshness >= 4) score += 2; if (f.projection <= 6) score += 2 }
    if (eMatch === 0) score -= 6
  }

  if (c.time) {
    maxScore += 15
    const tKey = TIME_MAP[c.time]
    if (t.time.includes(tKey)) score += 10
    else score -= 10
    if (tKey === 'morning') { if (f.freshness >= 6) score += 4; if (f.weight === 'heavy' && f.dark >= 7) score -= 6 }
    if (tKey === 'night') { if (f.warmth >= 7) score += 4; if (f.projection >= 6) score += 3; if (f.freshness >= 8 && f.warmth <= 3) score -= 4 }
    if (tKey === 'afternoon') { if (f.weight === 'medium') score += 2 }
    if (tKey === 'evening') { if (f.warmth >= 5) score += 2; if (f.longevity >= 6) score += 2 }
  }

  return maxScore > 0 ? Math.min(Math.round((Math.max(score, 0) / maxScore) * 100), 100) : 0
}

export interface DailyResult { scent: Scent; score: number }

// recencyDays: per-scent days-since-last-worn. Neglected owned scents get a small nudge.
export function rankDaily(
  scents: Scent[],
  conditions: Conditions,
  recencyDays: Record<string, number> = {},
): DailyResult[] {
  return scents
    .map(scent => {
      let score = scoreScent(scent, conditions)
      const days = recencyDays[scent.id]
      if (score > 0 && typeof days === 'number') {
        score = Math.min(100, score + Math.min(Math.floor(days / 3), 6))
      }
      return { scent, score }
    })
    .sort((a, b) => b.score - a.score)
}

export interface LayerSuggestion { scent: Scent; chemistry: number }

export function layerPartner(
  primary: Scent,
  excludeIds: string[],
  scents: Scent[],
): LayerSuggestion | null {
  const exclude = new Set(excludeIds)
  const scored = scents
    .filter(s => s.id !== primary.id && !exclude.has(s.id) && s.profile)
    .map(s => {
      const chem = calcChemistry([primary, s])
      return { scent: s, chemistry: chem ? chem.total : 0 }
    })
    .filter(c => c.chemistry >= 45)
    .sort((a, b) => b.chemistry - a.chemistry)
  return scored.length ? scored[0] : null
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd /Users/joa/Documents/AI/sillage && npx vitest run src/domain/selector.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
cd /Users/joa/Documents/AI/sillage
git add src/domain/selector.ts src/domain/selector.test.ts
git commit -m "feat: port daily selector engine (physics scoring + layer partner)"
```

---

## Task 4: Enrich the seed catalogue with real data

**Files:**
- Modify (full rewrite): `src/domain/catalogue.seed.ts`
- Test: `src/domain/catalogue.seed.test.ts`

**Context:** Populate every scent that has a real legacy equivalent with its `profile`, `tags`, `season`, `mood`, `aura`, `blurb` (legacy `description`), `application` (legacy `pulsePoints`), and `effect`. Add three legacy-only scents with full real data: `iaq-spanishtobacco`, `lelabo-tabac26`, `tomford-noirextreme`. Leave `lelabo-santal33`, `tomford-noir`, `aramic-heart`, and `aramic-heaven` without a `profile` (no legacy data exists; do not invent). Keep all existing `id`s, `families`, `accords`, `notes`, and `ingredientKey` exactly as they are — only ADD the new fields. New scents get layered notes assigned from their real note lists (layer assignment is interpretive; the note names are real).

- [ ] **Step 1: Write the failing test**

Replace the contents of `src/domain/catalogue.seed.test.ts` with:

```typescript
import { describe, it, expect } from 'vitest'
import { SEED_SCENTS } from './catalogue.seed'

describe('SEED_SCENTS', () => {
  it('has the expected number of scents', () => {
    expect(SEED_SCENTS).toHaveLength(18)
  })

  it('gives every profiled scent all 14 profile fields and matching tags', () => {
    for (const s of SEED_SCENTS) {
      if (!s.profile) continue
      expect(Object.keys(s.profile)).toHaveLength(14)
      expect(['light', 'medium', 'heavy']).toContain(s.profile.weight)
      expect(s.tags, `${s.id} has a profile but no tags`).toBeDefined()
    }
  })

  it('enriches the known wardrobe scents and adds the legacy-only ones', () => {
    const byId = new Map(SEED_SCENTS.map(s => [s.id, s]))
    expect(byId.get('aesop-hwyl')?.profile?.smoky).toBe(9)
    expect(byId.get('aesop-hwyl')?.aura).toBe('#4a5240')
    expect(byId.get('byredo-mojaveghost')?.mood).toBe('Ethereal')
    expect(byId.get('iaq-spanishtobacco')?.profile?.longevity).toBe(10)
    expect(byId.get('lelabo-tabac26')).toBeDefined()
    expect(byId.get('tomford-noirextreme')?.profile?.warmth).toBe(10)
  })

  it('leaves scents with no legacy data unprofiled', () => {
    const byId = new Map(SEED_SCENTS.map(s => [s.id, s]))
    expect(byId.get('lelabo-santal33')?.profile).toBeUndefined()
    expect(byId.get('aramic-heart')?.profile).toBeUndefined()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /Users/joa/Documents/AI/sillage && npx vitest run src/domain/catalogue.seed.test.ts`
Expected: FAIL — length is 15, profiles undefined.

- [ ] **Step 3: Write minimal implementation**

Replace the entire contents of `src/domain/catalogue.seed.ts` with:

```typescript
import type { Scent } from './types'

export const SEED_SCENTS: Scent[] = [
  { id: 'aesop-hwyl', brand: 'Aesop', name: 'Hwyl', families: ['woody','smoky'],
    ingredientKey: 'smoke,forest',
    accords: [{name:'smoke',strength:.9},{name:'woody',strength:.7},{name:'incense',strength:.6}],
    notes: [{name:'Cypress',layer:'top'},{name:'Frankincense',layer:'heart'},{name:'Vetiver',layer:'base'}],
    profile: { warmth:7, freshness:3, sweet:1, dark:8, floral:0, spicy:3, green:5, woody:9, smoky:9, musky:2, resinous:7, projection:5, longevity:8, weight:'heavy' },
    tags: { occasions:['solo','gallery','reflection'], weather:['cold','overcast','rainy','fog'], energy:['introspective','calm'], time:['afternoon','evening'] },
    season:['autumn','winter'], mood:'Meditative', aura:'#4a5240',
    blurb:'Smoke rising through wet cypress. A Japanese temple at dusk.',
    application:'Inner wrists and behind ears, let the incense drift naturally.',
    effect:'Quiet authority. People lean in without knowing why.' },

  { id: 'aesop-aurner', brand: 'Aesop', name: 'Aurner', families: ['aromatic','woody'],
    ingredientKey: 'cedar,plant',
    accords: [{name:'aromatic',strength:.8},{name:'woody',strength:.6}],
    notes: [{name:'Geranium',layer:'top'},{name:'Chamomile',layer:'heart'},{name:'Cedar',layer:'base'}],
    profile: { warmth:5, freshness:6, sweet:3, dark:3, floral:5, spicy:4, green:4, woody:6, smoky:0, musky:2, resinous:1, projection:4, longevity:6, weight:'medium' },
    tags: { occasions:['work','brunch','meeting'], weather:['mild','overcast','cool'], energy:['calm','focused','balanced'], time:['morning','afternoon'] },
    season:['spring','autumn'], mood:'Calm', aura:'#8b7d6b',
    blurb:'Herbal tea in a sunlit studio. Linen and warm wood.',
    application:'Wrists and chest, a gentle radius of calm.',
    effect:'Approachable intelligence. Quietly impressive.' },

  { id: 'tomford-noir', brand: 'Tom Ford', name: 'Noir', year: 2012, families: ['amber','smoky'],
    ingredientKey: 'smoke,incense',
    accords: [{name:'leather',strength:.62},{name:'amber',strength:.54},{name:'iris',strength:.4},{name:'spicy',strength:.33}],
    notes: [{name:'Bergamot',layer:'top'},{name:'Pink Pepper',layer:'top'},{name:'Iris',layer:'heart'},{name:'Nutmeg',layer:'heart'},{name:'Amber',layer:'base'},{name:'Leather',layer:'base'},{name:'Vanilla',layer:'base'}] },

  { id: 'lelabo-santal33', brand: 'Le Labo', name: 'Santal 33', families: ['woody'],
    ingredientKey: 'sandalwood,wood',
    accords: [{name:'sandalwood',strength:.92},{name:'leather',strength:.5},{name:'cardamom',strength:.45}],
    notes: [{name:'Cardamom',layer:'top'},{name:'Violet',layer:'heart'},{name:'Sandalwood',layer:'base'},{name:'Cedar',layer:'base'}] },

  { id: 'byredo-mojaveghost', brand: 'Byredo', name: 'Mojave Ghost', families: ['woody','floral'],
    ingredientKey: 'desert,sand',
    accords: [{name:'woody',strength:.7},{name:'floral',strength:.55},{name:'amber',strength:.4}],
    notes: [{name:'Ambrette',layer:'top'},{name:'Magnolia',layer:'heart'},{name:'Sandalwood',layer:'base'}],
    profile: { warmth:4, freshness:7, sweet:4, dark:1, floral:4, spicy:0, green:2, woody:5, smoky:0, musky:8, resinous:1, projection:4, longevity:5, weight:'light' },
    tags: { occasions:['date','brunch','travel','beach'], weather:['warm','hot','mild','sunny'], energy:['relaxed','romantic'], time:['morning','afternoon'] },
    season:['spring','summer'], mood:'Ethereal', aura:'#d4c5a9',
    blurb:'Desert light through white curtains. Clean skin after the ocean.',
    application:'Neck, inner elbows, and hair, this one floats.',
    effect:'Magnetic softness. The scent people ask about.' },

  { id: 'dior-ambrenuit', brand: 'Dior', name: 'Ambre Nuit', families: ['amber'],
    ingredientKey: 'amber,rose',
    accords: [{name:'amber',strength:.8},{name:'rose',strength:.5}],
    notes: [{name:'Bergamot',layer:'top'},{name:'Rose',layer:'heart'},{name:'Ambergris',layer:'base'}],
    profile: { warmth:9, freshness:1, sweet:4, dark:8, floral:3, spicy:7, green:0, woody:6, smoky:6, musky:2, resinous:5, projection:7, longevity:9, weight:'heavy' },
    tags: { occasions:['date','dinner','event'], weather:['cold','cool'], energy:['confident','bold','romantic'], time:['evening','night'] },
    season:['autumn','winter'], mood:'Seductive', aura:'#6b3a3a',
    blurb:'A dark rose crushed in amber resin. Candlelit and close.',
    application:'Neck, chest, and inner wrists, let body heat amplify.',
    effect:'Irresistible gravity. The closer they get, the more they want.' },

  { id: 'dior-grisdior', brand: 'Dior', name: 'Gris Dior', families: ['aromatic','floral'],
    ingredientKey: 'lavender,citrus',
    accords: [{name:'aromatic',strength:.7},{name:'citrus',strength:.5}],
    notes: [{name:'Bergamot',layer:'top'},{name:'Lavender',layer:'heart'},{name:'Patchouli',layer:'base'}],
    profile: { warmth:5, freshness:6, sweet:2, dark:3, floral:6, spicy:2, green:3, woody:4, smoky:0, musky:3, resinous:2, projection:6, longevity:7, weight:'medium' },
    tags: { occasions:['work','meeting','dinner','event'], weather:['mild','cool','overcast'], energy:['confident','balanced','sharp'], time:['morning','afternoon','evening'] },
    season:['spring','autumn'], mood:'Refined', aura:'#9e8b7e',
    blurb:'A tailored grey suit. Rose petals on marble.',
    application:'Wrists and behind ears, classic deployment for a classic scent.',
    effect:'Polished authority. Parisian restraint.' },

  { id: 'diptyque-vetyverio', brand: 'Diptyque', name: 'Vetyverio', families: ['woody','aromatic'],
    ingredientKey: 'vetiver,grass',
    accords: [{name:'vetiver',strength:.85},{name:'earthy',strength:.6}],
    notes: [{name:'Citrus',layer:'top'},{name:'Geranium',layer:'heart'},{name:'Vetiver',layer:'base'}],
    profile: { warmth:3, freshness:8, sweet:1, dark:2, floral:3, spicy:3, green:8, woody:7, smoky:2, musky:5, resinous:0, projection:4, longevity:5, weight:'light' },
    tags: { occasions:['work','casual','brunch','meeting'], weather:['mild','warm','sunny'], energy:['calm','balanced','focused'], time:['morning','afternoon'] },
    season:['spring','summer'], mood:'Grounded', aura:'#6a7a5e',
    blurb:'Wet grass and grapefruit zest. A Parisian garden at ten in the morning.',
    application:'Wrists, inner elbows, and behind ears, spray generously, this sits close to skin.',
    effect:'Effortless refinement. Clean, earthy intelligence that never tries too hard.' },

  { id: 'malingoetz-cannabis', brand: 'Malin + Goetz', name: 'Cannabis', families: ['aromatic'],
    ingredientKey: 'cannabis,leaf',
    accords: [{name:'green',strength:.8},{name:'aromatic',strength:.6}],
    notes: [{name:'Lime',layer:'top'},{name:'Cannabis Accord',layer:'heart'},{name:'Patchouli',layer:'base'}],
    profile: { warmth:4, freshness:6, sweet:1, dark:3, floral:0, spicy:4, green:7, woody:5, smoky:1, musky:2, resinous:1, projection:4, longevity:5, weight:'light' },
    tags: { occasions:['casual','weekend','social','festival'], weather:['warm','mild','humid'], energy:['relaxed','social','nonchalant'], time:['afternoon','evening'] },
    season:['summer','autumn'], mood:'Nonchalant', aura:'#4f6b4a',
    blurb:'Sunday in the park. Black pepper and easy confidence.',
    application:'Wrists and back of neck, casual, effortless placement.',
    effect:'Cool without trying. The friend everyone gravitates toward.' },

  { id: 'cave-sloanetones', brand: 'CAVE', name: 'Sloane Tones', families: ['smoky','woody'],
    ingredientKey: 'leather,dark',
    accords: [{name:'leather',strength:.6}],
    notes: [{name:'Osmanthus',layer:'top'},{name:'Tuberose',layer:'heart'},{name:'Agarwood',layer:'base'},{name:'Cedar',layer:'base'}],
    profile: { warmth:8, freshness:2, sweet:6, dark:6, floral:5, spicy:3, green:1, woody:7, smoky:2, musky:3, resinous:3, projection:7, longevity:8, weight:'heavy' },
    tags: { occasions:['event','dinner','date'], weather:['cool','cold','overcast'], energy:['confident','romantic','bold'], time:['evening','night'] },
    season:['autumn','winter'], mood:'Luxurious', aura:'#6b5a7e',
    blurb:'Agarwood smoke through tuberose. Sloane Street after dark.',
    application:'Behind ears and chest, let the oud and florals interplay at body temperature.',
    effect:'Understated opulence. London luxury without the logo.' },

  { id: 'franckolivier-nighttouch', brand: 'Franck Olivier', name: 'Night Touch', families: ['amber','woody'],
    ingredientKey: 'amber,wood',
    accords: [{name:'amber',strength:.6}],
    notes: [{name:'Bergamot',layer:'top'},{name:'Jasmine',layer:'heart'},{name:'Vetiver',layer:'base'},{name:'Musk',layer:'base'}],
    profile: { warmth:3, freshness:8, sweet:5, dark:1, floral:3, spicy:1, green:3, woody:3, smoky:0, musky:6, resinous:0, projection:6, longevity:5, weight:'light' },
    tags: { occasions:['night out','party','date','social'], weather:['warm','hot','humid'], energy:['energetic','bold','social'], time:['evening','night'] },
    season:['spring','summer'], mood:'Electric', aura:'#3a4a6b',
    blurb:'Neon reflections on wet pavement. Summer night velocity.',
    application:'Neck and forearms, designed to cut through warm air.',
    effect:'Head-turning freshness. High-energy magnetism.' },

  { id: 'aramic-heart', brand: 'Aramic', name: 'Heart', families: ['amber'],
    ingredientKey: 'rose,red', needsEnrichment: true,
    accords: [{name:'amber',strength:.5}],
    notes: [{name:'Rose',layer:'heart'}] },

  { id: 'aramic-heaven', brand: 'Aramic', name: 'Heaven', families: ['fresh'],
    ingredientKey: 'sky,clouds', needsEnrichment: true,
    accords: [{name:'fresh',strength:.5}],
    notes: [{name:'Citrus',layer:'top'}] },

  { id: 'reef-summerpeach', brand: 'Reef', name: 'Summer Peach', families: ['fresh','gourmand'],
    ingredientKey: 'peach,fruit',
    accords: [{name:'fruity',strength:.6}],
    notes: [{name:'Peach',layer:'top'},{name:'Iris',layer:'heart'},{name:'Yerba Mate',layer:'base'}],
    profile: { warmth:3, freshness:9, sweet:6, dark:0, floral:2, spicy:0, green:6, woody:1, smoky:0, musky:1, resinous:0, projection:3, longevity:4, weight:'light' },
    tags: { occasions:['brunch','casual','beach','daytime'], weather:['hot','warm','sunny'], energy:['light','energetic','relaxed'], time:['morning','afternoon'] },
    season:['spring','summer'], mood:'Bright', aura:'#c4956a',
    blurb:'First bite of summer. Sun on bare arms. Uncomplicated joy.',
    application:'Wrists, neck, and liberally, this one is gentle and close-range.',
    effect:'Disarming warmth. A smile you can smell.' },

  { id: 'ghissah-hudson', brand: 'Ghissah', name: 'Hudson', families: ['woody','amber'],
    ingredientKey: 'oud,wood',
    accords: [{name:'woody',strength:.6}],
    notes: [{name:'Rose',layer:'heart'},{name:'White Flowers',layer:'heart'},{name:'Saffron',layer:'heart'},{name:'Amber',layer:'base'},{name:'Musk',layer:'base'},{name:'Tonka Bean',layer:'base'}],
    profile: { warmth:7, freshness:4, sweet:7, dark:3, floral:6, spicy:3, green:0, woody:2, smoky:0, musky:6, resinous:3, projection:6, longevity:7, weight:'medium' },
    tags: { occasions:['date','dinner','event','social'], weather:['mild','cool','cold'], energy:['romantic','confident'], time:['afternoon','evening','night'] },
    season:['spring','autumn','winter'], mood:'Romantic', aura:'#8a5e6a',
    blurb:'Saffron-dusted rose and ripe fruit. A love letter sealed in amber.',
    application:'Neck and inner wrists, let the saffron bloom at body heat. Two to three sprays.',
    effect:'Warm magnetism. The scent that draws people closer without them realising why.' },

  { id: 'iaq-spanishtobacco', brand: 'Ibrahim Al Qurashi', name: 'Spanish Tobacco', families: ['amber','spicy'],
    ingredientKey: 'tobacco,saffron',
    accords: [{name:'tobacco',strength:.8},{name:'amber',strength:.6},{name:'saffron',strength:.5}],
    notes: [{name:'Aquatic',layer:'top'},{name:'Saffron',layer:'heart'},{name:'Cocoa',layer:'heart'},{name:'Iris',layer:'heart'},{name:'Tobacco',layer:'base'},{name:'Amber',layer:'base'}],
    profile: { warmth:9, freshness:2, sweet:6, dark:9, floral:1, spicy:6, green:0, woody:5, smoky:4, musky:2, resinous:4, projection:8, longevity:10, weight:'heavy' },
    tags: { occasions:['event','dinner','date'], weather:['cold','cool'], energy:['bold','confident','commanding'], time:['evening','night'] },
    season:['autumn','winter'], mood:'Opulent', aura:'#5c3d2e',
    blurb:'Leather armchair in a private library. Saffron smoke and old money.',
    application:'Chest and behind ears only, this beast projects. Less is power.',
    effect:'Unforgettable presence. Rooms remember you.' },

  { id: 'lelabo-tabac26', brand: 'Le Labo', name: 'Tabac 26', families: ['woody','smoky'],
    ingredientKey: 'tobacco,hay',
    accords: [{name:'tobacco',strength:.7},{name:'woody',strength:.6},{name:'hay',strength:.5}],
    notes: [{name:'Bay Leaf',layer:'top'},{name:'Fig',layer:'heart'},{name:'Hay',layer:'heart'},{name:'Tobacco',layer:'base'},{name:'Cedar',layer:'base'}],
    profile: { warmth:7, freshness:3, sweet:2, dark:6, floral:0, spicy:3, green:4, woody:8, smoky:3, musky:1, resinous:2, projection:5, longevity:7, weight:'medium' },
    tags: { occasions:['reading','gallery','solo'], weather:['cold','overcast','rainy'], energy:['introspective','calm'], time:['afternoon'] },
    season:['autumn','winter'], mood:'Intellectual', aura:'#6b5e4f',
    blurb:'A dog-eared novel. Dried fig leaves and afternoon light.',
    application:'Wrists and inner elbows, a personal aura, not a broadcast.',
    effect:'Quiet depth. The scent of someone with something to say.' },

  { id: 'tomford-noirextreme', brand: 'Tom Ford', name: 'Noir Extreme', families: ['amber','spicy','gourmand'],
    ingredientKey: 'spice,vanilla',
    accords: [{name:'amber',strength:.7},{name:'spicy',strength:.65},{name:'vanilla',strength:.6}],
    notes: [{name:'Cardamom',layer:'top'},{name:'Nutmeg',layer:'top'},{name:'Saffron',layer:'heart'},{name:'Kulfi',layer:'heart'},{name:'Rose',layer:'heart'},{name:'Vanilla',layer:'base'},{name:'Amber',layer:'base'}],
    profile: { warmth:10, freshness:1, sweet:8, dark:7, floral:2, spicy:9, green:0, woody:3, smoky:1, musky:2, resinous:4, projection:8, longevity:9, weight:'heavy' },
    tags: { occasions:['date','dinner','event','night out'], weather:['cold','cool'], energy:['bold','confident','commanding'], time:['evening','night'] },
    season:['autumn','winter'], mood:'Commanding', aura:'#2e2e2e',
    blurb:'Cardamom kulfi at midnight. Velvet and gold.',
    application:'Chest and one wrist, let body heat do the work. Two sprays maximum.',
    effect:'Devastating. The scent of someone who has already won.' },
]
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd /Users/joa/Documents/AI/sillage && npx vitest run src/domain/catalogue.seed.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Run the full suite to catch any count-based assertions elsewhere**

Run: `cd /Users/joa/Documents/AI/sillage && npx vitest run`
Expected: PASS. If a test in `catalogue.test.ts`, `ShelfPage.test.tsx`, or elsewhere hardcoded a 15-count or a removed scent name, update that assertion to match the new catalogue (18 scents; no scent was removed, only enriched, plus 3 added). Do not weaken a test beyond fixing the count/name.

- [ ] **Step 6: Commit**

```bash
cd /Users/joa/Documents/AI/sillage
git add src/domain/catalogue.seed.ts src/domain/catalogue.seed.test.ts
git commit -m "feat: enrich seed catalogue with real profiles, tags and copy; add 3 legacy scents"
```

---

## Task 5: Chemistry-driven pairings

**Files:**
- Modify: `src/domain/pairings.ts`
- Test: `src/domain/pairings.test.ts`

**Context:** The spec's Perfumery Lab "suggests the best combinations from your shelf, ranked." That is exactly a chemistry ranking. Add `chemistryPairings(target, owned)` that ranks owned scents by `calcChemistry([target, candidate]).total`, excluding the target and any candidate without a profile. Leave the existing `suggestPairings` (note/family overlap) untouched as the fallback used when profiles are absent.

- [ ] **Step 1: Write the failing test**

Append to `src/domain/pairings.test.ts`:

```typescript
import { chemistryPairings } from './pairings'
import { SEED_SCENTS } from './catalogue.seed'

describe('chemistryPairings', () => {
  it('ranks profiled shelf scents by chemistry and excludes the target and unprofiled scents', () => {
    const byId = new Map(SEED_SCENTS.map(s => [s.id, s]))
    const target = byId.get('dior-ambrenuit')!
    const owned = SEED_SCENTS
    const result = chemistryPairings(target, owned)
    expect(result.length).toBeGreaterThan(0)
    expect(result.every(p => p.scent.id !== target.id)).toBe(true)
    expect(result.every(p => p.scent.profile !== undefined)).toBe(true)
    // sorted descending by score
    for (let i = 1; i < result.length; i++) {
      expect(result[i - 1].score).toBeGreaterThanOrEqual(result[i].score)
    }
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /Users/joa/Documents/AI/sillage && npx vitest run src/domain/pairings.test.ts`
Expected: FAIL — `chemistryPairings` is not exported.

- [ ] **Step 3: Write minimal implementation**

Append to `src/domain/pairings.ts`:

```typescript
import { calcChemistry } from './chemistry'

export function chemistryPairings(target: Scent, owned: Scent[]): Pairing[] {
  if (!target.profile) return []
  return owned
    .filter(s => s.id !== target.id && s.profile)
    .map(s => {
      const chem = calcChemistry([target, s])
      return { scent: s, score: chem ? chem.total : 0 }
    })
    .sort((a, b) => b.score - a.score)
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd /Users/joa/Documents/AI/sillage && npx vitest run src/domain/pairings.test.ts`
Expected: PASS.

- [ ] **Step 5: Full suite + typecheck**

Run: `cd /Users/joa/Documents/AI/sillage && npx vitest run && npx tsc -b`
Expected: all tests PASS, no type errors.

- [ ] **Step 6: Commit**

```bash
cd /Users/joa/Documents/AI/sillage
git add src/domain/pairings.ts src/domain/pairings.test.ts
git commit -m "feat: add chemistry-driven shelf pairings for the Perfumery Lab"
```

---

## Definition of done

- `Scent` carries an optional 14-field `profile`, `tags`, `season`, `mood`, `aura`, `application`, `effect`.
- `chemistry.ts` and `selector.ts` are faithful, typed ports of the legacy engines, each guarding for missing profiles, each unit-tested.
- The seed catalogue has 18 scents; every scent with real legacy data is fully profiled; the four with no legacy data stay unprofiled; nothing is fabricated.
- `chemistryPairings` ranks the shelf for the Perfumery Lab.
- `npx vitest run` and `npx tsc -b` both pass.
- These modules are pure domain with no UI, ready for Phase 2 surfaces (Perfumery Lab, Daily, fingerprint visualiser) to consume.
