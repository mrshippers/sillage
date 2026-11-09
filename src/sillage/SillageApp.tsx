import { useCallback, useEffect, useMemo, useState, type CSSProperties } from 'react'
import './atelier.css'
import { allBottles } from './bottles'
import { mountGlass } from './glass'
import Lab from './Lab'
import { morph } from './motion'
import Notes from './Notes'
import ScentPage from './ScentPage'
import Shelf from './Shelf'
import Tonight from './Tonight'
import { cssVars } from './tokens'
import { useBottleStatus, useOwnBottles, usePersisted, useWears } from './wardrobeState'
import You from './You'

/* Sillage, "atelier". Every bottle is a smelling strip on a plum-night
 * ground; the shell is five tabs and one opened bottle at a time. */

type Tab = 'tonight' | 'shelf' | 'lab' | 'notes' | 'you'
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

  const open = useCallback((id: string) => {
    morph(() => {
      setOpenId(id)
      window.scrollTo({ top: 0 })
    }, id)
  }, [])
  const back = () => {
    const id = openId ?? undefined
    morph(() => setOpenId(null), id)
  }
  const go = (t: Tab) => {
    morph(() => {
      setTab(t)
      setOpenId(null)
      setNote(null)
      window.scrollTo({ top: 0 })
    })
  }
  useEffect(() => {
    document.title = opened ? `${opened.short}, Sillage` : 'Sillage'
  }, [opened])
  // the tab bar is glass: this reads what is passing under it and bends the rim
  useEffect(() => mountGlass(), [])

  return (
    <div className="app" style={{ ...cssVars(), ...(haze ? { '--haze': haze } : null) } as CSSProperties}>
      <div className="haze" aria-hidden>
        <i />
        <i />
        <i />
      </div>
      <main className="col">
        <div className="top">
          <span className="wordmark">SILLAGE</span>
        </div>

        <div className={opened ? 'page page--scent' : 'page'} key={opened ? opened.id : tab}>
        {opened ? (
          <ScentPage
            bottle={opened}
            back={back}
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

      <nav className="tabs glass" data-rim="t" aria-label="Sillage">
        <ul style={{ '--i': TABS.findIndex(t => t.id === tab) } as CSSProperties} data-away={opened ? '' : undefined}>
          <li className="tab-ink" aria-hidden />
          {TABS.map(t => (
            <li key={t.id}>
              <button type="button" aria-current={!opened && tab === t.id ? 'page' : undefined} onClick={() => go(t.id)}>
                {t.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
