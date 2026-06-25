import { useState, useMemo, useEffect, useRef } from 'react'
import type { CSSProperties } from 'react'
import { WEATHER_MAP, OCCASION_MAP, ENERGY_MAP, TIME_MAP } from '../domain/selector'
import { FRAGRANCES, scoreOne, chemistryOf, getLayerPartner } from './data'
import type { Fragrance } from './data'
import { deriveNose, scentOfDay, greeting, reasonFor, currentSeason } from './families'
import Smoke from './Smoke'
import Splash from './Splash'
import Wheel from './Wheel'

/* The whole app in one phone — splash open, breathing Home, living Wheel, Shelf,
 * Perfumery Lab, Daily Selector, your Nose and Settings. Bones are the typed
 * engines; brain is the original's mood + chemistry. Real data only. */

const GOLD = '#caa25f'
const SERIF = "'Fraunces', 'Georgia', serif"

type PageId = 'home' | 'wheel' | 'shelf' | 'layer' | 'daily' | 'profile' | 'settings'

const ICONS: Record<PageId, string> = {
  home: 'M7 20V11l5-4 5 4v9M10 20v-4.5a2 2 0 014 0V20',
  wheel: 'M12 12m-8.5 0a8.5 8.5 0 1017 0a8.5 8.5 0 10-17 0M12 12m-2.4 0a2.4 2.4 0 104.8 0a2.4 2.4 0 10-4.8 0M12 3.5v6M12 14.5v6M3.5 12h6M14.5 12h6',
  shelf: 'M3 7h18M4.5 7l1.3 12a1 1 0 001 .9h10.4a1 1 0 001-.9L19.5 7M8 7V5a4 4 0 018 0v2',
  layer: 'M9 12a5.4 5.4 0 1010.8 0A5.4 5.4 0 109 12zM4.2 12a5.4 5.4 0 1010.8 0A5.4 5.4 0 104.2 12z',
  daily: 'M12 12m-4.2 0a4.2 4.2 0 108.4 0a4.2 4.2 0 10-8.4 0M12 3v2.2M12 18.8V21M3 12h2.2M18.8 12H21M5.6 5.6l1.5 1.5M16.9 16.9l1.5 1.5M18.4 5.6l-1.5 1.5M7.1 16.9l-1.5 1.5',
  profile: 'M12 7.5m-3 0a3 3 0 106 0a3 3 0 10-6 0M6.5 15m-2 0a2 2 0 104 0a2 2 0 10-4 0M17.5 15m-2 0a2 2 0 104 0a2 2 0 10-4 0M9.6 9l-1.6 4.2M14.4 9l1.6 4.2',
  settings: 'M4 8h10M18 8h2M4 16h2M10 16h10M16 8m-2.4 0a2.4 2.4 0 104.8 0a2.4 2.4 0 10-4.8 0M8 16m-2.4 0a2.4 2.4 0 104.8 0a2.4 2.4 0 10-4.8 0',
}
const NAV: { id: PageId; label: string }[] = [
  { id: 'home', label: 'Home' }, { id: 'wheel', label: 'Wheel' }, { id: 'shelf', label: 'Shelf' },
  { id: 'layer', label: 'Perfumery' }, { id: 'daily', label: 'Daily' }, { id: 'profile', label: 'Nose' }, { id: 'settings', label: 'Settings' },
]

const aura = (f: Fragrance, h: number): CSSProperties => ({
  height: h, borderRadius: 18, position: 'relative', overflow: 'hidden',
  background: `radial-gradient(120% 90% at 25% 15%, ${f.color} 0%, rgba(8,6,9,0.45) 55%, rgba(6,4,7,0.95) 100%)`,
  border: '1px solid rgba(255,255,255,0.14)', boxShadow: '0 20px 50px rgba(0,0,0,0.45)',
})

export default function SillageApp() {
  const [splashing, setSplashing] = useState(true)
  const [page, setPage] = useState<PageId>('home')

  // settings (functional)
  const [shimmer, setShimmer] = useState<'subtle' | 'pronounced'>('subtle')
  const [bg, setBg] = useState<'smoke' | 'aurora'>('smoke')
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
    const el = itemRefs.current[page], nav = navRef.current, ind = indRef.current
    if (!el || !nav || !ind) return
    const nr = nav.getBoundingClientRect(), er = el.getBoundingClientRect()
    ind.style.left = `${er.left - nr.left + er.width / 2 - 21}px`
  }, [page, splashing])

  const season0 = currentSeason()
  const greet = useMemo(() => greeting(), [])
  const sotd = useMemo(() => scentOfDay(), [])

  const shelf = useMemo(() => {
    let list = [...FRAGRANCES]
    if (season) list = list.filter(f => f.season.includes(season))
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter(f => f.name.toLowerCase().includes(q) || f.house.toLowerCase().includes(q) || f.family.toLowerCase().includes(q) || f.notes.some(n => n.toLowerCase().includes(q)))
    }
    list.sort(sortKey === 'name' ? (a, b) => a.short.localeCompare(b.short) : (a, b) => (b.projection + b.longevity) - (a.projection + a.longevity))
    return list
  }, [query, season, sortKey])

  const results = useMemo(() => {
    if (!showResults) return []
    const conditions = { weather: selWeather, occasion: selOccasion, energy: selEnergy, time: selTime }
    return FRAGRANCES.map(f => ({ ...f, score: scoreOne(f, conditions) })).sort((a, b) => b.score - a.score).slice(0, 3)
  }, [showResults, selWeather, selOccasion, selEnergy, selTime])
  const layer = useMemo(() => results.length ? getLayerPartner(results[0], results.map(r => r.id)) : null, [results])
  const chem = useMemo(() => showChem ? chemistryOf(lab) : null, [showChem, lab])
  const nose = useMemo(() => deriveNose(), [])

  const canGenerate = selWeather.length > 0 || !!selOccasion || !!selEnergy || !!selTime
  const resetDaily = () => { setSelWeather([]); setSelOccasion(''); setSelEnergy(''); setSelTime(''); setShowResults(false) }
  const toggleWeather = (w: string) => { setShowResults(false); setSelWeather(p => p.includes(w) ? p.filter(x => x !== w) : [...p, w]) }
  const toggleLab = (id: number) => { setShowChem(false); setLab(p => p.includes(id) ? p.filter(x => x !== id) : p.length >= 3 ? p : [...p, id]) }
  const scoreColor = (s: number) => s >= 75 ? '#7ab87a' : s >= 50 ? GOLD : s >= 30 ? '#c49a6a' : '#a06060'
  const goShelf = (id: number) => { setPage('shelf'); setOpenId(id) }
  const helloParts = greet.hello.split(' ')

  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', padding: 16, background: 'radial-gradient(130% 100% at 50% -10%,#170f1c 0%,#0a0710 50%,#050407 100%)' }}>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,400;1,9..144,500&family=Archivo:wght@400;500;600&display=swap" rel="stylesheet" />
      {bg === 'smoke' && <Smoke opacity={shimmer === 'pronounced' ? 0.85 : 0.45} count={shimmer === 'pronounced' ? 22 : 14} style={{ zIndex: 0 }} />}
      {bg === 'aurora' && <div className="aurora" />}

      <div className="phone">
        <div className="notch" />
        <div className="wordmark">SILLAGE</div>

        {/* HOME */}
        {page === 'home' && (
          <div className="pg" key="home">
            <div className="H t30">{helloParts[0]} <span className="hi">{helloParts.slice(1).join(' ')}</span></div>
            <div className="sub2">{greet.meta}</div>
            <div className="qh2">Scent of the day</div>
            <div style={aura(sotd, 250)} onClick={() => goShelf(sotd.id)}>
              <div style={{ position: 'absolute', inset: 0, padding: 18, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', background: 'linear-gradient(180deg,rgba(8,6,9,0.05),rgba(8,6,9,0.55))', cursor: 'pointer' }}>
                <div style={{ fontSize: 9, letterSpacing: '0.24em', textTransform: 'uppercase', color: '#e7cfa0' }}>Tonight, reach for</div>
                <div style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 42, lineHeight: 1, margin: '5px 0 7px' }}>{sotd.short}</div>
                <div style={{ fontSize: 11, lineHeight: 1.5, opacity: 0.86 }}>{reasonFor(sotd, season0)}</div>
              </div>
            </div>
            <div className="qh2">From your shelf</div>
            <div className="psx">
              {FRAGRANCES.slice(0, 8).map(f => (
                <div key={f.id} className="psc" style={{ background: `radial-gradient(120% 90% at 30% 20%, ${f.color}, rgba(8,6,9,0.5) 60%, rgba(6,4,7,0.95))` }} onClick={() => goShelf(f.id)}>
                  <div className="psn">{f.short}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* WHEEL */}
        {page === 'wheel' && <div className="pg" key="wheel"><Wheel /></div>}

        {/* SHELF */}
        {page === 'shelf' && (
          <div className="pg" key="shelf">
            <div className="H t30">My <span className="hi">Shelf</span></div>
            <div className="sub2">{FRAGRANCES.length} bottles · hand-profiled</div>
            <div className="search2">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="rgba(251,248,243,.6)" strokeWidth="1.6"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4-4" /></svg>
              <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search your shelf, or any note..." />
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
              <div className="chipsX">
                {[null, 'Spring', 'Summer', 'Autumn', 'Winter'].map(s => (
                  <button key={s || 'all'} className={`chip2${season === s ? ' on' : ''}`} onClick={() => setSeason(s)}>{s || 'All'}</button>
                ))}
              </div>
              <button className="sort2" onClick={() => setSortKey(k => k === 'score' ? 'name' : 'score')}>
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M3 6h12M3 12h8M3 18h4M17 6v12M17 18l3-3M17 18l-3-3" /></svg>{sortKey === 'score' ? 'Score' : 'A–Z'}
              </button>
            </div>
            {shelf.length === 0 && <div style={{ opacity: 0.4, padding: '24px 0', textAlign: 'center', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase' }}>Nothing matches</div>}
            {shelf.map(f => {
              const open = openId === f.id
              return (
                <div key={f.id} className="srow2" style={{ flexWrap: 'wrap', cursor: 'pointer' }} onClick={() => setOpenId(open ? null : f.id)}>
                  <div className="sth" style={{ background: `linear-gradient(160deg, ${f.color}, rgba(8,6,9,0.8))` }} />
                  <div className="si"><div className="sbn">{f.house}</div><div className="snn">{f.short}</div><div className="sfm">{f.family}</div></div>
                  <div className="scc" style={{ color: GOLD }}>{f.longevity}.{f.projection}</div>
                  {open && (
                    <div style={{ flexBasis: '100%', paddingTop: 12, animation: 'rise .3s ease both' }}>
                      <p style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 15, lineHeight: 1.6, opacity: 0.8, margin: '0 0 12px' }}>{f.description}</p>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 10 }}>
                        <div><div className="lab">Projection</div><Bar value={f.projection} /></div>
                        <div><div className="lab">Longevity</div><Bar value={f.longevity} /></div>
                      </div>
                      <div style={{ fontSize: 11, opacity: 0.45, marginBottom: 8 }}>{f.notes.join(' · ')}</div>
                      <div className="sline"><span style={{ color: GOLD }}>Wear:</span> {f.pulsePoints}</div>
                      <div className="sline"><span style={{ color: GOLD }}>Effect:</span> {f.effect}</div>
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
            <div className="H t30">Perfumery <span className="hi">Lab</span></div>
            <div className="sub2">Layer two or three, find the chemistry</div>
            <div className="slots2">
              {[0, 1, 2].map(i => {
                const id = lab[i]; const f = id != null ? FRAGRANCES.find(x => x.id === id) : null
                return <div key={i} className="slot2" style={f ? aura(f, 108) : undefined} onClick={() => f && toggleLab(f.id)}>{f ? <div className="slotl">{f.short}</div> : <div className="plus2">+</div>}</div>
              })}
            </div>
            <div className="qh2">Choose from the shelf · {lab.length}/3</div>
            <div className="picks">
              {FRAGRANCES.map(f => {
                const active = lab.includes(f.id), disabled = !active && lab.length >= 3
                return (
                  <button key={f.id} className={`pick${active ? ' on' : ''}`} disabled={disabled} onClick={() => toggleLab(f.id)}>
                    <span style={{ width: 3, alignSelf: 'stretch', background: f.color, borderRadius: 2, opacity: active ? 1 : 0.3 }} />
                    <span style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}><span className="pickn">{f.short}</span><span className="pickf">{f.house}</span></span>
                  </button>
                )
              })}
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button className="cta" disabled={lab.length < 2} onClick={() => setShowChem(true)}>Test Chemistry</button>
              <button className="ghost" onClick={() => { setLab([]); setShowChem(false) }}>Clear</button>
            </div>
            {showChem && chem && (
              <div style={{ marginTop: 26 }} key={chem.names.join()}>
                <div style={{ textAlign: 'center', marginTop: 6 }}>
                  <div style={{ fontFamily: SERIF, fontSize: 64, lineHeight: 1, color: scoreColor(chem.total), textShadow: '0 0 28px rgba(202,162,95,.45)' }}>{chem.total}</div>
                  <div style={{ fontSize: 9, letterSpacing: '0.26em', textTransform: 'uppercase', opacity: 0.6, marginTop: 4 }}>Chemistry Score</div>
                  <div style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 15, opacity: 0.8, marginTop: 6 }}>{chem.names.join(' × ')}</div>
                  <div style={{ fontSize: 11, opacity: 0.5, marginTop: 6, lineHeight: 1.5 }}>{chem.total >= 80 ? 'Made for each other.' : chem.total >= 65 ? 'Strong, complementary character.' : chem.total >= 45 ? 'Interesting tension, apply with care.' : chem.total >= 25 ? 'Competing profiles, risky.' : 'Fighting each other, wear apart.'}</div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, margin: '24px 0 6px' }}>
                  {[{ l: 'Harmony', ...chem.harmony }, { l: 'Weight', ...chem.weight }, { l: 'Temperature', ...chem.temperature }, { l: 'Projection', ...chem.projection }].map(a => {
                    const col = a.verdict === 'Excellent' ? '#7ab87a' : a.verdict === 'Good' ? GOLD : a.verdict === 'Fair' ? '#c49a6a' : '#a06060'
                    return <div key={a.l}><div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}><span className="lab">{a.l}</span><span style={{ fontSize: 9, color: col, letterSpacing: '0.1em' }}>{a.verdict}</span></div><div className="track"><div style={{ height: '100%', width: `${(a.score / a.max) * 100}%`, background: col, transition: 'width .8s ease' }} /></div></div>
                  })}
                </div>
                <div className="qh2">The Journey</div>
                {[{ p: 'Opening', t: chem.opening, w: '0–15 min' }, { p: 'Heart', t: chem.heart, w: '15 min–3 hr' }, { p: 'Dry-down', t: chem.drydown, w: '3 hr +' }].map(s => (
                  <div key={s.p} style={{ display: 'flex', gap: 14, marginTop: 13 }}><div style={{ width: 66, flexShrink: 0 }}><div style={{ color: GOLD, fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase' }}>{s.p}</div><div style={{ fontSize: 8.5, opacity: 0.35, marginTop: 2 }}>{s.w}</div></div><div style={{ fontSize: 12.5, lineHeight: 1.6, opacity: 0.55 }}>{s.t}</div></div>
                ))}
                <div style={{ marginTop: 20, padding: 16, border: '1px solid rgba(202,162,95,.14)', borderRadius: 13, background: 'rgba(202,162,95,.03)' }}><div className="lab" style={{ marginBottom: 8 }}>How to wear it</div><div style={{ fontSize: 12.5, opacity: 0.6, lineHeight: 1.7 }}>{chem.application}</div></div>
              </div>
            )}
          </div>
        )}

        {/* DAILY */}
        {page === 'daily' && (
          <div className="pg" key="daily">
            <div className="H t30">Daily <span className="hi">Selector</span></div>
            <div className="sub2">Tonight's pick, from how you feel</div>
            <div className="qh2">Conditions</div><div className="chips2">{Object.keys(WEATHER_MAP).map(w => <button key={w} className={`chip2${selWeather.includes(w) ? ' on' : ''}`} onClick={() => toggleWeather(w)}>{w}</button>)}</div>
            <div className="qh2">How do you feel?</div><div className="chips2">{Object.keys(ENERGY_MAP).map(e => <button key={e} className={`chip2${selEnergy === e ? ' on' : ''}`} onClick={() => { setShowResults(false); setSelEnergy(selEnergy === e ? '' : e) }}>{e}</button>)}</div>
            <div className="qh2">Where to?</div><div className="chips2">{Object.keys(OCCASION_MAP).map(o => <button key={o} className={`chip2${selOccasion === o ? ' on' : ''}`} onClick={() => { setShowResults(false); setSelOccasion(selOccasion === o ? '' : o) }}>{o}</button>)}</div>
            <div className="qh2">Time of day</div><div className="chips2">{Object.keys(TIME_MAP).map(t => <button key={t} className={`chip2${selTime === t ? ' on' : ''}`} onClick={() => { setShowResults(false); setSelTime(selTime === t ? '' : t) }}>{t}</button>)}</div>
            <div style={{ display: 'flex', gap: 10, marginTop: 22 }}><button className="cta" disabled={!canGenerate} onClick={() => setShowResults(true)}>Select Scent</button><button className="ghost" onClick={resetDaily}>Reset</button></div>
            {showResults && results.length > 0 && (() => {
              const top = results[0]
              return (
                <div style={{ marginTop: 24 }} key={top.id}>
                  <div style={aura(top, 200)}>
                    <div style={{ position: 'absolute', inset: 0, padding: 16, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', background: 'linear-gradient(180deg,rgba(8,6,9,0.05),rgba(8,6,9,0.6))' }}>
                      <div style={{ fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#e7cfa0' }}>{top.mood} · {top.score}% match</div>
                      <div style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 30, margin: '4px 0 5px' }}>{top.short}</div>
                      <div style={{ fontSize: 11, lineHeight: 1.5, opacity: 0.88 }}>{top.description}</div>
                    </div>
                  </div>
                  <div className="sline" style={{ marginTop: 12 }}><span style={{ color: GOLD }}>Apply:</span> {top.pulsePoints}</div>
                  {layer && (
                    <div style={{ marginTop: 14, padding: 14, border: '1px solid rgba(202,162,95,.2)', borderRadius: 13, background: 'rgba(202,162,95,.04)' }}>
                      <div className="lab" style={{ marginBottom: 8 }}>Optional layer · {layer.chemistry}% chemistry</div>
                      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}><div style={{ width: 3, alignSelf: 'stretch', background: layer.color, borderRadius: 2 }} /><div><div style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 17 }}>{layer.name}</div><div style={{ fontSize: 11, opacity: 0.55, lineHeight: 1.6, marginTop: 3 }}>{(() => { const [b, t] = layer.warmth >= top.warmth ? [layer, top] : [top, layer]; return `${b.short} to the chest first, then ${t.short} at the wrists.` })()}</div></div></div>
                    </div>
                  )}
                  <div className="qh2">Alternatives</div>
                  {results.slice(1).map(r => <div key={r.id} className="alt2"><span className="altv">{r.short}</span><span style={{ opacity: 0.7, fontSize: 11 }}>{r.score}% ◇</span></div>)}
                </div>
              )
            })()}
          </div>
        )}

        {/* PROFILE — your nose */}
        {page === 'profile' && (
          <div className="pg" key="profile">
            <div className="H t30">Your <span className="hi">Nose</span></div>
            <div className="sub2">Mapped from what you own and how it's profiled</div>
            <div className="qh2">Dominant families</div>
            {nose.families.map(fam => (
              <div key={fam.name} style={{ display: 'flex', alignItems: 'center', gap: 9, margin: '7px 0' }}>
                <span style={{ fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', width: 64, opacity: 0.7 }}>{fam.name}</span>
                <div style={{ height: 9, borderRadius: 5, flex: 1, background: 'rgba(255,255,255,.07)', overflow: 'hidden' }}><div style={{ height: '100%', borderRadius: 5, width: `${fam.pct}%`, background: fam.color, transition: 'width .8s ease' }} /></div>
              </div>
            ))}
            <div className="qh2">Signature notes</div>
            <div className="chips2">{nose.notes.map((n, i) => <span key={n} className={`chip2${i === 0 ? ' on' : ''}`}>{n}</span>)}</div>
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <div className="stat"><div className="statv">{nose.bottles}</div><div className="statl">Bottles</div></div>
              <div className="stat"><div className="statv">{nose.avgLongevity}</div><div className="statl">Avg longevity</div></div>
              <div className="stat"><div className="statv" style={{ fontSize: 16 }}>{nose.anchor}</div><div className="statl">Anchor scent</div></div>
            </div>
          </div>
        )}

        {/* SETTINGS */}
        {page === 'settings' && (
          <div className="pg" key="settings">
            <div className="H t30">Settings</div>
            <div className="sub2">Make it yours</div>
            <div className="qh2" style={{ marginTop: 14 }}>Feel</div>
            <div className="set"><span>Shimmer</span><div className="seg"><span className={shimmer === 'subtle' ? 'on' : ''} onClick={() => setShimmer('subtle')}>Subtle</span><span className={shimmer === 'pronounced' ? 'on' : ''} onClick={() => setShimmer('pronounced')}>Pronounced</span></div></div>
            <div className="set"><span>Background</span><div className="seg"><span className={bg === 'smoke' ? 'on' : ''} onClick={() => setBg('smoke')}>Smoke</span><span className={bg === 'aurora' ? 'on' : ''} onClick={() => setBg('aurora')}>Aurora</span></div></div>
            <div className="set"><span>Daily reminder</span><div className={`tog${reminder ? ' on' : ''}`} onClick={() => setReminder(r => !r)} /></div>
            <div className="qh2" style={{ marginTop: 14 }}>Collection</div>
            <div className="set"><span>Catalogue</span><span className="setv">{FRAGRANCES.length} hand-profiled</span></div>
            <div className="set"><span>Data</span><span className="setv">Real · never fabricated</span></div>
            <div className="set"><span>Open the wardrobe</span><span className="setv" style={{ cursor: 'pointer', color: GOLD }} onClick={() => setSplashing(true)}>Replay open ↻</span></div>
          </div>
        )}

        {/* NAV */}
        <div className="nav" ref={navRef}>
          <div className="indicator" ref={indRef} />
          {NAV.map(n => (
            <button key={n.id} ref={el => { itemRefs.current[n.id] = el }} className={`nv${page === n.id ? ' active' : ''}`} onClick={() => { setPage(n.id); setOpenId(null) }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d={ICONS[n.id]} /></svg>
              <span className="nl">{n.label}</span>
            </button>
          ))}
        </div>

        {splashing && <Splash onDone={() => setSplashing(false)} />}
      </div>

      <style>{`
        .phone{position:relative;width:392px;height:min(820px,94vh);border-radius:46px;background:#08060c;border:9px solid #16131c;box-shadow:0 50px 100px rgba(0,0,0,.7),inset 0 1px 0 rgba(255,255,255,.1);overflow:hidden;font-family:'Archivo','Helvetica Neue',sans-serif;color:#fbf8f3;z-index:2;}
        @media (max-width:440px){.phone{width:100%;height:100vh;border-radius:0;border-width:0;}}
        .notch{position:absolute;top:0;left:50%;transform:translateX(-50%);width:120px;height:26px;background:#16131c;border-radius:0 0 16px 16px;z-index:40;}
        .wordmark{position:absolute;top:14px;left:0;right:0;text-align:center;font-family:${SERIF};font-size:13px;letter-spacing:7px;color:${GOLD};opacity:.85;z-index:39;pointer-events:none;}
        .aurora{position:absolute;inset:0;z-index:0;background:linear-gradient(115deg,#ff6ec4,#7873f5,#4ade80,#fef08a,#ff6ec4);background-size:300% 300%;filter:blur(60px) saturate(120%);opacity:.16;animation:irid 14s ease infinite;}
        @keyframes irid{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
        .pg{position:absolute;inset:0;padding:50px 20px 88px;overflow-y:auto;scrollbar-width:none;animation:rise .5s cubic-bezier(.4,0,.2,1) both;}
        .pg::-webkit-scrollbar{display:none;}
        @keyframes rise{from{opacity:0;transform:translateY(22px);filter:blur(6px);}to{opacity:1;transform:translateY(0);filter:blur(0);}}
        .H{font-family:${SERIF};font-weight:400;letter-spacing:-.01em;}.t30{font-size:29px;}.hi{font-style:italic;color:${GOLD};}
        .sub2{font-size:11px;opacity:.55;margin-top:2px;}
        .qh2{font-size:9.5px;letter-spacing:.2em;text-transform:uppercase;opacity:.5;margin:18px 0 9px;}
        .lab{font-size:9px;letter-spacing:.22em;text-transform:uppercase;font-family:'Archivo',sans-serif;opacity:.5;}
        .chips2{display:flex;gap:7px;flex-wrap:wrap;}.chipsX{display:flex;gap:7px;overflow-x:auto;scrollbar-width:none;flex:1;}.chipsX::-webkit-scrollbar{display:none;}
        .chip2{flex:0 0 auto;font-size:10px;letter-spacing:.1em;text-transform:uppercase;padding:6px 11px;border-radius:20px;border:1px solid rgba(255,255,255,.14);color:rgba(251,248,243,.7);cursor:pointer;white-space:nowrap;transition:.2s;background:transparent;}
        .chip2.on{background:rgba(202,162,95,.18);border-color:rgba(202,162,95,.5);color:#e7cfa0;}
        .search2{display:flex;align-items:center;gap:9px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:10px 12px;margin:14px 0 10px;}
        .search2 input{flex:1;background:none;border:none;outline:none;color:#fbf8f3;font-size:13px;font-family:'Archivo';}
        .search2 input::placeholder{color:rgba(251,248,243,.4);}
        .sort2{flex:0 0 auto;font-size:10px;letter-spacing:.1em;text-transform:uppercase;padding:7px 10px;border-radius:20px;border:1px solid rgba(255,255,255,.14);color:rgba(251,248,243,.7);cursor:pointer;display:flex;gap:5px;align-items:center;background:transparent;}
        .srow2{display:flex;gap:12px;align-items:center;padding:11px 0;border-bottom:1px solid rgba(255,255,255,.06);}
        .sth{width:48px;height:62px;border-radius:9px;flex:0 0 auto;border:1px solid rgba(255,255,255,.12);}
        .si{flex:1;min-width:0;}.sbn{font-size:8px;letter-spacing:.18em;text-transform:uppercase;opacity:.55;}
        .snn{font-family:${SERIF};font-style:italic;font-size:18px;line-height:1.1;margin:1px 0 3px;}.sfm{font-size:9px;opacity:.6;}
        .scc{font-family:${SERIF};font-size:16px;opacity:.92;flex:0 0 auto;}
        .sline{font-size:11.5px;opacity:.55;line-height:1.6;margin-top:5px;}
        .psx{display:flex;gap:11px;overflow-x:auto;scrollbar-width:none;padding-bottom:4px;}.psx::-webkit-scrollbar{display:none;}
        .psc{flex:0 0 auto;width:104px;height:140px;border-radius:13px;overflow:hidden;position:relative;border:1px solid rgba(255,255,255,.13);cursor:pointer;}
        .psn{position:absolute;left:9px;bottom:9px;font-family:${SERIF};font-style:italic;font-size:14px;}
        .cta{flex:1;background:rgba(202,162,95,.16);border:1px solid rgba(202,162,95,.45);color:#e7cfa0;padding:12px;border-radius:13px;cursor:pointer;font-family:'Archivo';font-size:10px;letter-spacing:.22em;text-transform:uppercase;transition:.25s;}
        .cta:disabled{opacity:.35;cursor:default;}
        .ghost{background:transparent;border:1px solid rgba(255,255,255,.14);color:rgba(251,248,243,.6);padding:12px 18px;border-radius:13px;cursor:pointer;font-family:'Archivo';font-size:10px;letter-spacing:.18em;text-transform:uppercase;}
        .slots2{display:flex;align-items:center;gap:9px;margin-top:16px;}
        .slot2{flex:1;height:108px;border-radius:14px;border:1px dashed rgba(255,255,255,.2);display:flex;align-items:flex-end;justify-content:center;position:relative;cursor:pointer;overflow:hidden;}
        .slotl{position:absolute;inset:0;display:flex;align-items:flex-end;justify-content:center;padding-bottom:9px;font-family:${SERIF};font-style:italic;font-size:15px;}
        .plus2{font-family:${SERIF};font-size:22px;opacity:.4;}
        .picks{display:grid;grid-template-columns:1fr 1fr;gap:7px;}
        .pick{display:flex;gap:8px;align-items:center;text-align:left;padding:9px 10px;border-radius:11px;cursor:pointer;transition:.2s;background:rgba(255,255,255,.025);border:1px solid rgba(255,255,255,.06);color:#fbf8f3;}
        .pick.on{background:rgba(202,162,95,.1);border-color:rgba(202,162,95,.4);}.pick:disabled{opacity:.3;cursor:default;}
        .pickn{font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}.pickf{font-size:8.5px;letter-spacing:.12em;text-transform:uppercase;opacity:.5;}
        .track{height:3px;border-radius:2px;background:rgba(255,255,255,.06);overflow:hidden;}
        .alt2{display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-top:1px solid rgba(255,255,255,.07);}.altv{font-family:${SERIF};font-style:italic;font-size:15px;}
        .stat{flex:1;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:13px;padding:12px;text-align:center;}.statv{font-family:${SERIF};font-size:22px;}.statl{font-size:8px;letter-spacing:.14em;text-transform:uppercase;opacity:.55;margin-top:2px;}
        .set{display:flex;justify-content:space-between;align-items:center;padding:13px 0;border-bottom:1px solid rgba(255,255,255,.07);font-size:13px;}
        .setv{font-size:11px;opacity:.6;}
        .seg{display:flex;border:1px solid rgba(255,255,255,.14);border-radius:10px;overflow:hidden;}.seg span{font-size:9px;letter-spacing:.08em;text-transform:uppercase;padding:5px 9px;cursor:pointer;opacity:.55;}.seg span.on{background:rgba(202,162,95,.2);opacity:1;color:#e7cfa0;}
        .tog{width:34px;height:19px;border-radius:12px;background:rgba(255,255,255,.12);position:relative;cursor:pointer;transition:.25s;}.tog.on{background:rgba(202,162,95,.5);}
        .tog::after{content:'';position:absolute;top:2px;left:2px;width:15px;height:15px;border-radius:50%;background:#fff;transition:.25s;}.tog.on::after{left:17px;}
        .nav{position:absolute;left:0;right:0;bottom:0;height:74px;display:flex;align-items:center;justify-content:space-around;padding:0 4px 10px;z-index:30;background:linear-gradient(180deg,rgba(14,10,16,.2),rgba(9,6,12,.92));-webkit-backdrop-filter:blur(22px);backdrop-filter:blur(22px);border-top:1px solid rgba(255,255,255,.08);}
        .indicator{position:absolute;top:8px;height:42px;width:42px;border-radius:14px;background:radial-gradient(circle,rgba(202,162,95,.32),rgba(202,162,95,.05));border:1px solid rgba(202,162,95,.35);transition:left .45s cubic-bezier(.6,.05,.1,1);z-index:0;}
        .nv{position:relative;z-index:1;display:flex;flex-direction:column;align-items:center;gap:3px;cursor:pointer;background:none;border:none;color:#fbf8f3;opacity:.42;transition:.3s;width:44px;}
        .nv.active{opacity:1;}.nv svg{width:20px;height:20px;}.nv.active svg{filter:drop-shadow(0 0 6px rgba(202,162,95,.7));}
        .nl{font-size:7px;letter-spacing:.04em;text-transform:uppercase;}
        ::selection{background:rgba(202,162,95,.25);color:#fff;}
      `}</style>
    </div>
  )
}

function Bar({ value, max = 10 }: { value: number; max?: number }) {
  return <div style={{ display: 'flex', gap: 3, marginTop: 5 }}>{Array.from({ length: max }).map((_, j) => <div key={j} style={{ flex: 1, height: 3, borderRadius: 2, background: j < value ? GOLD : 'rgba(255,255,255,0.07)' }} />)}</div>
}
