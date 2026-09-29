import { useMemo, useState } from 'react'
import type { Ownership } from '../domain/types'
import type { Bottle } from './bottles'
import { Chroma, Strip } from './Strip'
import { STATUS_LABEL } from './wardrobeState'

type Sort = 'yours' | 'worn' | 'name'

/* The rack: every bottle as a strip, your score beside it. */
export default function Shelf({
  bottles,
  statusOf,
  scoreOf,
  wearCount,
  open,
}: {
  bottles: Bottle[]
  statusOf: (id: string) => Ownership
  scoreOf: (id: string) => number | null
  wearCount: (id: string) => number
  open: (id: string) => void
}) {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<Ownership | 'all'>('owned')
  const [sort, setSort] = useState<Sort>('yours')

  const counts = useMemo(() => {
    const c: Record<Ownership, number> = { owned: 0, finished: 0, wishlist: 0 }
    bottles.forEach(b => c[statusOf(b.id)]++)
    return c
  }, [bottles, statusOf])

  const list = useMemo(() => {
    const q = query.trim().toLowerCase()
    return bottles
      .filter(b => status === 'all' || statusOf(b.id) === status)
      .filter(b => !q || b.name.toLowerCase().includes(q) || b.notes.some(n => n.toLowerCase().includes(q)) || (b.family ?? '').toLowerCase().includes(q))
      .sort((a, b) =>
        sort === 'name'
          ? a.short.localeCompare(b.short)
          : sort === 'worn'
            ? wearCount(b.id) - wearCount(a.id) || a.short.localeCompare(b.short)
            : (scoreOf(b.id) ?? -1) - (scoreOf(a.id) ?? -1) || a.short.localeCompare(b.short),
      )
  }, [bottles, query, status, sort, statusOf, scoreOf, wearCount])

  return (
    <>
      <h1 className="h1">The shelf</h1>
      <p className="lede">
        {counts.owned} on it{counts.finished ? `, ${counts.finished} finished` : ''}
        {counts.wishlist ? `, ${counts.wishlist} wanted` : ''}.
      </p>

      <label className="label" htmlFor="shelf-q">
        Find a bottle or a note
      </label>
      <input id="shelf-q" className="field" type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="vetiver, Aesop, smoky…" />

      <div className="chips" style={{ marginTop: 12 }} role="group" aria-label="Which bottles">
        {(['owned', 'finished', 'wishlist', 'all'] as const).map(s => (
          <button key={s} type="button" className="chip" aria-pressed={status === s} onClick={() => setStatus(s)}>
            {s === 'all' ? 'Every bottle' : STATUS_LABEL[s]}
          </button>
        ))}
      </div>
      <div className="chips" style={{ marginTop: 8 }} role="group" aria-label="Order">
        {([['yours', 'Your score'], ['worn', 'Most worn'], ['name', 'A to Z']] as const).map(([k, l]) => (
          <button key={k} type="button" className="chip" aria-pressed={sort === k} onClick={() => setSort(k)}>
            {l}
          </button>
        ))}
      </div>

      {list.length === 0 ? <p className="empty">Nothing matches.</p> : null}
      <ul className="rack">
        {list.map(b => {
          const score = scoreOf(b.id)
          const st = statusOf(b.id)
          return (
            <li key={b.id} className="rack-row">
              <div>
                <Strip bottle={b} size="row" onClick={() => open(b.id)} />
                <Chroma bottle={b} />
              </div>
              <div className="rack-side">
                {score !== null ? <span className="score" aria-label={`your score ${score} of 10`}>{score}</span> : null}
                {st !== 'owned' ? <span className="status-word">{STATUS_LABEL[st]}</span> : null}
                {!b.profile ? <span className="status-word">not profiled</span> : null}
              </div>
            </li>
          )
        })}
      </ul>
    </>
  )
}
