import { useMemo, useState } from 'react'
import type { Bottle } from './bottles'
import { chemistryOf } from './data'
import { Strip } from './Strip'

const VERDICT = (t: number) =>
  t >= 80 ? 'Made for each other.' : t >= 65 ? 'Strong, complementary character.' : t >= 45 ? 'Interesting tension, apply with care.' : t >= 25 ? 'Competing profiles, risky.' : 'Fighting each other. Wear them apart.'

/* The lab: two or three strips from the shelf, and what they do together. */
export default function Lab({ shelf }: { shelf: Bottle[] }) {
  const profiled = shelf.filter(b => b.profile)
  const [picked, setPicked] = useState<string[]>([])
  const chem = useMemo(() => (picked.length >= 2 ? chemistryOf(picked.map(Number)) : null), [picked])
  const toggle = (id: string) => setPicked(p => (p.includes(id) ? p.filter(x => x !== id) : p.length >= 3 ? p : [...p, id]))

  return (
    <>
      <h1 className="h1">The lab</h1>
      <p className="lede">Two or three from the shelf. The chemistry comes from their profiles.</p>

      <div className="chips wrap" style={{ marginTop: 18 }} role="group" aria-label="Choose up to three">
        {profiled.map(b => (
          <button key={b.id} type="button" className="chip" aria-pressed={picked.includes(b.id)} disabled={!picked.includes(b.id) && picked.length >= 3} onClick={() => toggle(b.id)}>
            {b.short}
          </button>
        ))}
      </div>

      {picked.length ? (
        <div className="rack" style={{ marginTop: 20 }}>
          {picked.map(id => {
            const b = profiled.find(x => x.id === id)
            return b ? <Strip key={id} bottle={b} size="row" /> : null
          })}
        </div>
      ) : null}

      {chem ? (
        <section aria-label="Chemistry">
          <p className="result">{chem.total}</p>
          <p className="muted small">chemistry, of 100</p>
          <p className="verdict">{VERDICT(chem.total)}</p>
          <ul className="bars bars--words" style={{ marginTop: 18 }}>
            {[
              ['Harmony', chem.harmony],
              ['Weight', chem.weight],
              ['Temperature', chem.temperature],
              ['Projection', chem.projection],
            ].map(([l, a]) => {
              const ax = a as { score: number; max: number; verdict: string }
              return (
                <li key={l as string}>
                  <span>{l as string}</span>
                  <span className="bar" aria-hidden>
                    <i style={{ width: `${(ax.score / ax.max) * 100}%` }} />
                  </span>
                  <b>{ax.verdict}</b>
                </li>
              )
            })}
          </ul>
          <h2 className="h2">How it unfolds</h2>
          <p className="para"><b>The first fifteen minutes</b> {chem.opening}</p>
          <p className="para"><b>After an hour</b> {chem.heart}</p>
          <p className="para"><b>The dry-down</b> {chem.drydown}</p>
          <p className="para"><b>How to wear them</b> {chem.application}</p>
        </section>
      ) : (
        <p className="empty small">{picked.length === 1 ? 'Pick one more.' : 'Nothing picked yet.'}</p>
      )}
    </>
  )
}
