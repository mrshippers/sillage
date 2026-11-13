import { useEffect, useRef, useState } from 'react'
import type { Bottle } from './bottles'
import { Strip } from './Strip'

/* The opened bottle leads with the bottle itself, in 3D, named beneath in the
 * house's own order. Where 3D cannot start, the paper strip stands in. */
function webgl() {
  try {
    return !!document.createElement('canvas').getContext('webgl2')
  } catch {
    return false
  }
}

export default function BottleHero({ bottle }: { bottle: Bottle }) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const [ok] = useState(webgl)
  const [lit, setLit] = useState(false)
  useEffect(() => {
    if (!ok || !canvas.current) return
    let gone = false
    let api: { dispose: () => void } | null = null
    import('./bottleViewer').then(m =>
      Promise.all([document.fonts.load("400 84px 'Bodoni Moda Variable'"), document.fonts.load("500 34px 'Jost Variable'")]).then(() => {
        if (gone || !canvas.current) return
        api = m.createViewer(canvas.current, { id: bottle.id, house: bottle.house, name: bottle.short, stain: bottle.stain, notes: bottle.notes })
        setLit(true)
      }),
    )
    return () => {
      gone = true
      api?.dispose()
    }
  }, [ok, bottle])
  if (!ok) return <Strip bottle={bottle} size="hero" />
  return (
    <figure className="bottle-hero" data-lit={lit ? '' : undefined} data-noswipe>
      <canvas ref={canvas} className="bottle-hero-canvas" aria-label={`${bottle.name}. Drag to turn the bottle.`} />
      <figcaption className="bottle-hero-cap">
        <span className="bh-house">{bottle.house}</span>
        <span className="bh-name">{bottle.short}</span>
        {bottle.family ? <span className="bh-family">{bottle.family}</span> : null}
      </figcaption>
    </figure>
  )
}
