import { useState, useMemo } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { WEATHER_MAP, OCCASION_MAP, ENERGY_MAP, TIME_MAP } from '../domain/selector'
import { FRAGRANCES, scoreOne, chemistryOf, getLayerPartner } from './data'
import type { Fragrance } from './data'

const MODES = [
  { id: 'collection', label: 'Collection', icon: '◆' },
  { id: 'selector', label: 'Daily Selector', icon: '◇' },
  { id: 'perfumery', label: 'Perfumery', icon: '◎' },
]

export default function SillageApp() {
  const [mode, setMode] = useState('collection')
  const [selectedFragrance, setSelectedFragrance] = useState<Fragrance | null>(null)
  const [filterSeason, setFilterSeason] = useState<string | null>(null)
  const [carouselIdx, setCarouselIdx] = useState(0)
  const [selWeather, setSelWeather] = useState<string[]>([])
  const [selOccasion, setSelOccasion] = useState('')
  const [selEnergy, setSelEnergy] = useState('')
  const [selTime, setSelTime] = useState('')
  const [showResults, setShowResults] = useState(false)
  const [labSelected, setLabSelected] = useState<number[]>([])
  const [showChemistry, setShowChemistry] = useState(false)

  const filtered = filterSeason ? FRAGRANCES.filter(f => f.season.includes(filterSeason)) : FRAGRANCES
  const selectorResults = useMemo(() => {
    if (!showResults) return []
    const conditions = { weather: selWeather, occasion: selOccasion, energy: selEnergy, time: selTime }
    return FRAGRANCES
      .map(f => ({ ...f, score: scoreOne(f, conditions) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
  }, [showResults, selWeather, selOccasion, selEnergy, selTime])
  const layerSuggestion = useMemo(
    () => selectorResults.length ? getLayerPartner(selectorResults[0], selectorResults.map(r => r.id)) : null,
    [selectorResults],
  )
  const chemistry = useMemo(() => showChemistry ? chemistryOf(labSelected) : null, [showChemistry, labSelected])

  const canGenerate = selWeather.length > 0 || Boolean(selOccasion) || Boolean(selEnergy) || Boolean(selTime)
  const resetSelector = () => { setSelWeather([]); setSelOccasion(''); setSelEnergy(''); setSelTime(''); setShowResults(false) }
  const toggleWeather = (w: string) => { setShowResults(false); setSelWeather(prev => prev.includes(w) ? prev.filter(x => x !== w) : [...prev, w]) }
  const toggleLab = (id: number) => { setShowChemistry(false); setLabSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : prev.length >= 3 ? prev : [...prev, id]) }

  const gold = '#c9a96e'
  const sans = "'Helvetica Neue', sans-serif"
  const labelStyle: CSSProperties = { fontSize: 9, letterSpacing: '0.25em', textTransform: 'uppercase', fontFamily: sans, marginBottom: 4 }

  const TagButton = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) => (
    <button onClick={onClick} style={{
      background: active ? 'rgba(201,169,110,0.1)' : 'rgba(255,255,255,0.015)',
      border: active ? '1px solid rgba(201,169,110,0.4)' : '1px solid rgba(255,255,255,0.05)',
      color: active ? gold : 'rgba(232,224,212,0.35)',
      padding: '6px 14px', borderRadius: 2, cursor: 'pointer', fontFamily: sans,
      fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', transition: 'all 0.3s ease',
      backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
    }}>{children}</button>
  )

  const Bar = ({ value, max = 10 }: { value: number; max?: number }) => (
    <div style={{ display: 'flex', gap: 3, marginTop: 4 }}>
      {Array.from({ length: max }).map((_, j) => (
        <div key={j} style={{ width: 16, height: 3, background: j < value ? gold : 'rgba(255,255,255,0.04)', transition: 'background 0.3s ease' }} />
      ))}
    </div>
  )

  const getScoreColor = (s: number) => s >= 75 ? '#7ab87a' : s >= 50 ? gold : s >= 30 ? '#c49a6a' : '#a06060'

  return (
    <div style={{ minHeight: '100vh', background: '#08070605', color: '#e8e0d4', fontFamily: "'Cormorant Garamond', 'Georgia', serif", position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, background: 'linear-gradient(180deg, #0a0908 0%, #060504 50%, #080706 100%)' }} />
      <div style={{ position: 'fixed', inset: 0, opacity: 0.03, pointerEvents: 'none', zIndex: 0, background: 'radial-gradient(ellipse at 30% 40%, rgba(201,169,110,0.4) 0%, transparent 50%), radial-gradient(ellipse at 70% 60%, rgba(80,60,40,0.3) 0%, transparent 40%)' }} />
      <div style={{ position: 'fixed', inset: 0, opacity: 0.015, pointerEvents: 'none', zIndex: 0, backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")", backgroundSize: '128px 128px' }} />

      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600&display=swap" rel="stylesheet" />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 900, margin: '0 auto', padding: '0 24px' }}>
        <header style={{ padding: '48px 0 28px', borderBottom: '1px solid rgba(201,169,110,0.1)', animation: 'fadeDown 0.8s ease both' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: 42, fontWeight: 300, letterSpacing: '0.12em', margin: 0, color: gold, textTransform: 'uppercase' }}>Sillage</h1>
            <span style={{ fontSize: 11, letterSpacing: '0.3em', color: 'rgba(201,169,110,0.35)', textTransform: 'uppercase', fontFamily: sans }}>Fragrance Wardrobe</span>
          </div>
          <p style={{ margin: '4px 0 0', fontSize: 14, color: 'rgba(201,169,110,0.28)', fontFamily: sans, letterSpacing: '0.06em', fontWeight: 300, fontStyle: 'italic' }}>
            intentional imprints
          </p>
        </header>

        <nav style={{ display: 'flex', gap: 0, padding: '20px 0', borderBottom: '1px solid rgba(255,255,255,0.03)', animation: 'fadeDown 0.8s ease 0.15s both', overflowX: 'auto' }}>
          {MODES.map(m => (
            <button key={m.id} onClick={() => { setMode(m.id); setSelectedFragrance(null); resetSelector(); setLabSelected([]); setShowChemistry(false); setCarouselIdx(0) }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '10px 20px', color: mode === m.id ? gold : 'rgba(232,224,212,0.3)', fontFamily: sans, fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 400, borderBottom: mode === m.id ? `1px solid ${gold}` : '1px solid transparent', transition: 'all 0.4s ease', whiteSpace: 'nowrap' }}>
              <span style={{ marginRight: 6, fontSize: 10 }}>{m.icon}</span>{m.label}
            </button>
          ))}
        </nav>

        {/* COLLECTION */}
        {mode === 'collection' && (
          <div style={{ animation: 'fadeUp 0.6s ease both' }}>
            <div style={{ display: 'flex', gap: 12, padding: '24px 0 18px', flexWrap: 'wrap' }}>
              {[null, 'Spring', 'Summer', 'Autumn', 'Winter'].map(sv => (
                <TagButton key={sv || 'all'} active={filterSeason === sv} onClick={() => { setFilterSeason(sv); setCarouselIdx(0); setSelectedFragrance(null) }}>{sv || 'All'}</TagButton>
              ))}
            </div>
            <div style={{ position: 'relative', padding: '16px 0 8px' }}>
              <div style={{ display: 'flex', alignItems: 'stretch', gap: 6, justifyContent: 'center', minHeight: 180 }}>
                {[-1, 0, 1].map(offset => {
                  const idx = carouselIdx + offset
                  const f = filtered[idx]
                  if (!f) return <div key={offset} style={{ flex: '0 0 17%', minWidth: 0 }} />
                  const isCenter = offset === 0
                  const isOpen = selectedFragrance?.id === f.id
                  return (
                    <div key={f.id} onClick={() => { if (isCenter) setSelectedFragrance(isOpen ? null : f); else setCarouselIdx(idx) }}
                      style={{
                        flex: isCenter ? '0 0 62%' : '0 0 17%', minWidth: 0, cursor: 'pointer',
                        padding: isCenter ? '22px 18px 22px 20px' : '18px 14px 18px 16px',
                        position: 'relative', overflow: 'hidden',
                        border: isOpen ? '1px solid rgba(201,169,110,0.35)' : isCenter ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(255,255,255,0.02)',
                        background: isOpen ? 'rgba(201,169,110,0.03)' : isCenter ? 'rgba(255,255,255,0.015)' : 'rgba(255,255,255,0.005)',
                        backdropFilter: isCenter ? 'blur(12px)' : 'none', WebkitBackdropFilter: isCenter ? 'blur(12px)' : 'none',
                        filter: isCenter ? 'none' : 'blur(1.2px)',
                        opacity: isCenter ? 1 : 0.4,
                        transform: isCenter ? 'scale(1)' : 'scale(0.94)',
                        transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                        zIndex: isCenter ? 2 : 1,
                      }}>
                      <div style={{ position: 'absolute', top: 0, left: 0, width: 3, height: '100%', background: f.color, opacity: isCenter ? (isOpen ? 1 : 0.4) : 0.12, transition: 'opacity 0.4s ease' }} />
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                        <div>
                          <div style={{ ...labelStyle, color: 'rgba(201,169,110,0.45)', marginBottom: 4, fontSize: 8 }}>{f.house}</div>
                          <h3 style={{ margin: 0, fontSize: isCenter ? 20 : 15, fontWeight: 400, color: '#e8e0d4', letterSpacing: '0.02em', transition: 'font-size 0.4s ease' }}>{f.short}</h3>
                        </div>
                        <span style={{ fontSize: 9, letterSpacing: '0.15em', color: 'rgba(232,224,212,0.12)', fontFamily: sans, marginTop: 2 }}>{String(f.id).padStart(2, '0')}</span>
                      </div>
                      <div style={{ fontSize: 11, color: 'rgba(232,224,212,0.3)', fontFamily: sans, fontWeight: 300, lineHeight: 1.5 }}>{f.notes.join(' · ')}</div>
                      {isCenter && isOpen && (
                        <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid rgba(201,169,110,0.08)', animation: 'fadeUp 0.3s ease both' }}>
                          <p style={{ fontSize: 15, lineHeight: 1.8, color: 'rgba(232,224,212,0.65)', fontStyle: 'italic', margin: '0 0 14px', fontWeight: 300 }}>{f.description}</p>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <div><div style={{ ...labelStyle, color: 'rgba(201,169,110,0.35)' }}>Family</div><div style={{ fontSize: 12, color: 'rgba(232,224,212,0.6)', fontFamily: sans }}>{f.family}</div></div>
                            <div><div style={{ ...labelStyle, color: 'rgba(201,169,110,0.35)' }}>Mood</div><div style={{ fontSize: 12, color: 'rgba(232,224,212,0.6)', fontFamily: sans }}>{f.mood}</div></div>
                            <div><div style={{ ...labelStyle, color: 'rgba(201,169,110,0.35)' }}>Projection</div><Bar value={f.projection} /></div>
                            <div><div style={{ ...labelStyle, color: 'rgba(201,169,110,0.35)' }}>Longevity</div><Bar value={f.longevity} /></div>
                            <div style={{ gridColumn: '1 / -1' }}><div style={{ ...labelStyle, color: 'rgba(201,169,110,0.35)' }}>Seasons</div><div style={{ display: 'flex', gap: 8, marginTop: 4 }}>{f.season.map(sv => (<span key={sv} style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: gold, padding: '3px 10px', border: '1px solid rgba(201,169,110,0.15)', fontFamily: sans }}>{sv}</span>))}</div></div>
                            <div style={{ gridColumn: '1 / -1' }}><div style={{ ...labelStyle, color: 'rgba(201,169,110,0.35)' }}>Application</div><div style={{ fontSize: 12, color: 'rgba(232,224,212,0.5)', fontFamily: sans, lineHeight: 1.6 }}>{f.pulsePoints}</div></div>
                            <div style={{ gridColumn: '1 / -1' }}><div style={{ ...labelStyle, color: 'rgba(201,169,110,0.35)' }}>Effect</div><div style={{ fontSize: 12, color: 'rgba(232,224,212,0.5)', fontFamily: sans, lineHeight: 1.6 }}>{f.effect}</div></div>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 24, marginTop: 20 }}>
                <button onClick={() => { setCarouselIdx(Math.max(0, carouselIdx - 1)); setSelectedFragrance(null) }} disabled={carouselIdx === 0}
                  style={{ background: 'none', border: 'none', cursor: carouselIdx === 0 ? 'default' : 'pointer', color: carouselIdx === 0 ? 'rgba(232,224,212,0.08)' : 'rgba(201,169,110,0.4)', fontSize: 18, fontFamily: sans, padding: '4px 12px', transition: 'color 0.3s ease' }}>‹</button>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  {filtered.map((_, i) => (
                    <button key={i} onClick={() => { setCarouselIdx(i); setSelectedFragrance(null) }}
                      style={{ width: i === carouselIdx ? 16 : 4, height: 4, borderRadius: 2, border: 'none', cursor: 'pointer', background: i === carouselIdx ? gold : 'rgba(232,224,212,0.08)', transition: 'all 0.4s ease', padding: 0 }} />
                  ))}
                </div>
                <button onClick={() => { setCarouselIdx(Math.min(filtered.length - 1, carouselIdx + 1)); setSelectedFragrance(null) }} disabled={carouselIdx >= filtered.length - 1}
                  style={{ background: 'none', border: 'none', cursor: carouselIdx >= filtered.length - 1 ? 'default' : 'pointer', color: carouselIdx >= filtered.length - 1 ? 'rgba(232,224,212,0.08)' : 'rgba(201,169,110,0.4)', fontSize: 18, fontFamily: sans, padding: '4px 12px', transition: 'color 0.3s ease' }}>›</button>
              </div>
            </div>
          </div>
        )}

        {/* DAILY SELECTOR */}
        {mode === 'selector' && (
          <div style={{ padding: '32px 0 60px', animation: 'fadeUp 0.5s ease both' }}>
            <h2 style={{ fontSize: 28, fontWeight: 300, margin: '0 0 6px', color: gold, letterSpacing: '0.06em' }}>Daily Selector</h2>
            <p style={{ fontSize: 12, color: 'rgba(232,224,212,0.25)', fontFamily: sans, fontWeight: 300, margin: '0 0 28px', letterSpacing: '0.03em' }}>Set your conditions. Scent profiles are scored on physical chemistry, not just tags.</p>

            <div style={{ marginBottom: 24 }}><div style={{ ...labelStyle, color: 'rgba(201,169,110,0.4)', marginBottom: 10 }}>Weather / Conditions</div><div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>{Object.keys(WEATHER_MAP).map(w => <TagButton key={w} active={selWeather.includes(w)} onClick={() => toggleWeather(w)}>{w}</TagButton>)}</div></div>
            <div style={{ marginBottom: 24 }}><div style={{ ...labelStyle, color: 'rgba(201,169,110,0.4)', marginBottom: 10 }}>Occasion</div><div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>{Object.keys(OCCASION_MAP).map(o => <TagButton key={o} active={selOccasion === o} onClick={() => { setShowResults(false); setSelOccasion(selOccasion === o ? '' : o) }}>{o}</TagButton>)}</div></div>
            <div style={{ marginBottom: 24 }}><div style={{ ...labelStyle, color: 'rgba(201,169,110,0.4)', marginBottom: 10 }}>Energy / Mood</div><div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>{Object.keys(ENERGY_MAP).map(e => <TagButton key={e} active={selEnergy === e} onClick={() => { setShowResults(false); setSelEnergy(selEnergy === e ? '' : e) }}>{e}</TagButton>)}</div></div>
            <div style={{ marginBottom: 32 }}><div style={{ ...labelStyle, color: 'rgba(201,169,110,0.4)', marginBottom: 10 }}>Time of Day</div><div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>{Object.keys(TIME_MAP).map(t => <TagButton key={t} active={selTime === t} onClick={() => { setShowResults(false); setSelTime(selTime === t ? '' : t) }}>{t}</TagButton>)}</div></div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setShowResults(true)} disabled={!canGenerate} style={{ background: canGenerate ? 'rgba(201,169,110,0.1)' : 'rgba(201,169,110,0.03)', border: '1px solid rgba(201,169,110,0.25)', color: canGenerate ? gold : 'rgba(201,169,110,0.2)', padding: '10px 32px', cursor: canGenerate ? 'pointer' : 'default', fontFamily: sans, fontSize: 10, letterSpacing: '0.25em', textTransform: 'uppercase', transition: 'all 0.3s ease', backdropFilter: 'blur(8px)' }}>Select Scent</button>
              <button onClick={resetSelector} style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', color: 'rgba(232,224,212,0.25)', padding: '10px 24px', cursor: 'pointer', fontFamily: sans, fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase' }}>Reset</button>
            </div>

            {showResults && selectorResults.length > 0 && (
              <div style={{ marginTop: 40, animation: 'fadeUp 0.6s ease both' }}>
                <div style={{ ...labelStyle, color: 'rgba(201,169,110,0.35)', marginBottom: 20 }}>Recommendation</div>
                {(() => {
                  const top = selectorResults[0]
                  return (
                    <div style={{ padding: '28px 24px', border: '1px solid rgba(201,169,110,0.2)', background: 'rgba(201,169,110,0.02)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', marginBottom: 16, position: 'relative' }}>
                      <div style={{ position: 'absolute', top: 0, left: 0, width: 3, height: '100%', background: top.color }} />
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}><div style={{ ...labelStyle, color: gold }}>Primary Pick</div><div style={{ fontSize: 10, fontFamily: sans, color: 'rgba(201,169,110,0.45)', letterSpacing: '0.1em' }}>{top.score}%</div></div>
                      <h3 style={{ margin: '4px 0 8px', fontSize: 26, fontWeight: 400, color: '#e8e0d4' }}>{top.name}</h3>
                      <p style={{ fontSize: 15, lineHeight: 1.8, color: 'rgba(232,224,212,0.55)', fontStyle: 'italic', margin: '0 0 16px', fontWeight: 300 }}>{top.description}</p>
                      <div style={{ fontSize: 12, color: 'rgba(232,224,212,0.45)', fontFamily: sans, lineHeight: 1.8, marginBottom: 4 }}><span style={{ color: 'rgba(201,169,110,0.5)' }}>Apply:</span> {top.pulsePoints}</div>
                      <div style={{ fontSize: 12, color: 'rgba(232,224,212,0.45)', fontFamily: sans, lineHeight: 1.8 }}><span style={{ color: 'rgba(201,169,110,0.5)' }}>Effect:</span> {top.effect}</div>
                      {layerSuggestion && (
                        <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid rgba(201,169,110,0.08)' }}>
                          <div style={{ ...labelStyle, color: 'rgba(201,169,110,0.35)', marginBottom: 10 }}>Optional Layer · {layerSuggestion.chemistry}% chemistry</div>
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                            <div style={{ width: 3, minHeight: 36, background: layerSuggestion.color, flexShrink: 0, marginTop: 2 }} />
                            <div>
                              <div style={{ fontSize: 16, color: '#e8e0d4', marginBottom: 6 }}>{layerSuggestion.name}</div>
                              <div style={{ fontSize: 11, color: 'rgba(232,224,212,0.4)', fontFamily: sans, lineHeight: 1.6 }}>
                                {(() => {
                                  const [base, t] = layerSuggestion.warmth >= top.warmth ? [layerSuggestion, top] : [top, layerSuggestion]
                                  return `Apply ${base.short} to chest first, then ${t.short} on wrists and neck. ${base.weight === 'heavy' && t.weight === 'light' ? 'Perfect weight contrast, depth meets lift.' : 'Let them find each other at body temperature.'}`
                                })()}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })()}
                <div style={{ ...labelStyle, color: 'rgba(201,169,110,0.25)', margin: '24px 0 12px' }}>Alternatives</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {selectorResults.slice(1).map(r => (
                    <div key={r.id} style={{ padding: '16px 20px', border: '1px solid rgba(255,255,255,0.03)', background: 'rgba(255,255,255,0.01)', position: 'relative' }}>
                      <div style={{ position: 'absolute', top: 0, left: 0, width: 3, height: '100%', background: r.color, opacity: 0.3 }} />
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div><h4 style={{ margin: '0 0 4px', fontSize: 17, fontWeight: 400, color: 'rgba(232,224,212,0.7)' }}>{r.name}</h4><div style={{ fontSize: 11, color: 'rgba(232,224,212,0.3)', fontFamily: sans }}>{r.notes.join(' · ')}</div></div>
                        <div style={{ fontSize: 10, fontFamily: sans, color: 'rgba(201,169,110,0.35)', letterSpacing: '0.1em', flexShrink: 0, marginLeft: 12 }}>{r.score}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* PERFUMERY */}
        {mode === 'perfumery' && (
          <div style={{ padding: '32px 0 60px', animation: 'fadeUp 0.5s ease both' }}>
            <h2 style={{ fontSize: 28, fontWeight: 300, margin: '0 0 6px', color: gold, letterSpacing: '0.06em' }}>Perfumery</h2>
            <p style={{ fontSize: 12, color: 'rgba(232,224,212,0.25)', fontFamily: sans, fontWeight: 300, margin: '0 0 28px', letterSpacing: '0.03em' }}>Pick 2 to 3 scents. See if they work together or fight each other.</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10, marginBottom: 32 }}>
              {FRAGRANCES.map(f => {
                const active = labSelected.includes(f.id)
                const disabled = !active && labSelected.length >= 3
                return (
                  <button key={f.id} onClick={() => !disabled && toggleLab(f.id)}
                    style={{ textAlign: 'left', cursor: disabled ? 'default' : 'pointer', padding: '14px 16px', position: 'relative', overflow: 'hidden',
                      background: active ? 'rgba(201,169,110,0.04)' : 'rgba(255,255,255,0.01)',
                      border: active ? '1px solid rgba(201,169,110,0.3)' : '1px solid rgba(255,255,255,0.03)',
                      opacity: disabled ? 0.3 : 1, transition: 'all 0.3s ease',
                      backdropFilter: active ? 'blur(8px)' : 'none',
                    }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, width: 3, height: '100%', background: f.color, opacity: active ? 1 : 0.15 }} />
                    {active && <div style={{ position: 'absolute', top: 8, right: 10, fontSize: 10, color: gold, fontFamily: sans, letterSpacing: '0.1em' }}>{labSelected.indexOf(f.id) + 1}</div>}
                    <div style={{ fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: active ? 'rgba(201,169,110,0.5)' : 'rgba(232,224,212,0.25)', fontFamily: sans, marginBottom: 4 }}>{f.house}</div>
                    <div style={{ fontSize: 15, color: active ? '#e8e0d4' : 'rgba(232,224,212,0.5)', fontWeight: 400 }}>{f.short}</div>
                    <div style={{ fontSize: 10, color: 'rgba(232,224,212,0.2)', fontFamily: sans, marginTop: 4, lineHeight: 1.4 }}>{f.notes.slice(0, 3).join(' · ')}</div>
                  </button>
                )
              })}
            </div>

            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <button onClick={() => setShowChemistry(true)} disabled={labSelected.length < 2} style={{ background: labSelected.length >= 2 ? 'rgba(201,169,110,0.1)' : 'rgba(201,169,110,0.03)', border: '1px solid rgba(201,169,110,0.25)', color: labSelected.length >= 2 ? gold : 'rgba(201,169,110,0.2)', padding: '10px 32px', cursor: labSelected.length >= 2 ? 'pointer' : 'default', fontFamily: sans, fontSize: 10, letterSpacing: '0.25em', textTransform: 'uppercase', transition: 'all 0.3s ease', backdropFilter: 'blur(8px)' }}>Test Chemistry</button>
              <button onClick={() => { setLabSelected([]); setShowChemistry(false) }} style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', color: 'rgba(232,224,212,0.25)', padding: '10px 24px', cursor: 'pointer', fontFamily: sans, fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase' }}>Clear</button>
              <span style={{ fontSize: 10, color: 'rgba(232,224,212,0.15)', fontFamily: sans, letterSpacing: '0.1em', marginLeft: 8 }}>{labSelected.length}/3</span>
            </div>

            {showChemistry && chemistry && (
              <div style={{ marginTop: 40, animation: 'fadeUp 0.6s ease both' }}>
                <div style={{ textAlign: 'center', padding: '36px 0 28px', borderBottom: '1px solid rgba(201,169,110,0.08)' }}>
                  <div style={{ ...labelStyle, color: 'rgba(201,169,110,0.35)', marginBottom: 12 }}>Chemistry Score</div>
                  <div style={{ fontSize: 72, fontWeight: 300, color: getScoreColor(chemistry.total), letterSpacing: '0.02em', lineHeight: 1 }}>{chemistry.total}</div>
                  <div style={{ fontSize: 14, color: 'rgba(232,224,212,0.35)', fontFamily: sans, fontWeight: 300, marginTop: 8 }}>{chemistry.names.join(' × ')}</div>
                  <div style={{ fontSize: 12, color: 'rgba(232,224,212,0.2)', fontFamily: sans, marginTop: 6 }}>
                    {chemistry.total >= 80 ? 'Exceptional pairing, these were made for each other' : chemistry.total >= 65 ? 'Strong combination, complementary with real character' : chemistry.total >= 45 ? 'Interesting tension, could work with careful application' : chemistry.total >= 25 ? 'Risky pairing, competing profiles, proceed with caution' : 'These are fighting each other, better worn separately'}
                  </div>
                </div>
                <div style={{ padding: '28px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                  {[{ label: 'Note Harmony', ...chemistry.harmony }, { label: 'Weight Balance', ...chemistry.weight }, { label: 'Temperature', ...chemistry.temperature }, { label: 'Projection', ...chemistry.projection }].map(item => (
                    <div key={item.label}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <div style={{ ...labelStyle, color: 'rgba(201,169,110,0.4)', margin: 0 }}>{item.label}</div>
                        <div style={{ fontSize: 10, fontFamily: sans, color: item.verdict === 'Excellent' ? '#7ab87a' : item.verdict === 'Good' ? gold : item.verdict === 'Fair' ? '#c49a6a' : '#a06060', letterSpacing: '0.1em' }}>{item.verdict}</div>
                      </div>
                      <div style={{ height: 3, background: 'rgba(255,255,255,0.03)', position: 'relative' }}>
                        <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: `${(item.score / item.max) * 100}%`, background: item.verdict === 'Excellent' ? '#7ab87a' : item.verdict === 'Good' ? gold : item.verdict === 'Fair' ? '#c49a6a' : '#a06060', transition: 'width 0.8s ease' }} />
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ borderTop: '1px solid rgba(201,169,110,0.06)', paddingTop: 24, marginBottom: 24 }}>
                  <div style={{ ...labelStyle, color: 'rgba(201,169,110,0.35)', marginBottom: 16 }}>The Journey</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {[{ phase: 'Opening', text: chemistry.opening, time: '0 to 15 min' }, { phase: 'Heart', text: chemistry.heart, time: '15 min to 3 hrs' }, { phase: 'Dry-down', text: chemistry.drydown, time: '3 hrs+' }].map((p, i) => (
                      <div key={p.phase} style={{ display: 'flex', gap: 16, animation: `fadeUp 0.4s ease ${i * 0.1}s both` }}>
                        <div style={{ width: 60, flexShrink: 0 }}><div style={{ fontSize: 10, fontFamily: sans, color: gold, letterSpacing: '0.15em', textTransform: 'uppercase' }}>{p.phase}</div><div style={{ fontSize: 9, fontFamily: sans, color: 'rgba(232,224,212,0.15)', marginTop: 2 }}>{p.time}</div></div>
                        <div style={{ fontSize: 14, color: 'rgba(232,224,212,0.5)', lineHeight: 1.7, fontWeight: 300, paddingTop: 1 }}>{p.text}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ padding: '20px 24px', border: '1px solid rgba(201,169,110,0.1)', background: 'rgba(201,169,110,0.02)', backdropFilter: 'blur(8px)' }}>
                  <div style={{ ...labelStyle, color: 'rgba(201,169,110,0.4)', marginBottom: 10 }}>How to Wear It</div>
                  <div style={{ fontSize: 13, color: 'rgba(232,224,212,0.5)', fontFamily: sans, lineHeight: 1.7, fontWeight: 300 }}>{chemistry.application}</div>
                </div>
              </div>
            )}
          </div>
        )}

        <footer style={{ padding: '40px 0', borderTop: '1px solid rgba(255,255,255,0.02)', textAlign: 'center' }}>
          <span style={{ fontSize: 9, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(232,224,212,0.1)', fontFamily: sans }}>Sillage, A Considered Collection</span>
        </footer>
      </div>

      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeDown { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        ::selection { background: rgba(201,169,110,0.2); color: #e8e0d4; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: rgba(255,255,255,0.01); }
        ::-webkit-scrollbar-thumb { background: rgba(201,169,110,0.18); border-radius: 2px; animation: scrollPulse 3.5s ease-in-out infinite; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(201,169,110,0.4); }
        @keyframes scrollPulse { 0%, 100% { box-shadow: 0 0 2px 0px rgba(201,169,110,0); background: rgba(201,169,110,0.15); } 50% { box-shadow: 0 0 5px 1px rgba(201,169,110,0.1); background: rgba(201,169,110,0.28); } }
      `}</style>
    </div>
  )
}
