import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { Check } from 'lucide-react'
import { getLogByDate, upsertDailyLog } from '../../db/queries'
import { SYMPTOM_OPTIONS, type CervicalMucus, type Mood, type Symptom } from '../../db/schema'
import { SYMPTOM_ICONS, SYMPTOM_LABELS, MOOD_ICONS, MOOD_LABELS } from '../../lib/icons'
import { IconOption } from '../../components/IconOption'
import { Card } from '../../components/Card'
import { Button } from '../../components/Button'

const MOODS: Mood[] = ['great', 'good', 'okay', 'low', 'awful']

const MUCUS_OPTIONS: { value: CervicalMucus; label: string }[] = [
  { value: 'dry', label: 'Dry' },
  { value: 'sticky', label: 'Sticky' },
  { value: 'creamy', label: 'Creamy' },
  { value: 'watery', label: 'Watery' },
  { value: 'eggWhite', label: 'Egg white' },
]

export function LogForm({ date, onSaved }: { date: string; onSaved?: () => void }) {
  const [symptoms, setSymptoms] = useState<Symptom[]>([])
  const [mood, setMood] = useState<Mood | null>(null)
  const [notes, setNotes] = useState('')
  const [temperature, setTemperature] = useState<string>('')
  const [cervicalMucus, setCervicalMucus] = useState<CervicalMucus | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    let cancelled = false
    getLogByDate(date).then((log) => {
      if (cancelled) return
      setSymptoms(log?.symptoms ?? [])
      setMood(log?.mood ?? null)
      setNotes(log?.notes ?? '')
      setTemperature(log?.temperature != null ? String(log.temperature) : '')
      setCervicalMucus(log?.cervicalMucus ?? null)
    })
    return () => {
      cancelled = true
    }
  }, [date])

  function toggleSymptom(s: Symptom) {
    setSymptoms((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]))
  }

  async function handleSave() {
    await upsertDailyLog(date, {
      symptoms,
      mood,
      notes,
      temperature: temperature ? parseFloat(temperature) : null,
      cervicalMucus,
    })
    setSaved(true)
    onSaved?.()
    setTimeout(() => setSaved(false), 1500)
  }

  return (
    <div className="space-y-4">
      <Card>
        <p className="text-sm font-semibold text-ink mb-4">{format(new Date(date), 'EEEE, MMMM d')}</p>

        <p className="text-xs font-medium text-ink-light mb-3">Mood</p>
        <div className="grid grid-cols-5 gap-2 mb-6">
          {MOODS.map((m) => (
            <IconOption
              key={m}
              icon={MOOD_ICONS[m]}
              label={MOOD_LABELS[m]}
              selected={mood === m}
              onClick={() => setMood(mood === m ? null : m)}
            />
          ))}
        </div>

        <p className="text-xs font-medium text-ink-light mb-3">Symptoms</p>
        <div className="grid grid-cols-4 gap-y-4 mb-6">
          {SYMPTOM_OPTIONS.map((s) => (
            <IconOption
              key={s}
              icon={SYMPTOM_ICONS[s]}
              label={SYMPTOM_LABELS[s]}
              selected={symptoms.includes(s)}
              onClick={() => toggleSymptom(s)}
            />
          ))}
        </div>

        <p className="text-xs font-medium text-ink-light mb-2">Cervical mucus</p>
        <div className="flex flex-wrap gap-2 mb-5">
          {MUCUS_OPTIONS.map((o) => (
            <button
              key={o.value}
              onClick={() => setCervicalMucus(cervicalMucus === o.value ? null : o.value)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium border transition-colors ${
                cervicalMucus === o.value
                  ? 'border-teal-600 bg-teal-50 text-teal-700'
                  : 'border-cream-200 text-ink-light'
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>

        <p className="text-xs font-medium text-ink-light mb-2">Basal body temperature (°C)</p>
        <input
          type="number"
          step="0.01"
          value={temperature}
          onChange={(e) => setTemperature(e.target.value)}
          placeholder="e.g. 36.5"
          className="w-full rounded-xl border border-cream-200 px-3 py-2 text-sm mb-5 focus:outline-none focus:border-teal-500"
        />

        <p className="text-xs font-medium text-ink-light mb-2">Notes</p>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Anything else to remember..."
          className="w-full rounded-xl border border-cream-200 px-3 py-2 text-sm focus:outline-none focus:border-teal-500"
        />
      </Card>

      <Button className="w-full flex items-center justify-center gap-1.5" onClick={handleSave}>
        {saved ? (
          <>
            Saved <Check size={16} strokeWidth={2.5} />
          </>
        ) : (
          'Save entry'
        )}
      </Button>
    </div>
  )
}
