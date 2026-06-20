import type { Scent, Family } from './types'

export type SortKey = 'name' | 'brand'
export interface FilterCriteria {
  family?: Family
  brand?: string
}

export interface Catalogue {
  getAll(): Scent[]
  getById(id: string): Scent | undefined
  search(query: string): Scent[]
  filter(criteria: FilterCriteria): Scent[]
  sort(list: Scent[], key: SortKey): Scent[]
}

export function createCatalogue(scents: Scent[]): Catalogue {
  const byId = new Map(scents.map(s => [s.id, s]))
  return {
    getAll: () => [...scents],
    getById: (id) => byId.get(id),
    search(query) {
      const q = query.trim().toLowerCase()
      if (!q) return [...scents]
      return scents.filter(s =>
        s.name.toLowerCase().includes(q) || s.brand.toLowerCase().includes(q))
    },
    filter({ family, brand }) {
      return scents.filter(s =>
        (!family || s.families.includes(family)) &&
        (!brand || s.brand === brand))
    },
    sort(list, key) {
      return [...list].sort((a, b) => a[key].localeCompare(b[key]))
    },
  }
}
