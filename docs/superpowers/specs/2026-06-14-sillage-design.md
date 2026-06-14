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

3. Scent Wheel. Seven fragrance families orbiting a hub, built with anime.js. Gems skinned in their ingredient, pulsing and tilting. Tap a family and the wheel swings it up, the hub counts your bottles, your wardrobe filters below, and empty families read as gaps to explore.

4. Wardrobe. Your full collection. Owned, wishlist, finished bottles. Sort and filter by family, season, rating, or note. Add and remove scents.

5. Daily. One pick a day. Chosen from weather, season, time of day, and what you have neglected. Always with a short human reason, never a bare suggestion.

6. Discover. Search the catalogue, add any scent to your wardrobe, hunt niche by note or family. This is where the wardrobe grows.

7. Combos and Share. Build layering combos. Export a scent or a combo as an image. Share your shelf. The first social gesture.

8. Scent Profile. Your nose, mapped. Dominant families, recurring notes, how your taste moves over time. Your scent DNA.

## Ratings (refined, not five blunt stars)

A 0 to 10 Sillage Score per scent. Show your score against the community ("the hive") on the same meter so the gap is visible. Optionally break a rating into a few axes later (longevity, projection, how much you reach for it) but V1 keeps the single 0 to 10 plus your private notes. Half points allowed.

## Daily recommendation logic

Inputs: today's weather (temp, clear or wet), the season, the time of day, and recency (how long since you last wore each owned scent). Score owned scents against the day, pick the best fit you have not reached for recently, and always render a one-line human reason. Example: "Cold and clear out, and you haven't worn it in nine days. It earns a dark evening."

## Pairing recommendations (personal, real time)

Pairings are computed from your own wardrobe, not a generic list. Match on shared base notes and family overlap, rank by closeness, and write the reason in plain language. Example: "Your Santal 33, same leather and wood base. One spray of each and the sandalwood turns smoky." If a family has nothing in it, say so and point to discovery.

## Copy voice

All scent depth and pairing copy runs through the humanizer. It should read like someone who actually knows fragrance: specific, opinionated, varied rhythm, no AI tells, no em dashes, no "vibrant tapestry". Short and characterful over comprehensive.

## The system underneath (my calls, overrule any)

### Fragrance data
Own a curated catalogue. Seed it from an open fragrance dataset plus the wardrobe we already have, store brand, name, year, families, accords with rough strengths, and the top/heart/base notes. Generate humanised descriptions and review them. Grow the catalogue as scents get added through Discover.

Why not Fragrantica: it has no public API and actively blocks scraping, so building on it is fragile and against their terms. Owning the data is legal, fast, and ours to shape (we control the humanised copy and the accord strengths the visualiser needs).

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
