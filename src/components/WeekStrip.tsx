import { addDays, format, isSameDay, startOfWeek } from 'date-fns'

export function WeekStrip({ periodDates }: { periodDates: Set<string> }) {
  const start = startOfWeek(new Date(), { weekStartsOn: 1 })
  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i))

  return (
    <div className="grid grid-cols-7 gap-1">
      {days.map((day) => {
        const iso = format(day, 'yyyy-MM-dd')
        const isToday = isSameDay(day, new Date())
        const isPeriod = periodDates.has(iso)

        return (
          <div key={iso} className="flex flex-col items-center gap-2">
            <span className="text-[11px] font-medium text-ink-light">{format(day, 'EEEEE')}</span>
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-full text-sm ${
                isToday
                  ? 'bg-white font-semibold text-ink shadow-[0_2px_10px_-2px_rgba(42,36,32,0.18)]'
                  : 'font-medium text-ink-light'
              }`}
            >
              {format(day, 'd')}
            </div>
            <span className={`h-1 w-1 rounded-full ${isPeriod ? 'bg-rose-500' : 'bg-transparent'}`} />
          </div>
        )
      })}
    </div>
  )
}
