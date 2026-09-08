import { format } from 'date-fns'
import { useLiveQuery } from '../../lib/useLiveQuery'
import { getActiveCycle, startPeriod, logFlowDay } from '../../db/queries'
import type { FlowIntensity } from '../../db/schema'
import { LogForm } from '../symptoms/LogForm'
import { Card } from '../../components/Card'

const FLOW_OPTIONS: { value: FlowIntensity; label: string }[] = [
  { value: 'spotting', label: 'Spotting' },
  { value: 'light', label: 'Light' },
  { value: 'medium', label: 'Medium' },
  { value: 'heavy', label: 'Heavy' },
]

export function DayDetail({ date, onClose }: { date: string; onClose: () => void }) {
  const activeCycle = useLiveQuery(() => getActiveCycle(), [], null)

  async function setFlow(intensity: FlowIntensity) {
    if (activeCycle) {
      await logFlowDay(activeCycle.id, date, intensity)
    } else {
      await startPeriod(date, intensity)
    }
  }

  return (
    <div className="fixed inset-0 z-30 bg-black/40 flex items-end justify-center" onClick={onClose}>
      <div
        className="w-full max-w-[480px] max-h-[88vh] overflow-y-auto rounded-t-3xl bg-cream-50 p-4 pb-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-3">
          <p className="font-semibold text-ink">{format(new Date(date), 'MMMM d, yyyy')}</p>
          <button onClick={onClose} className="text-ink-light text-xl leading-none">
            ×
          </button>
        </div>

        <Card className="mb-4">
          <p className="text-xs font-medium text-ink-light mb-2">Period flow</p>
          <div className="flex flex-wrap gap-2">
            {FLOW_OPTIONS.map((o) => (
              <button
                key={o.value}
                onClick={() => setFlow(o.value)}
                className="rounded-full bg-cream-100 px-3 py-1.5 text-xs font-medium text-ink-light hover:bg-rose-50 hover:text-rose-600 transition-colors"
              >
                {o.label}
              </button>
            ))}
          </div>
        </Card>

        <LogForm date={date} />
      </div>
    </div>
  )
}
