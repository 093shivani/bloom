import { addDays, differenceInCalendarDays, format, parseISO } from 'date-fns'
import type { Cycle } from '../db/schema'

const fmt = (d: Date) => format(d, 'yyyy-MM-dd')

export interface CycleStats {
  avgCycleLength: number
  avgPeriodLength: number
  cycleLengths: number[]
}

/** Derives average cycle/period length from historical cycle start dates. */
export function computeCycleStats(
  cycles: Cycle[],
  fallback: { avgCycleLength: number; avgPeriodLength: number },
): CycleStats {
  const sorted = [...cycles].sort((a, b) => a.startDate.localeCompare(b.startDate))

  const cycleLengths: number[] = []
  for (let i = 1; i < sorted.length; i++) {
    const days = differenceInCalendarDays(parseISO(sorted[i].startDate), parseISO(sorted[i - 1].startDate))
    if (days > 10 && days < 90) cycleLengths.push(days)
  }

  const periodLengths = sorted
    .filter((c) => c.endDate)
    .map((c) => differenceInCalendarDays(parseISO(c.endDate!), parseISO(c.startDate)) + 1)
    .filter((d) => d > 0 && d < 15)

  const avgCycleLength = cycleLengths.length
    ? Math.round(cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length)
    : fallback.avgCycleLength

  const avgPeriodLength = periodLengths.length
    ? Math.round(periodLengths.reduce((a, b) => a + b, 0) / periodLengths.length)
    : fallback.avgPeriodLength

  return { avgCycleLength, avgPeriodLength, cycleLengths }
}

export interface Predictions {
  nextPeriodStart: string | null
  nextPeriodEnd: string | null
  ovulationDate: string | null
  fertileWindowStart: string | null
  fertileWindowEnd: string | null
}

/**
 * Predicts next period, ovulation day, and fertile window based on the most
 * recent cycle start date plus historical/settings-derived averages.
 * Ovulation is estimated as (cycle length - luteal phase length) days after
 * the last period start; fertile window is the 5 days before ovulation plus
 * ovulation day itself.
 */
export function predictNextCycle(
  cycles: Cycle[],
  settings: { avgCycleLength: number; avgPeriodLength: number; lutealPhaseLength: number },
): Predictions {
  const sorted = [...cycles].sort((a, b) => b.startDate.localeCompare(a.startDate))
  const lastCycle = sorted[0]

  if (!lastCycle) {
    return {
      nextPeriodStart: null,
      nextPeriodEnd: null,
      ovulationDate: null,
      fertileWindowStart: null,
      fertileWindowEnd: null,
    }
  }

  const { avgCycleLength, avgPeriodLength } = computeCycleStats(cycles, settings)
  const lutealPhaseLength = settings.lutealPhaseLength || 14

  const lastStart = parseISO(lastCycle.startDate)
  const nextPeriodStart = addDays(lastStart, avgCycleLength)
  const nextPeriodEnd = addDays(nextPeriodStart, avgPeriodLength - 1)

  const ovulationDate = addDays(lastStart, avgCycleLength - lutealPhaseLength)
  const fertileWindowStart = addDays(ovulationDate, -5)
  const fertileWindowEnd = ovulationDate

  return {
    nextPeriodStart: fmt(nextPeriodStart),
    nextPeriodEnd: fmt(nextPeriodEnd),
    ovulationDate: fmt(ovulationDate),
    fertileWindowStart: fmt(fertileWindowStart),
    fertileWindowEnd: fmt(fertileWindowEnd),
  }
}

export function getCycleDayForDate(cycles: Cycle[], date: string): number | null {
  const sorted = [...cycles]
    .filter((c) => c.startDate <= date)
    .sort((a, b) => b.startDate.localeCompare(a.startDate))
  const cycle = sorted[0]
  if (!cycle) return null
  return differenceInCalendarDays(parseISO(date), parseISO(cycle.startDate)) + 1
}
