import { useEffect, useRef, useState } from 'react'
import type { Bottle } from './bottles'
import { createCabinet, type CabinetApi } from './cabinetScene'

/* The cabinet on the Shelf: the three.js scene plus the caption that names
 * the bottle at the front. Loaded on its own so the rest of the app paints first. */

function webgl(): boolean {
  try {
    return !!document.createElement('canvas').getContext('webgl2')
  } catch {
    return false
  }
}

export default function Cabinet({ bottles, open }: { bottles: Bottle[]; open: (id: string) => void }) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const api = useRef<CabinetApi | null>(null)
  const list = useRef(bottles)
  const [front, setFront] = useState(0)
  const [ok] = useState(webgl)

  useEffect(() => {
    list.current = bottles
  })

  useEffect(() => {
    const c = canvas.current
    if (!c || !ok) return
    let gone = false
    let cab: CabinetApi | null = null
    // build after the page has landed: compiling glass shaders mid-swipe drops the frames that matter most
    const start = setTimeout(() => {
      if (gone) return
      cab = createCabinet(c, { onFront: setFront, onOpen: i => open(list.current[i].id) })
      api.current = cab
      // the labels are drawn in the brand faces, so wait for them before stocking the shelf
      Promise.all([document.fonts.load("400 84px 'Bodoni Moda Variable'"), document.fonts.load("500 34px 'Jost Variable'")])
        .catch(() => undefined)
        .then(() => !gone && cab?.setBottles(list.current.map(b => ({ id: b.id, house: b.house, name: b.short, stain: b.stain, notes: b.notes }))))
    }, 380)
    return () => {
      gone = true
      clearTimeout(start)
      cab?.dispose()
      api.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ok])

  const sig = bottles.map(b => b.id).join('|')
  const first = useRef(true)
  useEffect(() => {
    if (first.current) return void (first.current = false)
    api.current?.setBottles(list.current.map(b => ({ id: b.id, house: b.house, name: b.short, stain: b.stain, notes: b.notes })))
  }, [sig])

  if (!ok || !bottles.length) return null
  const b = bottles[Math.min(front, bottles.length - 1)]
  return (
    <figure className="cabinet" data-noswipe>
      <canvas ref={canvas} className="cabinet-canvas" aria-label={`Your shelf as a cabinet. ${b.short} by ${b.house} is at the front. Drag to turn it.`} />
      <figcaption className="cabinet-cap glass">
        <span className="cabinet-who">
          <span className="cabinet-house">{b.house}</span>
          <span className="cabinet-name" key={b.id}>{b.short}</span>
        </span>
        <button type="button" className="btn btn-lq" onClick={() => open(b.id)}>
          Open
        </button>
      </figcaption>
    </figure>
  )
}
