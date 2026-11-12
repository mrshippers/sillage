/* What a person's Sillage is, as data: their wardrobe (status and score per
 * bottle), the days they wore each bottle, and the bottles they added. Pure, so
 * the merge on sign-in can be tested without a server. */

export type Status = 'owned' | 'finished' | 'wishlist'
export type WardrobeEntry = { scentId: string; ownership: Status; score?: number; addedAt?: string }
export type OwnBottle = { id: string; name: string; house: string; notes: string[]; addedOn: string }
export type Snapshot = { wardrobe: WardrobeEntry[]; wears: Record<string, string[]>; own: OwnBottle[] }

export type Rows = {
  wardrobe: { scent_id: string; ownership: Status; score: number | null }[]
  wears: { scent_id: string; day: string }[]
  own_bottles: { id: string; house: string; name: string; notes: string[]; added_on: string }[]
}

export const emptySnapshot = (): Snapshot => ({ wardrobe: [], wears: {}, own: [] })

export function toRows(s: Snapshot): Rows {
  return {
    wardrobe: s.wardrobe.map(e => ({ scent_id: e.scentId, ownership: e.ownership, score: e.score ?? null })),
    wears: Object.entries(s.wears).flatMap(([scent_id, days]) => days.map(day => ({ scent_id, day }))),
    own_bottles: s.own.map(b => ({ id: b.id, house: b.house, name: b.name, notes: b.notes, added_on: b.addedOn })),
  }
}

export function fromRows(r: Rows): Snapshot {
  const wears: Record<string, string[]> = {}
  for (const w of r.wears) (wears[w.scent_id] ??= []).push(w.day)
  for (const k in wears) wears[k] = [...new Set(wears[k])].sort()
  return {
    wardrobe: r.wardrobe.map(w => ({ scentId: w.scent_id, ownership: w.ownership, ...(w.score === null ? {} : { score: w.score }) })),
    wears,
    own: r.own_bottles.map(b => ({ id: b.id, house: b.house, name: b.name, notes: b.notes, addedOn: b.added_on })),
  }
}

/** On sign-in: nothing is lost from either side. The account wins where both
 * hold the same bottle (it is the copy every device agrees on); a bottle only
 * this device knows is kept and uploaded; wear days are a union. */
export function merge(local: Snapshot, remote: Snapshot): Snapshot {
  const wardrobe = new Map(local.wardrobe.map(e => [e.scentId, e]))
  for (const e of remote.wardrobe) wardrobe.set(e.scentId, { ...wardrobe.get(e.scentId), ...e })
  const wears: Record<string, string[]> = {}
  for (const src of [local.wears, remote.wears]) for (const [k, d] of Object.entries(src)) wears[k] = [...new Set([...(wears[k] ?? []), ...d])].sort()
  const own = new Map(local.own.map(b => [b.id, b]))
  for (const b of remote.own) own.set(b.id, b)
  return { wardrobe: [...wardrobe.values()], wears, own: [...own.values()] }
}

/** keys present before but gone now: these rows must be deleted on the server */
export function removedKeys(before: Rows, after: Rows) {
  const key = {
    wardrobe: (r: Rows['wardrobe'][number]) => r.scent_id,
    wears: (r: Rows['wears'][number]) => `${r.scent_id}|${r.day}`,
    own_bottles: (r: Rows['own_bottles'][number]) => r.id,
  }
  const gone = <T>(a: T[], b: T[], k: (x: T) => string) => {
    const now = new Set(b.map(k))
    return a.filter(x => !now.has(k(x)))
  }
  return {
    wardrobe: gone(before.wardrobe, after.wardrobe, key.wardrobe),
    wears: gone(before.wears, after.wears, key.wears),
    own_bottles: gone(before.own_bottles, after.own_bottles, key.own_bottles),
  }
}
