# Sillage Phase 1 (Foundation) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up an owned Sillage codebase with a typed Scent data model, a local-first wardrobe, and two working surfaces (Shelf and Scent detail) running on real data.

**Architecture:** Vite + React + TypeScript SPA. Pure-function domain logic (catalogue search/filter/sort, wardrobe persistence, pairings) lives in framework-free modules under `src/domain` and is fully unit-tested with Vitest. React components under `src/ui` consume those modules. Bespoke CSS with design tokens (CSS variables), no utility framework, to keep the editorial look. Local persistence via `localStorage` behind a small repository so it can be swapped for cloud sync later.

**Tech Stack:** Vite, React 18, TypeScript, Vitest + @testing-library/react + jsdom, react-router-dom v6, Fraunces + Archivo (Google Fonts).

---

## File structure (created in this plan)

- `src/domain/types.ts` — Scent, Note, Accord, Family, WardrobeEntry, Ownership types.
- `src/domain/catalogue.ts` — pure catalogue service: getAll, getById, search, filter, sort.
- `src/domain/catalogue.seed.ts` — the 15-scent seed dataset.
- `src/domain/pairings.ts` — pure pairing logic from owned scents.
- `src/domain/wardrobe.ts` — local-first wardrobe store (localStorage repo + in-memory ops + subscribe).
- `src/ui/tokens.css` — design tokens (palette, type, spacing).
- `src/ui/components/GlassCard.tsx` — frosted panel primitive.
- `src/ui/components/RatingMeter.tsx` — 0-10 Sillage Score meter.
- `src/ui/components/ScentCard.tsx` — data-driven scent card.
- `src/ui/pages/ShelfPage.tsx` — list + search + filter + sort.
- `src/ui/pages/ScentPage.tsx` — single scent: accords, note pyramid, score, pairings.
- `src/ui/App.tsx` — routes + nav shell.
- `src/main.tsx`, `index.html` — entry (from scaffold).

---

### Task 1: Scaffold project and test runner

**Files:**
- Create: project root files via Vite, then `vitest.config.ts`, `src/setupTests.ts`
- Modify: `package.json`

- [ ] **Step 1: Scaffold Vite React+TS app in place**

Run:
```bash
cd /Users/joa/Documents/AI/sillage
npm create vite@latest . -- --template react-ts
npm install
```
If the directory is not empty, choose "Ignore files and continue" when prompted. Keep the existing `docs/`, `.gitignore`, `.git`.

- [ ] **Step 2: Install test + routing deps**

Run:
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
npm install react-router-dom
```

- [ ] **Step 3: Create `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.ts'],
  },
})
```

- [ ] **Step 4: Create `src/setupTests.ts`**

```ts
import '@testing-library/jest-dom'
```

- [ ] **Step 5: Add test script to `package.json`**

Add to the `"scripts"` block:
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 6: Add a smoke test `src/smoke.test.ts`**

```ts
import { describe, it, expect } from 'vitest'

describe('toolchain', () => {
  it('runs', () => {
    expect(1 + 1).toBe(2)
  })
})
```

- [ ] **Step 7: Run tests, expect pass**

Run: `npm test`
Expected: 1 passed.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "chore: scaffold Vite React TS app with Vitest"
```

---

### Task 2: Domain types

**Files:**
- Create: `src/domain/types.ts`
- Test: `src/domain/types.test.ts`

- [ ] **Step 1: Write the failing test**

`src/domain/types.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { FAMILIES, isFamily } from './types'

describe('families', () => {
  it('lists the eight families', () => {
    expect(FAMILIES).toHaveLength(8)
    expect(FAMILIES).toContain('woody')
  })
  it('validates family strings', () => {
    expect(isFamily('amber')).toBe(true)
    expect(isFamily('nonsense')).toBe(false)
  })
})
```

- [ ] **Step 2: Run test, expect fail**

Run: `npx vitest run src/domain/types.test.ts`
Expected: FAIL (cannot find module './types').

- [ ] **Step 3: Create `src/domain/types.ts`**

```ts
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
  ingredientKey: string  // search keyword for imagery, e.g. "sandalwood,wood"
  blurb?: string         // humanised description, may be filled later
  needsEnrichment?: boolean
}

export type Ownership = 'owned' | 'wishlist' | 'finished'
export interface WardrobeEntry {
  scentId: string
  ownership: Ownership
  score?: number        // 0..10, half points allowed
  notes?: string
  lastWornAt?: string   // ISO date
  addedAt: string       // ISO date
}
```

- [ ] **Step 4: Run test, expect pass**

Run: `npx vitest run src/domain/types.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/domain/types.ts src/domain/types.test.ts
git commit -m "feat: domain types for scents and wardrobe"
```

---

### Task 3: Seed catalogue dataset

**Files:**
- Create: `src/domain/catalogue.seed.ts`
- Test: `src/domain/catalogue.seed.test.ts`

The seed holds Joa's 15 confirmed scents. Well-documented scents get real notes; the niche ones (Aramic, Reef, Ghissah, CAVE) carry `needsEnrichment: true` and minimal notes, to be filled by the catalogue LLM lookup in Phase 2. This is intentional data state, not a placeholder.

- [ ] **Step 1: Write the failing test**

`src/domain/catalogue.seed.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { SEED_SCENTS } from './catalogue.seed'
import { isFamily } from './types'

describe('seed catalogue', () => {
  it('has 15 scents with unique ids', () => {
    expect(SEED_SCENTS).toHaveLength(15)
    const ids = new Set(SEED_SCENTS.map(s => s.id))
    expect(ids.size).toBe(15)
  })
  it('every scent has a brand, name, and valid families', () => {
    for (const s of SEED_SCENTS) {
      expect(s.brand.length).toBeGreaterThan(0)
      expect(s.name.length).toBeGreaterThan(0)
      expect(s.families.length).toBeGreaterThan(0)
      expect(s.families.every(isFamily)).toBe(true)
    }
  })
  it('includes Mojave Ghost and NOT Gypsy Water', () => {
    const names = SEED_SCENTS.map(s => s.name)
    expect(names).toContain('Mojave Ghost')
    expect(names).not.toContain('Gypsy Water')
  })
})
```

- [ ] **Step 2: Run test, expect fail**

Run: `npx vitest run src/domain/catalogue.seed.test.ts`
Expected: FAIL (cannot find module).

- [ ] **Step 3: Create `src/domain/catalogue.seed.ts`**

```ts
import type { Scent } from './types'

export const SEED_SCENTS: Scent[] = [
  { id: 'aesop-hwyl', brand: 'Aesop', name: 'Hwyl', families: ['woody','smoky'],
    ingredientKey: 'smoke,forest',
    accords: [{name:'smoke',strength:.9},{name:'woody',strength:.7},{name:'incense',strength:.6}],
    notes: [{name:'Cypress',layer:'top'},{name:'Frankincense',layer:'heart'},{name:'Vetiver',layer:'base'}] },
  { id: 'aesop-aurner', brand: 'Aesop', name: 'Aurner', families: ['aromatic','woody'],
    ingredientKey: 'cedar,plant',
    accords: [{name:'aromatic',strength:.8},{name:'woody',strength:.6}],
    notes: [{name:'Geranium',layer:'top'},{name:'Chamomile',layer:'heart'},{name:'Cedar',layer:'base'}] },
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
    notes: [{name:'Ambrette',layer:'top'},{name:'Magnolia',layer:'heart'},{name:'Sandalwood',layer:'base'}] },
  { id: 'dior-ambrenuit', brand: 'Dior', name: 'Ambre Nuit', families: ['amber'],
    ingredientKey: 'amber,rose',
    accords: [{name:'amber',strength:.8},{name:'rose',strength:.5}],
    notes: [{name:'Bergamot',layer:'top'},{name:'Rose',layer:'heart'},{name:'Ambergris',layer:'base'}] },
  { id: 'dior-grisdior', brand: 'Dior', name: 'Gris Dior', families: ['aromatic','floral'],
    ingredientKey: 'lavender,citrus',
    accords: [{name:'aromatic',strength:.7},{name:'citrus',strength:.5}],
    notes: [{name:'Bergamot',layer:'top'},{name:'Lavender',layer:'heart'},{name:'Patchouli',layer:'base'}] },
  { id: 'diptyque-vetyverio', brand: 'Diptyque', name: 'Vetyverio', families: ['woody','aromatic'],
    ingredientKey: 'vetiver,grass',
    accords: [{name:'vetiver',strength:.85},{name:'earthy',strength:.6}],
    notes: [{name:'Citrus',layer:'top'},{name:'Geranium',layer:'heart'},{name:'Vetiver',layer:'base'}] },
  { id: 'malingoetz-cannabis', brand: 'Malin + Goetz', name: 'Cannabis', families: ['aromatic'],
    ingredientKey: 'cannabis,leaf',
    accords: [{name:'green',strength:.8},{name:'aromatic',strength:.6}],
    notes: [{name:'Lime',layer:'top'},{name:'Cannabis Accord',layer:'heart'},{name:'Patchouli',layer:'base'}] },
  { id: 'cave-sloanetones', brand: 'CAVE', name: 'Sloane Tones', families: ['smoky','woody'],
    ingredientKey: 'leather,dark', needsEnrichment: true,
    accords: [{name:'leather',strength:.6}],
    notes: [{name:'Leather',layer:'base'}] },
  { id: 'franckolivier-nighttouch', brand: 'Franck Olivier', name: 'Night Touch', families: ['amber','woody'],
    ingredientKey: 'amber,wood', needsEnrichment: true,
    accords: [{name:'amber',strength:.6}],
    notes: [{name:'Amber',layer:'base'}] },
  { id: 'aramic-heart', brand: 'Aramic', name: 'Heart', families: ['amber'],
    ingredientKey: 'rose,red', needsEnrichment: true,
    accords: [{name:'amber',strength:.5}],
    notes: [{name:'Rose',layer:'heart'}] },
  { id: 'aramic-heaven', brand: 'Aramic', name: 'Heaven', families: ['fresh'],
    ingredientKey: 'sky,clouds', needsEnrichment: true,
    accords: [{name:'fresh',strength:.5}],
    notes: [{name:'Citrus',layer:'top'}] },
  { id: 'reef-summerpeach', brand: 'Reef', name: 'Summer Peach', families: ['fresh','gourmand'],
    ingredientKey: 'peach,fruit', needsEnrichment: true,
    accords: [{name:'fruity',strength:.6}],
    notes: [{name:'Peach',layer:'top'}] },
  { id: 'ghissah-hudson', brand: 'Ghissah', name: 'Hudson', families: ['woody','amber'],
    ingredientKey: 'oud,wood', needsEnrichment: true,
    accords: [{name:'woody',strength:.6}],
    notes: [{name:'Oud',layer:'base'}] },
]
```

- [ ] **Step 4: Run test, expect pass**

Run: `npx vitest run src/domain/catalogue.seed.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/domain/catalogue.seed.ts src/domain/catalogue.seed.test.ts
git commit -m "feat: seed catalogue of 15 scents"
```

---

### Task 4: Catalogue service (search, filter, sort)

**Files:**
- Create: `src/domain/catalogue.ts`
- Test: `src/domain/catalogue.test.ts`

- [ ] **Step 1: Write the failing test**

`src/domain/catalogue.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { createCatalogue } from './catalogue'
import { SEED_SCENTS } from './catalogue.seed'

const cat = createCatalogue(SEED_SCENTS)

describe('catalogue', () => {
  it('gets all and by id', () => {
    expect(cat.getAll()).toHaveLength(15)
    expect(cat.getById('tomford-noir')?.name).toBe('Noir')
    expect(cat.getById('missing')).toBeUndefined()
  })
  it('searches by name and brand, case-insensitive', () => {
    expect(cat.search('noir').map(s => s.id)).toEqual(['tomford-noir'])
    expect(cat.search('aesop').length).toBe(2)
  })
  it('filters by family and brand', () => {
    expect(cat.filter({ family: 'woody' }).every(s => s.families.includes('woody'))).toBe(true)
    expect(cat.filter({ brand: 'Dior' }).length).toBe(2)
  })
  it('sorts by name ascending', () => {
    const names = cat.sort(cat.getAll(), 'name').map(s => s.name)
    const sorted = [...names].sort((a, b) => a.localeCompare(b))
    expect(names).toEqual(sorted)
  })
})
```

- [ ] **Step 2: Run test, expect fail**

Run: `npx vitest run src/domain/catalogue.test.ts`
Expected: FAIL (cannot find module).

- [ ] **Step 3: Create `src/domain/catalogue.ts`**

```ts
import type { Scent, Family } from './types'

export type SortKey = 'name' | 'brand'
export interface FilterCriteria {
  family?: Family
  brand?: string
}

export interface Catalogue {
  getAll(): Scent[]
  getById(id: string): Scent | undefined
  search(query: string): Scent[]
  filter(criteria: FilterCriteria): Scent[]
  sort(list: Scent[], key: SortKey): Scent[]
}

export function createCatalogue(scents: Scent[]): Catalogue {
  const byId = new Map(scents.map(s => [s.id, s]))
  return {
    getAll: () => [...scents],
    getById: (id) => byId.get(id),
    search(query) {
      const q = query.trim().toLowerCase()
      if (!q) return [...scents]
      return scents.filter(s =>
        s.name.toLowerCase().includes(q) || s.brand.toLowerCase().includes(q))
    },
    filter({ family, brand }) {
      return scents.filter(s =>
        (!family || s.families.includes(family)) &&
        (!brand || s.brand === brand))
    },
    sort(list, key) {
      return [...list].sort((a, b) => a[key].localeCompare(b[key]))
    },
  }
}
```

- [ ] **Step 4: Run test, expect pass**

Run: `npx vitest run src/domain/catalogue.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/domain/catalogue.ts src/domain/catalogue.test.ts
git commit -m "feat: catalogue service with search, filter, sort"
```

---

### Task 5: Wardrobe store (local-first)

**Files:**
- Create: `src/domain/wardrobe.ts`
- Test: `src/domain/wardrobe.test.ts`

- [ ] **Step 1: Write the failing test**

`src/domain/wardrobe.test.ts`:
```ts
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
  it('persists across instances using the same storage', () => {
    const storage = memoryStorage()
    const a = createWardrobe(storage)
    a.add('lelabo-santal33', 'owned')
    const b = createWardrobe(storage)
    expect(b.get('lelabo-santal33')?.ownership).toBe('owned')
  })
})
```

- [ ] **Step 2: Run test, expect fail**

Run: `npx vitest run src/domain/wardrobe.test.ts`
Expected: FAIL (cannot find module).

- [ ] **Step 3: Create `src/domain/wardrobe.ts`**

```ts
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
  let entries: WardrobeEntry[] = load()
  const listeners = new Set<Listener>()

  function load(): WardrobeEntry[] {
    try { return JSON.parse(storage.getItem(KEY) ?? '[]') } catch { return [] }
  }
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
    get: (id) => entries.find(e => e.scentId === id),
    add: (id, ownership) => upsert(id, { ownership }),
    remove: (id) => { entries = entries.filter(e => e.scentId !== id); persist() },
    rate: (id, score) => upsert(id, { score: clamp(score, 0, 10) }),
    subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn) },
  }
}
```

- [ ] **Step 4: Run test, expect pass**

Run: `npx vitest run src/domain/wardrobe.test.ts`
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add src/domain/wardrobe.ts src/domain/wardrobe.test.ts
git commit -m "feat: local-first wardrobe store"
```

---

### Task 6: Pairings from the wardrobe

**Files:**
- Create: `src/domain/pairings.ts`
- Test: `src/domain/pairings.test.ts`

- [ ] **Step 1: Write the failing test**

`src/domain/pairings.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { suggestPairings } from './pairings'
import { SEED_SCENTS } from './catalogue.seed'

describe('pairings', () => {
  it('ranks owned scents that share base notes or families with the target', () => {
    const target = SEED_SCENTS.find(s => s.id === 'tomford-noir')!
    const owned = SEED_SCENTS.filter(s => ['lelabo-santal33','aesop-hwyl','reef-summerpeach'].includes(s.id))
    const result = suggestPairings(target, owned)
    expect(result[0].scent.id).not.toBe('tomford-noir') // never pairs with itself
    expect(result.length).toBeGreaterThan(0)
    // Hwyl shares the 'smoky' family with Noir, should outrank the fresh Reef
    const ids = result.map(r => r.scent.id)
    expect(ids.indexOf('aesop-hwyl')).toBeLessThan(ids.indexOf('reef-summerpeach'))
  })
  it('excludes the target itself', () => {
    const target = SEED_SCENTS.find(s => s.id === 'lelabo-santal33')!
    const result = suggestPairings(target, [target])
    expect(result).toEqual([])
  })
})
```

- [ ] **Step 2: Run test, expect fail**

Run: `npx vitest run src/domain/pairings.test.ts`
Expected: FAIL (cannot find module).

- [ ] **Step 3: Create `src/domain/pairings.ts`**

```ts
import type { Scent } from './types'

export interface Pairing { scent: Scent; score: number }

function sharedFamilies(a: Scent, b: Scent): number {
  const set = new Set(a.families)
  return b.families.filter(f => set.has(f)).length
}
function sharedBaseNotes(a: Scent, b: Scent): number {
  const base = new Set(a.notes.filter(n => n.layer === 'base').map(n => n.name.toLowerCase()))
  return b.notes.filter(n => n.layer === 'base' && base.has(n.name.toLowerCase())).length
}

export function suggestPairings(target: Scent, owned: Scent[]): Pairing[] {
  return owned
    .filter(s => s.id !== target.id)
    .map(s => ({ scent: s, score: sharedBaseNotes(target, s) * 2 + sharedFamilies(target, s) }))
    .filter(p => p.score > 0)
    .sort((a, b) => b.score - a.score)
}
```

- [ ] **Step 4: Run test, expect pass**

Run: `npx vitest run src/domain/pairings.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/domain/pairings.ts src/domain/pairings.test.ts
git commit -m "feat: wardrobe-based pairing suggestions"
```

---

### Task 7: Design tokens and font wiring

**Files:**
- Create: `src/ui/tokens.css`
- Modify: `index.html`, `src/main.tsx`

- [ ] **Step 1: Create `src/ui/tokens.css`**

```css
:root {
  --bg-deep: #140d18;
  --bg-plum: #211624;
  --navy: #0b2545;
  --gold: #caa25f;
  --gold-light: #e6cf9b;
  --plum: #8b5c8f;
  --teal: #3f7f76;
  --ink: #fbf8f3;
  --ink-dim: rgba(251, 248, 243, 0.6);
  --glass-border: rgba(255, 255, 255, 0.16);
  --radius: 18px;
  --serif: 'Fraunces', Georgia, serif;
  --sans: 'Archivo', system-ui, sans-serif;
}
* { box-sizing: border-box; }
body {
  margin: 0;
  font-family: var(--sans);
  color: var(--ink);
  background: radial-gradient(120% 80% at 50% 0%, var(--bg-plum), var(--bg-deep) 60%, #0a070c 100%);
  min-height: 100vh;
}
.serif { font-family: var(--serif); }
.italic { font-style: italic; }
```

- [ ] **Step 2: Add fonts to `index.html`** (inside `<head>`)

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;1,9..144,400;1,9..144,500&family=Archivo:wght@400;500;600&display=swap" rel="stylesheet" />
```

- [ ] **Step 3: Import tokens in `src/main.tsx`** (replace the default `index.css` import)

```ts
import './ui/tokens.css'
```

- [ ] **Step 4: Verify build compiles**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 5: Commit**

```bash
git add src/ui/tokens.css index.html src/main.tsx
git commit -m "feat: design tokens and fonts"
```

---

### Task 8: GlassCard and RatingMeter primitives

**Files:**
- Create: `src/ui/components/GlassCard.tsx`, `src/ui/components/RatingMeter.tsx`
- Test: `src/ui/components/RatingMeter.test.tsx`

- [ ] **Step 1: Write the failing test**

`src/ui/components/RatingMeter.test.tsx`:
```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { RatingMeter } from './RatingMeter'

describe('RatingMeter', () => {
  it('shows the score out of 10', () => {
    render(<RatingMeter score={8.4} />)
    expect(screen.getByText('8.4')).toBeInTheDocument()
    expect(screen.getByLabelText('Sillage score 8.4 out of 10')).toBeInTheDocument()
  })
  it('renders an em dash when unrated', () => {
    render(<RatingMeter score={undefined} />)
    expect(screen.getByText('-')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test, expect fail**

Run: `npx vitest run src/ui/components/RatingMeter.test.tsx`
Expected: FAIL (cannot find module).

- [ ] **Step 3: Create `src/ui/components/GlassCard.tsx`**

```tsx
import type { PropsWithChildren, CSSProperties } from 'react'

export function GlassCard({ children, style }: PropsWithChildren<{ style?: CSSProperties }>) {
  return (
    <div style={{
      background: 'linear-gradient(160deg, rgba(255,255,255,.08), rgba(255,255,255,.02))',
      border: '1px solid var(--glass-border)',
      borderRadius: 'var(--radius)',
      backdropFilter: 'blur(18px)',
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,.2)',
      padding: '16px',
      ...style,
    }}>{children}</div>
  )
}
```

- [ ] **Step 4: Create `src/ui/components/RatingMeter.tsx`**

```tsx
export function RatingMeter({ score }: { score?: number }) {
  const pct = score !== undefined ? (score / 10) * 100 : 0
  return (
    <div aria-label={score !== undefined ? `Sillage score ${score} out of 10` : 'Unrated'}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span style={{ fontSize: 8, letterSpacing: '.22em', textTransform: 'uppercase', color: 'var(--ink-dim)' }}>
          Sillage score
        </span>
        <span className="serif" style={{ fontSize: 20 }}>
          {score !== undefined ? score : '-'}
          <span style={{ fontSize: 9, color: 'var(--ink-dim)' }}> / 10</span>
        </span>
      </div>
      <div style={{ position: 'relative', height: 6, borderRadius: 4, marginTop: 8,
        background: 'linear-gradient(90deg, #3a2d4a, #8a4a2e, var(--gold))' }}>
        <div style={{ position: 'absolute', left: `${pct}%`, top: '50%', width: 11, height: 11,
          transform: 'translate(-50%,-50%)', borderRadius: '50%', background: '#fff',
          boxShadow: '0 0 8px var(--gold)', opacity: score !== undefined ? 1 : 0 }} />
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Run test, expect pass**

Run: `npx vitest run src/ui/components/RatingMeter.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 6: Commit**

```bash
git add src/ui/components/GlassCard.tsx src/ui/components/RatingMeter.tsx src/ui/components/RatingMeter.test.tsx
git commit -m "feat: GlassCard and RatingMeter primitives"
```

---

### Task 9: ScentCard component

**Files:**
- Create: `src/ui/components/ScentCard.tsx`
- Test: `src/ui/components/ScentCard.test.tsx`

- [ ] **Step 1: Write the failing test**

`src/ui/components/ScentCard.test.tsx`:
```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ScentCard } from './ScentCard'
import { SEED_SCENTS } from '../../domain/catalogue.seed'

const noir = SEED_SCENTS.find(s => s.id === 'tomford-noir')!

describe('ScentCard', () => {
  it('shows brand and name', () => {
    render(<ScentCard scent={noir} />)
    expect(screen.getByText('Tom Ford')).toBeInTheDocument()
    expect(screen.getByText('Noir')).toBeInTheDocument()
  })
  it('lists notes grouped by layer in top, heart, base order', () => {
    render(<ScentCard scent={noir} />)
    const labels = screen.getAllByTestId('layer-label').map(n => n.textContent)
    expect(labels).toEqual(['Top', 'Heart', 'Base'])
  })
})
```

- [ ] **Step 2: Run test, expect fail**

Run: `npx vitest run src/ui/components/ScentCard.test.tsx`
Expected: FAIL (cannot find module).

- [ ] **Step 3: Create `src/ui/components/ScentCard.tsx`**

```tsx
import type { Scent, Layer } from '../../domain/types'
import { GlassCard } from './GlassCard'

const ORDER: Layer[] = ['top', 'heart', 'base']
const LABEL: Record<Layer, string> = { top: 'Top', heart: 'Heart', base: 'Base' }

export function ScentCard({ scent, onClick }: { scent: Scent; onClick?: () => void }) {
  return (
    <GlassCard style={{ cursor: onClick ? 'pointer' : 'default' }}>
      <div onClick={onClick}>
        <div style={{ fontSize: 8, letterSpacing: '.26em', textTransform: 'uppercase', color: 'var(--ink-dim)' }}>
          {scent.brand}
        </div>
        <div className="serif italic" style={{ fontSize: 24 }}>{scent.name}</div>
        <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {ORDER.map(layer => {
            const notes = scent.notes.filter(n => n.layer === layer)
            if (notes.length === 0) return null
            return (
              <div key={layer}>
                <div data-testid="layer-label" style={{ fontSize: 7.5, letterSpacing: '.22em',
                  textTransform: 'uppercase', color: 'var(--ink-dim)' }}>{LABEL[layer]}</div>
                <div style={{ fontSize: 11 }}>{notes.map(n => n.name).join(' · ')}</div>
              </div>
            )
          })}
        </div>
      </div>
    </GlassCard>
  )
}
```

- [ ] **Step 4: Run test, expect pass**

Run: `npx vitest run src/ui/components/ScentCard.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/ui/components/ScentCard.tsx src/ui/components/ScentCard.test.tsx
git commit -m "feat: ScentCard with layered notes"
```

---

### Task 10: Shelf page (search, filter, sort)

**Files:**
- Create: `src/ui/pages/ShelfPage.tsx`
- Test: `src/ui/pages/ShelfPage.test.tsx`

- [ ] **Step 1: Write the failing test**

`src/ui/pages/ShelfPage.test.tsx`:
```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { ShelfPage } from './ShelfPage'
import { createCatalogue } from '../../domain/catalogue'
import { SEED_SCENTS } from '../../domain/catalogue.seed'

function renderShelf() {
  const cat = createCatalogue(SEED_SCENTS)
  return render(<MemoryRouter><ShelfPage catalogue={cat} /></MemoryRouter>)
}

describe('ShelfPage', () => {
  it('lists all scents', () => {
    renderShelf()
    expect(screen.getAllByTestId('scent-row').length).toBe(15)
  })
  it('filters by search query', async () => {
    renderShelf()
    await userEvent.type(screen.getByPlaceholderText(/search/i), 'noir')
    expect(screen.getAllByTestId('scent-row').length).toBe(1)
    expect(screen.getByText('Noir')).toBeInTheDocument()
  })
  it('filters by family when a chip is clicked', async () => {
    renderShelf()
    await userEvent.click(screen.getByRole('button', { name: 'woody' }))
    const rows = screen.getAllByTestId('scent-row')
    expect(rows.length).toBeGreaterThan(0)
    expect(rows.length).toBeLessThan(15)
  })
})
```

- [ ] **Step 2: Run test, expect fail**

Run: `npx vitest run src/ui/pages/ShelfPage.test.tsx`
Expected: FAIL (cannot find module).

- [ ] **Step 3: Create `src/ui/pages/ShelfPage.tsx`**

```tsx
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import type { Catalogue, SortKey } from '../../domain/catalogue'
import { FAMILIES, type Family } from '../../domain/types'

export function ShelfPage({ catalogue }: { catalogue: Catalogue }) {
  const [query, setQuery] = useState('')
  const [family, setFamily] = useState<Family | null>(null)
  const [sortKey] = useState<SortKey>('name')

  const rows = useMemo(() => {
    let list = query ? catalogue.search(query) : catalogue.getAll()
    if (family) list = list.filter(s => s.families.includes(family))
    return catalogue.sort(list, sortKey)
  }, [catalogue, query, family, sortKey])

  return (
    <div style={{ padding: '24px 20px 90px' }}>
      <h1 className="serif" style={{ fontSize: 30, margin: 0 }}>My <span className="italic">Shelf</span></h1>
      <div style={{ color: 'var(--ink-dim)', fontSize: 11 }}>{catalogue.getAll().length} bottles</div>

      <input
        placeholder="Search your shelf, or any scent..."
        value={query}
        onChange={e => setQuery(e.target.value)}
        style={{ width: '100%', margin: '14px 0', padding: '11px 13px', borderRadius: 14,
          border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,.06)',
          color: 'var(--ink)', fontFamily: 'var(--sans)', fontSize: 13, outline: 'none' }}
      />

      <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginBottom: 14 }}>
        <button onClick={() => setFamily(null)} aria-pressed={family === null} style={chipStyle(family === null)}>all</button>
        {FAMILIES.map(f => (
          <button key={f} onClick={() => setFamily(f)} aria-pressed={family === f} style={chipStyle(family === f)}>{f}</button>
        ))}
      </div>

      <div>
        {rows.map(s => (
          <Link key={s.id} to={`/scent/${s.id}`} data-testid="scent-row"
            style={{ display: 'flex', justifyContent: 'space-between', padding: '11px 0',
              borderBottom: '1px solid rgba(255,255,255,.06)', textDecoration: 'none', color: 'var(--ink)' }}>
            <span>
              <span style={{ fontSize: 8, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--ink-dim)', display: 'block' }}>{s.brand}</span>
              <span className="serif italic" style={{ fontSize: 18 }}>{s.name}</span>
            </span>
            <span style={{ fontSize: 9, color: 'var(--ink-dim)' }}>{s.families.join(' · ')}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}

function chipStyle(active: boolean): React.CSSProperties {
  return {
    fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', cursor: 'pointer',
    padding: '6px 11px', borderRadius: 4, border: '1px solid var(--glass-border)',
    background: active ? 'rgba(202,162,95,.18)' : 'transparent',
    color: active ? 'var(--gold-light)' : 'var(--ink-dim)',
  }
}
```

Note: filter chips use square corners (`borderRadius: 4`), not pills, per the brand direction.

- [ ] **Step 4: Run test, expect pass**

Run: `npx vitest run src/ui/pages/ShelfPage.test.tsx`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/ui/pages/ShelfPage.tsx src/ui/pages/ShelfPage.test.tsx
git commit -m "feat: Shelf page with search and family filter"
```

---

### Task 11: Scent detail page

**Files:**
- Create: `src/ui/pages/ScentPage.tsx`
- Test: `src/ui/pages/ScentPage.test.tsx`

- [ ] **Step 1: Write the failing test**

`src/ui/pages/ScentPage.test.tsx`:
```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { ScentPage } from './ScentPage'
import { createCatalogue } from '../../domain/catalogue'
import { createWardrobe } from '../../domain/wardrobe'
import { SEED_SCENTS } from '../../domain/catalogue.seed'

function memoryStorage(): Storage {
  const m = new Map<string, string>()
  return { getItem: k => m.get(k) ?? null, setItem: (k, v) => void m.set(k, v),
    removeItem: k => void m.delete(k), clear: () => m.clear(),
    key: i => [...m.keys()][i] ?? null, get length() { return m.size } } as Storage
}

function renderAt(id: string) {
  const cat = createCatalogue(SEED_SCENTS)
  const wardrobe = createWardrobe(memoryStorage())
  wardrobe.add('aesop-hwyl', 'owned')
  return render(
    <MemoryRouter initialEntries={[`/scent/${id}`]}>
      <Routes>
        <Route path="/scent/:id" element={<ScentPage catalogue={cat} wardrobe={wardrobe} />} />
      </Routes>
    </MemoryRouter>
  )
}

describe('ScentPage', () => {
  it('shows the scent name and family', () => {
    renderAt('tomford-noir')
    expect(screen.getByRole('heading', { name: 'Noir' })).toBeInTheDocument()
    expect(screen.getByText(/Tom Ford/)).toBeInTheDocument()
  })
  it('renders accords', () => {
    renderAt('tomford-noir')
    expect(screen.getByText(/leather/i)).toBeInTheDocument()
  })
  it('suggests a pairing from the wardrobe', () => {
    renderAt('tomford-noir')
    // Hwyl is owned and shares the smoky family with Noir
    expect(screen.getByText('Hwyl')).toBeInTheDocument()
  })
  it('shows a not-found message for unknown ids', () => {
    renderAt('does-not-exist')
    expect(screen.getByText(/not found/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test, expect fail**

Run: `npx vitest run src/ui/pages/ScentPage.test.tsx`
Expected: FAIL (cannot find module).

- [ ] **Step 3: Create `src/ui/pages/ScentPage.tsx`**

```tsx
import { useParams } from 'react-router-dom'
import type { Catalogue } from '../../domain/catalogue'
import type { Wardrobe } from '../../domain/wardrobe'
import { RatingMeter } from '../components/RatingMeter'
import { ScentCard } from '../components/ScentCard'
import { suggestPairings } from '../../domain/pairings'

export function ScentPage({ catalogue, wardrobe }: { catalogue: Catalogue; wardrobe: Wardrobe }) {
  const { id = '' } = useParams()
  const scent = catalogue.getById(id)
  if (!scent) return <div style={{ padding: 24 }} className="serif italic">Scent not found.</div>

  const entry = wardrobe.get(id)
  const owned = wardrobe.list()
    .map(e => catalogue.getById(e.scentId))
    .filter((s): s is NonNullable<typeof s> => Boolean(s))
  const pairings = suggestPairings(scent, owned)

  return (
    <div style={{ padding: '24px 20px 90px', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div>
        <div style={{ fontSize: 9, letterSpacing: '.24em', textTransform: 'uppercase', color: 'var(--gold)' }}>
          {scent.brand}{scent.year ? ` · ${scent.year}` : ''}
        </div>
        <h1 className="serif italic" style={{ fontSize: 44, margin: '4px 0' }}>{scent.name}</h1>
        <div style={{ fontSize: 10, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--ink-dim)' }}>
          {scent.families.join(' · ')}
        </div>
      </div>

      <RatingMeter score={entry?.score} />

      <div>
        <div style={{ fontSize: 8, letterSpacing: '.22em', textTransform: 'uppercase', color: 'var(--ink-dim)', marginBottom: 8 }}>Dominant accords</div>
        {scent.accords.map(a => (
          <div key={a.name} style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '6px 0' }}>
            <span style={{ width: 64, fontSize: 11, textTransform: 'capitalize' }}>{a.name}</span>
            <span style={{ height: 7, borderRadius: 4, width: `${a.strength * 100}%`, maxWidth: 200, background: 'var(--gold)' }} />
          </div>
        ))}
      </div>

      <ScentCard scent={scent} />

      {pairings.length > 0 && (
        <div>
          <div style={{ fontSize: 8, letterSpacing: '.22em', textTransform: 'uppercase', color: 'var(--ink-dim)', marginBottom: 8 }}>Pairs with your shelf</div>
          {pairings.map(p => (
            <div key={p.scent.id} className="serif italic" style={{ fontSize: 15, padding: '4px 0' }}>{p.scent.name}</div>
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Run test, expect pass**

Run: `npx vitest run src/ui/pages/ScentPage.test.tsx`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/ui/pages/ScentPage.tsx src/ui/pages/ScentPage.test.tsx
git commit -m "feat: scent detail page with accords and pairings"
```

---

### Task 12: App shell, routing, and run

**Files:**
- Create: `src/ui/App.tsx`
- Modify: `src/main.tsx`
- Test: `src/ui/App.test.tsx`

- [ ] **Step 1: Write the failing test**

`src/ui/App.test.tsx`:
```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { App } from './App'

describe('App', () => {
  it('renders the Shelf at the root route', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: /Shelf/i })).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test, expect fail**

Run: `npx vitest run src/ui/App.test.tsx`
Expected: FAIL (cannot find module).

- [ ] **Step 3: Create `src/ui/App.tsx`**

```tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { createCatalogue } from '../domain/catalogue'
import { createWardrobe } from '../domain/wardrobe'
import { SEED_SCENTS } from '../domain/catalogue.seed'
import { ShelfPage } from './pages/ShelfPage'
import { ScentPage } from './pages/ScentPage'

const catalogue = createCatalogue(SEED_SCENTS)
const wardrobe = createWardrobe()

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ShelfPage catalogue={catalogue} />} />
        <Route path="/scent/:id" element={<ScentPage catalogue={catalogue} wardrobe={wardrobe} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
```

- [ ] **Step 4: Replace `src/main.tsx` body to render App**

```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import './ui/tokens.css'
import { App } from './ui/App'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

- [ ] **Step 5: Run test, expect pass**

Run: `npx vitest run src/ui/App.test.tsx`
Expected: PASS.

- [ ] **Step 6: Run the full suite and the build**

Run: `npm test && npm run build`
Expected: all tests pass, build succeeds.

- [ ] **Step 7: Manual check**

Run: `npm run dev`, open the local URL. Confirm the Shelf lists 15 scents, search and family filter work, clicking a row opens the scent detail with accords and (if you add an owned scent) pairings.

- [ ] **Step 8: Commit**

```bash
git add src/ui/App.tsx src/ui/App.test.tsx src/main.tsx
git commit -m "feat: app shell with routing, Shelf and Scent detail wired"
```

---

## Self-review notes

- **Spec coverage (Phase 1 scope):** repo scaffold (Task 1), design system tokens + primitives (Tasks 7-9), Scent data model (Task 2), catalogue + search/filter/sort incl. brand (Task 4), local-first wardrobe persistence (Task 5), pairings (Task 6), Shelf (Task 10), Scent detail with accords/notes/score (Task 11), app shell (Task 12). The smoke field, holographic cards, Notes Explorer, Perfumery, Daily, Profile, splash, mesh gradient, PS nav, LLM Q&A, and Capacitor wrap are later phases per the spec build order and are intentionally out of Phase 1.
- **No placeholders:** every code step contains complete code; niche-scent seed entries use a real `needsEnrichment` flag rather than fake data.
- **Type consistency:** `Catalogue`, `Wardrobe`, `Scent`, `Family`, `SortKey` names are used identically across tasks; `createCatalogue`/`createWardrobe`/`suggestPairings` signatures match their call sites in the pages and App.
- **RatingMeter unrated** renders a single hyphen `-` (not an em dash), honouring the no-em-dash rule.
