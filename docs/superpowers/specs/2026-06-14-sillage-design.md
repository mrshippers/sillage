# Sillage — design spec

Date: 2026-06-14
Status: draft for review
Project: Sillage, a fragrance wardrobe app
Live today: sillagefragrance.netlify.app (Vite/React SPA, no source recoverable, no persistence)

## What it is

Letterboxd for fragrances. A place to keep your wardrobe, rate what you wear, learn what you're smelling, and let the niche reign. Smell nerds unite. Light where it should be light, dense and tactile where it earns it.

The current live app is a hushed dark grid of fragrance cards with no source code, no source map, and no persistence (nothing you do is saved). We rebuild it as an owned codebase, keep the editorial soul, and grow it into the product below.

## The feel (locked in the visual brainstorm)

Direction is B+C: the data craft of an "olfactory lab" fused with the living colour of "synaesthesia", sealed under a subtle iridescent glass sheen that drifts as you move. A mild optical illusion that echoes how a scent re-reads itself each time you return to it.

- Ground: near-black, navy-to-plum depth.
- Surface: frosted glass with real depth, holographic foil, specular glare, ivory type (one uniform off-white, not tinted per card).
- Motion: a volumetric smoke field rising like sillage in the air (canvas now, WebGL in production). Scents drift gently like a music visualiser. Cards tilt to the cursor like holographic trading cards.
- Cards are skinned in the key ingredient (Noir wears smoke, Santal 33 wears sandalwood, Gypsy Water wears pine), darkened so type stays crisp.
- Notes read as a bullet list by layer (top, heart, base) with a volatility column beside it: airy and translucent at the top, dense and grounded at the base.

Confirmed strength choices: subtle shimmer (premium reads as restraint), Scent Smoke background.

## The eight surfaces

1. Home. A momentum start page. Calm centre with the scent of the day and a human one-line reason. Scents drift around the screen. A PlayStation-style horizontal card scroll along the bottom where the centre card grows. Hover or tap any scent for depth and pairings.

2. Scent. The signature surface. Holographic card, dominant accords as luminous bars, the top/heart/base note pyramid, a scent fingerprint visualiser tinted to the scent's aura, a refined 0 to 10 Sillage Score (your nose against the hive), and humanised depth copy.

3. Notes Explorer (the wheel, reborn). Not a rigid filter. Notes float free in a gentle physics field, drifting and nudging each other, sized by how often they appear in your shelf. Tap a note to actually learn it: what it is, how it smells (humanised), a fact worth knowing, and which of your scents wear it. This is the original "explore notes, fun facts, photoreal ingredient" idea. Cluster by family with a chip ring, or open the classic orbiting family wheel as a second view for filtering. The point is education and play, not just sorting.

4. Wardrobe. Your full collection. Owned, wishlist, finished bottles. Sort and filter by family, season, rating, or note. Add and remove scents.

5. Daily. One pick a day. Chosen from weather, season, time of day, and what you have neglected. Always with a short human reason, never a bare suggestion.

6. Discover. Search the catalogue, add any scent to your wardrobe, hunt niche by note or family. This is where the wardrobe grows.

7. Perfumery Lab (combo builder). Restoring the page from the original Sillage, with its real name and its Chemistry Score. Layer up to four scents, watch their auras and fingerprints merge into one blended profile, get a Chemistry Score and a short LLM verdict on whether they work. The lab also suggests the best combinations from your shelf, ranked, so it proposes pairings you have not tried, not just scores the ones you pick. Save or export a combo as an image.

8. Scent Profile. Your nose, mapped, with real substance. Dominant families as a chart, your signature notes, taste over time (how your ratings and wears drift across seasons), most-worn and best-rated, your gaps, and a shareable "scent DNA" summary. Not a padded stats page, a portrait of your taste.

### Navigation and settings

A persistent glass nav bar (bottom tab bar on mobile, side rail on wide screens): Home, Wheel, Shelf, Perfumery, Daily, Profile, Settings. PS3/PS4 in feel: the active icon lifts, a glowing blob springs across with overshoot, tapping fires a ripple. Not a static bar.

Page transitions are a first-class feature, not an afterthought. Moving between surfaces is a real transition (the outgoing page recedes with blur and depth, the incoming rises through the smoke), tuned to feel like console UI, fluid and a little physical. Shared elements where it makes sense (a scent card morphing into the scent page).

Settings: theme and shimmer strength, background character (smoke, aurora, metal), units, daily-pick reminder, manage catalogue and data, LLM provider and key (Claude or Perplexity), export or wipe your wardrobe.

### Dynamic layouts

The holographic card is a hero treatment, not a default. It does not appear on every page. Each surface gets a layout that fits it: Home is a drifting momentum page, Wheel is radial, Wardrobe is a dense sortable grid, Combo is a blend canvas, Discover is search-first, Profile is data and charts. Shared design language, different shapes.

## Ratings (refined, not five blunt stars)

A 0 to 10 Sillage Score per scent. Show your score against the community ("the hive") on the same meter so the gap is visible. Optionally break a rating into a few axes later (longevity, projection, how much you reach for it) but V1 keeps the single 0 to 10 plus your private notes. Half points allowed.

## Daily recommendation logic

Inputs: today's weather (temp, clear or wet), the season, the time of day, and recency (how long since you last wore each owned scent). Score owned scents against the day, pick the best fit you have not reached for recently, and always render a one-line human reason. Example: "Cold and clear out, and you haven't worn it in nine days. It earns a dark evening."

## Pairing recommendations (personal, real time)

Pairings are computed from your own wardrobe, not a generic list. Match on shared base notes and family overlap, rank by closeness, and write the reason in plain language. Example: "Your Santal 33, same leather and wood base. One spray of each and the sandalwood turns smoky." If a family has nothing in it, say so and point to discovery.

## Copy voice

All scent depth and pairing copy runs through the humanizer. It should read like someone who actually knows fragrance: specific, opinionated, varied rhythm, no AI tells, no em dashes, no "vibrant tapestry". Short and characterful over comprehensive.

## The system underneath (my calls, overrule any)

### Fragrance data and search
Own a curated catalogue, but make it feel bottomless. Seed it from a large open fragrance dataset (tens of thousands of perfumes with notes and accords) plus the wardrobe we already have. Store brand, name, year, families, accords with rough strengths, and the top/heart/base notes.

Search hits the local catalogue first and returns instantly. When you search a niche scent that is not in the seed (the whole point, the niche must reign), a live LLM lookup fetches its notes, accords, and a humanised blurb, shows it, and adds it to the catalogue so it is there next time. The catalogue grows with use.

Filter and sort everywhere it helps: by family, by brand, by season, by note, by owned or wishlist. Sort by score, recency, or name. Brand filtering matters for a niche collector, so it is a first-class filter, not buried.

Why not Fragrantica: it has no public API and actively blocks scraping. Owning the seed plus filling gaps with an LLM is legal, robust, and ours to shape (we control the humanised copy and the accord strengths the visualiser needs).

### Question answering (Claude / Perplexity)
The depth copy and the "ask anything about a scent" feature are LLM-backed, not just static. Claude is the default for conversational depth, pairing reasoning, and the combo verdict (humanizer baked into the prompt so it never reads like AI). Perplexity is the option for fresh factual lookups on obscure releases where web recency matters. The provider and key are set in Settings. Calls are cached per scent so we are not paying for the same answer twice.

### App Store path
Keep the React/Vite codebase and wrap it with Capacitor to produce a real iOS binary. No rebuild, everything we designed ships as-is. TestFlight first, then App Store. (Expo/React Native would mean a full rewrite for little gain here.)

### Storage
Local-first. The wardrobe lives on device and works offline. Add cloud sync (Supabase) only when the social layer needs accounts. No sign-up to start.

### Design system
One reusable kit: the smoke field, holographic glass card, iridescent sheen, ivory type, and the family palette. anime.js for component motion, a WebGL shader for the field in production. Built once, used across every surface.

## Architecture

- Shell: React + Vite, TypeScript, file-based feature modules (home, scent, wheel, wardrobe, daily, discover, combos, profile). Each module owns its components and talks to shared data through typed interfaces.
- Data layer: a typed Scent model and a catalogue service (search, get, add). Local store for the user's wardrobe, ratings, and notes. The catalogue ships as seed data and can be extended.
- Design system package: tokens (palette, type, motion timings) plus the shared primitives (SmokeField, GlassCard, ScentCard, HoloFoil, RatingMeter, NotePyramid, FingerprintBars, ScentWheel).
- Native wrap: Capacitor project that loads the built web app, plus the bits that want native (haptics on tilt, device motion driving the foil, share sheet for combo images).
- Keep files small and focused. The current app crammed everything into one bundle, we do not repeat that.

## Build order

1. Foundation. Repo, design system, the Scent data model, wardrobe and scent detail running on real data with local persistence.
2. Explore. The scent wheel, discover and search, the catalogue seeded and searchable.
3. Intelligence. Daily pick, humanised depth, live pairings from the wardrobe.
4. Social. Combos and share-as-image first, then accounts and the Letterboxd layer (follows, shared shelves, the hive score).
5. Ship. Capacitor wrap, polish pass, TestFlight, App Store submission.

## Open items

- Confirm exact brand and name for four scents Joa added so their notes are real, not invented: "Aramic Heart", "Aramic Heaven", "Reef Summer Peach", "Ghissah Hudson".
- More scents to be added to the wardrobe (drip-fed).
- Pick the open dataset to seed the catalogue (evaluate coverage and licence in phase 2).
- Decide how far the social layer goes in V1 versus a later release.

## Out of scope for now (YAGNI)

- Buying or price tracking.
- A full social network at launch (phase it).
- Android (Capacitor makes it cheap later, but iOS first).
- AI scent generation or "what should I buy" beyond pairings from what you own.
