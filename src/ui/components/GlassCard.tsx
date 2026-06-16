import type { PropsWithChildren, CSSProperties } from 'react'

export function GlassCard({ children, style }: PropsWithChildren<{ style?: CSSProperties }>) {
  return (
    <div style={{
      background: 'linear-gradient(160deg, rgba(255,255,255,.08), rgba(255,255,255,.02))',
      border: '1px solid var(--glass-border)',
      borderRadius: 'var(--radius)',
      backdropFilter: 'blur(18px)',
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,.2)',
      padding: '16px',
      ...style,
    }}>{children}</div>
  )
}
