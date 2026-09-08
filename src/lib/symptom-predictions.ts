import { addDays, differenceInCalendarDays, format, parseISO } from 'date-fns'
import type { Cycle, DailyLog, Symptom } from '../db/schema'

const fmt = (d: Date) => format(d, 'yyyy-MM-dd')

/** Finds the cycle a given date falls in: the most recent cycle that started on or before it. */
function cycleForDate(sortedCycles: Cycle[], date: string): Cycle | undefined {
  let result: Cycle | undefined
  for (const cycle of sortedCycles) {
    if (cycle.startDate <= date) result = cycle
    else break
  }
  return result
}

interface DayBucket {
  /** Distinct cycles that had a log entry on this cycle-day (the sample size). */
  coveredCycleIds: Set<string>
  /** Per symptom, the distinct cycles where it was logged on this cycle-day. */
  symptomCycleIds: Map<Symptom, Set<string>>
}

/**
 * Builds a histogram of symptom frequency by cycle-day (1 = period start day,
 * wrapping at `cycleLength` so PMS-type symptoms near the end of a cycle
 * align across cycles of slightly different length). Each cycle contributes
 * at most one data point per symptom per cycle-day, so a chatty logger in one
 * cycle can't outweigh sparser logging in others.
 */
function buildSymptomHistogram(cycles: Cycle[], logs: DailyLog[], cycleLength: number): Map<number, DayBucket> {
  const sorted = [...cycles].sort((a, b) => a.startDate.localeCompare(b.startDate))
  const buckets = new Map<number, DayBucket>()
  if (!sorted.length || cycleLength <= 0) return buckets

  for (const log of logs) {
    const cycle = cycleForDate(sorted, log.date)
    if (!cycle) continue

    const rawOffset = differenceInCalendarDays(parseISO(log.date), parseISO(cycle.startDate))
    if (rawOffset < 0) continue
    const cycleDay = (rawOffset % cycleLength) + 1

    let bucket = buckets.get(cycleDay)
    if (!bucket) {
      bucket = { coveredCycleIds: new Set(), symptomCycleIds: new Map() }
      buckets.set(cycleDay, bucket)
    }
    bucket.coveredCycleIds.add(cycle.id)

    for (const symptom of log.symptoms) {
      let cycleIds = bucket.symptomCycleIds.get(symptom)
      if (!cycleIds) {
        cycleIds = new Set()
        bucket.symptomCycleIds.set(symptom, cycleIds)
      }
      cycleIds.add(cycle.id)
    }
  }

  return buckets
}

export interface SymptomPrediction {
  date: string
  daysFromNow: number
  cycleDay: number
  symptom: Symptom
  /** Fraction (0-1) of historically-logged cycles that had this symptom on this cycle-day. */
  probability: number
  /** How many cycles that day-of-cycle prediction is based on. */
  sampleSize: number
}

export interface PredictSymptomsOptions {
  /** How many days ahead to predict for. Default 5. */
  daysAhead?: number
  /** Minimum distinct cycles with data on a cycle-day before it's trusted. Default 2. */
  minSampleSize?: number
  /** Minimum historical frequency before a symptom is surfaced. Default 0.4 (40%). */
  probabilityThreshold?: number
}

/**
 * Predicts which symptoms are likely on upcoming days, based on what was
 * logged at the same point in past cycles. Returns nothing until there's
 * enough history to say anything meaningful — this is meant to get more
 * useful the longer someone tracks, not to guess from day one.
 */
export function predictUpcomingSymptoms(
  cycles: Cycle[],
  logs: DailyLog[],
  settings: { avgCycleLength: number },
  options: PredictSymptomsOptions = {},
): SymptomPrediction[] {
  const daysAhead = options.daysAhead ?? 5
  const minSampleSize = options.minSampleSize ?? 2
  const probabilityThreshold = options.probabilityThreshold ?? 0.4
  const cycleLength = settings.avgCycleLength

  const sortedDesc = [...cycles].sort((a, b) => b.startDate.localeCompare(a.startDate))
  const lastCycle = sortedDesc[0]
  if (!lastCycle || cycleLength <= 0) return []

  const histogram = buildSymptomHistogram(cycles, logs, cycleLength)
  if (!histogram.size) return []

  const today = new Date()
  const todayRawOffset = differenceInCalendarDays(today, parseISO(lastCycle.startDate))
  const todayCycleDay = (((todayRawOffset % cycleLength) + cycleLength) % cycleLength) + 1

  const predictions: SymptomPrediction[] = []

  for (let daysFromNow = 1; daysFromNow <= daysAhead; daysFromNow++) {
    const futureCycleDay = ((todayCycleDay - 1 + daysFromNow) % cycleLength) + 1
    const bucket = histogram.get(futureCycleDay)
    if (!bucket) continue

    const sampleSize = bucket.coveredCycleIds.size
    if (sampleSize < minSampleSize) continue

    for (const [symptom, cycleIds] of bucket.symptomCycleIds) {
      const probability = cycleIds.size / sampleSize
      if (probability < probabilityThreshold) continue

      predictions.push({
        date: fmt(addDays(today, daysFromNow)),
        daysFromNow,
        cycleDay: futureCycleDay,
        symptom,
        probability,
        sampleSize,
      })
    }
  }

  return predictions.sort((a, b) => a.daysFromNow - b.daysFromNow || b.probability - a.probability)
}
