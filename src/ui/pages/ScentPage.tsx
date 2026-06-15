import { useParams } from 'react-router-dom'
import type { Catalogue } from '../../domain/catalogue'
import type { Wardrobe } from '../../domain/wardrobe'
import { RatingMeter } from '../components/RatingMeter'
import { suggestPairings } from '../../domain/pairings'

export function ScentPage({ catalogue, wardrobe }: { catalogue: Catalogue; wardrobe: Wardrobe }) {
  const { id = '' } = useParams()
  const scent = catalogue.getById(id)
  if (!scent) return <div style={{ padding: 24 }} className="serif italic">Scent not found.</div>

  const entry = wardrobe.get(id)
  const owned = wardrobe.list()
    .map(e => catalogue.getById(e.scentId))
    .filter((s): s is NonNullable<typeof s> => Boolean(s))
  const pairings = suggestPairings(scent, owned)

  return (
    <div style={{ padding: '24px 20px 90px', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div>
        <div style={{ fontSize: 9, letterSpacing: '.24em', textTransform: 'uppercase', color: 'var(--gold)' }}>
          {scent.brand}{scent.year ? ` · ${scent.year}` : ''}
        </div>
        <h1 className="serif italic" style={{ fontSize: 44, margin: '4px 0' }}>{scent.name}</h1>
        <div style={{ fontSize: 10, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--ink-dim)' }}>
          {scent.families.join(' · ')}
        </div>
      </div>

      <RatingMeter score={entry?.score} />

      <div>
        <div style={{ fontSize: 8, letterSpacing: '.22em', textTransform: 'uppercase', color: 'var(--ink-dim)', marginBottom: 8 }}>Dominant accords</div>
        {scent.accords.map(a => (
          <div key={a.name} style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '6px 0' }}>
            <span style={{ width: 64, fontSize: 11, textTransform: 'capitalize' }}>{a.name}</span>
            <span style={{ height: 7, borderRadius: 4, width: `${a.strength * 100}%`, maxWidth: 200, background: 'var(--gold)' }} />
          </div>
        ))}
      </div>

      {pairings.length > 0 && (
        <div>
          <div style={{ fontSize: 8, letterSpacing: '.22em', textTransform: 'uppercase', color: 'var(--ink-dim)', marginBottom: 8 }}>Pairs with your shelf</div>
          {pairings.map(p => (
            <div key={p.scent.id} className="serif italic" style={{ fontSize: 15, padding: '4px 0' }}>{p.scent.name}</div>
          ))}
        </div>
      )}
    </div>
  )
}
