import { db } from '../../db/schema'
import { supabase } from './supabaseClient'

/**
 * Pushes local rows newer than their remote counterpart (by updatedAt) and
 * pulls remote rows newer than local. Last-write-wins conflict resolution.
 * Tables mirror the local Dexie schema 1:1, scoped by user_id via RLS.
 */
export async function syncNow(userId: string): Promise<{ pushed: number; pulled: number }> {
  if (!supabase) throw new Error('Supabase is not configured')

  let pushed = 0
  let pulled = 0

  const tables = ['cycles', 'dailyLogs', 'pregnancies'] as const

  for (const table of tables) {
    const remoteTable = table === 'dailyLogs' ? 'daily_logs' : table
    const localRows = await (db as any)[table].toArray()

    const { data: remoteRows, error } = await supabase.from(remoteTable).select('*').eq('user_id', userId)
    if (error) throw error

    const remoteById = new Map((remoteRows ?? []).map((r: any) => [r.id, r]))
    const localById = new Map(localRows.map((r: any) => [r.id, r]))

    // Push local-newer rows
    const toUpsert = localRows.filter((local: any) => {
      const remote = remoteById.get(local.id)
      return !remote || new Date(local.updatedAt) > new Date(remote.updated_at)
    })
    if (toUpsert.length) {
      const { error: upsertError } = await supabase
        .from(remoteTable)
        .upsert(toUpsert.map((row: any) => ({ ...row, user_id: userId, updated_at: row.updatedAt })))
      if (upsertError) throw upsertError
      pushed += toUpsert.length
    }

    // Pull remote-newer rows
    for (const remote of (remoteRows ?? []) as any[]) {
      const local: any = localById.get(remote.id)
      if (!local || new Date(remote.updated_at) > new Date(local.updatedAt)) {
        await (db as any)[table].put({ ...remote, updatedAt: remote.updated_at })
        pulled++
      }
    }
  }

  return { pushed, pulled }
}
