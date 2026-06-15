import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import type { Catalogue, SortKey } from '../../domain/catalogue'
import { FAMILIES, type Family } from '../../domain/types'

export function ShelfPage({ catalogue }: { catalogue: Catalogue }) {
  const [query, setQuery] = useState('')
  const [family, setFamily] = useState<Family | null>(null)
  const [sortKey] = useState<SortKey>('name')

  const rows = useMemo(() => {
    let list = query ? catalogue.search(query) : catalogue.getAll()
    if (family) list = list.filter(s => s.families.includes(family))
    return catalogue.sort(list, sortKey)
  }, [catalogue, query, family, sortKey])

  return (
    <div style={{ padding: '24px 20px 90px' }}>
      <h1 className="serif" style={{ fontSize: 30, margin: 0 }}>My <span className="italic">Shelf</span></h1>
      <div style={{ color: 'var(--ink-dim)', fontSize: 11 }}>{catalogue.getAll().length} bottles</div>

      <input
        placeholder="Search your shelf, or any scent..."
        value={query}
        onChange={e => setQuery(e.target.value)}
        style={{ width: '100%', margin: '14px 0', padding: '11px 13px', borderRadius: 14,
          border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,.06)',
          color: 'var(--ink)', fontFamily: 'var(--sans)', fontSize: 13, outline: 'none' }}
      />

      <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginBottom: 14 }}>
        <button onClick={() => setFamily(null)} aria-pressed={family === null} style={chipStyle(family === null)}>all</button>
        {FAMILIES.map(f => (
          <button key={f} onClick={() => setFamily(f)} aria-pressed={family === f} style={chipStyle(family === f)}>{f}</button>
        ))}
      </div>

      <div>
        {rows.map(s => (
          <Link key={s.id} to={`/scent/${s.id}`} data-testid="scent-row"
            style={{ display: 'flex', justifyContent: 'space-between', padding: '11px 0',
              borderBottom: '1px solid rgba(255,255,255,.06)', textDecoration: 'none', color: 'var(--ink)' }}>
            <span>
              <span style={{ fontSize: 8, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--ink-dim)', display: 'block' }}>{s.brand}</span>
              <span className="serif italic" style={{ fontSize: 18 }}>{s.name}</span>
            </span>
            <span style={{ fontSize: 9, color: 'var(--ink-dim)' }}>{s.families.join(' · ')}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}

function chipStyle(active: boolean): React.CSSProperties {
  return {
    fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', cursor: 'pointer',
    padding: '6px 11px', borderRadius: 4, border: '1px solid var(--glass-border)',
    background: active ? 'rgba(202,162,95,.18)' : 'transparent',
    color: active ? 'var(--gold-light)' : 'var(--ink-dim)',
  }
}
