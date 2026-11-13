import { noteIndex, type Bottle } from './bottles'
import NotesField from './NotesField'
import { Strip } from './Strip'

/* Notes: everything your bottles are made of, most carried first. Tap one to
 * see which bottles carry it. Built only from the notes in your collection. */
export default function Notes({ bottles, note, setNote, open }: { bottles: Bottle[]; note: string | null; setNote: (n: string | null) => void; open: (id: string) => void }) {
  const index = noteIndex(bottles)
  const chosen = note ? index.find(n => n.note === note) : null

  if (chosen) {
    const carriers = bottles.filter(b => chosen.ids.includes(b.id))
    return (
      <>
        <button type="button" className="back" onClick={() => setNote(null)}>
          ← Every note
        </button>
        <h1 className="h1">{chosen.note}</h1>
        <p className="lede">
          In {carriers.length} of your {bottles.length} bottles.
        </p>
        <ul className="rack">
          {carriers.map(b => (
            <li key={b.id}>
              <Strip bottle={b} size="row" onClick={() => open(b.id)} />
            </li>
          ))}
        </ul>
      </>
    )
  }

  return (
    <>
      <h1 className="h1">Notes</h1>
      <p className="lede">
        {index.length} notes across {bottles.length} bottles. The bigger a note, the more of your bottles carry it.
      </p>
      <NotesField index={index} pick={setNote} />
      <h2 className="h2">Every note</h2>
      <ul className="ledger">
        {index.map(n => (
          <li key={n.note}>
            <button type="button" className="note note-link" onClick={() => setNote(n.note)}>
              {n.note}
            </button>
            <span>{n.ids.length}</span>
          </li>
        ))}
      </ul>
    </>
  )
}
