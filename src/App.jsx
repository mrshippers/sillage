import { useState, useEffect, useMemo } from "react";

const FRAGRANCES = [
  { id: 1, name: "Aesop Hwyl", house: "Aesop", short: "Hwyl", notes: ["Smoke", "Thyme", "Cypress", "Vetiver", "Frankincense"], family: "Woody Aromatic", season: ["Autumn", "Winter"], mood: "Meditative", color: "#4a5240",
    weight: "heavy", warmth: 7, freshness: 3, projection: 5, longevity: 8, sweet: 1, dark: 8, floral: 0, spicy: 3, green: 5, woody: 9, smoky: 9, musky: 2, resinous: 7,
    occasions: ["solo", "gallery", "evening walk", "reading", "reflection"],
    weather: ["cold", "overcast", "rainy", "fog"],
    energy: ["low", "calm", "introspective"],
    time: ["afternoon", "evening"],
    description: "Smoke rising through wet cypress. A Japanese temple at dusk.",
    pulsePoints: "Inner wrists and behind ears — let the incense drift naturally.",
    effect: "Quiet authority. People lean in without knowing why." },
  { id: 2, name: "Aesop Aurner", house: "Aesop", short: "Aurner", notes: ["Chamomile", "Cardamom", "Magnolia Leaf", "Geranium", "Cedar"], family: "Aromatic Floral", season: ["Spring", "Autumn"], mood: "Calm", color: "#8b7d6b",
    weight: "medium", warmth: 5, freshness: 6, projection: 4, longevity: 6, sweet: 3, dark: 3, floral: 5, spicy: 4, green: 4, woody: 6, smoky: 0, musky: 2, resinous: 1,
    occasions: ["work", "brunch", "casual", "meeting", "gallery"],
    weather: ["mild", "overcast", "cool"],
    energy: ["calm", "focused", "balanced"],
    time: ["morning", "afternoon"],
    description: "Herbal tea in a sunlit studio. Linen and warm wood.",
    pulsePoints: "Wrists and chest — a gentle radius of calm.",
    effect: "Approachable intelligence. Quietly impressive." },
  { id: 3, name: "Byredo Mojave Ghost", house: "Byredo", short: "Mojave Ghost", notes: ["Ambrette", "Nesberry", "Magnolia", "Sandalwood", "Musk"], family: "Woody Musk", season: ["Spring", "Summer"], mood: "Ethereal", color: "#d4c5a9",
    weight: "light", warmth: 4, freshness: 7, projection: 4, longevity: 5, sweet: 4, dark: 1, floral: 4, spicy: 0, green: 2, woody: 5, smoky: 0, musky: 8, resinous: 1,
    occasions: ["date", "brunch", "travel", "casual", "beach"],
    weather: ["warm", "hot", "mild", "sunny"],
    energy: ["relaxed", "light", "romantic"],
    time: ["morning", "afternoon", "all day"],
    description: "Desert light through white curtains. Clean skin after the ocean.",
    pulsePoints: "Neck, inner elbows, and hair — this one floats.",
    effect: "Magnetic softness. The scent people ask about." },
  { id: 4, name: "Dior Gris Dior", house: "Dior", short: "Gris Dior", notes: ["Rose", "Citrus", "Violet", "Oak Moss", "Amber"], family: "Chypre", season: ["Spring", "Autumn"], mood: "Refined", color: "#9e8b7e",
    weight: "medium", warmth: 5, freshness: 6, projection: 6, longevity: 7, sweet: 2, dark: 3, floral: 6, spicy: 2, green: 3, woody: 4, smoky: 0, musky: 3, resinous: 2,
    occasions: ["work", "meeting", "dinner", "event", "smart casual"],
    weather: ["mild", "cool", "overcast"],
    energy: ["confident", "balanced", "sharp"],
    time: ["morning", "afternoon", "evening"],
    description: "A tailored grey suit. Rose petals on marble.",
    pulsePoints: "Wrists and behind ears — classic deployment for a classic scent.",
    effect: "Polished authority. Parisian restraint." },
  { id: 5, name: "Dior Ambre Nuit", house: "Dior", short: "Ambre Nuit", notes: ["Turkish Rose", "Smoke", "Woods", "Amber", "Spice"], family: "Oriental", season: ["Autumn", "Winter"], mood: "Seductive", color: "#6b3a3a",
    weight: "heavy", warmth: 9, freshness: 1, projection: 7, longevity: 9, sweet: 4, dark: 8, floral: 3, spicy: 7, green: 0, woody: 6, smoky: 6, musky: 2, resinous: 5,
    occasions: ["date", "dinner", "evening out", "event", "occasion"],
    weather: ["cold", "cool", "overcast"],
    energy: ["confident", "bold", "romantic"],
    time: ["evening", "night"],
    description: "A dark rose crushed in amber resin. Candlelit and close.",
    pulsePoints: "Neck, chest, and inner wrists — let body heat amplify.",
    effect: "Irresistible gravity. The closer they get, the more they want." },
  { id: 6, name: "Franck Olivier Night Touch", house: "Franck Olivier", short: "Night Touch", notes: ["Aldehydes", "Pineapple", "Bergamot", "Violet", "Jasmine", "Vetiver", "Musk"], family: "Fresh Aromatic", season: ["Summer", "Spring"], mood: "Electric", color: "#3a4a6b",
    weight: "light", warmth: 3, freshness: 8, projection: 6, longevity: 5, sweet: 5, dark: 1, floral: 3, spicy: 1, green: 3, woody: 3, smoky: 0, musky: 6, resinous: 0,
    occasions: ["night out", "party", "club", "date", "social"],
    weather: ["warm", "hot", "humid", "mild"],
    energy: ["energetic", "bold", "social"],
    time: ["evening", "night"],
    description: "Neon reflections on wet pavement. Summer night velocity.",
    pulsePoints: "Neck and forearms — designed to cut through warm air.",
    effect: "Head-turning freshness. High-energy magnetism." },
  { id: 7, name: "Ibrahim Al Qurashi Spanish Tobacco", house: "Ibrahim Al Qurashi", short: "Spanish Tobacco", notes: ["Aquatic", "Saffron", "Cocoa", "Iris", "Tobacco", "Amber"], family: "Oriental Tobacco", season: ["Autumn", "Winter"], mood: "Opulent", color: "#5c3d2e",
    weight: "heavy", warmth: 9, freshness: 2, projection: 8, longevity: 10, sweet: 6, dark: 9, floral: 1, spicy: 6, green: 0, woody: 5, smoky: 4, musky: 2, resinous: 4,
    occasions: ["evening out", "event", "occasion", "dinner", "date"],
    weather: ["cold", "cool", "overcast"],
    energy: ["bold", "confident", "commanding"],
    time: ["evening", "night"],
    description: "Leather armchair in a private library. Saffron smoke and old money.",
    pulsePoints: "Chest and behind ears only — this beast projects. Less is power.",
    effect: "Unforgettable presence. Rooms remember you." },
  { id: 8, name: "Le Labo Tabac 26", house: "Le Labo", short: "Tabac 26", notes: ["Bay Leaf", "Fig", "Hay", "Tobacco", "Cedar"], family: "Woody Tobacco", season: ["Autumn", "Winter"], mood: "Intellectual", color: "#6b5e4f",
    weight: "medium", warmth: 7, freshness: 3, projection: 5, longevity: 7, sweet: 2, dark: 6, floral: 0, spicy: 3, green: 4, woody: 8, smoky: 3, musky: 1, resinous: 2,
    occasions: ["reading", "gallery", "solo"],
    weather: ["cold", "overcast", "rainy"],
    energy: ["introspective", "calm"],
    time: ["afternoon", "evening"],
    description: "A dog-eared novel. Dried fig leaves and afternoon light.",
    pulsePoints: "Wrists and inner elbows — a personal aura, not a broadcast.",
    effect: "Quiet depth. The scent of someone with something to say." },
  { id: 9, name: "Malin+Goetz Cannabis", house: "Malin+Goetz", short: "Cannabis", notes: ["Bergamot", "Black Pepper", "Patchouli"], family: "Green Woody", season: ["Summer", "Autumn"], mood: "Nonchalant", color: "#4f6b4a",
    weight: "light", warmth: 4, freshness: 6, projection: 4, longevity: 5, sweet: 1, dark: 3, floral: 0, spicy: 4, green: 7, woody: 5, smoky: 1, musky: 2, resinous: 1,
    occasions: ["casual", "weekend", "social", "festival", "travel"],
    weather: ["warm", "mild", "humid"],
    energy: ["relaxed", "social", "nonchalant"],
    time: ["afternoon", "evening", "all day"],
    description: "Sunday in the park. Black pepper and easy confidence.",
    pulsePoints: "Wrists and back of neck — casual, effortless placement.",
    effect: "Cool without trying. The friend everyone gravitates toward." },
  { id: 10, name: "Reef Pesca", house: "Reef", short: "Pesca", notes: ["Peach", "Iris", "Yerba Mate"], family: "Fruity Green", season: ["Spring", "Summer"], mood: "Bright", color: "#c4956a",
    weight: "light", warmth: 3, freshness: 9, projection: 3, longevity: 4, sweet: 6, dark: 0, floral: 2, spicy: 0, green: 6, woody: 1, smoky: 0, musky: 1, resinous: 0,
    occasions: ["brunch", "casual", "beach", "travel", "daytime"],
    weather: ["hot", "warm", "sunny", "humid"],
    energy: ["light", "energetic", "relaxed"],
    time: ["morning", "afternoon"],
    description: "First bite of summer. Sun on bare arms. Uncomplicated joy.",
    pulsePoints: "Wrists, neck, and liberally — this one is gentle and close-range.",
    effect: "Disarming warmth. A smile you can smell." },
  { id: 11, name: "Tom Ford Noir Extreme", house: "Tom Ford", short: "Noir Extreme", notes: ["Cardamom", "Nutmeg", "Saffron", "Kulfi", "Rose", "Vanilla", "Amber"], family: "Oriental Spicy", season: ["Winter", "Autumn"], mood: "Commanding", color: "#2e2e2e",
    weight: "heavy", warmth: 10, freshness: 1, projection: 8, longevity: 9, sweet: 8, dark: 7, floral: 2, spicy: 9, green: 0, woody: 3, smoky: 1, musky: 2, resinous: 4,
    occasions: ["date", "dinner", "event", "occasion", "night out"],
    weather: ["cold", "cool"],
    energy: ["bold", "confident", "commanding"],
    time: ["evening", "night"],
    description: "Cardamom kulfi at midnight. Velvet and gold.",
    pulsePoints: "Chest and one wrist — let body heat do the work. Two sprays maximum.",
    effect: "Devastating. The scent of someone who's already won." },
  { id: 12, name: "CAVE Sloane Tones", house: "CAVE", short: "Sloane Tones", notes: ["Osmanthus", "Tuberose", "Patchouli", "Agarwood", "Cedar", "Vanilla"], family: "Woody Floral", season: ["Autumn", "Winter"], mood: "Luxurious", color: "#6b5a7e",
    weight: "heavy", warmth: 8, freshness: 2, projection: 7, longevity: 8, sweet: 6, dark: 6, floral: 5, spicy: 3, green: 1, woody: 7, smoky: 2, musky: 3, resinous: 3,
    occasions: ["event", "dinner", "date", "evening out", "occasion"],
    weather: ["cool", "cold", "overcast"],
    energy: ["confident", "romantic", "bold"],
    time: ["evening", "night"],
    description: "Agarwood smoke through tuberose. Sloane Street after dark.",
    pulsePoints: "Behind ears and chest — let the oud and florals interplay at body temperature.",
    effect: "Understated opulence. London luxury without the logo." },
  { id: 13, name: "Oud-Based Blends", house: "Custom", short: "Oud Blends", notes: ["Oud", "Dark Woods", "Resins"], family: "Oud", season: ["Winter", "Autumn"], mood: "Sacred", color: "#3d2e2e",
    weight: "heavy", warmth: 10, freshness: 0, projection: 7, longevity: 10, sweet: 2, dark: 10, floral: 0, spicy: 5, green: 0, woody: 10, smoky: 5, musky: 2, resinous: 9,
    occasions: ["prayer", "evening", "occasion", "reflection", "event"],
    weather: ["cold", "cool"],
    energy: ["introspective", "calm", "commanding"],
    time: ["evening", "night"],
    description: "Ancient wood burning slowly. Something older than language.",
    pulsePoints: "Behind ears and inner wrists — oud is intimate. Don't overspray.",
    effect: "Ancestral weight. The scent of someone grounded in something deeper." },
  { id: 14, name: "Gissah Hudson II", house: "Gissah", short: "Hudson II", notes: ["Rose", "Fruity Notes", "White Flowers", "Saffron", "Amber", "Musk", "Tonka Bean"], family: "Oriental Floral", season: ["Spring", "Autumn", "Winter"], mood: "Romantic", color: "#8a5e6a",
    weight: "medium", warmth: 7, freshness: 4, projection: 6, longevity: 7, sweet: 7, dark: 3, floral: 6, spicy: 3, green: 0, woody: 2, smoky: 0, musky: 6, resinous: 3,
    occasions: ["date", "dinner", "event", "evening out", "occasion", "social"],
    weather: ["mild", "cool", "cold", "overcast"],
    energy: ["romantic", "confident", "bold"],
    time: ["afternoon", "evening", "night"],
    description: "Saffron-dusted rose and ripe fruit. A love letter sealed in amber.",
    pulsePoints: "Neck and inner wrists — let the saffron bloom at body heat. Two to three sprays.",
    effect: "Warm magnetism. The scent that draws people closer without them realising why." },
  { id: 15, name: "Diptyque Vetyverio", house: "Diptyque", short: "Vetyverio", notes: ["Grapefruit", "Mandarin", "Bergamot", "Geranium", "Rose", "Nutmeg", "Vetiver", "Musk", "Cedar"], family: "Woody Vetiver", season: ["Spring", "Summer"], mood: "Grounded", color: "#6a7a5e",
    weight: "light", warmth: 3, freshness: 8, projection: 4, longevity: 5, sweet: 1, dark: 2, floral: 3, spicy: 3, green: 8, woody: 7, smoky: 2, musky: 5, resinous: 0,
    occasions: ["work", "casual", "brunch", "meeting", "travel", "daytime"],
    weather: ["mild", "warm", "sunny", "overcast"],
    energy: ["calm", "balanced", "focused", "relaxed"],
    time: ["morning", "afternoon", "all day"],
    description: "Wet grass and grapefruit zest. A Parisian garden at ten in the morning.",
    pulsePoints: "Wrists, inner elbows, and behind ears — spray generously, this sits close to skin.",
    effect: "Effortless refinement. Clean, earthy intelligence that never tries too hard." },
];

// ── Chemistry Engine ──
const PROFILE_KEYS = ["warmth", "freshness", "sweet", "dark", "floral", "spicy", "green", "woody", "smoky", "musky", "resinous"];

function calcChemistry(selected) {
  if (selected.length < 2) return null;
  const frags = selected.map(id => FRAGRANCES.find(f => f.id === id)).filter(Boolean);
  if (frags.length < 2) return null;

  // 1. Harmony: how well profiles complement without clashing (0-35)
  let harmony = 35;
  for (let i = 0; i < frags.length; i++) {
    for (let j = i + 1; j < frags.length; j++) {
      const a = frags[i], b = frags[j];
      let totalDiff = 0;
      PROFILE_KEYS.forEach(k => { totalDiff += Math.abs(a[k] - b[k]); });
      const avgDiff = totalDiff / PROFILE_KEYS.length;
      // Sweet spot: 2-5 avg diff = complementary. Too similar (<1.5) = redundant. Too different (>6) = clash
      if (avgDiff < 1.5) harmony -= 8;
      else if (avgDiff <= 5) harmony += 0;
      else if (avgDiff <= 7) harmony -= 6;
      else harmony -= 14;
    }
  }
  harmony = Math.max(0, Math.min(35, harmony));

  // 2. Weight balance (0-20)
  const weights = frags.map(f => f.weight);
  const allSame = weights.every(w => w === weights[0]);
  const hasLight = weights.includes("light"), hasHeavy = weights.includes("heavy"), hasMed = weights.includes("medium");
  let weightScore = 10;
  if (hasLight && hasHeavy) weightScore = 20; // perfect contrast
  else if (hasMed && (hasLight || hasHeavy)) weightScore = 16;
  else if (allSame && weights[0] === "heavy") weightScore = 5; // too dense
  else if (allSame && weights[0] === "light") weightScore = 8;
  else if (allSame) weightScore = 10;

  // 3. Temperature interplay (0-20)
  const warmths = frags.map(f => f.warmth);
  const warmRange = Math.max(...warmths) - Math.min(...warmths);
  let tempScore = warmRange >= 3 && warmRange <= 6 ? 20 : warmRange < 3 ? 12 : warmRange <= 8 ? 14 : 6;

  // 4. Projection balance (0-15)
  const projections = frags.map(f => f.projection);
  const projRange = Math.max(...projections) - Math.min(...projections);
  let projScore = projRange <= 2 ? 15 : projRange <= 4 ? 12 : projRange <= 6 ? 9 : 5;

  // 5. Note clash penalties (-10 to +10)
  let clashBonus = 0;
  const allNotes = frags.flatMap(f => f.notes.map(n => n.toLowerCase()));
  const uniqueNotes = new Set(allNotes);
  // Shared notes = familiarity bonus
  const sharedCount = allNotes.length - uniqueNotes.size;
  clashBonus += Math.min(sharedCount * 2, 6);
  // Extreme sweet+smoky or floral+smoky combos can be risky
  const maxSweet = Math.max(...frags.map(f => f.sweet));
  const maxSmoky = Math.max(...frags.map(f => f.smoky));
  if (maxSweet >= 7 && maxSmoky >= 7) clashBonus -= 4;
  const maxFloral = Math.max(...frags.map(f => f.floral));
  if (maxFloral >= 5 && maxSmoky >= 6) clashBonus -= 3;

  const total = Math.max(0, Math.min(100, harmony + weightScore + tempScore + projScore + clashBonus));

  // Build breakdown
  const getVerdict = (score, max) => {
    const pct = score / max;
    if (pct >= 0.85) return "Excellent";
    if (pct >= 0.65) return "Good";
    if (pct >= 0.4) return "Fair";
    return "Risky";
  };

  // Opening / Heart / Drydown prediction
  const avgFresh = frags.reduce((s, f) => s + f.freshness, 0) / frags.length;
  const avgWarm = frags.reduce((s, f) => s + f.warmth, 0) / frags.length;
  const avgDark = frags.reduce((s, f) => s + f.dark, 0) / frags.length;
  const opening = avgFresh >= 5 ? "Bright and lifted — the fresher notes lead" : avgSpicy(frags) >= 5 ? "Spiced and immediate — hits with intent" : "Warm and enveloping from the first breath";
  const heart = avgFloral(frags) >= 4 ? "Floral complexity emerges as it settles" : avgWarm >= 7 ? "Rich amber and resinous warmth take centre stage" : "Woody depth anchors the middle hours";
  const drydown = avgDark >= 6 ? "Dark, lasting, close to skin — lingers for hours" : avgWarm >= 6 ? "Warm vanilla-amber trail, intimate and enduring" : "Soft musk and clean wood, fading gracefully";

  // Application advice
  let application = "";
  if (frags.length === 2) {
    const [base, top] = frags[0].warmth >= frags[1].warmth ? [frags[0], frags[1]] : [frags[1], frags[0]];
    application = `Apply ${base.short} to chest and pulse points first — it's your foundation. Then ${top.short} on wrists and neck to give the opening its character. ${base.weight === "heavy" && top.weight === "light" ? "The weight contrast here is ideal — depth meets lift." : "Let them blend naturally at body temperature."}`;
  } else if (frags.length === 3) {
    const sorted = [...frags].sort((a, b) => b.warmth - a.warmth);
    application = `Layer heaviest first: ${sorted[0].short} on chest, ${sorted[1].short} on inner wrists, ${sorted[2].short} on neck and behind ears. Three layers means restraint — one spray each maximum.`;
  }

  return {
    total,
    harmony: { score: harmony, max: 35, verdict: getVerdict(harmony, 35) },
    weight: { score: weightScore, max: 20, verdict: getVerdict(weightScore, 20) },
    temperature: { score: tempScore, max: 20, verdict: getVerdict(tempScore, 20) },
    projection: { score: projScore, max: 15, verdict: getVerdict(projScore, 15) },
    opening, heart, drydown, application,
    names: frags.map(f => f.short),
  };
}

function avgSpicy(frags) { return frags.reduce((s, f) => s + f.spicy, 0) / frags.length; }
function avgFloral(frags) { return frags.reduce((s, f) => s + f.floral, 0) / frags.length; }

// ── Selector scoring ──
const WEATHER_MAP = { "Cold (< 8°C)": "cold", "Cool (8–14°C)": "cool", "Mild (14–20°C)": "mild", "Warm (20–26°C)": "warm", "Hot (26°C+)": "hot", "Rainy": "rainy", "Overcast": "overcast", "Sunny": "sunny", "Humid": "humid", "Fog": "fog" };
const OCCASION_MAP = { "Work / Office": ["work", "meeting"], "Date": ["date", "romantic"], "Dinner Out": ["dinner", "evening out"], "Casual / Weekend": ["casual", "weekend"], "Event / Occasion": ["event", "occasion"], "Travel": ["travel"], "Night Out": ["night out", "party", "club", "social"], "Solo / Reflection": ["solo", "reading", "reflection", "gallery"], "Brunch": ["brunch", "daytime"] };
const ENERGY_MAP = { "Calm & Centred": ["calm", "introspective", "focused"], "Confident & Sharp": ["confident", "sharp", "bold", "commanding"], "Relaxed & Easy": ["relaxed", "light", "nonchalant", "social"], "Romantic": ["romantic", "bold", "confident"], "Energetic": ["energetic", "bold", "social"] };
const TIME_MAP = { "Morning": "morning", "Afternoon": "afternoon", "Evening": "evening", "Night": "night" };

function scoreFragrance(f, weather, occasion, energy, time) {
  let score = 0;
  const dims = [];

  // ── WEATHER (0–30) ──
  if (weather.length) {
    const wKeys = weather.map(w => WEATHER_MAP[w]).filter(Boolean);
    const wMatch = wKeys.filter(w => f.weather.includes(w)).length;
    if (wMatch === 0) {
      score -= 15; // hard miss — wrong weather entirely
    } else {
      const matchRatio = wMatch / wKeys.length;
      // Specificity bonus: fewer tagged weathers = more specialist = bonus when matched
      const specificity = 1 + (1 - f.weather.length / 10) * 0.4;
      score += matchRatio * 25 * specificity;
    }
    // Physical modifiers
    const isHot = wKeys.some(w => ["hot", "warm", "humid"].includes(w));
    const isCold = wKeys.some(w => ["cold", "cool", "rainy", "fog"].includes(w));
    if (isHot && f.weight === "heavy") score -= 15;
    if (isHot && f.weight === "light" && f.freshness >= 6) score += 8;
    if (isCold && f.warmth >= 7) score += 8;
    if (isCold && f.weight === "light" && f.warmth <= 4) score -= 8;
    dims.push("w");
  }

  // ── OCCASION (0–25) ──
  if (occasion) {
    const oKeys = OCCASION_MAP[occasion] || [];
    const oMatch = oKeys.filter(o => f.occasions.includes(o)).length;
    if (oMatch === 0) {
      score -= 10; // wrong occasion
    } else {
      const specificity = 1 + (1 - f.occasions.length / 10) * 0.5;
      score += (oMatch / oKeys.length) * 22 * specificity;
    }
    // Occasion-specific bonuses
    if (occasion === "Date" && f.sweet >= 5 && f.warmth >= 6) score += 5;
    if (occasion === "Work / Office" && f.projection <= 5 && f.dark <= 5) score += 4;
    if (occasion === "Night Out" && f.projection >= 6 && f.freshness >= 5) score += 5;
    if (occasion === "Brunch" && f.freshness >= 6 && f.weight === "light") score += 5;
    if (occasion === "Event / Occasion" && f.projection >= 6 && f.longevity >= 7) score += 4;
    dims.push("o");
  }

  // ── ENERGY (0–20) ──
  if (energy) {
    const eKeys = ENERGY_MAP[energy] || [];
    const eMatch = eKeys.filter(e => f.energy.includes(e)).length;
    if (eMatch === 0) {
      score -= 8;
    } else {
      score += (eMatch / eKeys.length) * 18;
    }
    // Mood-scent synergy
    if (energy === "Romantic" && f.sweet >= 5) score += 3;
    if (energy === "Calm & Centred" && f.projection <= 5) score += 3;
    if (energy === "Energetic" && f.freshness >= 6) score += 3;
    dims.push("e");
  }

  // ── TIME (0–15) ──
  if (time) {
    const tKey = TIME_MAP[time];
    if (f.time.includes(tKey) || f.time.includes("all day")) {
      const timeSpecificity = 1 + (1 - f.time.length / 4) * 0.3;
      score += 13 * timeSpecificity;
    } else {
      score -= 8; // wrong time of day
    }
    // Hard modifiers
    if (tKey === "morning" && f.weight === "heavy" && f.dark >= 7) score -= 10;
    if (tKey === "morning" && f.freshness >= 7) score += 5;
    if (tKey === "night" && f.warmth >= 7 && f.projection >= 6) score += 6;
    if (tKey === "night" && f.freshness >= 7 && f.warmth <= 3) score -= 4;
    dims.push("t");
  }

  // Normalise to 0–100 based on dimensions used
  const maxPossible = dims.length === 0 ? 1 : dims.reduce((s, d) => {
    return s + ({ w: 38, o: 31, e: 21, t: 24 }[d] || 0);
  }, 0);
  const pct = Math.round((Math.max(score, 0) / maxPossible) * 100);
  return Math.min(pct, 100);
}

function getLayerPartner(primary) {
  if (primary.weight === "light" || primary.freshness >= 6) {
    const h = FRAGRANCES.filter(f => f.id !== primary.id && f.weight !== "light" && f.warmth > primary.warmth);
    if (h.length) return h.sort((a, b) => b.warmth - a.warmth)[0];
  }
  if (primary.weight === "heavy") {
    const l = FRAGRANCES.filter(f => f.id !== primary.id && f.freshness > primary.freshness && f.dark < primary.dark);
    if (l.length) return l.sort((a, b) => b.freshness - a.freshness)[0];
  }
  return FRAGRANCES.filter(f => f.id !== primary.id).sort((a, b) => Math.abs(b.warmth - primary.warmth) - Math.abs(a.warmth - primary.warmth))[0] || null;
}

const MODES = [
  { id: "collection", label: "Collection", icon: "◆" },
  { id: "selector", label: "Daily Selector", icon: "◇" },
  { id: "perfumery", label: "Perfumery", icon: "◎" },
];

export default function App() {
  const [mode, setMode] = useState("collection");
  const [selectedFragrance, setSelectedFragrance] = useState(null);
  const [filterSeason, setFilterSeason] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [selWeather, setSelWeather] = useState([]);
  const [selOccasion, setSelOccasion] = useState("");
  const [selEnergy, setSelEnergy] = useState("");
  const [selTime, setSelTime] = useState("");
  const [showResults, setShowResults] = useState(false);
  // Perfumery
  const [labSelected, setLabSelected] = useState([]);
  const [showChemistry, setShowChemistry] = useState(false);
  const [carouselIdx, setCarouselIdx] = useState(0);

  useEffect(() => { setMounted(true); }, []);

  const filtered = filterSeason ? FRAGRANCES.filter(f => f.season.includes(filterSeason)) : FRAGRANCES;
  const selectorResults = useMemo(() => {
    if (!showResults) return [];
    return FRAGRANCES.map(f => ({ ...f, score: scoreFragrance(f, selWeather, selOccasion, selEnergy, selTime) })).sort((a, b) => b.score - a.score).slice(0, 3);
  }, [showResults, selWeather, selOccasion, selEnergy, selTime]);
  const layerSuggestion = useMemo(() => selectorResults.length ? getLayerPartner(selectorResults[0]) : null, [selectorResults]);

  const chemistry = useMemo(() => showChemistry ? calcChemistry(labSelected) : null, [showChemistry, labSelected]);

  const canGenerate = selWeather.length > 0 || selOccasion || selEnergy || selTime;
  const resetSelector = () => { setSelWeather([]); setSelOccasion(""); setSelEnergy(""); setSelTime(""); setShowResults(false); };
  const toggleWeather = (w) => { setShowResults(false); setSelWeather(prev => prev.includes(w) ? prev.filter(x => x !== w) : [...prev, w]); };
  const toggleLab = (id) => { setShowChemistry(false); setLabSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : prev.length >= 3 ? prev : [...prev, id]); };

  const gold = "#c9a96e";
  const sans = "'Helvetica Neue', sans-serif";
  const labelStyle = { fontSize: 9, letterSpacing: "0.25em", textTransform: "uppercase", fontFamily: sans, marginBottom: 4 };

  const TagButton = ({ active, onClick, children }) => (
    <button onClick={onClick} style={{
      background: active ? `${gold}18` : "none",
      border: active ? `1px solid ${gold}55` : "1px solid rgba(232,224,212,0.08)",
      color: active ? gold : "rgba(232,224,212,0.4)",
      padding: "6px 14px", borderRadius: 2, cursor: "pointer", fontFamily: sans,
      fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", transition: "all 0.3s ease",
    }}>{children}</button>
  );

  const Bar = ({ value, max = 10 }) => (
    <div style={{ display: "flex", gap: 3, marginTop: 4 }}>
      {Array.from({ length: max }).map((_, j) => (
        <div key={j} style={{ width: 16, height: 3, background: j < value ? gold : "rgba(232,224,212,0.08)", transition: "background 0.3s ease" }} />
      ))}
    </div>
  );

  const getScoreColor = (score) => score >= 75 ? "#7ab87a" : score >= 50 ? gold : score >= 30 ? "#c49a6a" : "#a06060";

  return (
    <div style={{ minHeight: "100vh", background: "#080706", color: "#e8e0d4", fontFamily: "'Cormorant Garamond', 'Georgia', serif", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "fixed", inset: 0, opacity: 0.035, pointerEvents: "none", zIndex: 0, background: "radial-gradient(ellipse at 20% 50%, #c9a96e 0%, transparent 45%), radial-gradient(ellipse at 80% 20%, #5a4a3a 0%, transparent 40%), radial-gradient(ellipse at 50% 80%, #3a3a4a 0%, transparent 35%)" }} />
      <div style={{ position: "fixed", inset: 0, opacity: 0.015, pointerEvents: "none", zIndex: 0, background: "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, transparent 40%, rgba(255,255,255,0.02) 60%, transparent 100%)", mixBlendMode: "overlay" }} />
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600&display=swap" rel="stylesheet" />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 900, margin: "0 auto", padding: "0 24px" }}>
        {/* Header */}
        <header style={{ padding: "48px 0 28px", borderBottom: "1px solid rgba(201,169,110,0.12)", animation: mounted ? "fadeDown 0.8s ease both" : "none" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 16, flexWrap: "wrap" }}>
            <h1 style={{ fontSize: 42, fontWeight: 300, letterSpacing: "0.12em", margin: 0, color: gold, textTransform: "uppercase" }}>Sillage</h1>
            <span style={{ fontSize: 11, letterSpacing: "0.3em", color: "rgba(201,169,110,0.4)", textTransform: "uppercase", fontFamily: sans }}>Fragrance Wardrobe</span>
          </div>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "rgba(232,224,212,0.3)", fontFamily: sans, letterSpacing: "0.06em", fontWeight: 300, fontStyle: "italic" }}>
            intentional imprints
          </p>
        </header>

        {/* Nav */}
        <nav style={{ display: "flex", gap: 0, padding: "24px 0", borderBottom: "1px solid rgba(201,169,110,0.08)", animation: mounted ? "fadeDown 0.8s ease 0.15s both" : "none", overflowX: "auto" }}>
          {MODES.map(m => (
            <button key={m.id} onClick={() => { setMode(m.id); setSelectedFragrance(null); resetSelector(); setLabSelected([]); setShowChemistry(false); setCarouselIdx(0); }}
              style={{ background: "none", border: "none", cursor: "pointer", padding: "10px 20px", color: mode === m.id ? gold : "rgba(232,224,212,0.35)", fontFamily: sans, fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 400, borderBottom: mode === m.id ? `1px solid ${gold}` : "1px solid transparent", transition: "all 0.4s ease", whiteSpace: "nowrap" }}>
              <span style={{ marginRight: 6, fontSize: 10 }}>{m.icon}</span>{m.label}
            </button>
          ))}
        </nav>

        {/* ═══ COLLECTION ═══ */}
        {mode === "collection" && (
          <div style={{ animation: "fadeUp 0.6s ease both" }}>
            <div style={{ display: "flex", gap: 12, padding: "28px 0 20px", flexWrap: "wrap" }}>
              {[null, "Spring", "Summer", "Autumn", "Winter"].map(sv => (
                <TagButton key={sv || "all"} active={filterSeason === sv} onClick={() => { setFilterSeason(sv); setCarouselIdx(0); setSelectedFragrance(null); }}>{sv || "All"}</TagButton>
              ))}
            </div>

            {/* Carousel */}
            <div style={{ position: "relative", padding: "20px 0 8px" }}>
              {/* Cards */}
              <div style={{ display: "flex", alignItems: "stretch", gap: 6, justifyContent: "center", minHeight: 180 }}>
                {[-1, 0, 1].map(offset => {
                  const idx = carouselIdx + offset;
                  const f = filtered[idx];
                  if (!f) return <div key={offset} style={{ flex: "0 0 30%", minWidth: 0 }} />;
                  const isCenter = offset === 0;
                  const isOpen = selectedFragrance?.id === f.id;
                  return (
                    <div key={f.id} onClick={() => { if (isCenter) setSelectedFragrance(isOpen ? null : f); else setCarouselIdx(idx); }}
                      style={{
                        flex: isCenter ? "0 0 62%" : "0 0 17%",
                        minWidth: 0,
                        cursor: "pointer",
                        padding: isCenter ? "22px 18px 22px 20px" : "18px 14px 18px 16px",
                        position: "relative", overflow: "hidden",
                        border: isOpen ? "1px solid rgba(201,169,110,0.4)" : isCenter ? "1px solid rgba(201,169,110,0.15)" : "1px solid rgba(232,224,212,0.04)",
                        background: isOpen ? "rgba(201,169,110,0.04)" : isCenter ? "rgba(232,224,212,0.02)" : "rgba(232,224,212,0.008)",
                        filter: isCenter ? "none" : "blur(1.2px)",
                        opacity: isCenter ? 1 : 0.45,
                        transform: isCenter ? "scale(1)" : "scale(0.94)",
                        transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
                        zIndex: isCenter ? 2 : 1,
                      }}>
                      <div style={{ position: "absolute", top: 0, left: 0, width: 3, height: "100%", background: f.color, opacity: isCenter ? (isOpen ? 1 : 0.5) : 0.15, transition: "opacity 0.4s ease" }} />
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                        <div>
                          <div style={{ ...labelStyle, color: "rgba(201,169,110,0.5)", marginBottom: 4, fontSize: 8 }}>{f.house}</div>
                          <h3 style={{ margin: 0, fontSize: isCenter ? 20 : 15, fontWeight: 400, color: "#e8e0d4", letterSpacing: "0.02em", transition: "font-size 0.4s ease" }}>{f.short}</h3>
                        </div>
                        <span style={{ fontSize: 9, letterSpacing: "0.15em", color: "rgba(232,224,212,0.15)", fontFamily: sans, marginTop: 2 }}>{String(f.id).padStart(2, "0")}</span>
                      </div>
                      <div style={{ fontSize: 11, color: "rgba(232,224,212,0.35)", fontFamily: sans, fontWeight: 300, lineHeight: 1.5 }}>{f.notes.join(" · ")}</div>

                      {/* Expanded detail — center only */}
                      {isCenter && isOpen && (
                        <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid rgba(201,169,110,0.1)", animation: "fadeUp 0.3s ease both" }}>
                          <p style={{ fontSize: 15, lineHeight: 1.8, color: "rgba(232,224,212,0.7)", fontStyle: "italic", margin: "0 0 14px", fontWeight: 300 }}>{f.description}</p>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                            <div><div style={{ ...labelStyle, color: "rgba(201,169,110,0.4)" }}>Family</div><div style={{ fontSize: 12, color: "rgba(232,224,212,0.7)", fontFamily: sans }}>{f.family}</div></div>
                            <div><div style={{ ...labelStyle, color: "rgba(201,169,110,0.4)" }}>Mood</div><div style={{ fontSize: 12, color: "rgba(232,224,212,0.7)", fontFamily: sans }}>{f.mood}</div></div>
                            <div><div style={{ ...labelStyle, color: "rgba(201,169,110,0.4)" }}>Projection</div><Bar value={f.projection} /></div>
                            <div><div style={{ ...labelStyle, color: "rgba(201,169,110,0.4)" }}>Longevity</div><Bar value={f.longevity} /></div>
                            <div style={{ gridColumn: "1 / -1" }}><div style={{ ...labelStyle, color: "rgba(201,169,110,0.4)" }}>Seasons</div><div style={{ display: "flex", gap: 8, marginTop: 4 }}>{f.season.map(sv => (<span key={sv} style={{ fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", color: gold, padding: "3px 10px", border: "1px solid rgba(201,169,110,0.2)", fontFamily: sans }}>{sv}</span>))}</div></div>
                            <div style={{ gridColumn: "1 / -1" }}><div style={{ ...labelStyle, color: "rgba(201,169,110,0.4)" }}>Application</div><div style={{ fontSize: 12, color: "rgba(232,224,212,0.6)", fontFamily: sans, lineHeight: 1.6 }}>{f.pulsePoints}</div></div>
                            <div style={{ gridColumn: "1 / -1" }}><div style={{ ...labelStyle, color: "rgba(201,169,110,0.4)" }}>Effect</div><div style={{ fontSize: 12, color: "rgba(232,224,212,0.6)", fontFamily: sans, lineHeight: 1.6 }}>{f.effect}</div></div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Nav arrows */}
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 24, marginTop: 20 }}>
                <button onClick={() => { setCarouselIdx(Math.max(0, carouselIdx - 1)); setSelectedFragrance(null); }} disabled={carouselIdx === 0}
                  style={{ background: "none", border: "none", cursor: carouselIdx === 0 ? "default" : "pointer", color: carouselIdx === 0 ? "rgba(232,224,212,0.1)" : "rgba(201,169,110,0.5)", fontSize: 18, fontFamily: sans, padding: "4px 12px", transition: "color 0.3s ease", letterSpacing: "0.1em" }}>‹</button>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  {filtered.map((_, i) => (
                    <button key={i} onClick={() => { setCarouselIdx(i); setSelectedFragrance(null); }}
                      style={{ width: i === carouselIdx ? 16 : 4, height: 4, borderRadius: 2, border: "none", cursor: "pointer", background: i === carouselIdx ? gold : "rgba(232,224,212,0.12)", transition: "all 0.4s ease", padding: 0 }} />
                  ))}
                </div>
                <button onClick={() => { setCarouselIdx(Math.min(filtered.length - 1, carouselIdx + 1)); setSelectedFragrance(null); }} disabled={carouselIdx >= filtered.length - 1}
                  style={{ background: "none", border: "none", cursor: carouselIdx >= filtered.length - 1 ? "default" : "pointer", color: carouselIdx >= filtered.length - 1 ? "rgba(232,224,212,0.1)" : "rgba(201,169,110,0.5)", fontSize: 18, fontFamily: sans, padding: "4px 12px", transition: "color 0.3s ease", letterSpacing: "0.1em" }}>›</button>
              </div>
            </div>
          </div>
        )}

        {/* ═══ DAILY SELECTOR ═══ */}
        {mode === "selector" && (
          <div style={{ padding: "36px 0 60px", animation: "fadeUp 0.5s ease both" }}>
            <h2 style={{ fontSize: 28, fontWeight: 300, margin: "0 0 6px", color: gold, letterSpacing: "0.06em" }}>Daily Selector</h2>
            <p style={{ fontSize: 12, color: "rgba(232,224,212,0.3)", fontFamily: sans, fontWeight: 300, margin: "0 0 28px", letterSpacing: "0.03em" }}>Set your conditions. Every scent gets scored against weather, occasion, energy, and time.</p>

            <div style={{ marginBottom: 24 }}><div style={{ ...labelStyle, color: "rgba(201,169,110,0.5)", marginBottom: 10 }}>Weather / Conditions</div><div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{Object.keys(WEATHER_MAP).map(w => <TagButton key={w} active={selWeather.includes(w)} onClick={() => toggleWeather(w)}>{w}</TagButton>)}</div></div>
            <div style={{ marginBottom: 24 }}><div style={{ ...labelStyle, color: "rgba(201,169,110,0.5)", marginBottom: 10 }}>Occasion</div><div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{Object.keys(OCCASION_MAP).map(o => <TagButton key={o} active={selOccasion === o} onClick={() => { setShowResults(false); setSelOccasion(selOccasion === o ? "" : o); }}>{o}</TagButton>)}</div></div>
            <div style={{ marginBottom: 24 }}><div style={{ ...labelStyle, color: "rgba(201,169,110,0.5)", marginBottom: 10 }}>Energy / Mood</div><div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{Object.keys(ENERGY_MAP).map(e => <TagButton key={e} active={selEnergy === e} onClick={() => { setShowResults(false); setSelEnergy(selEnergy === e ? "" : e); }}>{e}</TagButton>)}</div></div>
            <div style={{ marginBottom: 32 }}><div style={{ ...labelStyle, color: "rgba(201,169,110,0.5)", marginBottom: 10 }}>Time of Day</div><div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{Object.keys(TIME_MAP).map(t => <TagButton key={t} active={selTime === t} onClick={() => { setShowResults(false); setSelTime(selTime === t ? "" : t); }}>{t}</TagButton>)}</div></div>

            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={() => setShowResults(true)} disabled={!canGenerate} style={{ background: canGenerate ? `${gold}22` : `${gold}0a`, border: `1px solid ${gold}40`, color: canGenerate ? gold : `${gold}40`, padding: "10px 32px", cursor: canGenerate ? "pointer" : "default", fontFamily: sans, fontSize: 10, letterSpacing: "0.25em", textTransform: "uppercase", transition: "all 0.3s ease" }}>Select Scent</button>
              <button onClick={resetSelector} style={{ background: "none", border: "1px solid rgba(232,224,212,0.08)", color: "rgba(232,224,212,0.3)", padding: "10px 24px", cursor: "pointer", fontFamily: sans, fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase" }}>Reset</button>
            </div>

            {showResults && selectorResults.length > 0 && (
              <div style={{ marginTop: 40, animation: "fadeUp 0.6s ease both" }}>
                <div style={{ ...labelStyle, color: "rgba(201,169,110,0.4)", marginBottom: 20 }}>Recommendation</div>
                {(() => {
                  const top = selectorResults[0];
                  return (
                    <div style={{ padding: "28px 24px", border: "1px solid rgba(201,169,110,0.3)", background: "rgba(201,169,110,0.04)", marginBottom: 16, position: "relative" }}>
                      <div style={{ position: "absolute", top: 0, left: 0, width: 3, height: "100%", background: top.color }} />
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}><div style={{ ...labelStyle, color: gold }}>Primary Pick</div><div style={{ fontSize: 10, fontFamily: sans, color: "rgba(201,169,110,0.5)", letterSpacing: "0.1em" }}>{top.score}%</div></div>
                      <h3 style={{ margin: "4px 0 8px", fontSize: 26, fontWeight: 400, color: "#e8e0d4" }}>{top.name}</h3>
                      <p style={{ fontSize: 15, lineHeight: 1.8, color: "rgba(232,224,212,0.6)", fontStyle: "italic", margin: "0 0 16px", fontWeight: 300 }}>{top.description}</p>
                      <div style={{ fontSize: 12, color: "rgba(232,224,212,0.5)", fontFamily: sans, lineHeight: 1.8, marginBottom: 4 }}><span style={{ color: "rgba(201,169,110,0.6)" }}>Apply:</span> {top.pulsePoints}</div>
                      <div style={{ fontSize: 12, color: "rgba(232,224,212,0.5)", fontFamily: sans, lineHeight: 1.8 }}><span style={{ color: "rgba(201,169,110,0.6)" }}>Effect:</span> {top.effect}</div>
                      {layerSuggestion && (
                        <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid rgba(201,169,110,0.1)" }}>
                          <div style={{ ...labelStyle, color: "rgba(201,169,110,0.4)", marginBottom: 10 }}>Optional Layer</div>
                          <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                            <div style={{ width: 3, minHeight: 36, background: layerSuggestion.color, flexShrink: 0, marginTop: 2 }} />
                            <div>
                              <div style={{ fontSize: 16, color: "#e8e0d4", marginBottom: 6 }}>{layerSuggestion.name}</div>
                              <div style={{ fontSize: 11, color: "rgba(232,224,212,0.45)", fontFamily: sans, lineHeight: 1.6 }}>
                                Apply {layerSuggestion.short} to chest first, then {top.short} on wrists and neck. {top.weight === "light" ? `The warmth of ${layerSuggestion.short} anchors the lighter notes.` : `The freshness of ${layerSuggestion.short} lifts the heavier notes.`}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
                <div style={{ ...labelStyle, color: "rgba(201,169,110,0.3)", margin: "24px 0 12px" }}>Alternatives</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {selectorResults.slice(1).map(r => (
                    <div key={r.id} style={{ padding: "16px 20px", border: "1px solid rgba(232,224,212,0.06)", background: "rgba(232,224,212,0.015)", position: "relative" }}>
                      <div style={{ position: "absolute", top: 0, left: 0, width: 3, height: "100%", background: r.color, opacity: 0.4 }} />
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div><h4 style={{ margin: "0 0 4px", fontSize: 17, fontWeight: 400, color: "rgba(232,224,212,0.8)" }}>{r.name}</h4><div style={{ fontSize: 11, color: "rgba(232,224,212,0.35)", fontFamily: sans }}>{r.notes.join(" · ")}</div></div>
                        <div style={{ fontSize: 10, fontFamily: sans, color: "rgba(201,169,110,0.4)", letterSpacing: "0.1em", flexShrink: 0, marginLeft: 12 }}>{r.score}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══ PERFUMERY ═══ */}
        {mode === "perfumery" && (
          <div style={{ padding: "36px 0 60px", animation: "fadeUp 0.5s ease both" }}>
            <h2 style={{ fontSize: 28, fontWeight: 300, margin: "0 0 6px", color: gold, letterSpacing: "0.06em" }}>Perfumery</h2>
            <p style={{ fontSize: 12, color: "rgba(232,224,212,0.3)", fontFamily: sans, fontWeight: 300, margin: "0 0 28px", letterSpacing: "0.03em" }}>
              Pick 2–3 scents. See if they work together or fight each other.
            </p>

            {/* Scent Selection Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 10, marginBottom: 32 }}>
              {FRAGRANCES.map(f => {
                const active = labSelected.includes(f.id);
                const disabled = !active && labSelected.length >= 3;
                return (
                  <button key={f.id} onClick={() => !disabled && toggleLab(f.id)}
                    style={{
                      textAlign: "left", cursor: disabled ? "default" : "pointer",
                      padding: "14px 16px", position: "relative", overflow: "hidden",
                      background: active ? "rgba(201,169,110,0.06)" : "rgba(232,224,212,0.015)",
                      border: active ? "1px solid rgba(201,169,110,0.4)" : "1px solid rgba(232,224,212,0.06)",
                      opacity: disabled ? 0.35 : 1,
                      transition: "all 0.3s ease",
                    }}>
                    <div style={{ position: "absolute", top: 0, left: 0, width: 3, height: "100%", background: f.color, opacity: active ? 1 : 0.2 }} />
                    {active && <div style={{ position: "absolute", top: 8, right: 10, fontSize: 10, color: gold, fontFamily: sans, letterSpacing: "0.1em" }}>{labSelected.indexOf(f.id) + 1}</div>}
                    <div style={{ fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: active ? "rgba(201,169,110,0.6)" : "rgba(232,224,212,0.3)", fontFamily: sans, marginBottom: 4 }}>{f.house}</div>
                    <div style={{ fontSize: 15, color: active ? "#e8e0d4" : "rgba(232,224,212,0.6)", fontWeight: 400 }}>{f.short}</div>
                    <div style={{ fontSize: 10, color: "rgba(232,224,212,0.25)", fontFamily: sans, marginTop: 4, lineHeight: 1.4 }}>{f.notes.slice(0, 3).join(" · ")}</div>
                  </button>
                );
              })}
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <button onClick={() => setShowChemistry(true)} disabled={labSelected.length < 2}
                style={{
                  background: labSelected.length >= 2 ? `${gold}22` : `${gold}0a`,
                  border: `1px solid ${gold}40`, color: labSelected.length >= 2 ? gold : `${gold}40`,
                  padding: "10px 32px", cursor: labSelected.length >= 2 ? "pointer" : "default", fontFamily: sans,
                  fontSize: 10, letterSpacing: "0.25em", textTransform: "uppercase", transition: "all 0.3s ease",
                }}>Test Chemistry</button>
              <button onClick={() => { setLabSelected([]); setShowChemistry(false); }} style={{
                background: "none", border: "1px solid rgba(232,224,212,0.08)", color: "rgba(232,224,212,0.3)",
                padding: "10px 24px", cursor: "pointer", fontFamily: sans, fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase",
              }}>Clear</button>
              <span style={{ fontSize: 10, color: "rgba(232,224,212,0.2)", fontFamily: sans, letterSpacing: "0.1em", marginLeft: 8 }}>{labSelected.length}/3 selected</span>
            </div>

            {/* ─── Chemistry Results ─── */}
            {showChemistry && chemistry && (
              <div style={{ marginTop: 40, animation: "fadeUp 0.6s ease both" }}>
                {/* Big Score */}
                <div style={{ textAlign: "center", padding: "36px 0 28px", borderBottom: "1px solid rgba(201,169,110,0.1)" }}>
                  <div style={{ ...labelStyle, color: "rgba(201,169,110,0.4)", marginBottom: 12 }}>Chemistry Score</div>
                  <div style={{ fontSize: 72, fontWeight: 300, color: getScoreColor(chemistry.total), letterSpacing: "0.02em", lineHeight: 1 }}>
                    {chemistry.total}
                  </div>
                  <div style={{ fontSize: 14, color: "rgba(232,224,212,0.4)", fontFamily: sans, fontWeight: 300, marginTop: 8 }}>
                    {chemistry.names.join(" × ")}
                  </div>
                  <div style={{ fontSize: 12, color: "rgba(232,224,212,0.25)", fontFamily: sans, marginTop: 6 }}>
                    {chemistry.total >= 80 ? "Exceptional pairing — these were made for each other" :
                     chemistry.total >= 65 ? "Strong combination — complementary with real character" :
                     chemistry.total >= 45 ? "Interesting tension — could work with careful application" :
                     chemistry.total >= 25 ? "Risky pairing — competing profiles, proceed with caution" :
                     "These are fighting each other — better worn separately"}
                  </div>
                </div>

                {/* Breakdown */}
                <div style={{ padding: "28px 0", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                  {[
                    { label: "Note Harmony", ...chemistry.harmony },
                    { label: "Weight Balance", ...chemistry.weight },
                    { label: "Temperature", ...chemistry.temperature },
                    { label: "Projection", ...chemistry.projection },
                  ].map(item => (
                    <div key={item.label}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                        <div style={{ ...labelStyle, color: "rgba(201,169,110,0.5)", margin: 0 }}>{item.label}</div>
                        <div style={{ fontSize: 10, fontFamily: sans, color: item.verdict === "Excellent" ? "#7ab87a" : item.verdict === "Good" ? gold : item.verdict === "Fair" ? "#c49a6a" : "#a06060", letterSpacing: "0.1em" }}>{item.verdict}</div>
                      </div>
                      <div style={{ height: 3, background: "rgba(232,224,212,0.06)", position: "relative" }}>
                        <div style={{ position: "absolute", top: 0, left: 0, height: "100%", width: `${(item.score / item.max) * 100}%`, background: item.verdict === "Excellent" ? "#7ab87a" : item.verdict === "Good" ? gold : item.verdict === "Fair" ? "#c49a6a" : "#a06060", transition: "width 0.8s ease" }} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Scent Journey */}
                <div style={{ borderTop: "1px solid rgba(201,169,110,0.08)", paddingTop: 24, marginBottom: 24 }}>
                  <div style={{ ...labelStyle, color: "rgba(201,169,110,0.4)", marginBottom: 16 }}>The Journey</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {[
                      { phase: "Opening", text: chemistry.opening, time: "0–15 min" },
                      { phase: "Heart", text: chemistry.heart, time: "15 min–3 hrs" },
                      { phase: "Dry-down", text: chemistry.drydown, time: "3 hrs+" },
                    ].map((p, i) => (
                      <div key={p.phase} style={{ display: "flex", gap: 16, animation: `fadeUp 0.4s ease ${i * 0.1}s both` }}>
                        <div style={{ width: 60, flexShrink: 0 }}>
                          <div style={{ fontSize: 10, fontFamily: sans, color: gold, letterSpacing: "0.15em", textTransform: "uppercase" }}>{p.phase}</div>
                          <div style={{ fontSize: 9, fontFamily: sans, color: "rgba(232,224,212,0.2)", marginTop: 2 }}>{p.time}</div>
                        </div>
                        <div style={{ fontSize: 14, color: "rgba(232,224,212,0.6)", lineHeight: 1.7, fontWeight: 300, paddingTop: 1 }}>{p.text}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Application Guide */}
                <div style={{ padding: "20px 24px", border: "1px solid rgba(201,169,110,0.15)", background: "rgba(201,169,110,0.03)" }}>
                  <div style={{ ...labelStyle, color: "rgba(201,169,110,0.5)", marginBottom: 10 }}>How to Wear It</div>
                  <div style={{ fontSize: 13, color: "rgba(232,224,212,0.6)", fontFamily: sans, lineHeight: 1.7, fontWeight: 300 }}>{chemistry.application}</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <footer style={{ padding: "40px 0", borderTop: "1px solid rgba(201,169,110,0.06)", textAlign: "center" }}>
          <span style={{ fontSize: 9, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(232,224,212,0.15)", fontFamily: sans }}>Sillage — A Considered Collection</span>
        </footer>
      </div>

      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeDown { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        ::selection { background: rgba(201,169,110,0.25); color: #e8e0d4; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: rgba(201,169,110,0.02); }
        ::-webkit-scrollbar-thumb { 
          background: rgba(201,169,110,0.2);
          border-radius: 2px;
          animation: scrollPulse 3.5s ease-in-out infinite;
        }
        ::-webkit-scrollbar-thumb:hover { background: rgba(201,169,110,0.45); }
        @keyframes scrollPulse {
          0%, 100% { box-shadow: 0 0 2px 0px rgba(201,169,110,0.0); background: rgba(201,169,110,0.18); }
          50% { box-shadow: 0 0 6px 1px rgba(201,169,110,0.12); background: rgba(201,169,110,0.32); }
        }
        body { background: #080706; }
      `}</style>
    </div>
  );
}
