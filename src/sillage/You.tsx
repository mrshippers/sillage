import { useState } from 'react'
import type { Bottle } from './bottles'
import { deriveNose } from './families'
import { OWN_KEY, WEARS_KEY, mostWorn, parseOwnBottle, todayLocal, type OwnBottle } from './wardrobeState'

/* You: your nose, read off what is on the shelf and what you actually wear;
 * adding a bottle the collection does not have; and your data, yours to take. */
export default function You({
  shelf,
  all,
  wears,
  addOwn,
  open,
}: {
  shelf: Bottle[]
  all: Bottle[]
  wears: Record<string, string[]>
  addOwn: (b: OwnBottle) => void
  open: (id: string) => void
}) {
  const nose = deriveNose(shelf.filter(b => b.profile).map(b => b.profile!))
  const worn = mostWorn(wears)
  const byId = new Map(all.map(b => [b.id, b]))
  const [form, setForm] = useState({ name: '', house: '', notes: '' })
  const [msg, setMsg] = useState<string | null>(null)

  const exportData = () => {
    const dump: Record<string, unknown> = {}
    for (const k of ['sillage.wardrobe.v1', WEARS_KEY, OWN_KEY]) {
      try {
        dump[k] = JSON.parse(localStorage.getItem(k) ?? 'null')
      } catch {
        dump[k] = null
      }
    }
    const url = URL.createObjectURL(new Blob([JSON.stringify(dump, null, 2)], { type: 'application/json' }))
    const a = document.createElement('a')
    a.href = url
    a.download = `sillage-${todayLocal()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <h1 className="h1">Your nose</h1>
      <p className="lede">Read off the {nose.bottles} bottles on your shelf and the diary of what you wear.</p>

      <h2 className="h2">Where it leans</h2>
      {nose.families.length ? (
        <ul className="bars">
          {nose.families.map(f => (
            <li key={f.name}>
              <span>{f.name}</span>
              <span className="bar" aria-hidden>
                <i style={{ width: `${f.pct}%` }} />
              </span>
              <b>{f.pct}%</b>
            </li>
          ))}
        </ul>
      ) : (
        <p className="empty">Nothing profiled on the shelf yet.</p>
      )}

      <h2 className="h2">Signature notes</h2>
      <div className="notes">
        {nose.notes.map(n => (
          <span key={n} className="note">
            {n}
          </span>
        ))}
      </div>

      <h2 className="h2">Most worn</h2>
      {worn.length ? (
        <ul className="ledger">
          {worn.map(w => (
            <li key={w.id}>
              <button type="button" className="note-link" onClick={() => open(w.id)}>
                {byId.get(w.id)?.short ?? 'a bottle you removed'}
              </button>
              <span>{w.count}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="para">Nothing in the diary yet. Tap “wore it today” on a bottle and this fills itself.</p>
      )}
      <ul className="ledger" style={{ marginTop: 10 }}>
        <li>
          <span className="muted">Average longevity</span>
          <span>{nose.avgLongevity}</span>
        </li>
        <li>
          <span className="muted">Anchor</span>
          <span>{nose.anchor}</span>
        </li>
      </ul>

      <hr className="sep" />
      <h2 className="h2" style={{ marginTop: 0 }}>Add a bottle</h2>
      <p className="para">
        For one the collection does not have. It goes on your shelf unprofiled: no score, trail or pairing until it has a real profile.
      </p>
      <form
        onSubmit={e => {
          e.preventDefault()
          const b = parseOwnBottle(form, todayLocal())
          if ('error' in b) return setMsg(b.error)
          addOwn(b)
          setForm({ name: '', house: '', notes: '' })
          setMsg(`${b.house} ${b.name} is on the shelf.`)
        }}
      >
        <label className="label" htmlFor="own-name">Name</label>
        <input id="own-name" className="field" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Oud Wood" />
        <label className="label" htmlFor="own-house">House</label>
        <input id="own-house" className="field" value={form.house} onChange={e => setForm({ ...form, house: e.target.value })} placeholder="Tom Ford" />
        <label className="label" htmlFor="own-notes">Notes you know are in it</label>
        <input id="own-notes" className="field" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="oud, rosewood, cardamom" />
        <div className="actions">
          <button type="submit" className="btn">Put it on the shelf</button>
        </div>
        {msg ? <p className="para small" role="status">{msg}</p> : null}
      </form>

      <hr className="sep" />
      <h2 className="h2" style={{ marginTop: 0 }}>Your data</h2>
      <p className="para">Everything you record lives on this device. Take a copy whenever you like.</p>
      <div className="actions">
        <button type="button" className="btn btn-line" onClick={exportData}>
          Download my data
        </button>
      </div>
    </>
  )
}
