import { useEffect, useMemo, useRef, useState } from 'react'
import { FAMILIES, DEFAULT_FAMILY, familyMembers } from './families'
import type { Family } from './families'
import { useReducedMotion } from './useReducedMotion'
import { color, font, gold, ink, radius as R, shadow, tint, type, veil, white } from './tokens'

// The Scent Wheel - families orbit a glowing hub. Tap a family: it swings to
// the crown, the hub counts your real bottles, and the wardrobe below filters.
// Membership + counts are derived from the real profile axes.
//
// The gems used to be typographic dingbats on a flat radial gradient. They are
// now drawn marks on the same material stack as the rest of the app, and the
// orbit stills completely under prefers-reduced-motion.

export function FamilyIcon({ family, size = 22, stroke }: { family: Family; size?: number; stroke?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke={stroke || family.color}
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {family.icon.map((d, i) => (
        <path key={i} d={d} />
      ))}
    </svg>
  )
}

export default function Wheel() {
  const [sel, setSel] = useState(DEFAULT_FAMILY)
  const ringRef = useRef<HTMLDivElement | null>(null)
  const nodeRefs = useRef<(HTMLDivElement | null)[]>([])
  const offRef = useRef(0)
  const targetRef = useRef(0)
  const reduced = useReducedMotion()
  const N = FAMILIES.length
  const R_ORBIT = 108
  const cx = 150
  const cy = 150

  const positions = useMemo(
    () =>
      FAMILIES.map((_, i) => {
        const ang = (i / N) * 2 * Math.PI - Math.PI / 2
        return { x: cx + R_ORBIT * Math.cos(ang), y: cy + R_ORBIT * Math.sin(ang), deg: (ang * 180) / Math.PI }
      }),
    [N],
  )

  useEffect(() => {
    let target = -90 - positions[sel].deg
    while (target - offRef.current > 180) target -= 360
    while (target - offRef.current < -180) target += 360
    targetRef.current = target
  }, [sel, positions])

  useEffect(() => {
    // Reduced motion: snap to the selected family, paint once, run no loop.
    if (reduced) {
      offRef.current = targetRef.current
      if (ringRef.current) ringRef.current.style.transform = `rotate(${offRef.current}deg)`
      nodeRefs.current.forEach(el => {
        if (el) el.style.transform = `rotate(${-offRef.current}deg)`
      })
      return
    }
    let raf = 0
    let t = 0
    const loop = () => {
      t += 0.012
      offRef.current += (targetRef.current - offRef.current) * 0.08
      const rot = offRef.current + Math.sin(t) * 3
      if (ringRef.current) ringRef.current.style.transform = `rotate(${rot}deg)`
      nodeRefs.current.forEach(el => {
        if (el) el.style.transform = `rotate(${-rot}deg)`
      })
      raf = requestAnimationFrame(loop)
    }
    loop()
    return () => cancelAnimationFrame(raf)
  }, [reduced, sel])

  const fam = FAMILIES[sel]
  const members = familyMembers(fam.key)

  return (
    <div>
      <h1 className="H t-title">
        Scent <span className="hi">Wheel</span>
      </h1>
      <p className="sub">Tap a family to filter your shelf</p>

      <div style={{ position: 'relative', width: 300, height: 300, margin: '14px auto 0' }}>
        <div ref={ringRef} style={{ position: 'absolute', inset: 0 }}>
          {FAMILIES.map((f, i) => {
            const selected = i === sel
            const count = familyMembers(f.key).length
            return (
              <div
                key={f.key}
                ref={el => {
                  nodeRefs.current[i] = el
                }}
                onClick={() => setSel(i)}
                style={{
                  position: 'absolute',
                  left: positions[i].x,
                  top: positions[i].y,
                  width: 60,
                  margin: '-30px 0 0 -30px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  cursor: 'pointer',
                }}
              >
                <div
                  className="gem"
                  style={{
                    background: `radial-gradient(115% 95% at 32% 22%, ${tint(f.color, 0.5)} 0%, ${veil(0.82)} 62%, ${veil(0.96)} 100%)`,
                    borderColor: selected ? gold(0.65) : white(0.14),
                    boxShadow: selected ? `0 0 20px ${tint(f.color, 0.45)}, ${shadow.lift}` : shadow.lift,
                    opacity: count ? 1 : 0.45,
                  }}
                >
                  <FamilyIcon family={f} size={22} stroke={selected ? color.goldLight : f.color} />
                  <span className="grain" />
                </div>
                <span
                  className="gem-label"
                  style={{ color: selected ? color.goldLight : ink(0.72) }}
                >
                  {f.name}
                </span>
              </div>
            )
          })}
        </div>

        <div className="hub">
          <FamilyIcon family={fam} size={26} stroke={color.goldLight} />
          <div style={{ fontFamily: font.display, fontStyle: 'italic', fontSize: type.lead, marginTop: 4 }}>{fam.name}</div>
          <div className="hub-count">
            {members.length ? `${members.length} ${members.length === 1 ? 'bottle' : 'bottles'}` : 'a gap to explore'}
          </div>
          <span className="grain" />
        </div>
      </div>

      <div style={{ marginTop: 20 }} key={fam.key}>
        {members.length === 0 && (
          <p
            style={{
              fontFamily: font.display,
              fontStyle: 'italic',
              color: ink(0.55),
              textAlign: 'center',
              padding: 20,
              fontSize: type.body,
              margin: 0,
            }}
          >
            No {fam.name.toLowerCase()} yet - a gap in your nose.
          </p>
        )}
        {members.map(m => (
          <div key={m.id} className="srow">
            <div
              className="sth"
              style={{
                background: `radial-gradient(120% 100% at 28% 18%, ${tint(m.color, 0.85)} 0%, ${veil(0.72)} 58%, ${veil(0.95)} 100%)`,
              }}
            >
              <span className="grain" />
              <span className="rim" style={{ borderRadius: R.sm }} />
            </div>
            <div className="si">
              <div className="sbn">{m.house}</div>
              <div className="snn">{m.short}</div>
              <div className="sfm">{m.notes.slice(0, 3).join(' · ')}</div>
            </div>
            <div className="scc">
              {m.longevity}.{m.projection}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
