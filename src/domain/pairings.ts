import type { Scent } from './types'
import { calcChemistry } from './chemistry'

export interface Pairing { scent: Scent; score: number }

function sharedFamilies(a: Scent, b: Scent): number {
  const set = new Set(a.families)
  return b.families.filter(f => set.has(f)).length
}
function sharedBaseNotes(a: Scent, b: Scent): number {
  const base = new Set(a.notes.filter(n => n.layer === 'base').map(n => n.name.toLowerCase()))
  return b.notes.filter(n => n.layer === 'base' && base.has(n.name.toLowerCase())).length
}

export function suggestPairings(target: Scent, owned: Scent[]): Pairing[] {
  return owned
    .filter(s => s.id !== target.id)
    .map(s => ({ scent: s, score: sharedBaseNotes(target, s) * 2 + sharedFamilies(target, s) }))
    .filter(p => p.score > 0)
    .sort((a, b) => b.score - a.score)
}

export function chemistryPairings(target: Scent, owned: Scent[]): Pairing[] {
  if (!target.profile) return []
  return owned
    .filter(s => s.id !== target.id && s.profile)
    .map(s => {
      const chem = calcChemistry([target, s])
      return { scent: s, score: chem ? chem.total : 0 }
    })
    .sort((a, b) => b.score - a.score)
}
