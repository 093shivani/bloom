import { useMemo } from 'react'
import { format, parseISO, isToday, isTomorrow } from 'date-fns'
import { useLiveQuery } from '../../lib/useLiveQuery'
import { db } from '../../db/schema'
import { getAllCycles, getAllLogs } from '../../db/queries'
import { predictUpcomingSymptoms, type SymptomPrediction } from '../../lib/symptom-predictions'
import { SYMPTOM_ICONS, SYMPTOM_LABELS } from '../../lib/icons'
import { Card } from '../../components/Card'

function dayLabel(dateIso: string): string {
  const date = parseISO(dateIso)
  if (isToday(date)) return 'Today'
  if (isTomorrow(date)) return 'Tomorrow'
  return format(date, 'EEEE')
}

export function UpcomingSymptomsCard() {
  const settings = useLiveQuery(() => db.settings.get('singleton'), [], undefined)
  const cycles = useLiveQuery(() => getAllCycles(), [], [])
  const logs = useLiveQuery(() => getAllLogs(), [], [])

  const predictions = useMemo(
    () => (settings ? predictUpcomingSymptoms(cycles, logs, settings) : []),
    [cycles, logs, settings],
  )

  const byDay = useMemo(() => {
    const groups = new Map<string, SymptomPrediction[]>()
    for (const p of predictions) {
      const list = groups.get(p.date) ?? []
      list.push(p)
      groups.set(p.date, list)
    }
    return [...groups.entries()]
  }, [predictions])

  if (!byDay.length) return null

  return (
    <Card>
      <p className="text-sm font-semibold text-ink mb-1">What to expect</p>
      <p className="text-xs text-ink-light mb-4">Based on symptoms you've logged in past cycles</p>

      <div className="space-y-3">
        {byDay.map(([date, dayPredictions]) => (
          <div key={date} className="flex items-start gap-3">
            <span className="w-16 shrink-0 pt-1.5 text-xs font-medium text-ink-light">{dayLabel(date)}</span>
            <div className="flex flex-wrap gap-2">
              {dayPredictions.map((p) => {
                const Icon = SYMPTOM_ICONS[p.symptom]
                return (
                  <span
                    key={p.symptom}
                    className="flex items-center gap-1.5 rounded-full bg-teal-50 py-1 pl-1.5 pr-2.5 text-xs font-medium text-teal-700"
                    title={`${Math.round(p.probability * 100)}% of your last ${p.sampleSize} cycles`}
                  >
                    <Icon size={13} strokeWidth={1.75} />
                    {SYMPTOM_LABELS[p.symptom]}
                  </span>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
