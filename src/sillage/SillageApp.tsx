import { useState, useMemo, useEffect, useRef } from 'react'
import { WEATHER_MAP, OCCASION_MAP, ENERGY_MAP, TIME_MAP } from '../domain/selector'
import { FRAGRANCES, scoreOne, chemistryOf, getLayerPartner } from './data'
import { deriveNose, scentOfDay, greeting, reasonFor, currentSeason } from './families'
import Smoke from './Smoke'
import Splash from './Splash'
import Wheel from './Wheel'
import { Mesh, Surface } from './Material'
import { materialCSS } from './materialCSS'
import { useReducedMotion } from './useReducedMotion'
import { MarkLockup } from './Mark'
import { color, cssVars, gold, ink, radius as R, shadow, tint, type as T, veil, white } from './tokens'

/* The whole app in one phone - splash open, breathing Home, living Wheel,
 * Shelf, Perfumery Lab, Daily Selector, your Nose and Settings. Bones are the
 * typed engines; brain is the original's mood + chemistry. Real data only.
 *
 * Every colour, size, radius, duration and easing comes from ./tokens. No
 * literals in this file - the surface has to stay retintable from the palette.
 */

type PageId = 'home' | 'wheel' | 'shelf' | 'layer' | 'daily' | 'profile' | 'settings'

const ICONS: Record<PageId, string> = {
  home: 'M7 20V11l5-4 5 4v9M10 20v-4.5a2 2 0 014 0V20',
  wheel:
    'M12 12m-8.5 0a8.5 8.5 0 1017 0a8.5 8.5 0 10-17 0M12 12m-2.4 0a2.4 2.4 0 104.8 0a2.4 2.4 0 10-4.8 0M12 3.5v6M12 14.5v6M3.5 12h6M14.5 12h6',
  shelf: 'M3 7h18M4.5 7l1.3 12a1 1 0 001 .9h10.4a1 1 0 001-.9L19.5 7M8 7V5a4 4 0 018 0v2',
  layer: 'M9 12a5.4 5.4 0 1010.8 0A5.4 5.4 0 109 12zM4.2 12a5.4 5.4 0 1010.8 0A5.4 5.4 0 104.2 12z',
  daily:
    'M12 12m-4.2 0a4.2 4.2 0 108.4 0a4.2 4.2 0 10-8.4 0M12 3v2.2M12 18.8V21M3 12h2.2M18.8 12H21M5.6 5.6l1.5 1.5M16.9 16.9l1.5 1.5M18.4 5.6l-1.5 1.5M7.1 16.9l-1.5 1.5',
  profile:
    'M12 7.5m-3 0a3 3 0 106 0a3 3 0 10-6 0M6.5 15m-2 0a2 2 0 104 0a2 2 0 10-4 0M17.5 15m-2 0a2 2 0 104 0a2 2 0 10-4 0M9.6 9l-1.6 4.2M14.4 9l1.6 4.2',
  settings: 'M4 8h10M18 8h2M4 16h2M10 16h10M16 8m-2.4 0a2.4 2.4 0 104.8 0a2.4 2.4 0 10-4.8 0M8 16m-2.4 0a2.4 2.4 0 104.8 0a2.4 2.4 0 10-4.8 0',
}

// "Lab" not "Perfumery" - at 9px (the type floor) a nine-character label
// overflowed its 50px nav slot and crowded its neighbours. The page keeps its
// full title.
const NAV: { id: PageId; label: string }[] = [
  { id: 'home', label: 'Home' },
  { id: 'wheel', label: 'Wheel' },
  { id: 'shelf', label: 'Shelf' },
  { id: 'layer', label: 'Lab' },
  { id: 'daily', label: 'Daily' },
  { id: 'profile', label: 'Nose' },
  { id: 'settings', label: 'Settings' },
]

export default function SillageApp() {
  const [splashing, setSplashing] = useState(true)
  const [page, setPage] = useState<PageId>('home')
  const reduced = useReducedMotion()

  // settings (functional)
  const [shimmer, setShimmer] = useState<'subtle' | 'pronounced'>('subtle')
  const [bg, setBg] = useState<'smoke' | 'mesh'>('smoke')
  const [reminder, setReminder] = useState(true)

  // shelf
  const [query, setQuery] = useState('')
  const [season, setSeason] = useState<string | null>(null)
  const [sortKey, setSortKey] = useState<'score' | 'name'>('score')
  const [openId, setOpenId] = useState<number | null>(null)
  // daily
  const [selWeather, setSelWeather] = useState<string[]>([])
  const [selOccasion, setSelOccasion] = useState('')
  const [selEnergy, setSelEnergy] = useState('')
  const [selTime, setSelTime] = useState('')
  const [showResults, setShowResults] = useState(false)
  // perfumery
  const [lab, setLab] = useState<number[]>([])
  const [showChem, setShowChem] = useState(false)

  const navRef = useRef<HTMLDivElement | null>(null)
  const indRef = useRef<HTMLDivElement | null>(null)
  const itemRefs = useRef<Record<string, HTMLButtonElement | null>>({})
  useEffect(() => {
    const el = itemRefs.current[page]
    const nav = navRef.current
    const ind = indRef.current
    if (!el || !nav || !ind) return
    const nr = nav.getBoundingClientRect()
    const er = el.getBoundingClientRect()
    ind.style.left = `${er.left - nr.left}px`
    ind.style.width = `${er.width}px`
  }, [page, splashing])

  const season0 = currentSeason()
  const greet = useMemo(() => greeting(), [])
  const sotd = useMemo(() => scentOfDay(), [])

  const shelf = useMemo(() => {
    let list = [...FRAGRANCES]
    if (season) list = list.filter(f => f.season.includes(season))
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter(
        f =>
          f.name.toLowerCase().includes(q) ||
          f.house.toLowerCase().includes(q) ||
          f.family.toLowerCase().includes(q) ||
          f.notes.some(n => n.toLowerCase().includes(q)),
      )
    }
    list.sort(
      sortKey === 'name'
        ? (a, b) => a.short.localeCompare(b.short)
        : (a, b) => b.projection + b.longevity - (a.projection + a.longevity),
    )
    return list
  }, [query, season, sortKey])

  const results = useMemo(() => {
    if (!showResults) return []
    const conditions = { weather: selWeather, occasion: selOccasion, energy: selEnergy, time: selTime }
    return FRAGRANCES.map(f => ({ ...f, score: scoreOne(f, conditions) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
  }, [showResults, selWeather, selOccasion, selEnergy, selTime])
  const layer = useMemo(() => (results.length ? getLayerPartner(results[0], results.map(r => r.id)) : null), [results])
  const chem = useMemo(() => (showChem ? chemistryOf(lab) : null), [showChem, lab])
  const nose = useMemo(() => deriveNose(), [])

  const canGenerate = selWeather.length > 0 || !!selOccasion || !!selEnergy || !!selTime
  const resetDaily = () => {
    setSelWeather([])
    setSelOccasion('')
    setSelEnergy('')
    setSelTime('')
    setShowResults(false)
  }
  const toggleWeather = (w: string) => {
    setShowResults(false)
    setSelWeather(p => (p.includes(w) ? p.filter(x => x !== w) : [...p, w]))
  }
  const toggleLab = (id: number) => {
    setShowChem(false)
    setLab(p => (p.includes(id) ? p.filter(x => x !== id) : p.length >= 3 ? p : [...p, id]))
  }
  const scoreColor = (s: number) => (s >= 75 ? color.good : s >= 50 ? color.gold : s >= 30 ? color.fair : color.poor)
  const goShelf = (id: number) => {
    setPage('shelf')
    setOpenId(id)
  }
  const helloParts = greet.hello.split(' ')

  return (
    <div className="stage">
      <div className="stage-inner">
        {bg === 'smoke' && (
          <Smoke
            opacity={shimmer === 'pronounced' ? 0.85 : 0.45}
            count={shimmer === 'pronounced' ? 22 : 14}
            style={{ zIndex: 0 }}
          />
        )}

        <div className="phone">
          <div className="notch" />
          <div className="chrome">
            <MarkLockup />
          </div>

          {bg === 'mesh' && <Mesh opacity={0.85} />}

          {/* HOME */}
          {page === 'home' && (
            <div className="pg" key="home">
              <h1 className="H t-title">
                {helloParts[0]} <span className="hi">{helloParts.slice(1).join(' ')}</span>
              </h1>
              <p className="sub">{greet.meta}</p>

              <div className="eyebrow">Scent of the day</div>
              <Surface scent={sotd} height={268} radius={R.lg} hero shade={0.86} onClick={() => goShelf(sotd.id)}>
                <div className="hero-body">
                  <div className="hero-kicker">Tonight, reach for</div>
                  <div className="hero-name">{sotd.short}</div>
                  <p className="hero-reason">{reasonFor(sotd, season0)}</p>
                </div>
              </Surface>

              <div className="eyebrow">From your shelf</div>
              <div className="rail">
                {FRAGRANCES.slice(0, 8).map(f => (
                  <Surface key={f.id} scent={f} radius={R.md} className="railcard" onClick={() => goShelf(f.id)}>
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
                  <span className="ledger-v">{season0}</span>
                </div>
              </div>
            </div>
          )}

          {/* WHEEL */}
          {page === 'wheel' && (
            <div className="pg" key="wheel">
              <Wheel />
            </div>
          )}

          {/* SHELF */}
          {page === 'shelf' && (
            <div className="pg" key="shelf">
              <h1 className="H t-title">
                My <span className="hi">Shelf</span>
              </h1>
              <p className="sub">{FRAGRANCES.length} bottles · hand-profiled</p>

              <div className="search">
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke={ink(0.55)} strokeWidth="1.6">
                  <circle cx="11" cy="11" r="7" />
                  <path d="M21 21l-4-4" />
                </svg>
                <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search your shelf, or any note" />
              </div>

              <div className="filterbar">
                <div className="tagset">
                  {[null, 'Spring', 'Summer', 'Autumn', 'Winter'].map(s => (
                    <button key={s || 'all'} className={`tag${season === s ? ' on' : ''}`} onClick={() => setSeason(s)}>
                      {s || 'All'}
                    </button>
                  ))}
                </div>
                <button className="tag ghosttag" onClick={() => setSortKey(k => (k === 'score' ? 'name' : 'score'))}>
                  {sortKey === 'score' ? 'Score' : 'A–Z'}
                </button>
              </div>

              {shelf.length === 0 && <div className="empty">Nothing matches</div>}

              {shelf.map(f => {
                const open = openId === f.id
                return (
                  <div key={f.id} className="srow" onClick={() => setOpenId(open ? null : f.id)} style={{ cursor: 'pointer' }}>
                    <div
                      className="sth"
                      style={{
                        background: `radial-gradient(120% 100% at 28% 18%, ${tint(f.color, 0.85)} 0%, ${veil(0.72)} 58%, ${veil(0.95)} 100%)`,
                      }}
                    >
                      <span className="grain" />
                      <span className="rim" style={{ borderRadius: R.sm }} />
                    </div>
                    <div className="si">
                      <div className="sbn">{f.house}</div>
                      <div className="snn">{f.short}</div>
                      <div className="sfm">{f.family}</div>
                    </div>
                    <div className="scc">
                      {f.longevity}.{f.projection}
                    </div>
                    {open && (
                      <div className="sopen">
                        <p className="sdesc">{f.description}</p>
                        <div className="meterpair">
                          <div>
                            <div className="lab">Projection</div>
                            <Meter value={f.projection} />
                          </div>
                          <div>
                            <div className="lab">Longevity</div>
                            <Meter value={f.longevity} />
                          </div>
                        </div>
                        <div className="notes">
                          {f.notes.map(n => (
                            <span key={n} className="note">
                              {n}
                            </span>
                          ))}
                        </div>
                        <div className="sline">
                          <span className="key">Wear</span> {f.pulsePoints}
                        </div>
                        <div className="sline">
                          <span className="key">Effect</span> {f.effect}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* PERFUMERY */}
          {page === 'layer' && (
            <div className="pg" key="layer">
              <h1 className="H t-title">
                Perfumery <span className="hi">Lab</span>
              </h1>
              <p className="sub">Layer two or three, find the chemistry</p>

              <div className="slots">
                {[0, 1, 2].map(i => {
                  const id = lab[i]
                  const f = id != null ? FRAGRANCES.find(x => x.id === id) : null
                  return f ? (
                    <Surface key={i} scent={f} radius={R.md} className="slot" onClick={() => toggleLab(f.id)}>
                      <div className="slot-label">{f.short}</div>
                    </Surface>
                  ) : (
                    <div key={i} className="slot slot-empty">
                      <span className="slot-mark" />
                    </div>
                  )
                })}
              </div>

              <div className="eyebrow">Choose from the shelf · {lab.length}/3</div>
              <div className="picks">
                {FRAGRANCES.map(f => {
                  const active = lab.includes(f.id)
                  const disabled = !active && lab.length >= 3
                  return (
                    <button key={f.id} className={`pick${active ? ' on' : ''}`} disabled={disabled} onClick={() => toggleLab(f.id)}>
                      <span className="pick-rule" style={{ background: active ? tint(f.color, 1) : tint(f.color, 0.35) }} />
                      <span className="pick-txt">
                        <span className="pickn">{f.short}</span>
                        <span className="pickf">{f.house}</span>
                      </span>
                    </button>
                  )
                })}
              </div>

              <div className="actions">
                <button className="cta" disabled={lab.length < 2} onClick={() => setShowChem(true)}>
                  Test Chemistry
                </button>
                <button
                  className="ghost"
                  onClick={() => {
                    setLab([])
                    setShowChem(false)
                  }}
                >
                  Clear
                </button>
              </div>

              {showChem && chem && (
                <div style={{ marginTop: 28 }} key={chem.names.join()}>
                  <div style={{ textAlign: 'center' }}>
                    <div className="chem-score" style={{ color: scoreColor(chem.total) }}>
                      {chem.total}
                    </div>
                    <div className="eyebrow centered">Chemistry Score</div>
                    <div className="chem-names">{chem.names.join(' × ')}</div>
                    <p className="chem-verdict">
                      {chem.total >= 80
                        ? 'Made for each other.'
                        : chem.total >= 65
                          ? 'Strong, complementary character.'
                          : chem.total >= 45
                            ? 'Interesting tension, apply with care.'
                            : chem.total >= 25
                              ? 'Competing profiles, risky.'
                              : 'Fighting each other, wear apart.'}
                    </p>
                  </div>

                  <div className="axes">
                    {[
                      { l: 'Harmony', ...chem.harmony },
                      { l: 'Weight', ...chem.weight },
                      { l: 'Temperature', ...chem.temperature },
                      { l: 'Projection', ...chem.projection },
                    ].map(a => {
                      const col =
                        a.verdict === 'Excellent'
                          ? color.good
                          : a.verdict === 'Good'
                            ? color.gold
                            : a.verdict === 'Fair'
                              ? color.fair
                              : color.poor
                      return (
                        <div key={a.l}>
                          <div className="axis-head">
                            <span className="lab">{a.l}</span>
                            <span className="axis-verdict" style={{ color: col }}>
                              {a.verdict}
                            </span>
                          </div>
                          <div className="track">
                            <div className="track-fill" style={{ width: `${(a.score / a.max) * 100}%`, background: col }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <div className="eyebrow">The Journey</div>
                  {[
                    { p: 'Opening', t: chem.opening, w: '0–15 min' },
                    { p: 'Heart', t: chem.heart, w: '15 min–3 hr' },
                    { p: 'Dry-down', t: chem.drydown, w: '3 hr +' },
                  ].map(s => (
                    <div key={s.p} className="stage-row">
                      <div className="stage-when">
                        <div className="stage-phase">{s.p}</div>
                        <div className="stage-clock">{s.w}</div>
                      </div>
                      <p className="stage-txt">{s.t}</p>
                    </div>
                  ))}

                  <div className="panel">
                    <div className="lab">How to wear it</div>
                    <p className="panel-txt">{chem.application}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* DAILY */}
          {page === 'daily' && (
            <div className="pg" key="daily">
              <h1 className="H t-title">
                Daily <span className="hi">Selector</span>
              </h1>
              <p className="sub">Tonight's pick, from how you feel</p>

              <Group label="Conditions">
                {Object.keys(WEATHER_MAP).map(w => (
                  <button key={w} className={`tag${selWeather.includes(w) ? ' on' : ''}`} onClick={() => toggleWeather(w)}>
                    {w}
                  </button>
                ))}
              </Group>
              <Group label="How do you feel?">
                {Object.keys(ENERGY_MAP).map(e => (
                  <button
                    key={e}
                    className={`tag${selEnergy === e ? ' on' : ''}`}
                    onClick={() => {
                      setShowResults(false)
                      setSelEnergy(selEnergy === e ? '' : e)
                    }}
                  >
                    {e}
                  </button>
                ))}
              </Group>
              <Group label="Where to?">
                {Object.keys(OCCASION_MAP).map(o => (
                  <button
                    key={o}
                    className={`tag${selOccasion === o ? ' on' : ''}`}
                    onClick={() => {
                      setShowResults(false)
                      setSelOccasion(selOccasion === o ? '' : o)
                    }}
                  >
                    {o}
                  </button>
                ))}
              </Group>
              <Group label="Time of day">
                {Object.keys(TIME_MAP).map(t => (
                  <button
                    key={t}
                    className={`tag${selTime === t ? ' on' : ''}`}
                    onClick={() => {
                      setShowResults(false)
                      setSelTime(selTime === t ? '' : t)
                    }}
                  >
                    {t}
                  </button>
                ))}
              </Group>

              <div className="actions">
                <button className="cta" disabled={!canGenerate} onClick={() => setShowResults(true)}>
                  Select Scent
                </button>
                <button className="ghost" onClick={resetDaily}>
                  Reset
                </button>
              </div>

              {showResults &&
                results.length > 0 &&
                (() => {
                  const top = results[0]
                  return (
                    <div style={{ marginTop: 26 }} key={top.id}>
                      <Surface scent={top} height={212} radius={R.lg} hero shade={0.86}>
                        <div className="hero-body">
                          <div className="hero-kicker">
                            {top.mood} · {top.score}% match
                          </div>
                          <div className="hero-name" style={{ fontSize: T.title }}>
                            {top.short}
                          </div>
                          <p className="hero-reason">{top.description}</p>
                        </div>
                      </Surface>
                      <div className="sline" style={{ marginTop: 14 }}>
                        <span className="key">Apply</span> {top.pulsePoints}
                      </div>
                      {layer && (
                        <div className="panel">
                          <div className="lab">Optional layer · {layer.chemistry}% chemistry</div>
                          <div className="layer-row">
                            <span className="pick-rule" style={{ background: tint(layer.color, 1) }} />
                            <div>
                              <div className="layer-name">{layer.name}</div>
                              <p className="layer-how">
                                {(() => {
                                  const [b, t] = layer.warmth >= top.warmth ? [layer, top] : [top, layer]
                                  return `${b.short} to the chest first, then ${t.short} at the wrists.`
                                })()}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                      <div className="eyebrow">Alternatives</div>
                      {results.slice(1).map(r => (
                        <div key={r.id} className="alt">
                          <span className="altv">{r.short}</span>
                          <span className="alts">{r.score}%</span>
                        </div>
                      ))}
                    </div>
                  )
                })()}
            </div>
          )}

          {/* PROFILE - your nose */}
          {page === 'profile' && (
            <div className="pg" key="profile">
              <h1 className="H t-title">
                Your <span className="hi">Nose</span>
              </h1>
              <p className="sub">Mapped from what you own and how it's profiled</p>

              <div className="eyebrow">Dominant families</div>
              {nose.families.map(fam => (
                <div key={fam.name} className="fam-row">
                  <span className="fam-name">{fam.name}</span>
                  <div className="track">
                    <div className="track-fill" style={{ width: `${fam.pct}%`, background: tint(fam.color, 0.9) }} />
                  </div>
                  <span className="fam-pct">{fam.pct}%</span>
                </div>
              ))}

              <div className="eyebrow">Signature notes</div>
              <div className="notes">
                {nose.notes.map((n, i) => (
                  <span key={n} className={`note${i === 0 ? ' lead' : ''}`}>
                    {n}
                  </span>
                ))}
              </div>

              <div className="eyebrow">At a glance</div>
              <div className="ledger">
                <div className="ledger-row">
                  <span>Bottles</span>
                  <span className="ledger-v">{nose.bottles}</span>
                </div>
                <div className="ledger-row">
                  <span>Average longevity</span>
                  <span className="ledger-v">{nose.avgLongevity}</span>
                </div>
                <div className="ledger-row">
                  <span>Anchor scent</span>
                  <span className="ledger-v">{nose.anchor}</span>
                </div>
              </div>
            </div>
          )}

          {/* SETTINGS */}
          {page === 'settings' && (
            <div className="pg" key="settings">
              <h1 className="H t-title">Settings</h1>
              <p className="sub">Make it yours</p>

              <div className="eyebrow">Feel</div>
              <div className="set">
                <span>Shimmer</span>
                <div className="seg">
                  <button className={shimmer === 'subtle' ? 'on' : ''} onClick={() => setShimmer('subtle')}>
                    Subtle
                  </button>
                  <button className={shimmer === 'pronounced' ? 'on' : ''} onClick={() => setShimmer('pronounced')}>
                    Pronounced
                  </button>
                </div>
              </div>
              <div className="set">
                <span>Background</span>
                <div className="seg">
                  <button className={bg === 'smoke' ? 'on' : ''} onClick={() => setBg('smoke')}>
                    Smoke
                  </button>
                  <button className={bg === 'mesh' ? 'on' : ''} onClick={() => setBg('mesh')}>
                    Mesh
                  </button>
                </div>
              </div>
              <div className="set">
                <span>Daily reminder</span>
                <button
                  className={`switch${reminder ? ' on' : ''}`}
                  role="switch"
                  aria-checked={reminder}
                  aria-label="Daily reminder"
                  onClick={() => setReminder(r => !r)}
                >
                  <span className="switch-knob" />
                </button>
              </div>

              <div className="eyebrow">Collection</div>
              <div className="set">
                <span>Catalogue</span>
                <span className="setv">{FRAGRANCES.length} hand-profiled</span>
              </div>
              <div className="set">
                <span>Data</span>
                <span className="setv">Real · never fabricated</span>
              </div>
              <div className="set">
                <span>Motion</span>
                <span className="setv">{reduced ? 'Reduced · system' : 'Full'}</span>
              </div>
              <div className="set">
                <span>Open the wardrobe</span>
                <button className="linkbtn" onClick={() => setSplashing(true)}>
                  Replay open
                </button>
              </div>
            </div>
          )}

          {/* NAV */}
          <nav className="nav" ref={navRef}>
            <div className="indicator" ref={indRef} />
            {NAV.map(n => (
              <button
                key={n.id}
                ref={el => {
                  itemRefs.current[n.id] = el
                }}
                className={`nv${page === n.id ? ' active' : ''}`}
                aria-current={page === n.id ? 'page' : undefined}
                onClick={() => {
                  setPage(n.id)
                  setOpenId(null)
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d={ICONS[n.id]} />
                </svg>
                <span className="nl">{n.label}</span>
              </button>
            ))}
          </nav>

          {splashing && <Splash onDone={() => setSplashing(false)} />}
        </div>
      </div>

      <style>{`
        :root{${cssVars()}}
        ${materialCSS}

        .stage{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;
          overflow:hidden;padding:var(--s-lg);
          background:radial-gradient(130% 100% at 50% -10%,var(--ground-plum) 0%,var(--ground-lift) 50%,var(--ground) 100%);}
        .stage-inner{position:relative;display:flex;align-items:center;justify-content:center;
          width:100%;height:100%;box-shadow:inset 0 0 150px ${veil(0.85)};}

        .phone{position:relative;width:392px;height:min(820px,94vh);border-radius:var(--r-phone);
          background:var(--device);border:9px solid var(--bezel);
          box-shadow:${shadow.device};
          overflow:hidden;font-family:var(--sans);color:var(--ink);z-index:2;}
        /* On a real handset the painted notch sat under the physical one. */
        @media (max-width:440px){
          .phone{width:100%;height:100dvh;border-radius:0;border-width:0;}
          .notch{display:none;}
          .chrome{justify-content:flex-start;padding-left:var(--s-lg);}
        }
        .notch{position:absolute;top:0;left:50%;transform:translateX(-50%);width:120px;height:26px;
          background:var(--bezel);border-radius:0 0 var(--r-md) var(--r-md);z-index:40;}
        /* The mark sits BELOW the notch. The old text wordmark was drawn at
           top:14px behind a 26px notch, so it was clipped on every screen. */
        .chrome{position:absolute;top:30px;left:0;right:0;height:20px;display:flex;align-items:center;
          justify-content:center;z-index:39;pointer-events:none;}

        .pg{position:absolute;inset:0;padding:60px var(--s-lg) 92px;overflow-y:auto;
          scrollbar-width:none;-webkit-overflow-scrolling:touch;
          display:flex;flex-direction:column;
          animation:sil-page var(--d-slow) var(--e-enter) both;}
        .pg::-webkit-scrollbar{display:none;}
        /* A designed terminus. Five of the seven pages are shorter than the
           screen and used to just stop, leaving 500-900px of dead black under
           the last element. margin-top:auto drops this rule to the foot of a
           short page and it trails the content on a long one. Decorative only -
           no pseudo-element text for a screen reader to announce. */
        .pg::after{content:'';margin-top:auto;flex:0 0 auto;height:1px;
          margin-left:22%;margin-right:22%;margin-bottom:var(--s-xl);
          background:linear-gradient(90deg,transparent,${gold(0.28)},transparent);}
        /* opacity + transform only. The old version blurred in, which the house
           motion doctrine bans outright: blur-in on text reads as a render fault. */
        @keyframes sil-page{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:none;}}

        h1,p{margin:0;}
        .H{font-family:var(--serif);font-weight:400;letter-spacing:-.015em;line-height:1.05;}
        .t-title{font-size:var(--t-title);}
        .hi{font-style:italic;color:var(--gold);}
        .sub{font-size:var(--t-small);color:${ink(0.5)};margin-top:5px;}
        .eyebrow{font-family:var(--sans);font-size:var(--t-tiny);letter-spacing:.2em;text-transform:uppercase;
          color:${ink(0.45)};margin:var(--s-xl) 0 var(--s-md);}
        .eyebrow.centered{text-align:center;margin-top:var(--s-sm);}
        .lab{font-family:var(--sans);font-size:var(--t-tiny);letter-spacing:.2em;text-transform:uppercase;color:${ink(0.5)};}
        .empty{color:${ink(0.35)};padding:var(--s-xl) 0;text-align:center;font-size:var(--t-micro);
          letter-spacing:.2em;text-transform:uppercase;}

        /* ---- hero surface ---- */
        .hero-body{position:absolute;inset:0;padding:var(--s-lg);display:flex;flex-direction:column;justify-content:flex-end;}
        .hero-kicker{font-size:var(--t-tiny);letter-spacing:.24em;text-transform:uppercase;color:var(--gold-light);}
        .hero-name{font-family:var(--serif);font-style:italic;font-size:var(--t-hero);line-height:1;margin:6px 0 8px;
          text-shadow:0 2px 30px ${gold(0.3)};}
        .hero-reason{font-size:var(--t-small);line-height:1.55;color:${ink(0.82)};}

        /* ---- horizontal rail ---- */
        .rail{display:flex;gap:var(--s-md);overflow-x:auto;scrollbar-width:none;padding-bottom:var(--s-xs);
          margin:0 calc(var(--s-lg) * -1);padding-left:var(--s-lg);padding-right:var(--s-lg);}
        .rail::-webkit-scrollbar{display:none;}
        .railcard{flex:0 0 auto;width:116px;height:152px;}
        .railcard-body{position:absolute;inset:0;padding:var(--s-md);display:flex;flex-direction:column;justify-content:flex-end;}
        .railcard-house{font-size:var(--t-tiny);letter-spacing:.16em;text-transform:uppercase;color:${ink(0.55)};}
        .railcard-name{font-family:var(--serif);font-style:italic;font-size:var(--t-body);line-height:1.15;margin-top:2px;}

        /* ---- ledger (replaces the boxed stat tiles) ---- */
        .ledger{border-top:1px solid ${white(0.08)};}
        .ledger-row{display:flex;justify-content:space-between;align-items:baseline;gap:var(--s-md);
          padding:11px 0;border-bottom:1px solid ${white(0.06)};font-size:var(--t-small);color:${ink(0.6)};}
        .ledger-v{font-family:var(--serif);font-size:var(--t-body);color:var(--ink);}

        /* ---- search ---- */
        .search{display:flex;align-items:center;gap:var(--s-sm);background:${white(0.05)};
          border:1px solid ${white(0.1)};border-radius:var(--r-sm);padding:10px var(--s-md);margin:var(--s-lg) 0 var(--s-md);}
        .search input{flex:1;background:none;border:none;outline:none;color:var(--ink);font-size:var(--t-body);font-family:var(--sans);}
        .search input::placeholder{color:${ink(0.35)};}

        /* ---- TAGS. Square-cut, 2px, letterpress inset.
           House rule: no pill / lozenge / fully-rounded capsule shapes anywhere,
           in any build. The old .chip2 was border-radius:20px - the single most
           recognisable tell of templated AI UI. ---- */
        /* Wrap, don't scroll. As a single scrolling row the five season tags
           plus the sort control did not fit 430px, so "Winter" sat half-hidden
           under the sort button and read as broken. */
        .filterbar{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin-bottom:var(--s-sm);}
        .tagset{display:contents;}
        .taggrid{display:flex;flex-wrap:wrap;gap:6px;}
        .tag{flex:0 0 auto;font-family:var(--sans);font-size:var(--t-micro);letter-spacing:.12em;
          text-transform:uppercase;padding:7px 10px;border-radius:var(--r-tag);
          border:1px solid ${white(0.12)};border-left:2px solid ${white(0.16)};
          background:${white(0.03)};box-shadow:inset 0 1px 0 ${white(0.05)};
          color:${ink(0.65)};cursor:pointer;white-space:nowrap;
          transition:color var(--d-fast) var(--e-move),border-color var(--d-fast) var(--e-move),background-color var(--d-fast) var(--e-move);}
        .tag:hover{color:${ink(0.9)};border-color:${white(0.22)};}
        .tag.on{background:${gold(0.1)};border-color:${gold(0.3)};border-left-color:var(--gold);color:var(--gold-light);}
        .tag:active{transform:scale(.98);}
        .ghosttag{border-left-color:${white(0.12)};margin-left:auto;}

        /* ---- shelf rows ---- */
        .srow{display:flex;gap:var(--s-md);align-items:center;flex-wrap:wrap;
          padding:11px 0;border-bottom:1px solid ${white(0.06)};}
        .sth{width:46px;height:60px;border-radius:var(--r-sm);flex:0 0 auto;position:relative;overflow:hidden;}
        .si{flex:1;min-width:0;}
        .sbn{font-size:var(--t-tiny);letter-spacing:.18em;text-transform:uppercase;color:${ink(0.5)};}
        .snn{font-family:var(--serif);font-style:italic;font-size:var(--t-lead);line-height:1.1;margin:2px 0 3px;}
        .sfm{font-size:var(--t-tiny);color:${ink(0.55)};}
        .scc{font-family:var(--serif);font-size:var(--t-lead);color:var(--gold);flex:0 0 auto;}
        .sopen{flex-basis:100%;padding-top:var(--s-md);animation:sil-page var(--d-base) var(--e-enter) both;}
        .sdesc{font-family:var(--serif);font-style:italic;font-size:var(--t-body);line-height:1.6;
          color:${ink(0.78)};margin-bottom:var(--s-md);}
        .meterpair{display:grid;grid-template-columns:1fr 1fr;gap:var(--s-lg);margin-bottom:var(--s-md);}
        .sline{font-size:var(--t-small);color:${ink(0.55)};line-height:1.6;margin-top:5px;}
        .sline .key{color:var(--gold);font-family:var(--sans);font-size:var(--t-tiny);letter-spacing:.16em;
          text-transform:uppercase;margin-right:6px;}

        /* ---- notes: lamp + lowercase, no container (house alternative to badges) ---- */
        .notes{display:flex;flex-wrap:wrap;gap:6px var(--s-md);margin:var(--s-sm) 0 var(--s-md);}
        .note{display:inline-flex;align-items:center;gap:6px;font-size:var(--t-small);color:${ink(0.55)};}
        .note::before{content:'';width:3px;height:3px;border-radius:50%;background:${ink(0.35)};flex:0 0 auto;}
        .note.lead{color:var(--gold-light);}
        .note.lead::before{background:var(--gold);box-shadow:0 0 6px ${gold(0.8)};}

        /* ---- meters ---- */
        .track{height:3px;border-radius:1px;background:${white(0.07)};overflow:hidden;flex:1;}
        .track-fill{height:100%;transition:width var(--d-slow) var(--e-move);}
        .meter{position:relative;height:3px;border-radius:1px;background:${white(0.07)};margin-top:7px;}
        .meter-fill{position:absolute;left:0;top:0;bottom:0;background:var(--gold);border-radius:1px;}
        .meter-mark{position:absolute;top:-3px;width:1px;height:9px;background:var(--gold-pale);
          box-shadow:0 0 6px ${gold(0.9)};}
        .meter-v{font-family:var(--serif);font-size:var(--t-small);color:${ink(0.7)};margin-left:6px;}

        /* ---- buttons ---- */
        .actions{display:flex;gap:var(--s-md);margin-top:var(--s-xl);}
        .cta{flex:1;background:${gold(0.14)};border:1px solid ${gold(0.4)};border-radius:var(--r-sm);
          color:var(--gold-light);padding:13px;cursor:pointer;font-family:var(--sans);font-size:var(--t-micro);
          letter-spacing:.2em;text-transform:uppercase;
          transition:background-color var(--d-fast) var(--e-move),border-color var(--d-fast) var(--e-move);}
        .cta:hover:not(:disabled){background:${gold(0.2)};border-color:${gold(0.55)};}
        .cta:active:not(:disabled){transform:scale(.985);}
        /* A disabled control must still be legible - the old one dropped to
           opacity .35 over a translucent fill and read as broken, not disabled. */
        .cta:disabled{background:transparent;border-color:${white(0.1)};border-style:dashed;
          color:${ink(0.4)};cursor:not-allowed;}
        .ghost{background:transparent;border:1px solid ${white(0.12)};border-radius:var(--r-sm);
          color:${ink(0.6)};padding:13px 18px;cursor:pointer;font-family:var(--sans);
          font-size:var(--t-micro);letter-spacing:.18em;text-transform:uppercase;
          transition:color var(--d-fast) var(--e-move),border-color var(--d-fast) var(--e-move);}
        .ghost:hover{color:${ink(0.85)};border-color:${white(0.2)};}
        .linkbtn{background:none;border:none;padding:0;cursor:pointer;color:var(--gold);
          font-family:var(--sans);font-size:var(--t-small);border-bottom:1px solid ${gold(0.4)};}

        /* ---- lab slots ---- */
        .slots{display:flex;align-items:stretch;gap:var(--s-sm);margin-top:var(--s-lg);}
        .slot{flex:1;height:112px;position:relative;cursor:pointer;}
        .slot-label{position:absolute;inset:0;display:flex;align-items:flex-end;justify-content:center;
          padding-bottom:10px;font-family:var(--serif);font-style:italic;font-size:var(--t-body);}
        .slot-empty{border:1px solid ${white(0.1)};border-radius:var(--r-md);display:flex;
          align-items:center;justify-content:center;background:${white(0.02)};cursor:default;}
        /* A drawn cross, not a typographic "+" inside a dashed box. */
        .slot-mark{position:relative;width:14px;height:14px;opacity:.4;}
        .slot-mark::before,.slot-mark::after{content:'';position:absolute;background:${ink(0.7)};}
        .slot-mark::before{left:50%;top:0;bottom:0;width:1px;transform:translateX(-50%);}
        .slot-mark::after{top:50%;left:0;right:0;height:1px;transform:translateY(-50%);}

        .picks{display:grid;grid-template-columns:1fr 1fr;gap:6px;}
        .pick{display:flex;gap:var(--s-sm);align-items:stretch;text-align:left;padding:9px 10px;
          border-radius:var(--r-tag);cursor:pointer;background:${white(0.025)};
          border:1px solid ${white(0.06)};color:var(--ink);
          transition:background-color var(--d-fast) var(--e-move),border-color var(--d-fast) var(--e-move);}
        .pick:hover:not(:disabled){background:${white(0.05)};}
        .pick.on{background:${gold(0.08)};border-color:${gold(0.35)};}
        .pick:disabled{opacity:.3;cursor:not-allowed;}
        .pick-rule{width:2px;flex:0 0 auto;border-radius:1px;}
        .pick-txt{display:flex;flex-direction:column;min-width:0;}
        .pickn{font-size:var(--t-small);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
        .pickf{font-size:var(--t-tiny);letter-spacing:.12em;text-transform:uppercase;color:${ink(0.45)};margin-top:1px;}

        /* ---- chemistry ---- */
        .chem-score{font-family:var(--serif);font-size:64px;line-height:1;text-shadow:0 0 28px ${gold(0.4)};}
        .chem-names{font-family:var(--serif);font-style:italic;font-size:var(--t-body);color:${ink(0.78)};margin-top:6px;}
        .chem-verdict{font-size:var(--t-small);color:${ink(0.5)};margin-top:6px;line-height:1.5;}
        .axes{display:grid;grid-template-columns:1fr 1fr;gap:var(--s-lg);margin:var(--s-xl) 0 var(--s-sm);}
        .axis-head{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:6px;}
        .axis-verdict{font-size:var(--t-tiny);letter-spacing:.1em;text-transform:uppercase;}
        .stage-row{display:flex;gap:var(--s-lg);margin-top:var(--s-md);}
        .stage-when{width:72px;flex-shrink:0;}
        .stage-phase{color:var(--gold);font-size:var(--t-tiny);letter-spacing:.14em;text-transform:uppercase;}
        .stage-clock{font-size:var(--t-tiny);color:${ink(0.35)};margin-top:2px;}
        .stage-txt{font-size:var(--t-small);line-height:1.6;color:${ink(0.55)};}
        .panel{margin-top:var(--s-lg);padding:var(--s-lg);border:1px solid ${gold(0.16)};
          border-left:2px solid ${gold(0.5)};border-radius:var(--r-tag);background:${gold(0.03)};}
        .panel-txt{font-size:var(--t-small);color:${ink(0.6)};line-height:1.7;margin-top:var(--s-sm);}
        .layer-row{display:flex;gap:var(--s-md);align-items:stretch;margin-top:var(--s-sm);}
        .layer-name{font-family:var(--serif);font-style:italic;font-size:var(--t-lead);}
        .layer-how{font-size:var(--t-small);color:${ink(0.55)};line-height:1.6;margin-top:3px;}
        .alt{display:flex;justify-content:space-between;align-items:baseline;padding:11px 0;
          border-bottom:1px solid ${white(0.06)};}
        .altv{font-family:var(--serif);font-style:italic;font-size:var(--t-body);}
        .alts{font-size:var(--t-small);color:var(--gold);}

        /* ---- nose ---- */
        .fam-row{display:flex;align-items:center;gap:var(--s-md);margin:9px 0;}
        .fam-name{font-size:var(--t-tiny);letter-spacing:.14em;text-transform:uppercase;width:70px;color:${ink(0.65)};}
        .fam-pct{font-family:var(--serif);font-size:var(--t-small);color:${ink(0.6)};width:32px;text-align:right;}

        /* ---- settings ---- */
        .set{display:flex;justify-content:space-between;align-items:center;gap:var(--s-md);
          padding:13px 0;border-bottom:1px solid ${white(0.06)};font-size:var(--t-body);}
        .setv{font-size:var(--t-small);color:${ink(0.55)};}
        .seg{display:flex;border:1px solid ${white(0.12)};border-radius:var(--r-tag);overflow:hidden;}
        .seg button{font-family:var(--sans);font-size:var(--t-tiny);letter-spacing:.1em;text-transform:uppercase;
          padding:6px 10px;cursor:pointer;color:${ink(0.5)};background:transparent;border:none;
          transition:color var(--d-fast) var(--e-move),background-color var(--d-fast) var(--e-move);}
        .seg button + button{border-left:1px solid ${white(0.12)};}
        .seg button.on{background:${gold(0.16)};color:var(--gold-light);}
        /* Square-cut switch. The previous control was a 12px-radius capsule with
           a circular knob - a pill by another name. */
        .switch{position:relative;width:38px;height:20px;border-radius:var(--r-tag);
          background:${white(0.08)};border:1px solid ${white(0.14)};cursor:pointer;padding:0;
          transition:background-color var(--d-base) var(--e-move),border-color var(--d-base) var(--e-move);}
        .switch.on{background:${gold(0.22)};border-color:${gold(0.5)};}
        .switch-knob{position:absolute;top:2px;left:2px;width:14px;height:14px;border-radius:1px;
          background:${ink(0.75)};transition:transform var(--d-base) var(--e-move),background-color var(--d-base) var(--e-move);}
        .switch.on .switch-knob{transform:translateX(18px);background:var(--gold-pale);}

        /* ---- wheel ---- */
        .gem{position:relative;width:54px;height:54px;border-radius:var(--r-md);overflow:hidden;
          display:flex;align-items:center;justify-content:center;border:1px solid ${white(0.14)};
          transition:box-shadow var(--d-slow) var(--e-move),border-color var(--d-slow) var(--e-move);}
        .gem-label{display:block;font-size:var(--t-tiny);letter-spacing:.14em;text-transform:uppercase;
          margin-top:6px;text-shadow:0 1px 3px ${veil(1)};white-space:nowrap;}
        .hub{position:absolute;top:50%;left:50%;width:120px;height:120px;margin:-60px 0 0 -60px;
          border-radius:50%;overflow:hidden;display:flex;flex-direction:column;align-items:center;
          justify-content:center;text-align:center;border:1px solid ${white(0.14)};
          background:radial-gradient(circle at 50% 34%,${gold(0.16)},${veil(0.98)} 76%);
          box-shadow:inset 0 1px 0 ${white(0.16)},0 20px 50px ${veil(0.6)};}
        .hub-count{font-size:var(--t-tiny);letter-spacing:.16em;text-transform:uppercase;
          color:${ink(0.6)};margin-top:4px;}

        /* ---- nav ---- */
        .nav{position:absolute;left:0;right:0;bottom:0;height:72px;display:flex;align-items:center;
          padding:0 var(--s-sm) 10px;z-index:30;
          background:linear-gradient(180deg,${veil(0.2)},${veil(0.94)});
          -webkit-backdrop-filter:blur(22px);backdrop-filter:blur(22px);border-top:1px solid ${white(0.07)};}
        /* A fine rule under the active item, not a glowing 42px tile behind a
           20px icon. */
        .indicator{position:absolute;top:0;height:1px;background:linear-gradient(90deg,transparent,var(--gold),transparent);
          transition:left var(--d-slow) var(--e-move),width var(--d-slow) var(--e-move);z-index:1;}
        .nv{position:relative;z-index:1;flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;
          cursor:pointer;background:none;border:none;color:var(--ink);opacity:.4;padding:0;
          transition:opacity var(--d-fast) var(--e-move);}
        .nv:hover{opacity:.7;}
        .nv.active{opacity:1;color:var(--gold-light);}
        .nv svg{width:19px;height:19px;}
        .nl{font-size:var(--t-tiny);letter-spacing:.06em;text-transform:uppercase;}

        ::selection{background:${gold(0.25)};color:var(--gold-pale);}
        button:focus-visible,input:focus-visible,[role=switch]:focus-visible{
          outline:1px solid var(--gold);outline-offset:2px;}

        @media (prefers-reduced-motion: reduce){
          .pg,.sopen{animation:none;}
          .track-fill,.meter-fill{transition:none;}
          .indicator{transition:none;}
        }
      `}</style>
    </div>
  )
}

/** A labelled set of square-cut selection tags, laid out as a wrapped grid so
 * the last item never orphans on its own row (the old Daily screen wrapped 26
 * capsules into four ragged rows). */
function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <>
      <div className="eyebrow">{label}</div>
      <div className="taggrid">{children}</div>
    </>
  )
}

/** A continuous meter with a marker. Replaces the 10-segment tick bar, which
 * read as a battery indicator. */
function Meter({ value, max = 10 }: { value: number; max?: number }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100))
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <div className="meter" style={{ flex: 1 }}>
        <div className="meter-fill" style={{ width: `${pct}%` }} />
        <div className="meter-mark" style={{ left: `calc(${pct}% - 0.5px)` }} />
      </div>
      <span className="meter-v">{value}</span>
    </div>
  )
}
