import type { ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={twMerge('rounded-3xl bg-white p-5 shadow-[0_2px_16px_-4px_rgba(42,36,32,0.08)]', className)}>
      {children}
    </div>
  )
}

export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="px-5 pt-6 pb-2">
      <h1 className="text-2xl font-semibold text-ink">{title}</h1>
      {subtitle && <p className="mt-0.5 text-sm text-ink-light">{subtitle}</p>}
    </header>
  )
}
