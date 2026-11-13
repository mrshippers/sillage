import type { CSSProperties } from 'react'
import { axisValues, fromProfile, type Bottle } from './bottles'
import { chemistryOf, FRAGRANCES } from './data'
import BottleHero from './BottleHero'
import HoloCard from './HoloCard'
import { Strip, Trail } from './Strip'
import { PERSONAL } from '../cloud/cloud'
import { STATUS_LABEL, type Status } from './wardrobeState'

const WHEN = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' })

/* One bottle, opened. Everything here is from its profile or from you. */
export default function ScentPage({
  bottle,
  status,
  setStatus,
  score,
  rate,
  wornToday,
  toggleWorn,
  wearCount,
  lastWorn,
  onShelfIds,
  openNote,
  open,
  removeOwn,
}: {
  bottle: Bottle
  status: Status
  setStatus: (s: Status) => void
  score: number | null
  rate: (s: number | null) => void
  wornToday: boolean
  toggleWorn: () => void
  wearCount: number
  lastWorn: string | null
  onShelfIds: string[]
  openNote: (note: string) => void
  open: (id: string) => void
  removeOwn?: () => void
}) {
  const axes = axisValues(bottle).sort((a, b) => b.value - a.value)
  const p = bottle.profile
  // the best partner already on your shelf, from the chemistry engine
  const partner = p
    ? FRAGRANCES.filter(f => f.id !== p.id && onShelfIds.includes(String(f.id)))
        .map(f => ({ ...f, chemistry: chemistryOf([p.id, f.id])?.total ?? 0 }))
        .filter(f => f.chemistry >= 45)
        .sort((a, b) => b.chemistry - a.chemistry)[0] ?? null
    : null

  return (
    <>
      <BottleHero bottle={bottle} />
      <Trail bottle={bottle} />
      {p ? <p className="prose">{p.description}</p> : null}

      <h2 className="h2">Yours</h2>
      <div className="seg" role="group" aria-label="Where this bottle lives">
        {(['owned', 'finished', 'wishlist'] as const).map(s => (
          <button key={s} type="button" aria-pressed={status === s} onClick={() => setStatus(status === s && !PERSONAL ? 'none' : s)}>
            {s === 'owned' ? 'Shelf' : STATUS_LABEL[s]}
          </button>
        ))}
      </div>

      <p className="label">
        Your score{' '}
        {score !== null ? (
          <>
            <span style={{ color: 'var(--gold)' }}>{score} of 10</span>{' '}
            <button type="button" className="text-btn" onClick={() => rate(null)}>
              Clear
            </button>
          </>
        ) : (
          <span style={{ color: 'var(--graphite)' }}>· slide to score</span>
        )}
      </p>
      <div className="gauge" data-unset={score === null ? '' : undefined}>
        <input
          className="gauge-input"
          type="range"
          min={0}
          max={10}
          step={1}
          defaultValue={score ?? 5}
          key={score ?? 'unset'}
          aria-label="Your score out of 10"
          aria-valuetext={score === null ? 'Not scored' : `${score} out of 10`}
          style={{ '--fill': `${(score ?? 0) * 10}%` } as CSSProperties}
          onPointerUp={e => rate(Number(e.currentTarget.value))}
          onKeyUp={e => rate(Number(e.currentTarget.value))}
          onInput={e => e.currentTarget.style.setProperty('--fill', `${Number(e.currentTarget.value) * 10}%`)}
        />
        <div className="gauge-ticks" aria-hidden>
          {Array.from({ length: 11 }, (_, n) => (
            <span key={n} data-on={score === n ? '' : undefined}>
              {n}
            </span>
          ))}
        </div>
      </div>

      <div className="actions">
        <button type="button" className="btn" aria-pressed={wornToday} onClick={toggleWorn}>
          {wornToday ? 'Worn today' : 'Wore it today'}
        </button>
      </div>
      <p className="para small">
        {wearCount ? `Worn ${wearCount} time${wearCount === 1 ? '' : 's'}${lastWorn ? `, last on ${WHEN.format(new Date(`${lastWorn}T12:00`))}` : ''}.` : 'Not worn yet in the diary.'}
      </p>

      <h2 className="h2">In the bottle</h2>
      <HoloCard bottle={bottle} openNote={openNote} />

      {p ? (
        <>
          <h2 className="h2">Its profile</h2>
          <ul className="bars">
            {axes.map((a, k) => (
              <li key={a.key} style={{ '--k': k } as CSSProperties}>
                <span>{a.label}</span>
                <span className="bar" aria-hidden>
                  <i style={{ width: `${a.value * 10}%` }} />
                </span>
                <b>{a.value}</b>
              </li>
            ))}
          </ul>
          <p className="para">
            <b>Wear it</b> {p.pulsePoints}
          </p>
          <p className="para">
            <b>What it does</b> {p.effect}
          </p>
          {partner ? (
            <>
              <h2 className="h2">Layers well with</h2>
              <Strip bottle={fromProfile(partner)} size="row" onClick={() => open(String(partner.id))} />
              <p className="para small">Chemistry {partner.chemistry} of 100, from the two profiles.</p>
            </>
          ) : null}
        </>
      ) : (
        <>
          <h2 className="h2">Its profile</h2>
          <p className="para">
            Not profiled yet. Scores, the trail and pairings come from a real profile, never a guess, so this bottle sits out of them until it has one.
          </p>
          {removeOwn ? (
            <div className="actions">
              <button type="button" className="btn btn-line" onClick={removeOwn}>
                Remove this bottle
              </button>
            </div>
          ) : null}
        </>
      )}
    </>
  )
}
