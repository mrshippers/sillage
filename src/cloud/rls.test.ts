/// <reference types="node" />
// @vitest-environment node
import { PGlite } from '@electric-sql/pglite'
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

/* Accounts gate: one person can never read or write another's wardrobe.
 * Runs the real migration on real Postgres (PGlite) under a minimal Supabase
 * shim: auth.users, auth.uid() from the JWT claim, and the anon / authenticated
 * roles. The control proves the test can fail: with RLS stripped from the same
 * migration, the very same reads leak. */

const MIGRATION = readFileSync(new URL('../../supabase/migrations/0001_accounts.sql', import.meta.url), 'utf8')
const A = '00000000-0000-4000-8000-00000000000a'
const B = '00000000-0000-4000-8000-00000000000b'

async function boot(sql: string) {
  const db = new PGlite()
  await db.exec(`
    create role anon nologin; create role authenticated nologin;
    create schema auth; grant usage on schema auth to anon, authenticated;
    create table auth.users (id uuid primary key);
    create function auth.uid() returns uuid language sql stable as
      $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    grant usage on schema public to anon, authenticated;
    insert into auth.users values ('${A}'), ('${B}');
  `)
  await db.exec(sql)
  return db
}
async function as(db: PGlite, user: string | null, q: string, params: unknown[] = []) {
  await db.exec(`reset role; select set_config('request.jwt.claim.sub', '${user ?? ''}', false); set role ${user ? 'authenticated' : 'anon'};`)
  try {
    return await db.query<Record<string, unknown>>(q, params)
  } finally {
    await db.exec('reset role')
  }
}

async function leaks(sql: string) {
  const db = await boot(sql)
  await as(db, A, `insert into public.wardrobe (scent_id, ownership, score) values ('12', 'owned', 9)`)
  await as(db, A, `insert into public.wears (scent_id, day) values ('12', '2026-11-13')`)
  const bSees = (await as(db, B, 'select * from public.wardrobe')).rows.length
  const bWears = (await as(db, B, 'select * from public.wears')).rows.length
  const bUpdates = (await as(db, B, `update public.wardrobe set score = 0 where scent_id = '12' returning *`)).rows.length
  let bForged = true
  try {
    await as(db, B, `insert into public.wardrobe (user_id, scent_id, ownership) values ('${A}', '99', 'owned')`)
  } catch {
    bForged = false
  }
  // anon is refused outright (no grant) or sees nothing; either way, nothing of A's
  const anonSees = await as(db, null, 'select * from public.wardrobe').then(r => r.rows.length, () => 0)
  const aSees = (await as(db, A, 'select * from public.wardrobe')).rows.length
  const serviceSees = (await db.query('select * from public.wardrobe')).rows.length
  return { db, bSees, bWears, bUpdates, bForged, anonSees, aSees, serviceSees }
}

describe('accounts: row-level security', { timeout: 30_000 }, () => {
  it('another person sees, edits and forges nothing of yours; you see your own', async () => {
    const r = await leaks(MIGRATION)
    expect(r.serviceSees).toBe(1) // the row really exists
    expect(r.aSees).toBe(1)
    expect(r.bSees).toBe(0)
    expect(r.bWears).toBe(0)
    expect(r.bUpdates).toBe(0)
    expect(r.bForged).toBe(false)
    expect(r.anonSees).toBe(0)
  })

  it('control: the same migration without RLS leaks, so the test above can fail', async () => {
    const r = await leaks(MIGRATION.replace(/alter table [^;]+enable row level security;/g, ''))
    expect(r.bSees).toBe(1)
  })

  it('the catalogue is public to read and closed to write', async () => {
    const db = await boot(MIGRATION)
    await db.query(`insert into public.catalogue (id, house, name) values ('12', 'CAVE', 'Sloane Tones')`)
    expect((await as(db, null, 'select * from public.catalogue')).rows.length).toBe(1)
    await expect(as(db, A, `insert into public.catalogue (id, house, name) values ('x', 'y', 'zz')`)).rejects.toThrow()
  })

  it('deleting your account removes everything of yours and nothing of anyone else', async () => {
    const db = await boot(MIGRATION)
    await as(db, A, `insert into public.wardrobe (scent_id, ownership) values ('12', 'owned')`)
    await as(db, B, `insert into public.wardrobe (scent_id, ownership) values ('3', 'wishlist')`)
    await as(db, A, 'select public.delete_my_account()')
    expect((await db.query(`select * from public.wardrobe where user_id = '${A}'`)).rows.length).toBe(0)
    expect((await db.query(`select * from public.wardrobe where user_id = '${B}'`)).rows.length).toBe(1)
    await expect(as(db, null, 'select public.delete_my_account()')).rejects.toThrow()
  })
})
