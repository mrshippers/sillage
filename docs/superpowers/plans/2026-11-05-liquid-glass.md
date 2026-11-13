# Liquid glass on the tab bar (5 Nov 2026)

The brief this was built against, with the measured column filled in. Rerun it with
`npm run dev` and `node scripts/verify-glass.mjs` (Playwright is not a dependency here;
`PLAYWRIGHT_MODULE=/path/to/playwright` points the script at one).

## What step 0 found

- Sillage is dark only: one palette, set on `.app` from `tokens.ts`. There is no light theme to switch.
- One surface has anything moving under it: the tab bar, with the strips passing beneath. Everything else
  sits on the flat plum ground, where glass only goes grey.
- The 29 Sep changelog retired "blurred colour blobs, smoke, iridescent sheen". That stands. This is clear
  glass with no sheen and no glow: the only thing it adds is what is already passing under it.

## Prime directive

If a line of the glass spec fights the product being readable or being itself, break the line and say which.

Broken, and why:

1. **`blur(2px)`.** 6px. At 2px the words on the page can be read under the tab labels ("Calm & Centred"
   sat under "Tonight" like a second label), and two reviewers who had not seen the build both called it
   out. At 6px they are shapes and colour; at 10px there is nothing left to see through to. One token,
   `--glass-blur`.
2. **Light material and the light tint setting.** No light theme exists. The dark material ships; the
   setting keeps a `glass.tint.light` key for the day one does.
3. **Dense tint of 38% at brightness 0.8.** Fails contrast over paper (1.8:1 on a 64% label). Density now
   drives the brightness dim as well: thin is tint 0.16 at 0.8, dense is tint 0.25 at 0.28. The sweep set it.
4. **Tint `rgb(20 20 24)`.** Replaced with `ground-raised`, so the bar is a smoked flacon and not a grey pane.
5. **The 5 by 3 sample grid.** Kept at fifteen points, but twelve of them are pulled to the labels, a
   quarter in from each end of each word. A strip's edge between two grid points was passing under a label unseen.
6. **Density formula.** Kept, with a floor added for a theme whose ink cannot flip: fully dense once the
   brightest sample passes 0.6.
7. **"Remember the last ink."** Not stored. In a dark theme the ink is always light, so there is nothing to remember.
8. **Hover brightens the tint.** Not built: no glass surface here is hoverable as a whole.

## Hard constraints

- stack: Vite 8, React 19, plain CSS. Colour tokens in `tokens.ts` through `cssVars()`, numbers in `atelier.css`.
- banned: new dependencies, new elements for a surface, any change to layout, spacing, radii, fonts or copy,
  glass over the flat ground, colour literals outside the token block, lens on Firefox and Safari, sheen.
- units: CSS px, ms, alpha 0 to 1, WCAG contrast ratio.

## Budget

| metric | target | measured |
|---|---|---|
| text contrast on glass, worst label, 34 scroll stops | >= 4.5:1 | 5.24:1 ("Tonight", shelf at 60px) |
| contrast with paper `#ece6da` slid under the whole bar | >= 4.5:1 | 5.10:1 at density 1.00 |
| see-through left at the dense end | >= 20% of backdrop range | 20.3% |
| layout fingerprint, 12 screens, 1,662 nodes, against main | 0 changed, 0 removed | 0 changed, 0 removed |
| elements added for the surface | 0 | 0 |
| lens, rim band over stripes, on against off | >= 8/255 | 18.8/255 |
| lens, centre of the bar, on against off | <= 0.5/255 | **0.88/255, over** |
| lens map tiles redrawn across four width changes | 0 | 0 |
| backdrop sampler, p95 per pass | <= 1.5 ms | 1.2 ms (p50 0.8) |
| glass JS, minified and gzipped | <= 4 kB | **5.14 kB, over** |
| reduced transparency, forced colours | no backdrop filter, alpha 1.0 | both solid |
| tests, types, lint, build | 0 new failures | 86 pass; `Mark.test.ts` fails on main too |

Two lines over:

- **Lens centre.** "128 is none" is 0.2% short of none, so the middle of the bar sits about a tenth of a
  pixel off. Over hard black and paper stripes that is most of a level. Not visible; not zero.
- **Size.** The module grew by about a kilobyte after the budget was written, for the label-aimed sampling
  and for reading what a hit test cannot see. Both exist because the contrast line failed without them.

`Mark.test.ts` ("matches the committed favicon") fails on main before this branch. Untouched here.

## Systems

1. Tokens. `--glass-*` in `atelier.css`, registered with `@property`; the two colours come from `tokens.ts`.
2. The surface rule. `.glass`: tint, backdrop filter, edge, ink. `.tabs` wears it; its 1px top border stays, transparent.
3. Rim lens and colour split. `glass.ts` draws a displacement map per shape, bends the backdrop three times
   (red 15% further, blue 15% less), Chromium only.
4. Backdrop sampler. `glass.ts` reads fifteen points under the bar, a few per frame, and writes density and
   saturation kept as custom properties.
5. Tint setting. You tab, 0 to 1.5, kept on the device.
6. Accessibility. Solid under reduced transparency and forced colours. Focus rings untouched.
7. Design gate. At the worst scroll stop on the shelf, every label reads and you can still tell a strip
   is passing under the bar. Three reviewers, one after each round and given screenshots and nothing else,
   agreed on both counts and marked the material low all the same (55 on the final build, where 70 is
   "competent and forgettable"; 68 for legibility): when cream paper slides under, the bar has to go dark
   to hold a 64% label at 4.5:1, so the paper reads as a dim smear and its light does not carry. That is
   the trade.
   Drawing all five labels at full ink would let the dense end sit at roughly twice the brightness; it
   would also flatten the active tab to its gold marker alone, which is a design call and was not taken.

## Files

- `src/sillage/glass.ts` (new), `src/sillage/glass.test.ts` (new, 20 tests)
- `src/sillage/atelier.css`, `src/sillage/tokens.ts`
- `src/sillage/SillageApp.tsx` (mount, and `glass` on the tab bar), `src/sillage/You.tsx` (the setting)
- `scripts/verify-glass.mjs` (new)

## Not done, on purpose

- Glass on the strips, chips, fields or ledgers. They sit on flat plum. For those to work as glass the
  ground needs a scene behind it, which is a new background and a decision for another day.
- `src/ui/GlassCard.tsx` is unmounted legacy from phase 1 and was left alone.
