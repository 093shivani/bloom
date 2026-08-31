import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogIn, Loader2 } from 'lucide-react'
import { syncNow } from '../../lib/sync/syncEngine'
import { signOutAndDisableSync } from '../../lib/sync/auth'
import { Button } from '../../components/Button'

export function AuthPanel({ userId, onAuthChange }: { userId: string | null; onAuthChange: () => void }) {
  const navigate = useNavigate()
  const [status, setStatus] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function handleSignOut() {
    setBusy(true)
    try {
      await signOutAndDisableSync()
      onAuthChange()
    } finally {
      setBusy(false)
    }
  }

  async function handleSync() {
    if (!userId) return
    setBusy(true)
    setStatus(null)
    try {
      const result = await syncNow(userId)
      setStatus(`Synced: ${result.pushed} pushed, ${result.pulled} pulled`)
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Sync failed')
    } finally {
      setBusy(false)
    }
  }

  if (userId) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-ink-light">Signed in — cloud sync is enabled.</p>
        <div className="flex gap-2">
          <Button className="flex-1 flex items-center justify-center gap-2" disabled={busy} onClick={handleSync}>
            {busy && <Loader2 size={14} className="animate-spin" />}
            Sync now
          </Button>
          <Button variant="ghost" disabled={busy} onClick={handleSignOut}>
            Sign out
          </Button>
        </div>
        {status && <p className="text-xs text-ink-light">{status}</p>}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-ink-light">
        Log in to back up your data and sync it across devices. This is entirely optional — the app keeps working
        offline without an account.
      </p>
      <Button className="w-full flex items-center justify-center gap-2" onClick={() => navigate('/login')}>
        <LogIn size={16} strokeWidth={1.75} />
        Log in or sign up
      </Button>
    </div>
  )
}
