import type { Scent } from './types'

const PROFILE_KEYS = [
  'warmth', 'freshness', 'sweet', 'dark', 'floral', 'spicy',
  'green', 'woody', 'smoky', 'musky', 'resinous',
] as const

export interface AxisScore { score: number; max: number; verdict: string }
export interface ChemistryResult {
  total: number
  harmony: AxisScore
  weight: AxisScore
  temperature: AxisScore
  projection: AxisScore
  opening: string
  heart: string
  drydown: string
  application: string
  names: string[]
}

function verdict(score: number, max: number): string {
  const pct = score / max
  return pct >= 0.85 ? 'Excellent' : pct >= 0.65 ? 'Good' : pct >= 0.4 ? 'Fair' : 'Risky'
}

export function calcChemistry(scents: Scent[]): ChemistryResult | null {
  const frags = scents.filter(s => s.profile)
  if (frags.length < 2) return null
  const p = frags.map(f => f.profile!)

  let harmony = 35
  for (let i = 0; i < p.length; i++) {
    for (let j = i + 1; j < p.length; j++) {
      let totalDiff = 0
      PROFILE_KEYS.forEach(k => { totalDiff += Math.abs(p[i][k] - p[j][k]) })
      const avgDiff = totalDiff / PROFILE_KEYS.length
      if (avgDiff < 1.5) harmony -= 8
      else if (avgDiff <= 5) harmony += 0
      else if (avgDiff <= 7) harmony -= 6
      else harmony -= 14
    }
  }
  harmony = Math.max(0, Math.min(35, harmony))

  const weights = p.map(f => f.weight)
  const allSame = weights.every(w => w === weights[0])
  const hasLight = weights.includes('light')
  const hasHeavy = weights.includes('heavy')
  const hasMed = weights.includes('medium')
  let weightScore = 10
  if (hasLight && hasHeavy) weightScore = 20
  else if (hasMed && (hasLight || hasHeavy)) weightScore = 16
  else if (allSame && weights[0] === 'heavy') weightScore = 5
  else if (allSame && weights[0] === 'light') weightScore = 8

  const warmths = p.map(f => f.warmth)
  const warmRange = Math.max(...warmths) - Math.min(...warmths)
  const tempScore = warmRange >= 3 && warmRange <= 6 ? 20 : warmRange < 3 ? 12 : warmRange <= 8 ? 14 : 6

  const projections = p.map(f => f.projection)
  const projRange = Math.max(...projections) - Math.min(...projections)
  const projScore = projRange <= 2 ? 15 : projRange <= 4 ? 12 : projRange <= 6 ? 9 : 5

  let clashBonus = 0
  const allNotes = frags.flatMap(f => f.notes.map(n => n.name.toLowerCase()))
  const uniqueNotes = new Set(allNotes)
  clashBonus += Math.min((allNotes.length - uniqueNotes.size) * 2, 6)
  const maxSweet = Math.max(...p.map(f => f.sweet))
  const maxSmoky = Math.max(...p.map(f => f.smoky))
  if (maxSweet >= 7 && maxSmoky >= 7) clashBonus -= 4
  if (Math.max(...p.map(f => f.floral)) >= 5 && maxSmoky >= 6) clashBonus -= 3

  const total = Math.max(0, Math.min(100, harmony + weightScore + tempScore + projScore + clashBonus))

  const avg = (k: typeof PROFILE_KEYS[number]) => p.reduce((s, f) => s + f[k], 0) / p.length
  const avgFresh = avg('freshness'), avgWarm = avg('warmth'), avgDark = avg('dark'), avgSp = avg('spicy'), avgFl = avg('floral')
  const opening = avgFresh >= 5 ? 'Bright and lifted, the fresher notes lead'
    : avgSp >= 5 ? 'Spiced and immediate, hits with intent'
    : 'Warm and enveloping from the first breath'
  const heart = avgFl >= 4 ? 'Floral complexity emerges as it settles'
    : avgWarm >= 7 ? 'Rich amber and resinous warmth take centre stage'
    : 'Woody depth anchors the middle hours'
  const drydown = avgDark >= 6 ? 'Dark, lasting, close to skin, lingers for hours'
    : avgWarm >= 6 ? 'Warm vanilla-amber trail, intimate and enduring'
    : 'Soft musk and clean wood, fading gracefully'

  const names = frags.map(f => f.name)
  let application = ''
  if (frags.length === 2) {
    const [base, top] = p[0].warmth >= p[1].warmth ? [frags[0], frags[1]] : [frags[1], frags[0]]
    const bp = base.profile!, tp = top.profile!
    application = `Apply ${base.name} to chest and pulse points first, it is your foundation. Then ${top.name} on wrists and neck to give the opening its character. ${bp.weight === 'heavy' && tp.weight === 'light' ? 'The weight contrast here is ideal, depth meets lift.' : 'Let them blend naturally at body temperature.'}`
  } else if (frags.length === 3) {
    const sorted = [...frags].sort((a, b) => b.profile!.warmth - a.profile!.warmth)
    application = `Layer heaviest first: ${sorted[0].name} on chest, ${sorted[1].name} on inner wrists, ${sorted[2].name} on neck and behind ears. Three layers means restraint, one spray each maximum.`
  }

  return {
    total,
    harmony: { score: harmony, max: 35, verdict: verdict(harmony, 35) },
    weight: { score: weightScore, max: 20, verdict: verdict(weightScore, 20) },
    temperature: { score: tempScore, max: 20, verdict: verdict(tempScore, 20) },
    projection: { score: projScore, max: 15, verdict: verdict(projScore, 15) },
    opening, heart, drydown, application, names,
  }
}
