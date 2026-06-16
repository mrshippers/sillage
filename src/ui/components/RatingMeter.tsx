export function RatingMeter({ score }: { score?: number }) {
  const pct = score !== undefined ? (score / 10) * 100 : 0
  return (
    <div aria-label={score !== undefined ? `Sillage score ${score} out of 10` : 'Unrated'}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span style={{ fontSize: 8, letterSpacing: '.22em', textTransform: 'uppercase', color: 'var(--ink-dim)' }}>
          Sillage score
        </span>
        <span className="serif" style={{ fontSize: 20 }}>
          {score !== undefined ? score : '-'}
          <span style={{ fontSize: 9, color: 'var(--ink-dim)' }}> / 10</span>
        </span>
      </div>
      <div style={{ position: 'relative', height: 6, borderRadius: 4, marginTop: 8,
        background: 'linear-gradient(90deg, #3a2d4a, #8a4a2e, var(--gold))' }}>
        <div style={{ position: 'absolute', left: `${pct}%`, top: '50%', width: 11, height: 11,
          transform: 'translate(-50%,-50%)', borderRadius: '50%', background: '#fff',
          boxShadow: '0 0 8px var(--gold)', opacity: score !== undefined ? 1 : 0 }} />
      </div>
    </div>
  )
}
