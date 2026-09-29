import { useMemo, useState } from 'react'
import { ENERGY_MAP, OCCASION_MAP, TIME_MAP, WEATHER_MAP } from '../domain/selector'
import { fromProfile, type Bottle } from './bottles'
import { scoreOne } from './data'
import { currentSeason, reasonFor, scentOfDay } from './families'
import { Chroma, Strip, Trail } from './Strip'

const DAY = new Intl.DateTimeFormat('en-GB', { weekday: 'long' })
function part(h: number) {
  return h < 5 ? 'night' : h < 12 ? 'morning' : h < 17 ? 'afternoon' : h < 21 ? 'evening' : 'night'
}

/* Tonight: one strip laid out for you, and a way to choose by the evening.
 * Only bottles on your shelf are ever suggested. */
export default function Tonight({
  shelf,
  open,
  wornToday,
  toggleWorn,
}: {
  shelf: Bottle[]
  open: (id: string) => void
  wornToday: (id: string) => boolean
  toggleWorn: (id: string) => void
}) {
  const now = new Date()
  const season = currentSeason(now)
  const profiled = useMemo(() => shelf.filter(b => b.profile).map(b => b.profile!), [shelf])
  const pick = useMemo(() => (profiled.length ? fromProfile(scentOfDay(now, profiled)) : null), [profiled]) // eslint-disable-line react-hooks/exhaustive-deps

  const [weather, setWeather] = useState<string[]>([])
  const [occasion, setOccasion] = useState('')
  const [energy, setEnergy] = useState('')
  const [time, setTime] = useState('')
  const asked = weather.length > 0 || !!occasion || !!energy || !!time
  const results = useMemo(() => {
    if (!asked) return []
    const conditions = { weather, occasion, energy, time }
    return profiled
      .map(f => ({ f, score: scoreOne(f, conditions) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
  }, [asked, profiled, weather, occasion, energy, time])

  const one = (value: string, set: (v: string) => void, current: string) => () => set(current === value ? '' : value)

  return (
    <>
      <h1 className="h1">
        {DAY.format(now)} {part(now.getHours())}
      </h1>
      <p className="lede">{season}, and this is the one.</p>

      {pick ? (
        <section aria-label="Tonight's bottle" style={{ marginTop: 22 }}>
          <Strip bottle={pick} size="hero" onClick={() => open(pick.id)} />
          <Trail bottle={pick} />
          <p className="prose">{reasonFor(pick.profile!, season)}</p>
          <div className="actions">
            <button type="button" className="btn" aria-pressed={wornToday(pick.id)} onClick={() => toggleWorn(pick.id)}>
              {wornToday(pick.id) ? 'Worn tonight' : 'Wearing it tonight'}
            </button>
            <button type="button" className="btn btn-line" onClick={() => open(pick.id)}>
              The bottle
            </button>
          </div>
        </section>
      ) : (
        <p className="empty">Nothing on the shelf to choose from. Put a bottle back on the Shelf.</p>
      )}

      <hr className="sep" />
      <h2 className="h2" style={{ marginTop: 0 }}>Or choose by the evening</h2>

      <p className="label">Outside</p>
      <div className="chips">
        {Object.keys(WEATHER_MAP).map(w => (
          <button key={w} type="button" className="chip" aria-pressed={weather.includes(w)} onClick={() => setWeather(p => (p.includes(w) ? p.filter(x => x !== w) : [...p, w]))}>
            {w}
          </button>
        ))}
      </div>
      <p className="label">Where to</p>
      <div className="chips">
        {Object.keys(OCCASION_MAP).map(o => (
          <button key={o} type="button" className="chip" aria-pressed={occasion === o} onClick={one(o, setOccasion, occasion)}>
            {o}
          </button>
        ))}
      </div>
      <p className="label">How you feel</p>
      <div className="chips">
        {Object.keys(ENERGY_MAP).map(e => (
          <button key={e} type="button" className="chip" aria-pressed={energy === e} onClick={one(e, setEnergy, energy)}>
            {e}
          </button>
        ))}
      </div>
      <p className="label">When</p>
      <div className="chips">
        {Object.keys(TIME_MAP).map(t => (
          <button key={t} type="button" className="chip" aria-pressed={time === t} onClick={one(t, setTime, time)}>
            {t}
          </button>
        ))}
      </div>

      {asked ? (
        <ol className="rack" aria-label="Best for the evening">
          {results.map(({ f, score }) => {
            const b = fromProfile(f)
            return (
              <li key={b.id} className="rack-row">
                <div>
                  <Strip bottle={b} size="row" onClick={() => open(b.id)} />
                  <Chroma bottle={b} />
                </div>
                <div className="rack-side">
                  <span className="score">{score}</span>
                  <span className="status-word">fit</span>
                </div>
              </li>
            )
          })}
        </ol>
      ) : (
        <p className="empty small">Pick anything above and the shelf ranks itself.</p>
      )}
    </>
  )
}
