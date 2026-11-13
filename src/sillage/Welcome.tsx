import { useEffect, useRef, useState, type CSSProperties } from 'react'
import type { LabelSource } from './bottleModel'

/* The welcome: a fragrance advert, once per session. Tonight's bottle is lit
 * in 3D (welcomeScene.ts) and the wordmark settles over it letter by letter.
 * A tap ends it at once. If the 3D cannot start, the wordmark plays alone. */

const WORD = 'SILLAGE'
const HOLD_MS = 3200 // from the moment the scene is lit to the dissolve

export default function Welcome({ bottle, leaving, skip, done }: { bottle: LabelSource; leaving: boolean; skip: () => void; done: () => void }) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let gone = false
    let api: { start: () => void; dispose: () => void } | null = null
    // never wait more than this for the 3D: the word plays on its own
    const fallback = setTimeout(() => setReady(true), 1200)
    import('./welcomeScene')
      .then(m => Promise.all([document.fonts.load("400 84px 'Bodoni Moda Variable'"), document.fonts.load("500 34px 'Jost Variable'")]).then(() => m))
      .then(m => {
        if (gone || !canvas.current) return
        api = m.createWelcome(canvas.current, bottle)
        api.start()
        clearTimeout(fallback)
        setReady(true)
      })
      .catch(() => setReady(true))
    return () => {
      gone = true
      clearTimeout(fallback)
      api?.dispose()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!ready || leaving) return
    const t = setTimeout(skip, HOLD_MS)
    return () => clearTimeout(t)
  }, [ready, leaving, skip])

  return (
    <div
      className="welcome"
      data-ready={ready ? '' : undefined}
      data-out={leaving ? '' : undefined}
      aria-hidden
      onPointerDown={skip}
      onAnimationEnd={e => e.target === e.currentTarget && e.animationName === 'welcome-out' && done()}
    >
      <canvas ref={canvas} className="welcome-canvas" />
      <div className="welcome-card">
        <span className="wm" aria-label="Sillage">
          {WORD.split('').map((c, i) => (
            <span key={i} className="wm-l" style={{ '--i': i } as CSSProperties}>
              {c}
            </span>
          ))}
        </span>
        <span className="wm-rule" />
        <span className="wm-tag">Intentional imprints</span>
      </div>
    </div>
  )
}
