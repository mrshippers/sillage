import { useState } from 'react'
import { useAccount } from '../cloud/cloud'

/* Your account: sign in with a one-time code sent to your email (no password
 * to forget), see who you are signed in as, sign out, or delete the account and
 * everything in it. Only shown when the build has accounts switched on. */
export default function Account() {
  const acc = useAccount()
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [sent, setSent] = useState(false)
  const [busy, setBusy] = useState(false)
  const [confirm, setConfirm] = useState(false)
  if (!acc.available) return null

  const run = async (f: () => Promise<unknown>) => {
    setBusy(true)
    try {
      await f()
    } finally {
      setBusy(false)
    }
  }

  return (
    <section aria-label="Your account">
      <hr className="sep" />
      <h2 className="h2" style={{ marginTop: 0 }}>Your account</h2>
      {acc.session ? (
        <>
          <p className="para">
            Signed in as <b>{acc.email}</b>. Your shelf, scores and diary sync to every device you sign in on.
          </p>
          <div className="actions">
            <button type="button" className="btn btn-line" disabled={busy} onClick={() => run(acc.signOut)}>
              Sign out
            </button>
            {confirm ? (
              <button type="button" className="btn btn-line" disabled={busy} onClick={() => run(acc.deleteAccount)}>
                Delete it for good
              </button>
            ) : (
              <button type="button" className="btn btn-line" onClick={() => setConfirm(true)}>
                Delete account
              </button>
            )}
          </div>
          {confirm ? <p className="para small">This removes the account and everything synced to it. What is on this device stays here.</p> : null}
        </>
      ) : sent ? (
        <form
          onSubmit={e => {
            e.preventDefault()
            run(() => acc.verify(email.trim(), code.trim()))
          }}
        >
          <p className="para">We sent a code to <b>{email}</b>.</p>
          <label className="label" htmlFor="acc-code">The code from the email</label>
          <input id="acc-code" className="field" inputMode="numeric" autoComplete="one-time-code" value={code} onChange={e => setCode(e.target.value)} />
          <div className="actions">
            <button type="submit" className="btn" disabled={busy || code.trim().length < 6}>
              Sign in
            </button>
            <button type="button" className="btn btn-line" onClick={() => setSent(false)}>
              Use another email
            </button>
          </div>
        </form>
      ) : (
        <form
          onSubmit={e => {
            e.preventDefault()
            run(async () => setSent(await acc.sendCode(email.trim())))
          }}
        >
          <p className="para">Sign in to keep your shelf on every device. No password: we email you a code.</p>
          <label className="label" htmlFor="acc-email">Email</label>
          <input id="acc-email" className="field" type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} />
          <div className="actions">
            <button type="submit" className="btn" disabled={busy || !/^\S+@\S+\.\S+$/.test(email.trim())}>
              Email me a code
            </button>
          </div>
        </form>
      )}
      {acc.problem ? <p className="para small" role="status">{acc.problem}</p> : null}
    </section>
  )
}
