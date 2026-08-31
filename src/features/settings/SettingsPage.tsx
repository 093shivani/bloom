import { useLiveQuery } from '../../lib/useLiveQuery'
import { db } from '../../db/schema'
import { updateSettings } from '../../db/queries'
import { Card, PageHeader } from '../../components/Card'
import { AuthPanel } from '../auth/AuthPanel'

export function SettingsPage() {
  const settings = useLiveQuery(() => db.settings.get('singleton'), [], undefined)

  if (!settings) return null

  return (
    <div className="pb-24">
      <PageHeader title="Settings" />
      <div className="px-5 space-y-4">
        <Card>
          <p className="text-sm font-semibold text-ink mb-3">Cycle defaults</p>
          <NumberField
            label="Average cycle length (days)"
            value={settings.avgCycleLength}
            onChange={(v) => updateSettings({ avgCycleLength: v })}
          />
          <NumberField
            label="Average period length (days)"
            value={settings.avgPeriodLength}
            onChange={(v) => updateSettings({ avgPeriodLength: v })}
          />
          <NumberField
            label="Luteal phase length (days)"
            value={settings.lutealPhaseLength}
            onChange={(v) => updateSettings({ lutealPhaseLength: v })}
          />
          <p className="text-xs text-ink-light mt-2">
            These are used until you've logged enough cycles for the app to learn your pattern automatically.
          </p>
        </Card>

        <Card>
          <p className="text-sm font-semibold text-ink mb-3">Cloud sync</p>
          <AuthPanel userId={settings.userId} onAuthChange={() => {}} />
        </Card>

        <Card>
          <p className="text-sm font-semibold text-ink mb-1">Your privacy</p>
          <p className="text-xs text-ink-light">
            All data is stored locally on this device by default. Cloud sync is optional and only sends data when
            you explicitly sign in and sync.
          </p>
        </Card>
      </div>
    </div>
  )
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (v: number) => void
}) {
  return (
    <label className="flex items-center justify-between py-2 text-sm text-ink">
      {label}
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value, 10) || 0)}
        className="w-16 rounded-lg border border-cream-200 px-2 py-1 text-right text-sm focus:outline-none focus:border-teal-500"
      />
    </label>
  )
}
