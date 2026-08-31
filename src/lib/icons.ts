import {
  Zap,
  Brain,
  Wind,
  BatteryLow,
  Sparkle,
  Heart,
  Bone,
  CloudDrizzle,
  Cookie,
  Moon,
  Shuffle,
  Droplet,
  Smile,
  Meh,
  Frown,
  Laugh,
  Angry,
  type LucideIcon,
} from 'lucide-react'
import type { Mood, Symptom } from '../db/schema'

export const SYMPTOM_ICONS: Record<Symptom, LucideIcon> = {
  cramps: Zap,
  headache: Brain,
  bloating: Wind,
  fatigue: BatteryLow,
  acne: Sparkle,
  tenderBreasts: Heart,
  backache: Bone,
  nausea: CloudDrizzle,
  cravings: Cookie,
  insomnia: Moon,
  moodSwings: Shuffle,
  spotting: Droplet,
}

export const SYMPTOM_LABELS: Record<Symptom, string> = {
  cramps: 'Cramps',
  headache: 'Headache',
  bloating: 'Bloating',
  fatigue: 'Fatigue',
  acne: 'Acne',
  tenderBreasts: 'Tender breasts',
  backache: 'Backache',
  nausea: 'Nausea',
  cravings: 'Cravings',
  insomnia: 'Insomnia',
  moodSwings: 'Mood swings',
  spotting: 'Discharge',
}

export const MOOD_ICONS: Record<Mood, LucideIcon> = {
  great: Laugh,
  good: Smile,
  okay: Meh,
  low: Frown,
  awful: Angry,
}

export const MOOD_LABELS: Record<Mood, string> = {
  great: 'Great',
  good: 'Good',
  okay: 'Okay',
  low: 'Low',
  awful: 'Awful',
}
