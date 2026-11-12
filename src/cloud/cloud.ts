import { createClient, type Session, type SupabaseClient } from '@supabase/supabase-js'
import { useCallback, useEffect, useState } from 'react'
import { emptySnapshot, fromRows, merge, removedKeys, toRows, type Rows, type Snapshot } from './snapshot'

/* Accounts. Dormant unless the build carries a Supabase URL and public key:
 * then a person signs in with a one-time code sent to their email, their
 * Sillage syncs across their devices, and they can delete the account from
 * inside the app. The data stays on the device first; the account is a copy
 * every device agrees on. Keys are the public anon key only; row-level security
 * (supabase/migrations) is what keeps one person's data from another. */

const URL_ = import.meta.env.VITE_SUPABASE_URL as string | undefined
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined
export const cloud: SupabaseClient | null = URL_ && KEY ? createClient(URL_, KEY, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false } }) : null

/** Personal mode: the curated collection is the owner's own shelf (the web app).
 * The App Store build turns this off, so a new person starts with an empty shelf. */
export const PERSONAL = import.meta.env.VITE_PERSONAL !== '0'

export const STORE = { wardrobe: 'sillage.wardrobe.v1', wears: 'sillage.wears.v1', own: 'sillage.own.v1' } as const
export const CHANGED = 'sillage:changed'
export const PULLED = 'sillage:pulled'

function readLocal(): Snapshot {
  const get = <T>(k: string, d: T): T => {
    try {
      return (JSON.parse(localStorage.getItem(k) ?? 'null') as T) ?? d
    } catch {
      return d
    }
  }
  return { wardrobe: get(STORE.wardrobe, []), wears: get(STORE.wears, {}), own: get(STORE.own, []) }
}
function writeLocal(s: Snapshot) {
  try {
    localStorage.setItem(STORE.wardrobe, JSON.stringify(s.wardrobe))
    localStorage.setItem(STORE.wears, JSON.stringify(s.wears))
    localStorage.setItem(STORE.own, JSON.stringify(s.own))
  } catch {
    /* storage refused: the account still holds it */
  }
  window.dispatchEvent(new Event(PULLED))
}

async function pull(db: SupabaseClient): Promise<Snapshot> {
  const [w, d, o] = await Promise.all([
    db.from('wardrobe').select('scent_id, ownership, score'),
    db.from('wears').select('scent_id, day'),
    db.from('own_bottles').select('id, house, name, notes, added_on'),
  ])
  const err = w.error ?? d.error ?? o.error
  if (err) throw err
  return fromRows({ wardrobe: w.data ?? [], wears: d.data ?? [], own_bottles: o.data ?? [] } as Rows)
}

async function push(db: SupabaseClient, before: Rows, now: Rows) {
  const gone = removedKeys(before, now)
  const ops = [
    now.wardrobe.length && db.from('wardrobe').upsert(now.wardrobe, { onConflict: 'user_id,scent_id' }),
    now.wears.length && db.from('wears').upsert(now.wears, { onConflict: 'user_id,scent_id,day', ignoreDuplicates: true }),
    now.own_bottles.length && db.from('own_bottles').upsert(now.own_bottles, { onConflict: 'user_id,id' }),
    ...gone.wardrobe.map(r => db.from('wardrobe').delete().eq('scent_id', r.scent_id)),
    ...gone.wears.map(r => db.from('wears').delete().eq('scent_id', r.scent_id).eq('day', r.day)),
    ...gone.own_bottles.map(r => db.from('own_bottles').delete().eq('id', r.id)),
  ].filter(Boolean)
  const results = await Promise.all(ops as PromiseLike<{ error: unknown }>[])
  const err = results.find(r => r.error)?.error
  if (err) throw err
}

/** keeps this device and the account in step for as long as someone is signed in */
function startSync(db: SupabaseClient, onError: (e: unknown) => void): () => void {
  let last = toRows(emptySnapshot())
  let timer = 0
  let alive = true
  const flush = async () => {
    const now = toRows(readLocal())
    try {
      await push(db, last, now)
      last = now
    } catch (e) {
      onError(e)
    }
  }
  ;(async () => {
    try {
      const remote = await pull(db)
      if (!alive) return
      last = toRows(remote)
      const merged = merge(readLocal(), remote)
      writeLocal(merged)
      await flush()
    } catch (e) {
      onError(e)
    }
  })()
  const changed = () => {
    clearTimeout(timer)
    timer = window.setTimeout(flush, 800)
  }
  window.addEventListener(CHANGED, changed)
  return () => {
    alive = false
    clearTimeout(timer)
    window.removeEventListener(CHANGED, changed)
  }
}

export function useAccount() {
  const [session, setSession] = useState<Session | null>(null)
  const [problem, setProblem] = useState<string | null>(null)

  useEffect(() => {
    if (!cloud) return
    cloud.auth.getSession().then(({ data }) => setSession(data.session))
    const { data } = cloud.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => data.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!cloud || !session) return
    return startSync(cloud, () => setProblem('Could not reach your account. Your changes are safe here and will sync when it is back.'))
  }, [session])

  const sendCode = useCallback(async (email: string) => {
    if (!cloud) return false
    const { error } = await cloud.auth.signInWithOtp({ email, options: { shouldCreateUser: true } })
    setProblem(error ? error.message : null)
    return !error
  }, [])
  const verify = useCallback(async (email: string, token: string) => {
    if (!cloud) return false
    const { error } = await cloud.auth.verifyOtp({ email, token, type: 'email' })
    setProblem(error ? 'That code did not work. Check the latest email and try again.' : null)
    return !error
  }, [])
  const signOut = useCallback(async () => {
    await cloud?.auth.signOut()
  }, [])
  const deleteAccount = useCallback(async () => {
    if (!cloud) return false
    const { error } = await cloud.rpc('delete_my_account')
    if (error) {
      setProblem('The account could not be deleted. Try again in a moment.')
      return false
    }
    await cloud.auth.signOut()
    return true
  }, [])

  return { available: !!cloud, session, email: session?.user.email ?? null, problem, sendCode, verify, signOut, deleteAccount }
}
