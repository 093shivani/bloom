import { useState } from 'react'
import { Minus, Plus, X } from 'lucide-react'
import { Card } from '../../components/Card'

const MIN_DAYS = 1
const MAX_DAYS = 14

export function PeriodLengthDialog({
  initialDays,
  onConfirm,
  onCancel,
}: {
  initialDays: number
  onConfirm: (days: number) => void
  onCancel: () => void
}) {
  const [days, setDays] = useState(initialDays)

  return (
    <div className="fixed inset-0 z-30 bg-black/40 flex items-end" onClick={onCancel}>
      <div
        className="w-full rounded-t-3xl bg-cream-50 p-4 pb-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-1">
          <p className="font-semibold text-ink">How long is your period usually?</p>
          <button onClick={onCancel} className="text-ink-light text-xl leading-none" aria-label="Cancel">
            <X size={20} strokeWidth={1.75} />
          </button>
        </div>
        <p className="text-sm text-ink-light mb-5">
          This fills in your expected period days on the calendar and helps future predictions.
        </p>

        <Card className="flex items-center justify-center gap-6 py-5">
          <button
            onClick={() => setDays((d) => Math.max(MIN_DAYS, d - 1))}
            disabled={days <= MIN_DAYS}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-cream-100 text-ink disabled:opacity-40"
            aria-label="Fewer days"
          >
            <Minus size={18} strokeWidth={2} />
          </button>
          <div className="text-center">
            <p className="text-3xl font-semibold text-ink">{days}</p>
            <p className="text-xs text-ink-light">day{days === 1 ? '' : 's'}</p>
          </div>
          <button
            onClick={() => setDays((d) => Math.min(MAX_DAYS, d + 1))}
            disabled={days >= MAX_DAYS}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-cream-100 text-ink disabled:opacity-40"
            aria-label="More days"
          >
            <Plus size={18} strokeWidth={2} />
          </button>
        </Card>

        <button
          onClick={() => onConfirm(days)}
          className="mt-5 w-full rounded-full bg-rose-500 py-3 text-sm font-medium text-white hover:bg-rose-600"
        >
          Confirm
        </button>
      </div>
    </div>
  )
}
