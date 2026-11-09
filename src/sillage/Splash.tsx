/* The open: smoke blooms, the wordmark draws in under a sweep of light, then
 * the whole thing dissolves into Tonight. Once per session, a tap skips it.
 * The page underneath holds its first frame until the dissolve starts (see
 * data-splash in atelier.css), so it arrives out of the smoke, not after it. */
export default function Splash({ leaving, skip, done }: { leaving: boolean; skip: () => void; done: () => void }) {
  return (
    <div
      className="splash"
      data-out={leaving ? '' : undefined}
      aria-hidden
      onPointerDown={skip}
      onAnimationEnd={e => e.animationName === 'splash-out' && done()}
    >
      <i className="splash-aura a1" />
      <i className="splash-aura a2" />
      <i className="splash-aura a3" />
      <div className="splash-mark">
        <span className="splash-word">SILLAGE</span>
        <span className="splash-rule" />
        <span className="splash-tag">Intentional imprints</span>
      </div>
    </div>
  )
}
