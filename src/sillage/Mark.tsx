import { useMemo } from 'react'
import { color } from './tokens'
import { buildSpritz } from './markGeometry'

/* The Sillage mark - backlog item #1, the thing that was never built.
 *
 * Concept (from .superpowers/brainstorm/.../logo-v4.html, the final "Ghosted"
 * blend): a slim travel atomiser sits top-right, tilted, nozzle pointing
 * lower-left, ghosted almost into the ground. A fine gold spritz erupts from
 * the nozzle and drifts down and across, getting finer, wider-spread and more
 * transparent as it travels. The object is nearly invisible; the trail is the
 * whole mark. That is what sillage means - the trace a scent leaves behind.
 *
 * Replaces the plain text wordmark in the header and the stock Vite lightning
 * bolt favicon.
 */

/** The full mark on its ground - app icon, splash, favicon.
 *
 * `atomiser` is the blend: 0.4 Ghosted (the default, correct on the dark plum
 * ground), 0.7 Soft, 0.92 Solid. Off its ground the bottle needs lifting or
 * the mark reads as a comet rather than a spritz. */
export function Mark({
  size = 200,
  ground = true,
  glyphs = true,
  atomiser = 0.4,
}: {
  size?: number
  ground?: boolean
  glyphs?: boolean
  atomiser?: number
}) {
  const motes = useMemo(() => buildSpritz(), [])
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" role="img" aria-label="Sillage">
      <defs>
        <radialGradient id="sil-gold" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={color.goldPale} />
          <stop offset="55%" stopColor={color.goldLight} />
          <stop offset="100%" stopColor="#b78a47" />
        </radialGradient>
        <radialGradient id="sil-bg" cx="32%" cy="100%" r="125%">
          <stop offset="0%" stopColor="#36203a" />
          <stop offset="46%" stopColor="#211624" />
          <stop offset="100%" stopColor="#110b14" />
        </radialGradient>
        <filter id="sil-soft" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.1" />
        </filter>
        <filter id="sil-blur" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.4" />
        </filter>
        <filter id="sil-core" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="4.6" />
        </filter>
      </defs>

      {ground && <rect width="200" height="200" fill="url(#sil-bg)" />}
      {ground && (
        <>
          <circle cx="40" cy="180" r="76" fill={color.gold} opacity="0.11" />
          <circle cx="170" cy="44" r="60" fill={color.plum} opacity="0.10" />
        </>
      )}

      {/* Ghost pictograms - hairline glyphs at the threshold of visibility.
          Dropped at small sizes where they would only muddy the mark. */}
      {glyphs && ground && (
        <g stroke={color.ink} fill="none" strokeWidth="1.2" opacity="0.055">
          <g transform="translate(54,52)">
            <circle cx="0" cy="0" r="5" />
            <circle cx="14" cy="6" r="4" />
            <circle cx="4" cy="15" r="3.5" />
            <path d="M0 0 L14 6 M0 0 L4 15" />
          </g>
          <path transform="translate(160,150)" d="M0 0 C7 8 7 14 0 14 C-7 14 -7 8 0 0 Z" />
          <path transform="translate(60,150)" d="M-18 0 q6 -8 12 0 t12 0 t12 0" />
          <path transform="translate(150,96)" d="M0 -8 L7 -4 L7 4 L0 8 L-7 4 L-7 -4 Z" />
        </g>
      )}

      {/* The atomiser - deliberately plain, ghosted into the ground */}
      <g fill={color.ink} opacity={atomiser} filter="url(#sil-soft)" transform="rotate(28 160 40)">
        <rect x="153" y="30" width="13" height="40" rx="6.2" />
        <rect x="156" y="23" width="7" height="8" rx="2" />
        <rect x="157" y="16" width="5.5" height="7" rx="1.8" />
      </g>

      {/* The trail - the actual mark */}
      <g filter="url(#sil-blur)">
        {motes.map((m, i) => (
          <circle key={i} cx={m.x} cy={m.y} r={m.r} fill={m.fill} opacity={m.o} />
        ))}
      </g>

      {/* The core - point of emission, drawn last so it sits on top */}
      <circle cx="150" cy="52" r="7.5" fill="url(#sil-gold)" filter="url(#sil-core)" opacity="0.95" />
      <circle cx="150" cy="52" r="3.6" fill="#fff7e6" />
    </svg>
  )
}

/** Header lockup. Sits clear of the notch - the old text wordmark was drawn at
 * top:14px behind a 26px notch and was clipped on every single screen.
 *
 * Wordmark only, deliberately: the mark's whole idea is a fine spritz trail
 * fading over 150 units, and at 15px that resolves to an illegible speck. It
 * gets used where it has room - the splash and the app icon. */
export function MarkLockup() {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center' }}>
      <span
        style={{
          fontFamily: 'var(--serif)',
          fontSize: 11,
          fontWeight: 400,
          letterSpacing: '0.34em',
          paddingLeft: '0.34em',
          background: `linear-gradient(180deg,${color.goldPale},${color.goldMid} 55%,${color.goldDeep})`,
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        SILLAGE
      </span>
    </span>
  )
}
