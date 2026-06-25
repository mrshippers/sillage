import { useEffect, useMemo, useRef, useState } from 'react'
import { FAMILIES, DEFAULT_FAMILY, familyMembers } from './families'

// The Scent Wheel — families orbit a glowing hub, bobbing on a gentle wobble.
// Tap a family: it swings to the crown, the hub counts your real bottles, and
// the wardrobe below filters. Empty families invite you to explore (the gap in
// your nose). Membership + counts are derived from the real profile axes.
const SERIF = "'Fraunces', 'Georgia', serif"
const GOLD = '#caa25f'

export default function Wheel() {
  const [sel, setSel] = useState(DEFAULT_FAMILY)
  const ringRef = useRef<HTMLDivElement | null>(null)
  const nodeRefs = useRef<(HTMLDivElement | null)[]>([])
  const offRef = useRef(0)
  const targetRef = useRef(0)
  const N = FAMILIES.length
  const R = 108, cx = 150, cy = 150

  const positions = useMemo(() => FAMILIES.map((_, i) => {
    const ang = (i / N) * 2 * Math.PI - Math.PI / 2
    return { x: cx + R * Math.cos(ang), y: cy + R * Math.sin(ang), deg: (ang * 180) / Math.PI }
  }), [N])

  useEffect(() => {
    let target = -90 - positions[sel].deg
    while (target - offRef.current > 180) target -= 360
    while (target - offRef.current < -180) target += 360
    targetRef.current = target
  }, [sel, positions])

  useEffect(() => {
    let raf = 0, t = 0
    const loop = () => {
      t += 0.012
      offRef.current += (targetRef.current - offRef.current) * 0.08
      const rot = offRef.current + Math.sin(t) * 3
      if (ringRef.current) ringRef.current.style.transform = `rotate(${rot}deg)`
      nodeRefs.current.forEach(el => { if (el) el.style.transform = `rotate(${-rot}deg)` })
      raf = requestAnimationFrame(loop)
    }
    loop()
    return () => cancelAnimationFrame(raf)
  }, [])

  const fam = FAMILIES[sel]
  const members = familyMembers(fam.key)

  return (
    <div>
      <div className="H t30">Scent <span className="hi">Wheel</span></div>
      <div className="sub2">Tap a family to filter your shelf</div>

      <div style={{ position: 'relative', width: 300, height: 300, margin: '10px auto 0' }}>
        <div ref={ringRef} style={{ position: 'absolute', inset: 0 }}>
          {FAMILIES.map((f, i) => {
            const selected = i === sel
            const count = familyMembers(f.key).length
            return (
              <div key={f.key} ref={el => { nodeRefs.current[i] = el }} onClick={() => setSel(i)}
                style={{ position: 'absolute', left: positions[i].x, top: positions[i].y, width: 60, margin: '-30px 0 0 -30px', display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}>
                <div style={{
                  width: 54, height: 54, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: f.color,
                  background: `radial-gradient(circle at 50% 38%, ${f.color}55, rgba(8,6,9,0.75))`,
                  border: `1px solid ${selected ? 'rgba(255,236,200,0.8)' : 'rgba(255,255,255,0.18)'}`,
                  boxShadow: selected ? `0 0 22px ${f.color}` : '0 8px 22px rgba(0,0,0,0.5)',
                  filter: `drop-shadow(0 0 6px ${f.color}66)`, transition: 'box-shadow 0.3s, border-color 0.3s',
                }}>{f.glyph}</div>
                <div style={{ fontSize: 7, letterSpacing: '0.14em', textTransform: 'uppercase', marginTop: 5, opacity: 0.85, textShadow: '0 1px 3px #000' }}>{f.name}{count ? '' : ' ·'}</div>
              </div>
            )
          })}
        </div>
        <div style={{
          position: 'absolute', top: '50%', left: '50%', width: 118, height: 118, margin: '-59px 0 0 -59px', borderRadius: '50%',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center',
          border: '1px solid rgba(255,255,255,0.16)', background: `radial-gradient(circle at 50% 36%, ${fam.color}33, #0c0a10 78%)`,
          boxShadow: `inset 0 1px 0 rgba(255,255,255,0.2), 0 20px 50px rgba(0,0,0,0.6)`,
        }}>
          <div style={{ fontSize: 24, color: fam.color, filter: `drop-shadow(0 0 12px ${fam.color})` }}>{fam.glyph}</div>
          <div style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 18, marginTop: 2 }}>{fam.name}</div>
          <div style={{ fontSize: 7.5, letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.65, marginTop: 3 }}>
            {members.length ? `${members.length} ${members.length === 1 ? 'bottle' : 'bottles'}` : 'a gap to explore'}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 16 }} key={fam.key}>
        {members.length === 0 && (
          <div style={{ fontFamily: SERIF, fontStyle: 'italic', opacity: 0.6, textAlign: 'center', padding: 16, fontSize: 14 }}>
            No {fam.name.toLowerCase()} yet — a gap in your nose. Explore the niche →
          </div>
        )}
        {members.map((m, i) => (
          <div key={m.id} className="srow2" style={{ animation: `rise .45s ease ${i * 0.06}s both` }}>
            <div className="sth" style={{ background: `linear-gradient(160deg, ${m.color}, rgba(8,6,9,0.8))` }} />
            <div className="si">
              <div className="sbn">{m.house}</div>
              <div className="snn">{m.short}</div>
              <div className="sfm">{m.notes.slice(0, 3).join(' · ')}</div>
            </div>
            <div className="scc" style={{ color: GOLD }}>{m.longevity}.{m.projection}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
