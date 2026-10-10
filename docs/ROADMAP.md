# Sillage - Roadmap

Current state of `main` as of 2026-09-29, commit 33fef53 (the "atelier" redesign). The 25 Jun rebuild notes below are kept for history; where the atelier redesign changed them, the row says so.

---

## What is live now

5-tab app (Tonight, Shelf, Lab, Notes, You), every bottle drawn as a smelling strip, plus a full page per bottle with your 0-10 score and a wear diary. Vite + React + TypeScript SPA. 18 hand-profiled scents. 67 tests green at the atelier commit. Smoke, Splash, Material and the orbiting Wheel were deleted in that commit.

All scored/ranked/chemistry output derives from real typed engines (`chemistry.ts`, `selector.ts`) operating on real numeric profiles. No invented scent data anywhere in the codebase.

---

## Known gaps from the 25 Jun rebuild

These are confirmed unresolved corners from the commit message and source inspection.

| # | Gap | Impact | Source |
|---|-----|--------|--------|
| 1 | Logo mark not built | Brand spec (ghost flacon + spritz + S-molecule + monogram) exists in `docs/superpowers/specs/`. Only the plain gold SILLAGE wordmark appears in Splash. | Spec `2026-06-14-sillage-design.md` line 112 |
| 2 | ~~Aura cards are CSS gradients, not photography~~ SUPERSEDED 29 Sep 2026: aura cards were deleted; each bottle is now a smelling strip tinted with its authored `color`. | Cards use `radial-gradient` from each scent's `color` hex. Spec calls for cards "skinned in the key ingredient" (Santal 33 wears sandalwood, Noir wears smoke). Accurate and honest for now; photography is a future bar. | Commit 67915bf message |
| 3 | ~~No wardrobe persistence across sessions~~ DONE 28 Sep 2026: bottle status and settings persist via `wardrobe.ts` / `wardrobeState.ts`. There is still no rating UI to persist (see P1). | `src/domain/wardrobe.ts` has a full `localStorage` repo. The `src/sillage/SillageApp.tsx` layer uses `useState` arrays and does not call `wardrobe.ts`. Rating a scent or adding it to the shelf is lost on refresh. | Code inspection |
| 4 | ~~Ownership model absent~~ DONE 28 Sep 2026: every bottle is On the shelf, Finished or Wishlist. | Spec defines owned / wishlist / finished bottles. Currently every scent is just "on the shelf" with no ownership status. | Spec surface 4 |
| 5 | Wheel is family-orbit, not the full physics notes explorer. PARTLY SUPERSEDED 29 Sep 2026: the orbiting Wheel was deleted and a Notes tab (every note in your bottles, most carried first, tap one to see which bottles carry it) replaced it. The physics field is still not built. | The spec describes notes floating in a physics field, sized by frequency, with educational tap-to-learn content. The live Wheel shows 9 family rings orbiting a hub. The family-orbit view is the spec's "second view" fallback; the primary notes-field is not built. | Spec surface 3 |

---

## Next priorities (in order)

### P1 - Wire wardrobe persistence - DONE 28 Sep 2026

Correction on the gap as first written: the live app never had a rating UI, so nothing was being lost on refresh except the Settings choices. Shipped: bottle status persists through `src/domain/wardrobe.ts` (wrapped by `src/sillage/wardrobeState.ts`), and Shimmer / Background / Daily reminder persist too. A personal 0-10 rating on the open bottle was the remaining piece; it shipped 29 Sep 2026 as "your score" on the scent page, and ratings keep through status changes.


Connect `SillageApp.tsx` shelf state to `src/domain/wardrobe.ts` so ratings and owned scents survive a refresh. This is infrastructure, not a visible feature; it unblocks everything that depends on "your shelf" being real (Daily quality, Nose accuracy, Perfumery suggestions).

Estimated scope: replace the 3 `useState` arrays in `SillageApp.tsx` with `wardrobe.ts` subscribers + mutations. No new files needed.

### P2 - Ownership statuses - DONE 28 Sep 2026

Shipped as a Shelf / Finished / Wishlist control on each open bottle, a status filter row, and the state named in words on the row. Home, Daily and Nose now read only the bottles on the shelf, so a finished bottle is never suggested. Home was split out of `SillageApp.tsx` into `Home.tsx` first, per the constraint below.


Add `own | wish | finished` to `WardrobeEntry` (already has `owned?: boolean`). Surface as a 3-state chip on each shelf card and in the wardrobe filter. The Nose tab gains a Finished section.

### P3 - Logo mark

Render the brand mark spec from `docs/superpowers/specs/2026-06-14-sillage-design.md` as an inline SVG:
- Ghost flacon outline (two rectangles, rounded cap, narrow neck)
- Spritz burst (4-6 radial lines from the nozzle tip)
- S-molecule connectors (2 circles + a bridge)
- Monogram `S` inside the flacon body
- No fills, stroke only, works on dark and light ground

Use in Splash alongside the wordmark and as the PWA icon. (Splash was deleted 29 Sep 2026; the placement needs re-deciding.)

### P4 - Notes explorer (full physics field)

Build the primary Wheel view: individual notes floating in a `requestAnimationFrame` physics field, sized by frequency across the owned shelf, coloured by family. Tap a note for: name, humanised smell description, one fact worth knowing, which of your scents carry it.

The current family-orbit wheel becomes the secondary view, toggled by a chip.

Status 29 Sep 2026: the orbiting Wheel is gone and the Notes tab (a list of the notes in your collection, tap for the bottles that carry them) is the only notes view. The physics field and the per-note descriptions are not built.

### P5 - LLM niche search

On Shelf search, if the typed query matches nothing in the 18-scent catalogue, fire a Claude API call (user-supplied key in Settings) to fetch the scent's notes, accords, and a humanised blurb. Add it to the local catalogue for that session. Show a skeleton shimmer while fetching.

Required before App Store submission.

### P6 - Gyro-reactive holographic tilt

On mobile, use `DeviceMotionEvent` to shift the foil gradient and mesh glow on each aura card. (Aura cards were deleted 29 Sep 2026; the target needs re-pointing.) On web, fall back to pointer position. Graceful degradation: if permission denied or event unavailable, card stays static.

### P7 - Community ratings ("the hive")

Store per-scent aggregate scores in a lightweight Supabase table (anonymous, no account required). Show your score against the current hive mean on the RatingMeter as a ghost marker. Read-only on first open; your score pushes only when you explicitly rate.

### P8 - Shared-element morph transitions

Shelf card expands into the full scent detail and collapses back with a shared-element morph. No hard cuts. Uses the `View Transitions API` on supporting browsers; falls back to a simple fade.

---

## Later / YAGNI for now

These are in the design spec but deferred until the P1-P8 core is solid:

- Spritz microinteraction on rating (aura colour puff).
- Pull-to-refresh smoke swirl on Home.
- Haptics via Capacitor.
- Soft open chime.
- Scent DNA shareable summary card.
- App Store / TestFlight build (Capacitor wrapper, requires P5 LLM and P1 persistence first).
- Cloud sync for the wardrobe (replace `localStorage` with Supabase row once community ratings are live).
- LLM Q&A freeform ("what should I wear to a winter wedding?").
- Export / save a Perfumery Lab combo as an image.
- Catalogue growth beyond 18 scents.

---

## Architecture constraints

- Keep every file under 500 lines. `SillageApp.tsx` is currently 112 lines (the atelier commit split the screens into `Tonight`, `Shelf`, `Lab`, `Notes`, `ScentPage` and `You`).
- All scoring/ranking/chemistry must go through `src/domain/` pure functions. No business logic in React components.
- Never fabricate scent data. New scents must supply a `ScentProfile` from a verifiable source (fragrance community databases, lab sheets, the original Sillage source) or be added without a `profile` and left unscored.
