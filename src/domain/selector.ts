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
