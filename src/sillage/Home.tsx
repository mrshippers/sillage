import type { Fragrance } from './data'
import type { NoseProfile } from './families'
import { reasonFor } from './families'
import { Surface } from './Material'
import { radius as R } from './tokens'

/* Home: the greeting, tonight's bottle, the shelf rail and the wardrobe at a
 * glance. Everything reads off the bottles actually on the shelf; finished
 * and wishlist bottles are never suggested. Styles live with the app shell. */
export default function Home({
  greet,
  season,
  sotd,
  onShelf,
  nose,
  onOpen,
}: {
  greet: { hello: string; meta: string }
  season: string
  sotd: Fragrance | null
  onShelf: Fragrance[]
  nose: NoseProfile
  onOpen: (id: number) => void
}) {
  const helloParts = greet.hello.split(' ')
  return (
    <div className="pg" key="home">
      <h1 className="H t-title">
        {helloParts[0]} <span className="hi">{helloParts.slice(1).join(' ')}</span>
      </h1>
      <p className="sub">{greet.meta}</p>

      <div className="eyebrow">Scent of the day</div>
      {sotd ? (
        <Surface scent={sotd} height={268} radius={R.lg} hero shade={0.86} onClick={() => onOpen(sotd.id)}>
          <div className="hero-body">
            <div className="hero-kicker">Tonight, reach for</div>
            <div className="hero-name">{sotd.short}</div>
            <p className="hero-reason">{reasonFor(sotd, season)}</p>
          </div>
        </Surface>
      ) : (
        <div className="empty">Nothing on the shelf to reach for. Put a bottle back on the Shelf.</div>
      )}

      <div className="eyebrow">From your shelf</div>
      {onShelf.length === 0 && <div className="empty">Your shelf is empty</div>}
      <div className="rail">
        {onShelf.slice(0, 8).map(f => (
          <Surface key={f.id} scent={f} radius={R.md} className="railcard" onClick={() => onOpen(f.id)}>
            <div className="railcard-body">
              <div className="railcard-house">{f.house}</div>
              <div className="railcard-name">{f.short}</div>
            </div>
          </Surface>
        ))}
      </div>

      {/* The shelf at a glance - the old Home ended here with ~700px of
          dead black below the rail. */}
      <div className="eyebrow">The wardrobe</div>
      <div className="ledger">
        <div className="ledger-row">
          <span>Bottles</span>
          <span className="ledger-v">{nose.bottles}</span>
        </div>
        <div className="ledger-row">
          <span>Dominant</span>
          <span className="ledger-v">{nose.families[0]?.name ?? '-'}</span>
        </div>
        <div className="ledger-row">
          <span>Anchor</span>
          <span className="ledger-v">{nose.anchor}</span>
        </div>
        <div className="ledger-row">
          <span>Season</span>
          <span className="ledger-v">{season}</span>
        </div>
      </div>
    </div>
  )
}
