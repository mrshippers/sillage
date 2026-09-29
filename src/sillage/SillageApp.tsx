import { useCallback, useEffect, useMemo, useState, type CSSProperties } from 'react'
import './atelier.css'
import { allBottles } from './bottles'
import Lab from './Lab'
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

  const open = useCallback((id: string) => {
    setOpenId(id)
    window.scrollTo({ top: 0 })
  }, [])
  const go = (t: Tab) => {
    setTab(t)
    setOpenId(null)
    setNote(null)
    window.scrollTo({ top: 0 })
  }
  useEffect(() => {
    document.title = opened ? `${opened.short}, Sillage` : 'Sillage'
  }, [opened])

  return (
    <div className="app" style={cssVars() as CSSProperties}>
      <main className="col">
        <div className="top">
          <span className="wordmark">SILLAGE</span>
        </div>

        {opened ? (
          <ScentPage
            bottle={opened}
            back={() => setOpenId(null)}
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
          <Tonight shelf={shelf} open={open} wornToday={wornToday} toggleWorn={toggleToday} />
        ) : tab === 'shelf' ? (
          <Shelf bottles={all} statusOf={statusOf} scoreOf={scoreOf} wearCount={count} open={open} />
        ) : tab === 'lab' ? (
          <Lab shelf={shelf} />
        ) : tab === 'notes' ? (
          <Notes bottles={shelf} note={note} setNote={setNote} open={open} />
        ) : (
          <You shelf={shelf} all={all} wears={wears} addOwn={addOwn} open={open} />
        )}
      </main>

      <nav className="tabs" aria-label="Sillage">
        <ul>
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
