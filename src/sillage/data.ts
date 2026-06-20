// Sillage canonical collection — the real, hand-profiled wardrobe.
// Data is authored by Joa and never fabricated. Engines below are the typed,
// tested domain ports (calcChemistry / scoreScent / layerPartner) so the live
// app runs on the same brain as the rest of the codebase.
import type { Scent, Weight } from '../domain/types'
import { calcChemistry, type ChemistryResult } from '../domain/chemistry'
import { scoreScent, type Conditions } from '../domain/selector'

export interface Fragrance {
  id: number
  name: string
  house: string
  short: string
  notes: string[]
  family: string
  season: string[]
  mood: string
  color: string
  weight: Weight
  warmth: number
  freshness: number
  projection: number
  longevity: number
  sweet: number
  dark: number
  floral: number
  spicy: number
  green: number
  woody: number
  smoky: number
  musky: number
  resinous: number
  occasions: string[]
  weather: string[]
  energy: string[]
  time: string[]
  description: string
  pulsePoints: string
  effect: string
}

export const FRAGRANCES: Fragrance[] = [
  { id: 1, name: "Aesop Hwyl", house: "Aesop", short: "Hwyl", notes: ["Smoke", "Thyme", "Cypress", "Vetiver", "Frankincense"], family: "Woody Aromatic", season: ["Autumn", "Winter"], mood: "Meditative", color: "#4a5240",
    weight: "heavy", warmth: 7, freshness: 3, projection: 5, longevity: 8, sweet: 1, dark: 8, floral: 0, spicy: 3, green: 5, woody: 9, smoky: 9, musky: 2, resinous: 7,
    occasions: ["solo", "gallery", "reflection"],
    weather: ["cold", "overcast", "rainy", "fog"],
    energy: ["introspective", "calm"],
    time: ["afternoon", "evening"],
    description: "Smoke rising through wet cypress. A Japanese temple at dusk.",
    pulsePoints: "Inner wrists and behind ears, let the incense drift naturally.",
    effect: "Quiet authority. People lean in without knowing why." },
  { id: 2, name: "Aesop Aurner", house: "Aesop", short: "Aurner", notes: ["Chamomile", "Cardamom", "Magnolia Leaf", "Geranium", "Cedar"], family: "Aromatic Floral", season: ["Spring", "Autumn"], mood: "Calm", color: "#8b7d6b",
    weight: "medium", warmth: 5, freshness: 6, projection: 4, longevity: 6, sweet: 3, dark: 3, floral: 5, spicy: 4, green: 4, woody: 6, smoky: 0, musky: 2, resinous: 1,
    occasions: ["work", "brunch", "meeting"],
    weather: ["mild", "overcast", "cool"],
    energy: ["calm", "focused", "balanced"],
    time: ["morning", "afternoon"],
    description: "Herbal tea in a sunlit studio. Linen and warm wood.",
    pulsePoints: "Wrists and chest, a gentle radius of calm.",
    effect: "Approachable intelligence. Quietly impressive." },
  { id: 3, name: "Byredo Mojave Ghost", house: "Byredo", short: "Mojave Ghost", notes: ["Ambrette", "Nesberry", "Magnolia", "Sandalwood", "Musk"], family: "Woody Musk", season: ["Spring", "Summer"], mood: "Ethereal", color: "#d4c5a9",
    weight: "light", warmth: 4, freshness: 7, projection: 4, longevity: 5, sweet: 4, dark: 1, floral: 4, spicy: 0, green: 2, woody: 5, smoky: 0, musky: 8, resinous: 1,
    occasions: ["date", "brunch", "travel", "beach"],
    weather: ["warm", "hot", "mild", "sunny"],
    energy: ["relaxed", "romantic"],
    time: ["morning", "afternoon"],
    description: "Desert light through white curtains. Clean skin after the ocean.",
    pulsePoints: "Neck, inner elbows, and hair, this one floats.",
    effect: "Magnetic softness. The scent people ask about." },
  { id: 4, name: "Dior Gris Dior", house: "Dior", short: "Gris Dior", notes: ["Rose", "Citrus", "Violet", "Oak Moss", "Amber"], family: "Chypre", season: ["Spring", "Autumn"], mood: "Refined", color: "#9e8b7e",
    weight: "medium", warmth: 5, freshness: 6, projection: 6, longevity: 7, sweet: 2, dark: 3, floral: 6, spicy: 2, green: 3, woody: 4, smoky: 0, musky: 3, resinous: 2,
    occasions: ["work", "meeting", "dinner", "event"],
    weather: ["mild", "cool", "overcast"],
    energy: ["confident", "balanced", "sharp"],
    time: ["morning", "afternoon", "evening"],
    description: "A tailored grey suit. Rose petals on marble.",
    pulsePoints: "Wrists and behind ears, classic deployment for a classic scent.",
    effect: "Polished authority. Parisian restraint." },
  { id: 5, name: "Dior Ambre Nuit", house: "Dior", short: "Ambre Nuit", notes: ["Turkish Rose", "Smoke", "Woods", "Amber", "Spice"], family: "Oriental", season: ["Autumn", "Winter"], mood: "Seductive", color: "#6b3a3a",
    weight: "heavy", warmth: 9, freshness: 1, projection: 7, longevity: 9, sweet: 4, dark: 8, floral: 3, spicy: 7, green: 0, woody: 6, smoky: 6, musky: 2, resinous: 5,
    occasions: ["date", "dinner", "event"],
    weather: ["cold", "cool"],
    energy: ["confident", "bold", "romantic"],
    time: ["evening", "night"],
    description: "A dark rose crushed in amber resin. Candlelit and close.",
    pulsePoints: "Neck, chest, and inner wrists, let body heat amplify.",
    effect: "Irresistible gravity. The closer they get, the more they want." },
  { id: 6, name: "Franck Olivier Night Touch", house: "Franck Olivier", short: "Night Touch", notes: ["Aldehydes", "Pineapple", "Bergamot", "Violet", "Jasmine", "Vetiver", "Musk"], family: "Fresh Aromatic", season: ["Summer", "Spring"], mood: "Electric", color: "#3a4a6b",
    weight: "light", warmth: 3, freshness: 8, projection: 6, longevity: 5, sweet: 5, dark: 1, floral: 3, spicy: 1, green: 3, woody: 3, smoky: 0, musky: 6, resinous: 0,
    occasions: ["night out", "party", "date", "social"],
    weather: ["warm", "hot", "humid"],
    energy: ["energetic", "bold", "social"],
    time: ["evening", "night"],
    description: "Neon reflections on wet pavement. Summer night velocity.",
    pulsePoints: "Neck and forearms, designed to cut through warm air.",
    effect: "Head-turning freshness. High-energy magnetism." },
  { id: 7, name: "Ibrahim Al Qurashi Spanish Tobacco", house: "Ibrahim Al Qurashi", short: "Spanish Tobacco", notes: ["Aquatic", "Saffron", "Cocoa", "Iris", "Tobacco", "Amber"], family: "Oriental Tobacco", season: ["Autumn", "Winter"], mood: "Opulent", color: "#5c3d2e",
    weight: "heavy", warmth: 9, freshness: 2, projection: 8, longevity: 10, sweet: 6, dark: 9, floral: 1, spicy: 6, green: 0, woody: 5, smoky: 4, musky: 2, resinous: 4,
    occasions: ["event", "dinner", "date"],
    weather: ["cold", "cool"],
    energy: ["bold", "confident", "commanding"],
    time: ["evening", "night"],
    description: "Leather armchair in a private library. Saffron smoke and old money.",
    pulsePoints: "Chest and behind ears only, this beast projects. Less is power.",
    effect: "Unforgettable presence. Rooms remember you." },
  { id: 8, name: "Le Labo Tabac 26", house: "Le Labo", short: "Tabac 26", notes: ["Bay Leaf", "Fig", "Hay", "Tobacco", "Cedar"], family: "Woody Tobacco", season: ["Autumn", "Winter"], mood: "Intellectual", color: "#6b5e4f",
    weight: "medium", warmth: 7, freshness: 3, projection: 5, longevity: 7, sweet: 2, dark: 6, floral: 0, spicy: 3, green: 4, woody: 8, smoky: 3, musky: 1, resinous: 2,
    occasions: ["reading", "gallery", "solo"],
    weather: ["cold", "overcast", "rainy"],
    energy: ["introspective", "calm"],
    time: ["afternoon"],
    description: "A dog-eared novel. Dried fig leaves and afternoon light.",
    pulsePoints: "Wrists and inner elbows, a personal aura, not a broadcast.",
    effect: "Quiet depth. The scent of someone with something to say." },
  { id: 9, name: "Malin+Goetz Cannabis", house: "Malin+Goetz", short: "Cannabis", notes: ["Bergamot", "Black Pepper", "Patchouli"], family: "Green Woody", season: ["Summer", "Autumn"], mood: "Nonchalant", color: "#4f6b4a",
    weight: "light", warmth: 4, freshness: 6, projection: 4, longevity: 5, sweet: 1, dark: 3, floral: 0, spicy: 4, green: 7, woody: 5, smoky: 1, musky: 2, resinous: 1,
    occasions: ["casual", "weekend", "social", "festival"],
    weather: ["warm", "mild", "humid"],
    energy: ["relaxed", "social", "nonchalant"],
    time: ["afternoon", "evening"],
    description: "Sunday in the park. Black pepper and easy confidence.",
    pulsePoints: "Wrists and back of neck, casual, effortless placement.",
    effect: "Cool without trying. The friend everyone gravitates toward." },
  { id: 10, name: "Reef Pesca", house: "Reef", short: "Pesca", notes: ["Peach", "Iris", "Yerba Mate"], family: "Fruity Green", season: ["Spring", "Summer"], mood: "Bright", color: "#c4956a",
    weight: "light", warmth: 3, freshness: 9, projection: 3, longevity: 4, sweet: 6, dark: 0, floral: 2, spicy: 0, green: 6, woody: 1, smoky: 0, musky: 1, resinous: 0,
    occasions: ["brunch", "casual", "beach", "daytime"],
    weather: ["hot", "warm", "sunny"],
    energy: ["light", "energetic", "relaxed"],
    time: ["morning", "afternoon"],
    description: "First bite of summer. Sun on bare arms. Uncomplicated joy.",
    pulsePoints: "Wrists, neck, and liberally, this one is gentle and close-range.",
    effect: "Disarming warmth. A smile you can smell." },
  { id: 11, name: "Tom Ford Noir Extreme", house: "Tom Ford", short: "Noir Extreme", notes: ["Cardamom", "Nutmeg", "Saffron", "Kulfi", "Rose", "Vanilla", "Amber"], family: "Oriental Spicy", season: ["Winter", "Autumn"], mood: "Commanding", color: "#2e2e2e",
    weight: "heavy", warmth: 10, freshness: 1, projection: 8, longevity: 9, sweet: 8, dark: 7, floral: 2, spicy: 9, green: 0, woody: 3, smoky: 1, musky: 2, resinous: 4,
    occasions: ["date", "dinner", "event", "night out"],
    weather: ["cold", "cool"],
    energy: ["bold", "confident", "commanding"],
    time: ["evening", "night"],
    description: "Cardamom kulfi at midnight. Velvet and gold.",
    pulsePoints: "Chest and one wrist, let body heat do the work. Two sprays maximum.",
    effect: "Devastating. The scent of someone who has already won." },
  { id: 12, name: "CAVE Sloane Tones", house: "CAVE", short: "Sloane Tones", notes: ["Osmanthus", "Tuberose", "Patchouli", "Agarwood", "Cedar", "Vanilla"], family: "Woody Floral", season: ["Autumn", "Winter"], mood: "Luxurious", color: "#6b5a7e",
    weight: "heavy", warmth: 8, freshness: 2, projection: 7, longevity: 8, sweet: 6, dark: 6, floral: 5, spicy: 3, green: 1, woody: 7, smoky: 2, musky: 3, resinous: 3,
    occasions: ["event", "dinner", "date"],
    weather: ["cool", "cold", "overcast"],
    energy: ["confident", "romantic", "bold"],
    time: ["evening", "night"],
    description: "Agarwood smoke through tuberose. Sloane Street after dark.",
    pulsePoints: "Behind ears and chest, let the oud and florals interplay at body temperature.",
    effect: "Understated opulence. London luxury without the logo." },
  { id: 13, name: "Oud-Based Blends", house: "Custom", short: "Oud Blends", notes: ["Oud", "Dark Woods", "Resins"], family: "Oud", season: ["Winter", "Autumn"], mood: "Sacred", color: "#3d2e2e",
    weight: "heavy", warmth: 10, freshness: 0, projection: 7, longevity: 10, sweet: 2, dark: 10, floral: 0, spicy: 5, green: 0, woody: 10, smoky: 5, musky: 2, resinous: 9,
    occasions: ["prayer", "reflection", "occasion"],
    weather: ["cold", "cool"],
    energy: ["introspective", "calm", "commanding"],
    time: ["evening", "night"],
    description: "Ancient wood burning slowly. Something older than language.",
    pulsePoints: "Behind ears and inner wrists, oud is intimate. Do not overspray.",
    effect: "Ancestral weight. The scent of someone grounded in something deeper." },
  { id: 14, name: "Gissah Hudson II", house: "Gissah", short: "Hudson II", notes: ["Rose", "Fruity Notes", "White Flowers", "Saffron", "Amber", "Musk", "Tonka Bean"], family: "Oriental Floral", season: ["Spring", "Autumn", "Winter"], mood: "Romantic", color: "#8a5e6a",
    weight: "medium", warmth: 7, freshness: 4, projection: 6, longevity: 7, sweet: 7, dark: 3, floral: 6, spicy: 3, green: 0, woody: 2, smoky: 0, musky: 6, resinous: 3,
    occasions: ["date", "dinner", "event", "social"],
    weather: ["mild", "cool", "cold"],
    energy: ["romantic", "confident"],
    time: ["afternoon", "evening", "night"],
    description: "Saffron-dusted rose and ripe fruit. A love letter sealed in amber.",
    pulsePoints: "Neck and inner wrists, let the saffron bloom at body heat. Two to three sprays.",
    effect: "Warm magnetism. The scent that draws people closer without them realising why." },
  { id: 15, name: "Diptyque Vetyverio", house: "Diptyque", short: "Vetyverio", notes: ["Grapefruit", "Mandarin", "Bergamot", "Geranium", "Rose", "Nutmeg", "Vetiver", "Musk", "Cedar"], family: "Woody Vetiver", season: ["Spring", "Summer"], mood: "Grounded", color: "#6a7a5e",
    weight: "light", warmth: 3, freshness: 8, projection: 4, longevity: 5, sweet: 1, dark: 2, floral: 3, spicy: 3, green: 8, woody: 7, smoky: 2, musky: 5, resinous: 0,
    occasions: ["work", "casual", "brunch", "meeting"],
    weather: ["mild", "warm", "sunny"],
    energy: ["calm", "balanced", "focused"],
    time: ["morning", "afternoon"],
    description: "Wet grass and grapefruit zest. A Parisian garden at ten in the morning.",
    pulsePoints: "Wrists, inner elbows, and behind ears, spray generously, this sits close to skin.",
    effect: "Effortless refinement. Clean, earthy intelligence that never tries too hard." },
]

// Adapter: project a flat Fragrance into the typed domain Scent the engines expect.
export function toScent(f: Fragrance): Scent {
  return {
    id: String(f.id),
    name: f.short,
    brand: f.house,
    // Engines key off profile/tags/notes only; the descriptive family + capitalised
    // seasons stay on the flat Fragrance for display and are not re-typed here.
    families: [],
    accords: [],
    ingredientKey: f.short.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    notes: f.notes.map(n => ({ name: n, layer: 'heart' as const })),
    mood: f.mood,
    aura: f.color,
    application: f.pulsePoints,
    effect: f.effect,
    profile: {
      warmth: f.warmth, freshness: f.freshness, sweet: f.sweet, dark: f.dark,
      floral: f.floral, spicy: f.spicy, green: f.green, woody: f.woody,
      smoky: f.smoky, musky: f.musky, resinous: f.resinous,
      projection: f.projection, longevity: f.longevity, weight: f.weight,
    },
    tags: {
      occasions: f.occasions, weather: f.weather, energy: f.energy, time: f.time,
    },
  }
}

const byId = new Map(FRAGRANCES.map(f => [f.id, f]))

// ── Engine bridges (typed domain ports power the live app) ──
export function scoreOne(f: Fragrance, conditions: Conditions): number {
  return scoreScent(toScent(f), conditions)
}

export function chemistryOf(ids: number[]): ChemistryResult | null {
  const scents = ids.map(id => byId.get(id)).filter((f): f is Fragrance => Boolean(f)).map(toScent)
  return calcChemistry(scents)
}

export type LayerPick = Fragrance & { chemistry: number }

export function getLayerPartner(primary: Fragrance, resultIds: number[]): LayerPick | null {
  const candidates = FRAGRANCES.filter(f => !resultIds.includes(f.id))
  const ps = toScent(primary)
  const scored = candidates
    .map(f => {
      const chem = calcChemistry([ps, toScent(f)])
      return { ...f, chemistry: chem ? chem.total : 0 }
    })
    .filter(c => c.chemistry >= 45)
    .sort((a, b) => b.chemistry - a.chemistry)
  return scored.length ? scored[0] : null
}
