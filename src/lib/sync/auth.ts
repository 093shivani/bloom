import { supabase } from './supabaseClient'
import { updateSettings } from '../../db/queries'

export type SignUpOutcome = 'signed-in' | 'confirm-email'

export async function signIn(email: string, password: string): Promise<void> {
  const { data, error } = await supabase!.auth.signInWithPassword({ email, password })
  if (error) throw error
  if (data.user) await updateSettings({ syncEnabled: true, userId: data.user.id })
}

export async function signUp(email: string, password: string): Promise<SignUpOutcome> {
  const { data, error } = await supabase!.auth.signUp({ email, password })
  if (error) throw error
  if (data.user && data.session) {
    // A session came back immediately — the project doesn't require email
    // confirmation, so this account is ready to use right away.
    await updateSettings({ syncEnabled: true, userId: data.user.id })
    return 'signed-in'
  }
  return 'confirm-email'
}

export async function signOutAndDisableSync(): Promise<void> {
  await supabase!.auth.signOut()
  await updateSettings({ syncEnabled: false, userId: null })
}

export async function requestPasswordReset(email: string): Promise<void> {
  const { error } = await supabase!.auth.resetPasswordForEmail(email)
  if (error) throw error
}
