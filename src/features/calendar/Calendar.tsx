import { useMemo, useState } from 'react'
import { useLiveQuery } from '../../lib/useLiveQuery'
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  isSameMonth,
  isToday,
  startOfMonth,
  subMonths,
} from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { db } from '../../db/schema'
import { getAllCycles } from '../../db/queries'
import { predictNextCycle } from '../../lib/cycle-predictions'
import { Card, PageHeader } from '../../components/Card'
import { DayDetail } from './DayDetail'

function toIso(d: Date) {
  return format(d, 'yyyy-MM-dd')
}

export function Calendar() {
  const [month, setMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const settings = useLiveQuery(() => db.settings.get('singleton'), [], undefined)
  const cycles = useLiveQuery(() => getAllCycles(), [], [])

  const predictions = useMemo(() => (settings ? predictNextCycle(cycles, settings) : null), [cycles, settings])

  const periodDates = useMemo(() => {
    const set = new Set<string>()
    for (const cycle of cycles) {
      Object.keys(cycle.flowIntensity).forEach((d) => set.add(d))
    }
    return set
  }, [cycles])

  const predictedPeriodDates = useMemo(() => {
    const set = new Set<string>()
    if (predictions?.nextPeriodStart && predictions.nextPeriodEnd && settings) {
      const days = eachDayOfInterval({
        start: new Date(predictions.nextPeriodStart),
        end: new Date(predictions.nextPeriodEnd),
      })
      days.forEach((d) => set.add(toIso(d)))
    }
    return set
  }, [predictions, settings])

  const fertileDates = useMemo(() => {
    const set = new Set<string>()
    if (predictions?.fertileWindowStart && predictions.fertileWindowEnd) {
      const days = eachDayOfInterval({
        start: new Date(predictions.fertileWindowStart),
        end: new Date(predictions.fertileWindowEnd),
      })
      days.forEach((d) => set.add(toIso(d)))
    }
    return set
  }, [predictions])

  const daysInMonth = useMemo(() => {
    const start = startOfMonth(month)
    const end = endOfMonth(month)
    return eachDayOfInterval({ start, end })
  }, [month])

  const leadingBlanks = getDay(startOfMonth(month))

  return (
    <div className="pb-24">
      <PageHeader title="Calendar" />
      <div className="px-5">
        <Card>
          <div className="flex items-center justify-between mb-5">
            <button onClick={() => setMonth(subMonths(month, 1))} className="text-ink-light" aria-label="Previous month">
              <ChevronLeft size={20} strokeWidth={1.75} />
            </button>
            <p className="font-semibold text-ink">{format(month, 'MMMM yyyy')}</p>
            <button onClick={() => setMonth(addMonths(month, 1))} className="text-ink-light" aria-label="Next month">
              <ChevronRight size={20} strokeWidth={1.75} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-xs text-ink-light mb-2">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
              <div key={i}>{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: leadingBlanks }).map((_, i) => (
              <div key={`blank-${i}`} />
            ))}
            {daysInMonth.map((day) => {
              const iso = toIso(day)
              const isPeriod = periodDates.has(iso)
              const isPredictedPeriod = !isPeriod && predictedPeriodDates.has(iso)
              const isFertile = fertileDates.has(iso)
              const isOvulation = predictions?.ovulationDate === iso

              let bg = 'text-ink'
              if (isPeriod) bg = 'bg-rose-700 text-white'
              else if (isPredictedPeriod) bg = 'bg-rose-50 text-rose-600 border border-dashed border-rose-100'
              else if (isOvulation) bg = 'bg-teal-600 text-white'
              else if (isFertile) bg = 'bg-teal-50 text-teal-700'

              return (
                <button
                  key={iso}
                  onClick={() => setSelectedDate(iso)}
                  className={`aspect-square rounded-full text-sm flex items-center justify-center relative ${bg} ${
                    !isSameMonth(day, month) ? 'opacity-30' : ''
                  } ${isToday(day) && !isPeriod && !isOvulation ? 'ring-1 ring-ink' : ''}`}
                >
                  {format(day, 'd')}
                </button>
              )
            })}
          </div>
        </Card>

        <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-xs text-ink-light">
          <Legend swatch="bg-rose-700" label="Period" />
          <Legend swatch="bg-rose-50 border border-dashed border-rose-100" label="Predicted period" />
          <Legend swatch="bg-teal-600" label="Ovulation" />
          <Legend swatch="bg-teal-50" label="Fertile window" />
        </div>
      </div>

      {selectedDate && <DayDetail date={selectedDate} onClose={() => setSelectedDate(null)} />}
    </div>
  )
}

function Legend({ swatch, label }: { swatch: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={`w-3 h-3 rounded-full ${swatch}`} />
      {label}
    </div>
  )
}
