import type { LucideIcon } from 'lucide-react'
import { Check } from 'lucide-react'

export function IconOption({
  icon: Icon,
  label,
  selected,
  onClick,
}: {
  icon: LucideIcon
  label: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-2 w-full">
      <span className="relative">
        <span
          className={`flex h-14 w-14 items-center justify-center rounded-full border transition-colors ${
            selected ? 'border-teal-600 bg-teal-50' : 'border-cream-200 bg-white'
          }`}
        >
          <Icon size={22} strokeWidth={1.75} className={selected ? 'text-teal-600' : 'text-ink-light'} />
        </span>
        {selected && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-teal-600 ring-2 ring-white">
            <Check size={12} strokeWidth={3} className="text-white" />
          </span>
        )}
      </span>
      <span className="text-xs text-ink-light text-center leading-tight">{label}</span>
    </button>
  )
}
