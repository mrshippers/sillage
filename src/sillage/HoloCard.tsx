import type { CSSProperties } from 'react'
import { layeredNotes, type Bottle } from './bottles'
import { useTilt } from './useTilt'

/* The holographic card: the bottle's notes on a surface skinned in its own
 * colour, read top to heart to base, with a column beside them that runs from
 * light (what lifts off first) to heavy (what stays). It leans to a finger and
 * a foil slides across it. A hero treatment: one card, on the opened bottle.
 * A note is only placed in a layer where the catalogue says so; the rest are
 * listed without one. */

const LAYERS = [
  ['top', 'Top'],
  ['heart', 'Heart'],
  ['base', 'Base'],
] as const

export default function HoloCard({ bottle, openNote }: { bottle: Bottle; openNote: (n: string) => void }) {
  const ref = useTilt<HTMLElement>(true, 0.6)
  const layers = layeredNotes(bottle)
  const note = (n: string) => (
    <button key={n} type="button" className="holo-note" onClick={() => openNote(n)}>
      {n}
    </button>
  )
  return (
    <section ref={ref} className="holo" style={bottle.stain ? ({ '--stain': bottle.stain } as CSSProperties) : undefined} aria-label={`${bottle.short}, its notes`}>
      <span className="holo-foil" aria-hidden />
      <span className="holo-grain" aria-hidden />
      <header className="holo-head">
        <span className="holo-house">{bottle.house}</span>
        <span className="holo-name">{bottle.short}</span>
      </header>
      {layers ? (
        <div className="holo-body">
          <span className="holo-vol" aria-hidden />
          <div>
            {LAYERS.map(([k, label]) =>
              layers[k].length ? (
                <div key={k} className="holo-layer">
                  <span className="holo-label">{label}</span>
                  <div className="holo-notes">{layers[k].map(note)}</div>
                </div>
              ) : null,
            )}
          </div>
        </div>
      ) : null}
      {(layers ? layers.rest : bottle.notes).length ? (
        <div className="holo-layer holo-rest">
          {layers ? <span className="holo-label">Also in it</span> : null}
          <div className="holo-notes">{(layers ? layers.rest : bottle.notes).map(note)}</div>
        </div>
      ) : null}
    </section>
  )
}
