import Dexie, { type EntityTable } from 'dexie'

export type FlowIntensity = 'spotting' | 'light' | 'medium' | 'heavy'
export type Mood = 'great' | 'good' | 'okay' | 'low' | 'awful'
export type CervicalMucus = 'dry' | 'sticky' | 'creamy' | 'watery' | 'eggWhite'

export const SYMPTOM_OPTIONS = [
  'cramps',
  'headache',
  'bloating',
  'fatigue',
  'acne',
  'tenderBreasts',
  'backache',
  'nausea',
  'cravings',
  'insomnia',
  'moodSwings',
  'spotting',
] as const
export type Symptom = (typeof SYMPTOM_OPTIONS)[number]

export interface Cycle {
  id: string
  startDate: string // ISO date (yyyy-MM-dd)
  endDate: string | null
  flowIntensity: Partial<Record<string, FlowIntensity>> // date -> intensity
  createdAt: string
  updatedAt: string
}

export interface DailyLog {
  id: string
  date: string // ISO date (yyyy-MM-dd), unique per day
  symptoms: Symptom[]
  mood: Mood | null
  notes: string
  temperature: number | null // basal body temp, °C
  cervicalMucus: CervicalMucus | null
  createdAt: string
  updatedAt: string
}

export type PregnancyStatus = 'trying' | 'pregnant' | 'ended'

export interface Pregnancy {
  id: string
  status: PregnancyStatus
  lmpDate: string | null // last menstrual period date, used to calc due date
  conceptionDate: string | null
  dueDate: string | null
  endedDate: string | null
  createdAt: string
  updatedAt: string
}

export interface Settings {
  id: 'singleton'
  avgCycleLength: number // days
  avgPeriodLength: number // days
  lutealPhaseLength: number // days
  syncEnabled: boolean
  userId: string | null
  updatedAt: string
}

export const db = new Dexie('BloomHealthDB') as Dexie & {
  cycles: EntityTable<Cycle, 'id'>
  dailyLogs: EntityTable<DailyLog, 'id'>
  pregnancies: EntityTable<Pregnancy, 'id'>
  settings: EntityTable<Settings, 'id'>
}

db.version(1).stores({
  cycles: 'id, startDate, updatedAt',
  dailyLogs: 'id, date, updatedAt',
  pregnancies: 'id, status, createdAt, updatedAt',
  settings: 'id',
})

export async function ensureDefaultSettings(): Promise<Settings> {
  const existing = await db.settings.get('singleton')
  if (existing) return existing

  const defaults: Settings = {
    id: 'singleton',
    avgCycleLength: 28,
    avgPeriodLength: 5,
    lutealPhaseLength: 14,
    syncEnabled: false,
    userId: null,
    updatedAt: new Date().toISOString(),
  }
  await db.settings.put(defaults)
  return defaults
}
