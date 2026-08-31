import { nanoid } from './id'
import {
  db,
  ensureDefaultSettings,
  type Cycle,
  type DailyLog,
  type Pregnancy,
  type Settings,
  type FlowIntensity,
  type Symptom,
  type Mood,
  type CervicalMucus,
} from './schema'

function now() {
  return new Date().toISOString()
}

// ---------- Cycles ----------

export async function getAllCycles(): Promise<Cycle[]> {
  return db.cycles.orderBy('startDate').reverse().toArray()
}

export async function getActiveCycle(): Promise<Cycle | undefined> {
  const cycles = await getAllCycles()
  return cycles.find((c) => c.endDate === null)
}

export async function startPeriod(startDate: string, intensity: FlowIntensity = 'medium'): Promise<Cycle> {
  const cycle: Cycle = {
    id: nanoid(),
    startDate,
    endDate: null,
    flowIntensity: { [startDate]: intensity },
    createdAt: now(),
    updatedAt: now(),
  }
  await db.cycles.put(cycle)
  return cycle
}

export async function logFlowDay(cycleId: string, date: string, intensity: FlowIntensity): Promise<void> {
  const cycle = await db.cycles.get(cycleId)
  if (!cycle) return
  cycle.flowIntensity[date] = intensity
  cycle.updatedAt = now()
  await db.cycles.put(cycle)
}

export async function endPeriod(cycleId: string, endDate: string): Promise<void> {
  const cycle = await db.cycles.get(cycleId)
  if (!cycle) return
  cycle.endDate = endDate
  cycle.updatedAt = now()
  await db.cycles.put(cycle)
}

export async function deleteCycle(cycleId: string): Promise<void> {
  await db.cycles.delete(cycleId)
}

// ---------- Daily Logs ----------

export async function getLogByDate(date: string): Promise<DailyLog | undefined> {
  return db.dailyLogs.where('date').equals(date).first()
}

export async function getLogsInRange(startDate: string, endDate: string): Promise<DailyLog[]> {
  return db.dailyLogs.where('date').between(startDate, endDate, true, true).toArray()
}

export async function getAllLogs(): Promise<DailyLog[]> {
  return db.dailyLogs.orderBy('date').toArray()
}

export interface DailyLogInput {
  symptoms?: Symptom[]
  mood?: Mood | null
  notes?: string
  temperature?: number | null
  cervicalMucus?: CervicalMucus | null
}

export async function upsertDailyLog(date: string, input: DailyLogInput): Promise<DailyLog> {
  const existing = await getLogByDate(date)
  const log: DailyLog = {
    id: existing?.id ?? nanoid(),
    date,
    symptoms: input.symptoms ?? existing?.symptoms ?? [],
    mood: input.mood !== undefined ? input.mood : (existing?.mood ?? null),
    notes: input.notes !== undefined ? input.notes : (existing?.notes ?? ''),
    temperature: input.temperature !== undefined ? input.temperature : (existing?.temperature ?? null),
    cervicalMucus: input.cervicalMucus !== undefined ? input.cervicalMucus : (existing?.cervicalMucus ?? null),
    createdAt: existing?.createdAt ?? now(),
    updatedAt: now(),
  }
  await db.dailyLogs.put(log)
  return log
}

export async function deleteDailyLog(id: string): Promise<void> {
  await db.dailyLogs.delete(id)
}

// ---------- Pregnancy ----------

export async function getActivePregnancy(): Promise<Pregnancy | undefined> {
  return db.pregnancies.where('status').anyOf(['trying', 'pregnant']).first()
}

export async function getAllPregnancies(): Promise<Pregnancy[]> {
  return db.pregnancies.orderBy('createdAt').reverse().toArray()
}

export async function startTrying(): Promise<Pregnancy> {
  const pregnancy: Pregnancy = {
    id: nanoid(),
    status: 'trying',
    lmpDate: null,
    conceptionDate: null,
    dueDate: null,
    endedDate: null,
    createdAt: now(),
    updatedAt: now(),
  }
  await db.pregnancies.put(pregnancy)
  return pregnancy
}

export async function markPregnant(
  pregnancyId: string,
  lmpDate: string,
  dueDate: string,
): Promise<void> {
  const pregnancy = await db.pregnancies.get(pregnancyId)
  if (!pregnancy) return
  pregnancy.status = 'pregnant'
  pregnancy.lmpDate = lmpDate
  pregnancy.dueDate = dueDate
  pregnancy.updatedAt = now()
  await db.pregnancies.put(pregnancy)
}

export async function endPregnancy(pregnancyId: string, endedDate: string): Promise<void> {
  const pregnancy = await db.pregnancies.get(pregnancyId)
  if (!pregnancy) return
  pregnancy.status = 'ended'
  pregnancy.endedDate = endedDate
  pregnancy.updatedAt = now()
  await db.pregnancies.put(pregnancy)
}

// ---------- Settings ----------

export async function getSettings(): Promise<Settings> {
  const settings = await db.settings.get('singleton')
  if (settings) return settings
  return ensureDefaultSettings()
}

export async function updateSettings(partial: Partial<Omit<Settings, 'id'>>): Promise<Settings> {
  const current = await getSettings()
  const updated: Settings = { ...current, ...partial, id: 'singleton', updatedAt: now() }
  await db.settings.put(updated)
  return updated
}
