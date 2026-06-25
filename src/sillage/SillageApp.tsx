import { useState, useMemo, useEffect, useRef } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { WEATHER_MAP, OCCASION_MAP, ENERGY_MAP, TIME_MAP } from '../domain/selector'
import { FRAGRANCES, scoreOne, chemistryOf, getLayerPartner } from './data'
import type { Fragrance } from './data'

/* ----------------------------------------------------------------------------
 * Sillage — the vertical, optimised shape. A phone-shaped immersive wardrobe
 * that rises through smoke. Bones are the typed engines (scoreOne / chemistryOf
 * / getLayerPartner); the brain is the original's mood-driven Daily and the
 * Perfumery layering lab. Scent data is real and hand-profiled, never faked.
 * -------------------------------------------------------------------------- */

const GOLD = '#caa25f'
const GOLD_SOFT = 'rgba(202,162,95,0.5)'
const SERIF = "'Fraunces', 'Georgia', serif"
const SANS = "'Archivo', 'Helvetica Neue', sans-serif"

type PageId = 'shelf' | 'daily' | 'layer'

const NAV: { id: PageId; label: string; icon: string }[] = [
  { id: 'shelf', label: 'Shelf', icon: 'M3 7h18M3 7l1.5 12.5a1 1 0 001 .9h11a1 1 0 001-.9L19 7M8 7V5a4 4 0 018 0v2' },
  { id: 'daily', label: 'Daily', icon: 'M12 3v2.2M12 18.8V21M3 12h2.2M18.8 12H21M5.6 5.6l1.5 1.5M16.9 16.9l1.5 1.5M18.4 5.6l-1.5 1.5M7.1 16.9l-1.5 1.5' },
  { id: 'layer', label: 'Perfumery', icon: 'M9 12a5.4 5.4 0 1010.8 0A5.4 5.4 0 109 12zM4.2 12a5.4 5.4 0 1010.8 0A5.4 5.4 0 104.2 12z' },
]

/* --- ambient smoke, vanilla canvas, no deps --------------------------------- */
function Smoke() {
  const ref = useRef<HTMLCanvasElement | null>(null)
  useEffect(() => {
    const c = ref.current
    if (!c) return
    const ctx = c.getContext('2d')
    if (!ctx) return
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let W = 0, H = 0, raf = 0
    const cols = [[150, 120, 95], [120, 80, 90], [170, 140, 90]]
    type P = { x: number; y: number; vx: number; vy: number; r: number; life: number; max: number; seed: number; col: number[] }
    const ps: P[] = []
    const resize = () => {
      const r = c.getBoundingClientRect()
      W = r.width; H = r.height
      c.width = W * dpr; c.height = H * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    const spawn = (): P => ({
      x: W * Math.random(), y: H * 1.02, vx: (Math.random() - 0.5) * 0.2, vy: -(0.2 + Math.random() * 0.35),
      r: 40 + Math.random() * 60, life: Math.random() * 200, max: 420 + Math.random() * 200,
      seed: Math.random() * 6.28, col: cols[(Math.random() * cols.length) | 0],
    })
    resize()
    window.addEventListener('resize', resize)
    for (let i = 0; i < 16; i++) { const p = spawn(); p.y = Math.random() * H; ps.push(p) }
    let t = 0
    const frame = () => {
      t++
      ctx.clearRect(0, 0, W, H)
      ctx.globalCompositeOperation = 'lighter'
      for (let i = ps.length - 1; i >= 0; i--) {
        const p = ps[i]
        p.life++
        const n = Math.sin(p.y * 0.012 + p.seed + t * 0.01) * 0.4
        p.vx += n * 0.02; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.r += 0.28
        const pr = p.life / p.max
        const a = Math.sin(Math.min(pr, 1) * Math.PI) * 0.06
        if (pr >= 1 || p.y < -90) { ps.splice(i, 1); ps.push(spawn()); continue }
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r)
        g.addColorStop(0, `rgba(${p.col[0]},${p.col[1]},${p.col[2]},${a})`)
        g.addColorStop(1, `rgba(${p.col[0]},${p.col[1]},${p.col[2]},0)`)
        ctx.fillStyle = g
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.2832); ctx.fill()
      }
      raf = requestAnimationFrame(frame)
    }
    frame()
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [])
  return <canvas ref={ref} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', filter: 'blur(22px)', opacity: 0.5, pointerEvents: 'none' }} />
}

const label: CSSProperties = { fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', fontFamily: SANS, opacity: 0.5 }

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button onClick={onClick} style={{
      flex: '0 0 auto', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase',
      padding: '7px 12px', borderRadius: 20, whiteSpace: 'nowrap', cursor: 'pointer',
      transition: 'all 0.22s ease', fontFamily: SANS,
      background: active ? 'rgba(202,162,95,0.18)' : 'transparent',
      border: `1px solid ${active ? 'rgba(202,162,95,0.5)' : 'rgba(255,255,255,0.14)'}`,
      color: active ? '#e7cfa0' : 'rgba(251,248,243,0.7)',
    }}>{children}</button>
  )
}

function Bar({ value, max = 10 }: { value: number; max?: number }) {
  return (
    <div style={{ display: 'flex', gap: 3, marginTop: 5 }}>
      {Array.from({ length: max }).map((_, j) => (
        <div key={j} style={{ flex: 1, height: 3, borderRadius: 2, background: j < value ? GOLD : 'rgba(255,255,255,0.07)', transition: 'background 0.3s ease' }} />
      ))}
    </div>
  )
}

export default function SillageApp() {
  const [page, setPage] = useState<PageId>('shelf')
  const indicatorRef = useRef<HTMLDivElement | null>(null)
  const navRef = useRef<HTMLDivElement | null>(null)
  const itemRefs = useRef<Record<string, HTMLButtonElement | null>>({})

  // shelf
  const [query, setQuery] = useState('')
  const [season, setSeason] = useState<string | null>(null)
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

  // glide the nav indicator under the active item
  useEffect(() => {
    const el = itemRefs.current[page]
    const nav = navRef.current
    const ind = indicatorRef.current
    if (!el || !nav || !ind) return
    const nr = nav.getBoundingClientRect()
    const er = el.getBoundingClientRect()
    ind.style.left = `${er.left - nr.left + er.width / 2 - 23}px`
  }, [page])

  const shelf = useMemo(() => {
    let list = FRAGRANCES
    if (season) list = list.filter(f => f.season.includes(season))
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter(f =>
        f.name.toLowerCase().includes(q) || f.house.toLowerCase().includes(q) ||
        f.family.toLowerCase().includes(q) || f.notes.some(n => n.toLowerCase().includes(q)))
    }
    return list
  }, [query, season])

  const results = useMemo(() => {
    if (!showResults) return []
    const conditions = { weather: selWeather, occasion: selOccasion, energy: selEnergy, time: selTime }
    return FRAGRANCES.map(f => ({ ...f, score: scoreOne(f, conditions) })).sort((a, b) => b.score - a.score).slice(0, 3)
  }, [showResults, selWeather, selOccasion, selEnergy, selTime])
  const layer = useMemo(() => results.length ? getLayerPartner(results[0], results.map(r => r.id)) : null, [results])
  const chem = useMemo(() => showChem ? chemistryOf(lab) : null, [showChem, lab])

  const canGenerate = selWeather.length > 0 || !!selOccasion || !!selEnergy || !!selTime
  const resetDaily = () => { setSelWeather([]); setSelOccasion(''); setSelEnergy(''); setSelTime(''); setShowResults(false) }
  const toggleWeather = (w: string) => { setShowResults(false); setSelWeather(p => p.includes(w) ? p.filter(x => x !== w) : [...p, w]) }
  const toggleLab = (id: number) => { setShowChem(false); setLab(p => p.includes(id) ? p.filter(x => x !== id) : p.length >= 3 ? p : [...p, id]) }
  const scoreColor = (s: number) => s >= 75 ? '#7ab87a' : s >= 50 ? GOLD : s >= 30 ? '#c49a6a' : '#a06060'

  const panel = (f: Fragrance, h: number): CSSProperties => ({
    height: h, borderRadius: 14, position: 'relative', overflow: 'hidden',
    background: `linear-gradient(155deg, ${f.color} 0%, rgba(8,6,9,0.55) 62%, rgba(8,6,9,0.92) 100%)`,
    border: '1px solid rgba(255,255,255,0.12)',
  })

  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(130% 100% at 50% -10%,#170f1c 0%,#0a0710 50%,#050407 100%)', overflow: 'hidden', padding: 16 }}>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,400;1,9..144,500&family=Archivo:wght@400;500;600&display=swap" rel="stylesheet" />
      <Smoke />

      <div className="phone">
        <div className="notch" />

        {/* ---- SHELF ---- */}
        {page === 'shelf' && (
          <div className="page" key="shelf">
            <div className="ph">My <span className="phi">Shelf</span></div>
            <div className="sub">{FRAGRANCES.length} bottles · hand-profiled</div>

            <div className="search">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="rgba(251,248,243,.6)" strokeWidth="1.6"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4-4" /></svg>
              <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search your shelf, or any note..." />
            </div>
            <div className="chips">
              {[null, 'Spring', 'Summer', 'Autumn', 'Winter'].map(s => (
                <Chip key={s || 'all'} active={season === s} onClick={() => setSeason(s)}>{s || 'All'}</Chip>
              ))}
            </div>

            <div style={{ marginTop: 6 }}>
              {shelf.length === 0 && <div style={{ ...label, opacity: 0.4, padding: '24px 0', textAlign: 'center' }}>Nothing matches</div>}
              {shelf.map(f => {
                const open = openId === f.id
                return (
                  <div key={f.id} className="srow" onClick={() => setOpenId(open ? null : f.id)}>
                    <div className="sthumb" style={{ background: `linear-gradient(160deg, ${f.color}, rgba(8,6,9,0.8))` }} />
                    <div className="sinfo">
                      <div className="sb">{f.house}</div>
                      <div className="sn">{f.short}</div>
                      <div className="sfam">{f.family}</div>
                    </div>
                    <div className="ssc">{f.longevity}.{f.projection}</div>
                    {open && (
                      <div className="sdetail">
                        <p className="sdesc">{f.description}</p>
                        <div className="sgrid">
                          <div><div style={label}>Projection</div><Bar value={f.projection} /></div>
                          <div><div style={label}>Longevity</div><Bar value={f.longevity} /></div>
                        </div>
                        <div className="snotes">{f.notes.join(' · ')}</div>
                        <div className="sline"><span style={{ color: GOLD_SOFT }}>Wear:</span> {f.pulsePoints}</div>
                        <div className="sline"><span style={{ color: GOLD_SOFT }}>Effect:</span> {f.effect}</div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ---- DAILY ---- */}
        {page === 'daily' && (
          <div className="page" key="daily">
            <div className="ph">Daily <span className="phi">Selector</span></div>
            <div className="sub">Tonight's pick, from how you feel</div>

            <div className="qh">Conditions</div>
            <div className="moods">{Object.keys(WEATHER_MAP).map(w => <Chip key={w} active={selWeather.includes(w)} onClick={() => toggleWeather(w)}>{w}</Chip>)}</div>
            <div className="qh">How do you feel?</div>
            <div className="moods">{Object.keys(ENERGY_MAP).map(e => <Chip key={e} active={selEnergy === e} onClick={() => { setShowResults(false); setSelEnergy(selEnergy === e ? '' : e) }}>{e}</Chip>)}</div>
            <div className="qh">Where to?</div>
            <div className="moods">{Object.keys(OCCASION_MAP).map(o => <Chip key={o} active={selOccasion === o} onClick={() => { setShowResults(false); setSelOccasion(selOccasion === o ? '' : o) }}>{o}</Chip>)}</div>
            <div className="qh">Time of day</div>
            <div className="moods">{Object.keys(TIME_MAP).map(t => <Chip key={t} active={selTime === t} onClick={() => { setShowResults(false); setSelTime(selTime === t ? '' : t) }}>{t}</Chip>)}</div>

            <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
              <button className="cta" disabled={!canGenerate} onClick={() => setShowResults(true)}>Select Scent</button>
              <button className="ghost" onClick={resetDaily}>Reset</button>
            </div>

            {showResults && results.length > 0 && (() => {
              const top = results[0]
              return (
                <div style={{ marginTop: 26 }} key={top.id}>
                  <div className="dpick" style={panel(top, 210)}>
                    <div className="dc">
                      <div className="dk">{top.mood} · {top.score}% match</div>
                      <div className="dn">{top.short}</div>
                      <div className="dr">{top.description}</div>
                    </div>
                  </div>
                  <div className="sline" style={{ marginTop: 12 }}><span style={{ color: GOLD_SOFT }}>Apply:</span> {top.pulsePoints}</div>
                  {layer && (
                    <div className="layerbox">
                      <div style={{ ...label, marginBottom: 8 }}>Optional layer · {layer.chemistry}% chemistry</div>
                      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                        <div style={{ width: 3, alignSelf: 'stretch', background: layer.color, borderRadius: 2 }} />
                        <div>
                          <div style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 17 }}>{layer.name}</div>
                          <div style={{ fontSize: 11, opacity: 0.55, lineHeight: 1.6, marginTop: 3 }}>
                            {(() => { const [b, t] = layer.warmth >= top.warmth ? [layer, top] : [top, layer]
                              return `${b.short} to the chest first, then ${t.short} at the wrists.` })()}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="qh" style={{ marginTop: 20 }}>Alternatives</div>
                  {results.slice(1).map(r => (
                    <div key={r.id} className="alt">
                      <span className="av">{r.short}</span>
                      <span style={{ opacity: 0.7, fontFamily: SANS, fontSize: 11 }}>{r.score}% ◇</span>
                    </div>
                  ))}
                </div>
              )
            })()}
          </div>
        )}

        {/* ---- PERFUMERY ---- */}
        {page === 'layer' && (
          <div className="page" key="layer">
            <div className="ph">Perfumery <span className="phi">Lab</span></div>
            <div className="sub">Layer two or three, find the chemistry</div>

            <div className="slots">
              {[0, 1, 2].map(i => {
                const id = lab[i]
                const f = id != null ? FRAGRANCES.find(x => x.id === id) : null
                return (
                  <div key={i} className="slot" style={f ? panel(f, 110) : undefined} onClick={() => f && toggleLab(f.id)}>
                    {f ? <div className="sl2">{f.short}</div> : <div className="plus">+</div>}
                  </div>
                )
              })}
            </div>

            <div className="qh" style={{ marginTop: 18 }}>Choose from the shelf · {lab.length}/3</div>
            <div className="picklist">
              {FRAGRANCES.map(f => {
                const active = lab.includes(f.id)
                const disabled = !active && lab.length >= 3
                return (
                  <button key={f.id} className={`pick${active ? ' on' : ''}`} disabled={disabled} onClick={() => toggleLab(f.id)}>
                    <span style={{ width: 3, alignSelf: 'stretch', background: f.color, borderRadius: 2, opacity: active ? 1 : 0.3 }} />
                    <span style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                      <span className="pn">{f.short}</span>
                      <span className="pf">{f.house}</span>
                    </span>
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
                <div className="chem">
                  <div className="cv" style={{ color: scoreColor(chem.total) }}>{chem.total}</div>
                  <div className="cl">Chemistry Score</div>
                  <div style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 15, opacity: 0.8, marginTop: 6 }}>{chem.names.join(' × ')}</div>
                  <div style={{ fontSize: 11, opacity: 0.5, fontFamily: SANS, marginTop: 6, lineHeight: 1.5 }}>
                    {chem.total >= 80 ? 'Made for each other.' : chem.total >= 65 ? 'Strong, complementary character.' : chem.total >= 45 ? 'Interesting tension, apply with care.' : chem.total >= 25 ? 'Competing profiles, risky.' : 'Fighting each other, wear apart.'}
                  </div>
                </div>
                <div className="axes">
                  {[{ l: 'Harmony', ...chem.harmony }, { l: 'Weight', ...chem.weight }, { l: 'Temperature', ...chem.temperature }, { l: 'Projection', ...chem.projection }].map(a => {
                    const col = a.verdict === 'Excellent' ? '#7ab87a' : a.verdict === 'Good' ? GOLD : a.verdict === 'Fair' ? '#c49a6a' : '#a06060'
                    return (
                      <div key={a.l}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                          <span style={label}>{a.l}</span>
                          <span style={{ fontSize: 9, fontFamily: SANS, color: col, letterSpacing: '0.1em' }}>{a.verdict}</span>
                        </div>
                        <div className="track"><div style={{ height: '100%', width: `${(a.score / a.max) * 100}%`, background: col, transition: 'width 0.8s ease' }} /></div>
                      </div>
                    )
                  })}
                </div>
                <div className="qh">The Journey</div>
                {[{ p: 'Opening', t: chem.opening, w: '0–15 min' }, { p: 'Heart', t: chem.heart, w: '15 min–3 hr' }, { p: 'Dry-down', t: chem.drydown, w: '3 hr +' }].map(s => (
                  <div key={s.p} className="journey">
                    <div className="jp"><div style={{ color: GOLD, fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: SANS }}>{s.p}</div><div style={{ fontSize: 8.5, opacity: 0.35, fontFamily: SANS, marginTop: 2 }}>{s.w}</div></div>
                    <div className="jt">{s.t}</div>
                  </div>
                ))}
                <div className="wear"><div style={{ ...label, marginBottom: 8 }}>How to wear it</div><div style={{ fontSize: 12.5, opacity: 0.6, lineHeight: 1.7 }}>{chem.application}</div></div>
              </div>
            )}
          </div>
        )}

        {/* ---- NAV ---- */}
        <div className="nav" ref={navRef}>
          <div className="indicator" ref={indicatorRef} />
          {NAV.map(n => (
            <button key={n.id} ref={el => { itemRefs.current[n.id] = el }} className={`nv${page === n.id ? ' active' : ''}`}
              onClick={() => { setPage(n.id); setOpenId(null) }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d={n.icon} /></svg>
              <span className="nl">{n.label}</span>
            </button>
          ))}
        </div>

        <div className="wordmark">SILLAGE</div>
      </div>

      <style>{`
        .phone{position:relative;width:392px;height:min(800px,94vh);border-radius:46px;background:#08060c;
          border:9px solid #16131c;box-shadow:0 50px 100px rgba(0,0,0,.7),inset 0 1px 0 rgba(255,255,255,.1);
          overflow:hidden;font-family:${SANS};color:#fbf8f3;z-index:2;}
        @media (max-width:440px){.phone{width:100%;height:100vh;border-radius:0;border-width:0;}}
        .notch{position:absolute;top:0;left:50%;transform:translateX(-50%);width:120px;height:26px;background:#16131c;border-radius:0 0 16px 16px;z-index:30;}
        .wordmark{position:absolute;top:14px;left:0;right:0;text-align:center;font-family:${SERIF};font-size:13px;letter-spacing:7px;color:${GOLD};opacity:.85;z-index:29;pointer-events:none;}
        .page{position:absolute;inset:0;padding:54px 20px 88px;overflow-y:auto;scrollbar-width:none;animation:rise .5s cubic-bezier(.4,0,.2,1) both;}
        .page::-webkit-scrollbar{display:none;}
        @keyframes rise{from{opacity:0;transform:translateY(24px);filter:blur(6px);}to{opacity:1;transform:translateY(0);filter:blur(0);}}
        .ph{font-family:${SERIF};font-size:30px;font-weight:400;letter-spacing:-.01em;}
        .phi{font-style:italic;color:${GOLD};}
        .sub{font-size:11px;letter-spacing:.04em;opacity:.5;margin-top:3px;}
        .qh{font-size:10px;letter-spacing:.2em;text-transform:uppercase;opacity:.5;margin:18px 0 9px;}
        .search{display:flex;align-items:center;gap:9px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:11px 13px;margin:16px 0 12px;}
        .search input{flex:1;background:none;border:none;outline:none;color:#fbf8f3;font-size:13px;font-family:${SANS};}
        .search input::placeholder{color:rgba(251,248,243,.4);}
        .chips,.moods{display:flex;gap:7px;flex-wrap:wrap;}
        .chips{flex-wrap:nowrap;overflow-x:auto;scrollbar-width:none;}
        .chips::-webkit-scrollbar{display:none;}
        .srow{display:flex;gap:12px;align-items:center;flex-wrap:wrap;padding:11px 0;border-bottom:1px solid rgba(255,255,255,.06);cursor:pointer;}
        .sthumb{width:50px;height:64px;border-radius:9px;flex:0 0 auto;border:1px solid rgba(255,255,255,.12);}
        .sinfo{flex:1;min-width:0;}
        .sb{font-size:8.5px;letter-spacing:.18em;text-transform:uppercase;opacity:.55;}
        .sn{font-family:${SERIF};font-style:italic;font-size:19px;line-height:1.1;margin:1px 0 3px;}
        .sfam{font-size:9.5px;opacity:.6;}
        .ssc{font-family:${SERIF};font-size:16px;opacity:.85;color:${GOLD};flex:0 0 auto;}
        .sdetail{flex-basis:100%;padding-top:12px;animation:rise .3s ease both;}
        .sdesc{font-family:${SERIF};font-style:italic;font-size:15px;line-height:1.6;opacity:.8;margin:0 0 12px;}
        .sgrid{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:12px;}
        .snotes{font-size:11px;opacity:.45;letter-spacing:.02em;margin-bottom:10px;}
        .sline{font-size:11.5px;opacity:.55;line-height:1.6;margin-top:5px;}
        .cta{flex:1;background:rgba(202,162,95,.16);border:1px solid rgba(202,162,95,.45);color:#e7cfa0;padding:12px;border-radius:13px;cursor:pointer;font-family:${SANS};font-size:10px;letter-spacing:.22em;text-transform:uppercase;transition:.25s;}
        .cta:disabled{opacity:.35;cursor:default;}
        .ghost{background:transparent;border:1px solid rgba(255,255,255,.14);color:rgba(251,248,243,.6);padding:12px 18px;border-radius:13px;cursor:pointer;font-family:${SANS};font-size:10px;letter-spacing:.18em;text-transform:uppercase;}
        .dpick{position:relative;}
        .dc{position:absolute;inset:0;padding:16px;display:flex;flex-direction:column;justify-content:flex-end;}
        .dk{font-size:9px;letter-spacing:.2em;text-transform:uppercase;color:${GOLD};}
        .dn{font-family:${SERIF};font-style:italic;font-size:32px;line-height:1;margin:5px 0 7px;}
        .dr{font-size:11.5px;line-height:1.5;opacity:.9;}
        .layerbox{margin-top:14px;padding:14px;border:1px solid rgba(202,162,95,.2);border-radius:13px;background:rgba(202,162,95,.04);}
        .alt{display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-top:1px solid rgba(255,255,255,.07);}
        .av{font-family:${SERIF};font-style:italic;font-size:15px;}
        .slots{display:flex;align-items:center;gap:9px;margin-top:18px;}
        .slot{flex:1;height:110px;border-radius:14px;border:1px dashed rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center;position:relative;cursor:pointer;overflow:hidden;}
        .sl2{position:absolute;inset:0;display:flex;align-items:flex-end;padding:10px;font-family:${SERIF};font-style:italic;font-size:15px;}
        .plus{font-family:${SERIF};font-size:26px;opacity:.4;}
        .picklist{display:grid;grid-template-columns:1fr 1fr;gap:7px;}
        .pick{display:flex;gap:8px;align-items:center;text-align:left;padding:9px 10px;border-radius:11px;cursor:pointer;transition:.2s;background:rgba(255,255,255,.025);border:1px solid rgba(255,255,255,.06);color:#fbf8f3;}
        .pick.on{background:rgba(202,162,95,.1);border-color:rgba(202,162,95,.4);}
        .pick:disabled{opacity:.3;cursor:default;}
        .pn{font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
        .pf{font-size:8.5px;letter-spacing:.12em;text-transform:uppercase;opacity:.5;}
        .chem{text-align:center;margin-top:6px;}
        .cv{font-family:${SERIF};font-size:64px;line-height:1;text-shadow:0 0 28px rgba(202,162,95,.45);}
        .cl{font-size:9px;letter-spacing:.26em;text-transform:uppercase;opacity:.6;margin-top:4px;}
        .axes{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:24px 0 6px;}
        .track{height:3px;border-radius:2px;background:rgba(255,255,255,.06);overflow:hidden;}
        .journey{display:flex;gap:14px;margin-top:13px;}
        .jp{width:66px;flex:0 0 auto;}
        .jt{font-size:12.5px;line-height:1.6;opacity:.55;}
        .wear{margin-top:20px;padding:16px;border:1px solid rgba(202,162,95,.14);border-radius:13px;background:rgba(202,162,95,.03);}
        .nav{position:absolute;left:0;right:0;bottom:0;height:74px;display:flex;align-items:center;justify-content:space-around;padding:0 6px 10px;z-index:25;
          background:linear-gradient(180deg,rgba(14,10,16,.2),rgba(9,6,12,.92));-webkit-backdrop-filter:blur(22px);backdrop-filter:blur(22px);border-top:1px solid rgba(255,255,255,.08);}
        .indicator{position:absolute;top:9px;height:46px;width:46px;border-radius:15px;background:radial-gradient(circle,rgba(202,162,95,.32),rgba(202,162,95,.05));border:1px solid rgba(202,162,95,.35);transition:left .45s cubic-bezier(.6,.05,.1,1);z-index:0;}
        .nv{position:relative;z-index:1;display:flex;flex-direction:column;align-items:center;gap:4px;cursor:pointer;background:none;border:none;color:#fbf8f3;opacity:.45;transition:.3s;width:60px;}
        .nv.active{opacity:1;}
        .nv svg{width:21px;height:21px;}
        .nv.active svg{filter:drop-shadow(0 0 6px rgba(202,162,95,.7));}
        .nl{font-size:7.5px;letter-spacing:.06em;text-transform:uppercase;}
        ::selection{background:rgba(202,162,95,.25);color:#fff;}
      `}</style>
    </div>
  )
}
