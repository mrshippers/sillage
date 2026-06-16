import type { Scent, Layer } from '../../domain/types'
import { GlassCard } from './GlassCard'

const ORDER: Layer[] = ['top', 'heart', 'base']
const LABEL: Record<Layer, string> = { top: 'Top', heart: 'Heart', base: 'Base' }

export function ScentCard({ scent, onClick }: { scent: Scent; onClick?: () => void }) {
  return (
    <GlassCard style={{ cursor: onClick ? 'pointer' : 'default' }}>
      <div onClick={onClick}>
        <div style={{ fontSize: 8, letterSpacing: '.26em', textTransform: 'uppercase', color: 'var(--ink-dim)' }}>
          {scent.brand}
        </div>
        <div className="serif italic" style={{ fontSize: 24 }}>{scent.name}</div>
        <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {ORDER.map(layer => {
            const notes = scent.notes.filter(n => n.layer === layer)
            if (notes.length === 0) return null
            return (
              <div key={layer}>
                <div data-testid="layer-label" style={{ fontSize: 7.5, letterSpacing: '.22em',
                  textTransform: 'uppercase', color: 'var(--ink-dim)' }}>{LABEL[layer]}</div>
                <div style={{ fontSize: 11 }}>{notes.map(n => n.name).join(' · ')}</div>
              </div>
            )
          })}
        </div>
      </div>
    </GlassCard>
  )
}
