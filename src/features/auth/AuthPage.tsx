import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Mail, Lock, Eye, EyeOff, Loader2, CloudOff } from 'lucide-react'
import { isSupabaseConfigured } from '../../lib/sync/supabaseClient'
import { signIn, signUp, requestPasswordReset } from '../../lib/sync/auth'
import { Button } from '../../components/Button'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function AuthPage({ mode }: { mode: 'signin' | 'signup' }) {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)

  if (!isSupabaseConfigured) {
    return (
      <div className="pb-24 min-h-screen flex flex-col">
        <TopBar />
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-cream-100 mb-4">
            <CloudOff size={24} strokeWidth={1.75} className="text-ink-light" />
          </div>
          <p className="text-base font-semibold text-ink mb-1">Cloud sync isn't set up</p>
          <p className="text-sm text-ink-light mb-6">
            An account is only needed for optional cloud backup and sync — your data works fully offline without
            one. Ask whoever set up this app to add Supabase credentials to enable accounts.
          </p>
          <Button variant="secondary" onClick={() => navigate('/settings')}>
            Back to Settings
          </Button>
        </div>
      </div>
    )
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setInfo(null)

    if (!EMAIL_PATTERN.test(email)) {
      setError('Enter a valid email address.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setBusy(true)
    try {
      if (mode === 'signin') {
        await signIn(email, password)
        navigate('/settings')
      } else {
        const outcome = await signUp(email, password)
        if (outcome === 'signed-in') {
          navigate('/settings')
        } else {
          setInfo('Account created — check your email to confirm it, then log in.')
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setBusy(false)
    }
  }

  async function handleForgotPassword() {
    setError(null)
    setInfo(null)
    if (!EMAIL_PATTERN.test(email)) {
      setError('Enter your email above first.')
      return
    }
    setBusy(true)
    try {
      await requestPasswordReset(email)
      setInfo('Password reset email sent — check your inbox.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="pb-24 min-h-screen">
      <TopBar />

      <div className="px-6 pt-4">
        <h1 className="text-2xl font-semibold text-ink">
          {mode === 'signin' ? 'Welcome back' : 'Create your account'}
        </h1>
        <p className="text-sm text-ink-light mt-1.5 mb-8">
          {mode === 'signin'
            ? 'Log in to sync your data across devices.'
            : 'An account is optional — it only enables cloud backup and sync. Your data already works fully offline.'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="text-xs font-medium text-ink-light mb-1.5 block">Email</span>
            <div className="relative">
              <Mail size={17} strokeWidth={1.75} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-light" />
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-cream-200 pl-10 pr-3 py-3 text-sm focus:outline-none focus:border-teal-500"
              />
            </div>
          </label>

          <label className="block">
            <span className="text-xs font-medium text-ink-light mb-1.5 block">Password</span>
            <div className="relative">
              <Lock size={17} strokeWidth={1.75} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-light" />
              <input
                type={showPassword ? 'text' : 'password'}
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full rounded-xl border border-cream-200 pl-10 pr-10 py-3 text-sm focus:outline-none focus:border-teal-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-light"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={17} strokeWidth={1.75} /> : <Eye size={17} strokeWidth={1.75} />}
              </button>
            </div>
          </label>

          {mode === 'signin' && (
            <div className="text-right">
              <button type="button" onClick={handleForgotPassword} className="text-xs font-medium text-teal-700">
                Forgot password?
              </button>
            </div>
          )}

          {error && <p className="text-sm text-rose-600">{error}</p>}
          {info && <p className="text-sm text-teal-700">{info}</p>}

          <Button type="submit" className="w-full flex items-center justify-center gap-2" disabled={busy}>
            {busy && <Loader2 size={16} className="animate-spin" />}
            {mode === 'signin' ? 'Log in' : 'Create account'}
          </Button>
        </form>

        <p className="text-center text-sm text-ink-light mt-6">
          {mode === 'signin' ? (
            <>
              Don't have an account?{' '}
              <button
                className="font-medium text-rose-600"
                onClick={() => {
                  setError(null)
                  setInfo(null)
                  navigate('/signup')
                }}
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                className="font-medium text-rose-600"
                onClick={() => {
                  setError(null)
                  setInfo(null)
                  navigate('/login')
                }}
              >
                Log in
              </button>
            </>
          )}
        </p>

        <button
          className="w-full text-center text-xs text-ink-light mt-8"
          onClick={() => navigate('/settings')}
        >
          Continue without an account
        </button>
      </div>
    </div>
  )
}

function TopBar() {
  const navigate = useNavigate()
  return (
    <header className="flex items-center px-4 pt-6">
      <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-ink" aria-label="Back">
        <ArrowLeft size={20} strokeWidth={1.75} />
      </button>
    </header>
  )
}
