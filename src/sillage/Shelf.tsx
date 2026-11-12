import { lazy, Suspense, useMemo, useState, type CSSProperties } from 'react'
import type { Bottle } from './bottles'
import { FAMILIES } from './families'
import { Chroma, Strip } from './Strip'
import { STATUS_LABEL, type Status } from './wardrobeState'

type Sort = 'yours' | 'worn' | 'name'

const Cabinet = lazy(() => import('./Cabinet'))

function FamilyIcon({ d }: { d: string[] }) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {d.map((p, i) => (
        <path key={i} d={p} />
      ))}
    </svg>
  )
}

/* The rack: every bottle as a strip, your score beside it. */
export default function Shelf({
  bottles,
  statusOf,
  scoreOf,
  wearCount,
  open,
}: {
  bottles: Bottle[]
  statusOf: (id: string) => Status
  scoreOf: (id: string) => number | null
  wearCount: (id: string) => number
  open: (id: string) => void
}) {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<Status | 'all'>('owned')
  const [sort, setSort] = useState<Sort>('yours')
  const [family, setFamily] = useState<number | null>(null)

  const counts = useMemo(() => {
    const c: Record<Status, number> = { owned: 0, finished: 0, wishlist: 0, none: 0 }
    bottles.forEach(b => c[statusOf(b.id)]++)
    return c
  }, [bottles, statusOf])

  // the wheel counts the bottles under the current shelf / finished / wishlist choice, from their profiles
  const inStatus = useMemo(() => bottles.filter(b => status === 'all' || statusOf(b.id) === status), [bottles, status, statusOf])
  const familyCounts = useMemo(() => FAMILIES.map(f => inStatus.filter(b => b.profile && f.test(b.profile)).length), [inStatus])

  const list = useMemo(() => {
    const q = query.trim().toLowerCase()
    return inStatus
      .filter(b => family === null || (b.profile ? FAMILIES[family].test(b.profile) : false))
      .filter(b => !q || b.name.toLowerCase().includes(q) || b.notes.some(n => n.toLowerCase().includes(q)) || (b.family ?? '').toLowerCase().includes(q))
      .sort((a, b) =>
        sort === 'name'
          ? a.short.localeCompare(b.short)
          : sort === 'worn'
            ? wearCount(b.id) - wearCount(a.id) || a.short.localeCompare(b.short)
            : (scoreOf(b.id) ?? -1) - (scoreOf(a.id) ?? -1) || a.short.localeCompare(b.short),
      )
  }, [inStatus, family, query, sort, scoreOf, wearCount])

  return (
    <>
      <h1 className="h1">The shelf</h1>
      <p className="lede">
        {counts.owned} on it{counts.finished ? `, ${counts.finished} finished` : ''}
        {counts.wishlist ? `, ${counts.wishlist} wanted` : ''}.
      </p>

      <Suspense fallback={<div className="cabinet cabinet--waiting" aria-hidden />}>
        <Cabinet bottles={list} open={open} />
      </Suspense>

      <div className="chips fam" role="group" aria-label="Family">
        <button type="button" className="chip" aria-pressed={family === null} onClick={() => setFamily(null)}>
          Every family <span className="chip-n">{inStatus.length}</span>
        </button>
        {FAMILIES.map((f, i) => (
          <button key={f.key} type="button" className="chip" aria-pressed={family === i} data-empty={familyCounts[i] ? undefined : ''} style={{ '--c': f.color } as CSSProperties} onClick={() => setFamily(family === i ? null : i)}>
            <FamilyIcon d={f.icon} />
            {f.name} <span className="chip-n">{familyCounts[i]}</span>
          </button>
        ))}
      </div>

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

      {list.length === 0 ? (
        <p className="empty">
          {counts.owned === 0 && status === 'owned' && !query
            ? 'Nothing on your shelf yet. Choose Every bottle to find the ones you own, or add your own under You.'
            : family !== null && !query
              ? `No ${FAMILIES[family].name.toLowerCase()} here yet. A gap in your nose.`
              : 'Nothing matches.'}
        </p>
      ) : null}
      <ul className="rack">
        {list.map((b, r) => {
          const score = scoreOf(b.id)
          const st = statusOf(b.id)
          return (
            <li key={b.id} className="rack-row" style={{ '--r': r } as CSSProperties}>
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
