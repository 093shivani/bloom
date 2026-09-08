import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { ensureDefaultSettings } from './db/schema'
import { BottomNav } from './components/BottomNav'
import { Home } from './features/cycle-tracking/Home'
import { Calendar } from './features/calendar/Calendar'
import { LogPage } from './features/symptoms/LogPage'
import { Insights } from './features/symptoms/Insights'
import { SettingsPage } from './features/settings/SettingsPage'
import { PregnancyPage } from './features/pregnancy/PregnancyPage'
import { AuthPage } from './features/auth/AuthPage'

const ROUTES_WITHOUT_NAV = ['/login', '/signup']

function AppShell() {
  const location = useLocation()
  const showNav = !ROUTES_WITHOUT_NAV.includes(location.pathname)

  return (
    <>
      <div className="min-h-screen max-w-[480px] mx-auto">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/log" element={<LogPage />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="/pregnancy" element={<PregnancyPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/login" element={<AuthPage mode="signin" />} />
          <Route path="/signup" element={<AuthPage mode="signup" />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      {showNav && <BottomNav />}
    </>
  )
}

function App() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    ensureDefaultSettings().then(() => setReady(true))
  }, [])

  if (!ready) return null

  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  )
}

export default App
