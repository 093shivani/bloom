import { NavLink } from 'react-router-dom'
import { Home, CalendarDays, PenLine, Baby, BarChart3, Settings } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

const tabs: { to: string; label: string; icon: LucideIcon }[] = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/calendar', label: 'Calendar', icon: CalendarDays },
  { to: '/log', label: 'Log', icon: PenLine },
  { to: '/pregnancy', label: 'Pregnancy', icon: Baby },
  { to: '/insights', label: 'Insights', icon: BarChart3 },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 mx-auto max-w-[480px] border-t border-cream-200 bg-white/95 backdrop-blur pb-[env(safe-area-inset-bottom)]">
      <ul className="flex justify-around">
        {tabs.map((tab) => (
          <li key={tab.to} className="flex-1">
            <NavLink
              to={tab.to}
              end={tab.to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors ${
                  isActive ? 'text-rose-500' : 'text-ink-light'
                }`
              }
            >
              <tab.icon size={20} strokeWidth={1.75} />
              {tab.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
