import { addDays, differenceInCalendarDays, format, parseISO } from 'date-fns'

const fmt = (d: Date) => format(d, 'yyyy-MM-dd')

/** Naegele's rule: due date = LMP + 280 days. */
export function dueDateFromLMP(lmpDate: string): string {
  return fmt(addDays(parseISO(lmpDate), 280))
}

/** Due date from a known conception date = conception + 266 days. */
export function dueDateFromConception(conceptionDate: string): string {
  return fmt(addDays(parseISO(conceptionDate), 266))
}

export interface GestationalAge {
  weeks: number
  days: number
  totalDays: number
  trimester: 1 | 2 | 3
  daysUntilDueDate: number
}

export function getGestationalAge(lmpDate: string, dueDate: string, today: Date = new Date()): GestationalAge {
  const totalDays = Math.max(0, differenceInCalendarDays(today, parseISO(lmpDate)))
  const weeks = Math.floor(totalDays / 7)
  const days = totalDays % 7
  const trimester: 1 | 2 | 3 = weeks < 13 ? 1 : weeks < 27 ? 2 : 3
  const daysUntilDueDate = differenceInCalendarDays(parseISO(dueDate), today)

  return { weeks, days, totalDays, trimester, daysUntilDueDate }
}
