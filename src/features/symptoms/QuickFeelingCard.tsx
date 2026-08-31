import { useState } from 'react'
import { X } from 'lucide-react'
import { format } from 'date-fns'
import { upsertDailyLog, getLogByDate } from '../../db/queries'
import { SYMPTOM_ICONS, SYMPTOM_LABELS } from '../../lib/icons'
import type { Symptom } from '../../db/schema'
import { IconOption } from '../../components/IconOption'
import { Card } from '../../components/Card'

const QUICK_SYMPTOMS: Symptom[] = ['tenderBreasts', 'headache', 'spotting', 'cramps', 'bloating', 'fatigue']

export function QuickFeelingCard({ onDismiss }: { onDismiss: () => void }) {
  const [selected, setSelected] = useState<Set<Symptom>>(new Set())
  const [saved, setSaved] = useState(false)

  function toggle(s: Symptom) {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(s) ? next.delete(s) : next.add(s)
      return next
    })
  }

  async function handleSend() {
    const date = format(new Date(), 'yyyy-MM-dd')
    const existing = await getLogByDate(date)
    const merged = new Set([...(existing?.symptoms ?? []), ...selected])
    await upsertDailyLog(date, { symptoms: [...merged] })
    setSaved(true)
    setTimeout(onDismiss, 900)
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <p className="text-base font-semibold text-ink">How do you feel today?</p>
        <button onClick={onDismiss} className="text-ink-light">
          <X size={18} />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-y-4">
        {QUICK_SYMPTOMS.map((s) => (
          <IconOption
            key={s}
            icon={SYMPTOM_ICONS[s]}
            label={SYMPTOM_LABELS[s]}
            selected={selected.has(s)}
            onClick={() => toggle(s)}
          />
        ))}
      </div>

      <button
        onClick={handleSend}
        disabled={selected.size === 0}
        className="mt-5 w-full rounded-full bg-rose-500 py-3 text-sm font-medium text-white transition-colors hover:bg-rose-600 disabled:opacity-40"
      >
        {saved ? 'Saved' : 'Send'}
      </button>
    </Card>
  )
}
