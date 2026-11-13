import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent } from 'react'
import './atelier.css'
import { allBottles, fromProfile } from './bottles'
import { scentOfDay } from './families'
import { createSpring, type Spring } from './fluid'
import { mountGlass } from './glass'
import Lab from './Lab'
import { morph } from './motion'
import Notes from './Notes'
import ScentPage from './ScentPage'
import Shelf from './Shelf'
import Smoke from './Smoke'
import Tonight from './Tonight'
import { cssVars } from './tokens'
import { useSwipePages } from './useSwipePages'
import Welcome from './Welcome'
import { useBottleStatus, useOwnBottles, usePersisted, useWears } from './wardrobeState'
import You from './You'

/* Sillage, "atelier". Every bottle is a smelling strip on a plum-night
 * ground; the shell is five tabs and one opened bottle at a time. */

type Tab = 'tonight' | 'shelf' | 'lab' | 'notes' | 'you'
const ICON: Record<Tab, string> = {
  tonight: 'M19 14.5A7.5 7.5 0 0 1 9.5 5a7.5 7.5 0 1 0 9.5 9.5Z',
  shelf: 'M10 3.5h4M10.5 3.5v3M13.5 3.5v3M8 6.5h8a1.5 1.5 0 0 1 1.5 1.5v11a1.5 1.5 0 0 1-1.5 1.5H8A1.5 1.5 0 0 1 6.5 19V8A1.5 1.5 0 0 1 8 6.5ZM6.5 12h11',
  lab: 'M9.5 3.5h5M10 3.5v5.5L5.2 18a1.6 1.6 0 0 0 1.4 2.5h10.8a1.6 1.6 0 0 0 1.4-2.5L14 9V3.5M7.5 14.5h9',
  notes: 'M9 9.5m-4.5 0a4.5 4.5 0 1 0 9 0a4.5 4.5 0 1 0-9 0M16.5 15.5m-3 0a3 3 0 1 0 6 0a3 3 0 1 0-6 0M7.5 18m-2 0a2 2 0 1 0 4 0a2 2 0 1 0-4 0',
  you: 'M12 8.5m-3.5 0a3.5 3.5 0 1 0 7 0a3.5 3.5 0 1 0-7 0M5 20c.8-3.6 3.6-5.5 7-5.5s6.2 1.9 7 5.5',
}

const TABS: { id: Tab; label: string }[] = [
  { id: 'tonight', label: 'Tonight' },
  { id: 'shelf', label: 'Shelf' },
  { id: 'lab', label: 'Lab' },
  { id: 'notes', label: 'Notes' },
  { id: 'you', label: 'You' },
]

export default function SillageApp() {
  const [tab, setTab] = usePersisted<Tab>('sillage.tab', 'tonight', TABS.map(t => t.id))
  const [openId, setOpenId] = useState<string | null>(null)
  const [note, setNote] = useState<string | null>(null)
  const { statusOf, scoreOf, setStatus, rate } = useBottleStatus()
  const { wears, toggleToday, wornToday, count, last } = useWears()
  const { own, add: addOwn, remove: removeOwn } = useOwnBottles()

  const all = useMemo(() => allBottles(own), [own])
  const shelf = useMemo(() => all.filter(b => statusOf(b.id) === 'owned'), [all, statusOf])
  const opened = openId ? (all.find(b => b.id === openId) ?? null) : null

  // the smoke behind the page takes the colour of the strip you are looking at
  const [pickStain, setPickStain] = useState<string | null>(null)
  const haze = opened?.stain ?? (tab === 'tonight' ? pickStain : null)

  const tabIdx = TABS.findIndex(t => t.id === tab)
  // which side the page arrives from, so it leaves the way it came (+1 right, -1 left)
  const [dir, setDir] = useState<'' | 'r' | 'l' | 's'>('') // r, l: tapped in from that side; s: swiped, the gesture moves the page itself

  const open = useCallback((id: string) => {
    morph(() => {
      setDir('r')
      setOpenId(id)
      window.scrollTo({ top: 0 })
    }, id)
  }, [])
  const back = () => {
    const id = openId ?? undefined
    morph(() => {
      setDir('l')
      setOpenId(null)
    }, id)
  }
  const goNow = (t: Tab, swiped = false) => {
    setDir(swiped ? 's' : TABS.findIndex(x => x.id === t) > tabIdx ? 'r' : 'l')
    setTab(t)
    setOpenId(null)
    setNote(null)
    window.scrollTo({ top: 0 })
  }
  const go = (t: Tab) => morph(() => goNow(t))

  // the gold mark under the tabs is a spring: it follows a swipe 1:1 and settles on a tap
  const ink = useRef<Spring | null>(null)
  const inkEl = useRef<HTMLLIElement>(null)
  useEffect(() => {
    const el = inkEl.current
    if (!el) return
    const sp = createSpring(tabIdx, { response: 0.42, damping: 0.68, rest: 0.002 }, v => {
      el.style.transform = `translateX(${v * 100}%)`
    })
    sp.set(tabIdx)
    ink.current = sp
    return () => sp.stop()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  useEffect(() => ink.current?.to(tabIdx), [tabIdx])

  const appEl = useRef<HTMLDivElement>(null)
  const pageEl = useRef<HTMLDivElement>(null)
  useSwipePages(appEl, pageEl, {
    hasPrev: opened ? true : tabIdx > 0,
    hasNext: !opened && tabIdx < TABS.length - 1,
    prev: () => {
      if (opened) {
        setDir('s')
        setOpenId(null)
      } else goNow(TABS[tabIdx - 1].id, true)
    },
    next: () => goNow(TABS[tabIdx + 1].id, true),
    onProgress: f => {
      if (!opened) ink.current?.set(tabIdx + Math.max(-1, Math.min(1, f)))
    },
  })

  // the open: once per session, a tap skips it
  const [splash, setSplash] = useState<'on' | 'out' | 'off'>(() => (shouldSplash() ? 'on' : 'off'))
  useEffect(() => {
    if (splash !== 'on') return
    try {
      sessionStorage.setItem('sillage.opened', '1')
    } catch {
      /* private mode: it plays again next time, which is fine */
    }
  }, [splash])
  const skipWelcome = useCallback(() => setSplash(s => (s === 'on' ? 'out' : s)), [])
  // the welcome is shot on tonight's bottle; an empty shelf gets the house's own flacon
  const welcomeBottle = useMemo(() => {
    const profiled = shelf.filter(b => b.profile).map(b => b.profile!)
    const b = profiled.length ? fromProfile(scentOfDay(new Date(), profiled)) : null
    return b ? { id: b.id, house: b.house, name: b.short, stain: b.stain, notes: b.notes } : { id: 'sillage', house: 'Sillage', name: 'Sillage', stain: '#caa25f' }
    // the shot is chosen once, when the app opens
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  useEffect(() => {
    document.title = opened ? `${opened.short}, Sillage` : 'Sillage'
  }, [opened])
  // the tab bar is glass: this reads what is passing under it and bends the rim
  useEffect(() => mountGlass(), [])
  // fetch the cabinet's code while nothing is happening, so the Shelf never waits on it
  useEffect(() => {
    const go = () => void import('./Cabinet')
    const w = window as Window & { requestIdleCallback?: (cb: () => void) => number }
    if (w.requestIdleCallback) w.requestIdleCallback(go)
    else setTimeout(go, 2000)
  }, [])

  return (
    <div ref={appEl} className="app" data-splash={splash === 'on' ? 'on' : undefined} style={{ ...cssVars(), ...(haze ? { '--haze': haze } : null) } as CSSProperties}>
      <Smoke tint={haze} />
      <div className="grain" aria-hidden />
      <main className="col">
        <div className="top">
          {opened ? (
            <button type="button" className="top-back lq" onClick={back} aria-label="Back">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M15 5l-7 7 7 7" />
              </svg>
            </button>
          ) : null}
          <span className="wordmark">SILLAGE</span>
        </div>

        <div ref={pageEl} className={opened ? 'page page--scent' : 'page'} data-dir={dir || undefined} key={opened ? opened.id : tab}>
        {opened ? (
          <ScentPage
            bottle={opened}
            status={statusOf(opened.id)}
            setStatus={s => setStatus(opened.id, s)}
            score={scoreOf(opened.id)}
            rate={s => rate(opened.id, s)}
            wornToday={wornToday(opened.id)}
            toggleWorn={() => toggleToday(opened.id)}
            wearCount={count(opened.id)}
            lastWorn={last(opened.id)}
            onShelfIds={shelf.map(b => b.id)}
            openNote={n => {
              setNote(n)
              setOpenId(null)
              setTab('notes')
            }}
            open={open}
            removeOwn={
              opened.profile
                ? undefined
                : () => {
                    removeOwn(opened.id)
                    setOpenId(null)
                  }
            }
          />
        ) : tab === 'tonight' ? (
          <Tonight shelf={shelf} open={open} wornToday={wornToday} toggleWorn={toggleToday} onPick={setPickStain} />
        ) : tab === 'shelf' ? (
          <Shelf bottles={all} statusOf={statusOf} scoreOf={scoreOf} wearCount={count} open={open} />
        ) : tab === 'lab' ? (
          <Lab shelf={shelf} />
        ) : tab === 'notes' ? (
          <Notes bottles={shelf} note={note} setNote={setNote} open={open} />
        ) : (
          <You shelf={shelf} all={all} wears={wears} addOwn={addOwn} open={open} />
        )}
        </div>
      </main>

      <nav className="tabs glass" data-away={opened ? '' : undefined} aria-label="Sillage">
        <ul style={{ '--i': TABS.findIndex(t => t.id === tab) } as CSSProperties} data-away={opened ? '' : undefined}>
          <li className="tab-ink" ref={inkEl} aria-hidden />
          {TABS.map(t => (
            <li key={t.id}>
              <button type="button" aria-current={!opened && tab === t.id ? 'page' : undefined} onPointerDown={ripple} onClick={() => go(t.id)}>
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d={ICON[t.id]} />
                </svg>
                <span>{t.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
      {splash !== 'off' && <Welcome bottle={welcomeBottle} leaving={splash === 'out'} skip={skipWelcome} done={() => setSplash('off')} />}
    </div>
  )
}

function shouldSplash() {
  try {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return false
    return !sessionStorage.getItem('sillage.opened')
  } catch {
    return false
  }
}

/* A tap leaves a ripple under the finger, from the touch point, once. */
function ripple(e: PointerEvent<HTMLButtonElement>) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const b = e.currentTarget
  const r = b.getBoundingClientRect()
  const i = document.createElement('i')
  i.className = 'ripple'
  i.style.left = `${e.clientX - r.left}px`
  i.style.top = `${e.clientY - r.top}px`
  i.addEventListener('animationend', () => i.remove())
  b.appendChild(i)
}
