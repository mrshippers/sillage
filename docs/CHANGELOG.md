# Sillage - Changelog

Newest first. All dates from git commit metadata.

---

## 2026-06-25

### Full brainstormed app (commit 67915bf)

Built the complete brainstormed vision after the 25 Jun intermediate shell:

- **Splash screen** (`Splash.tsx`) - smoke curls, gold serif SILLAGE wordmark draws in under a sheen sweep, palette auras bloom, then the whole thing dissolves into Home. Skippable on tap.
- **Breathing Home** - contextual greeting driven by live time and season; Scent of the Day aura hero with a one-line reason built from real scent fields; From-your-shelf aura card row.
- **Living Scent Wheel** (`Wheel.tsx`, `families.ts`) - 9 families orbit a glowing hub; tap to crown a family and filter the shelf. Family membership is derived from real profile axes (warmth, freshness, woody etc.), not hand-coded; counts reflect actual catalogue data.
- **Nose (profile) tab** - dominant families, signature notes, and anchor scent all computed live from the shelf contents.
- **Settings** - functional Shimmer toggle, Smoke/Aurora background selector, replay-open button.
- Aura cards are `radial-gradient` from each scent's real `color` field, not hotlinked stock imagery.
- 45 tests green at ship.
- Split `SillageApp.tsx` (now 390 lines) into `Smoke.tsx`, `Splash.tsx`, `Wheel.tsx`, `families.ts` to stay under 500 lines per file.

### Vertical phone shell (commit c196fbb)

- Phone-framed immersive layout with ambient smoke canvas rising behind the app.
- Crafted SVG bottom nav (7 tabs: Home, Wheel, Shelf, Perfumery, Daily, Nose, Settings) with a gliding indicator that springs across tabs with overshoot.
- Shelf gains search, family-filter chips, and sort (newest/rating).
- Daily tab runs on mood + occasion inputs via `scoreScent` / `rankDaily` from `src/domain/selector.ts`.
- Perfumery Lab wired to `chemistryOf` from `src/domain/chemistry.ts`; displays a glowing Chemistry Score and `getLayerPartner` suggestions.

### Cache headers fix (commit c391ea6)

- Netlify config forces revalidation of `index.html` so no client stays pinned to a stale build after a deploy.

---

## 2026-06-20

### Phase 1 and 1.5 go live (commits e944b5f, 24a57fb, e3c9d39, merges)

- Restored the real typed Sillage (Phase 1 + 1.5 engines) as the live Netlify app, replacing the prior placeholder.
- Netlify build config (`netlify.toml`) added; SPA redirect fallback (`/* -> /index.html 200`) so deep links work.
- Page title and meta description set.
- Phase 1.5 domain-depth implementation plan committed to `docs/superpowers/plans/`.

---

## 2026-06-16

### Phase 1.5 - Domain depth (commits 9a5b43d, d215be8, 8494a49, 906b575)

- **Chemistry engine** (`src/domain/chemistry.ts`) - `calcChemistry(scents)` ported from the original `App.jsx` `FRAGRANCES` array. Returns a `ChemistryResult` with weighted-axis blending. Fully typed, unit-tested.
- **Daily Selector engine** (`src/domain/selector.ts`) - `scoreScent`, `rankDaily`, `getLayerPartner` ported verbatim from legacy source. Physics-style scoring against time-of-day, season, weather, and recency. Fully typed, unit-tested.
- **Enriched seed catalogue** (`src/domain/catalogue.seed.ts`) - all 15 Phase 1 scents given real numeric profiles (11 axes: warmth, freshness, sweet, dark, floral, spicy, green, woody, smoky, musky, resinous, plus projection/longevity/weight). Numbers transcribed from the original source, nothing invented. 3 legacy-only scents added (`iaq-spanishtobacco`, `lelabo-tabac26`, `tomford-noirextreme`). Total: 18 scents. 4 scents with no legacy equivalent left without a `profile` by design.
- **Chemistry pairings** (`src/domain/pairings.ts`) - `chemistryPairings(target, owned)` added alongside the existing `suggestPairings`.
- `Scent` type extended with optional `ScentProfile`, `ScentTags`, `season`, `mood`, `aura`, `application`, `effect`.

---

## 2026-06-15

### Phase 1 - Foundation (commits 7c3b910 through 2fdaa7e6)

- Vite + React 18 + TypeScript scaffold; Vitest + @testing-library/react test runner.
- **Domain types** (`src/domain/types.ts`) - `Scent`, `Note`, `Accord`, `Family`, `WardrobeEntry`, `Ownership`.
- **Catalogue service** (`src/domain/catalogue.ts`) - `getAll`, `getById`, `search`, `filter`, `sort`; pure functions, zero framework imports.
- **15-scent seed catalogue** (`src/domain/catalogue.seed.ts`) - real scent data, no invented values.
- **Local-first wardrobe store** (`src/domain/wardrobe.ts`) - `localStorage` persistence behind a repository interface with subscribe for UI reactivity.
- **Wardrobe-based pairing suggestions** (`src/domain/pairings.ts`).
- **UI primitives** - `GlassCard.tsx`, `RatingMeter.tsx` (0-10 scale), `ScentCard.tsx` (layered notes display).
- **Shelf page** - search, family filter, sort.
- **Scent detail page** - accords, note pyramid (top/heart/base), Sillage Score, pairings.
- **App shell** - react-router-dom v6 routes, Fraunces + Archivo fonts, design tokens in `tokens.css`.
- Design tokens system (`src/ui/tokens.css`).

---

## Pre-June 2026

- Original Sillage SPA deployed to `sillagefragrance.netlify.app` with no recoverable source code, no persistence.
- v2 scoring engine, darker metallic aesthetic, 15 fragrances (commits d18f022, e15710b).
- Luxury app icon + PWA manifest (a6556e4, f0b30da).
- Design specs and brand mark spec committed (commits 0b0e790 through 5d76e41).
