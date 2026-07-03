# Sillage - Roadmap

Current live state as of 2026-06-25, commit 67915bf.

---

## What is live now

7-tab phone app (Splash + Home, Wheel, Shelf, Perfumery, Daily, Nose, Settings) on `sillagefragrance.netlify.app`. Vite + React + TypeScript SPA. 18 hand-profiled scents. 45 tests green.

All scored/ranked/chemistry output derives from real typed engines (`chemistry.ts`, `selector.ts`) operating on real numeric profiles. No invented scent data anywhere in the codebase.

---

## Known gaps from the 25 Jun rebuild

These are confirmed unresolved corners from the commit message and source inspection.

| # | Gap | Impact | Source |
|---|-----|--------|--------|
| 1 | Logo mark not built | Brand spec (ghost flacon + spritz + S-molecule + monogram) exists in `docs/superpowers/specs/`. Only the plain gold SILLAGE wordmark appears in Splash. | Spec `2026-06-14-sillage-design.md` line 112 |
| 2 | Aura cards are CSS gradients, not photography | Cards use `radial-gradient` from each scent's `color` hex. Spec calls for cards "skinned in the key ingredient" (Santal 33 wears sandalwood, Noir wears smoke). Accurate and honest for now; photography is a future bar. | Commit 67915bf message |
| 3 | No wardrobe persistence across sessions | `src/domain/wardrobe.ts` has a full `localStorage` repo. The `src/sillage/SillageApp.tsx` layer uses `useState` arrays and does not call `wardrobe.ts`. Rating a scent or adding it to the shelf is lost on refresh. | Code inspection |
| 4 | Ownership model absent | Spec defines owned / wishlist / finished bottles. Currently every scent is just "on the shelf" with no ownership status. | Spec surface 4 |
| 5 | Wheel is family-orbit, not the full physics notes explorer | The spec describes notes floating in a physics field, sized by frequency, with educational tap-to-learn content. The live Wheel shows 9 family rings orbiting a hub. The family-orbit view is the spec's "second view" fallback; the primary notes-field is not built. | Spec surface 3 |

---

## Next priorities (in order)

### P1 - Wire wardrobe persistence

Connect `SillageApp.tsx` shelf state to `src/domain/wardrobe.ts` so ratings and owned scents survive a refresh. This is infrastructure, not a visible feature; it unblocks everything that depends on "your shelf" being real (Daily quality, Nose accuracy, Perfumery suggestions).

Estimated scope: replace the 3 `useState` arrays in `SillageApp.tsx` with `wardrobe.ts` subscribers + mutations. No new files needed.

### P2 - Ownership statuses

Add `own | wish | finished` to `WardrobeEntry` (already has `owned?: boolean`). Surface as a 3-state chip on each shelf card and in the wardrobe filter. The Nose tab gains a Finished section.

### P3 - Logo mark

Render the brand mark spec from `docs/superpowers/specs/2026-06-14-sillage-design.md` as an inline SVG:
- Ghost flacon outline (two rectangles, rounded cap, narrow neck)
- Spritz burst (4-6 radial lines from the nozzle tip)
- S-molecule connectors (2 circles + a bridge)
- Monogram `S` inside the flacon body
- No fills, stroke only, works on dark and light ground

Use in Splash alongside the wordmark and as the PWA icon.

### P4 - Notes explorer (full physics field)

Build the primary Wheel view: individual notes floating in a `requestAnimationFrame` physics field, sized by frequency across the owned shelf, coloured by family. Tap a note for: name, humanised smell description, one fact worth knowing, which of your scents carry it.

The current family-orbit wheel becomes the secondary view, toggled by a chip.

### P5 - LLM niche search

On Shelf search, if the typed query matches nothing in the 18-scent catalogue, fire a Claude API call (user-supplied key in Settings) to fetch the scent's notes, accords, and a humanised blurb. Add it to the local catalogue for that session. Show a skeleton shimmer while fetching.

Required before App Store submission.

### P6 - Gyro-reactive holographic tilt

On mobile, use `DeviceMotionEvent` to shift the foil gradient and mesh glow on each aura card. On web, fall back to pointer position. Graceful degradation: if permission denied or event unavailable, card stays static.

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

- Keep every file under 500 lines. `SillageApp.tsx` is currently 390 lines; the next feature that touches it should split out the Home section first.
- All scoring/ranking/chemistry must go through `src/domain/` pure functions. No business logic in React components.
- Never fabricate scent data. New scents must supply a `ScentProfile` from a verifiable source (fragrance community databases, lab sheets, the original Sillage source) or be added without a `profile` and left unscored.
