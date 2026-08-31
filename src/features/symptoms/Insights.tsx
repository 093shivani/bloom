import { useMemo } from 'react'
import { useLiveQuery } from '../../lib/useLiveQuery'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts'
import { db } from '../../db/schema'
import { getAllCycles, getAllLogs } from '../../db/queries'
import { computeCycleStats } from '../../lib/cycle-predictions'
import { SYMPTOM_OPTIONS } from '../../db/schema'
import { SYMPTOM_LABELS } from '../../lib/icons'
import { Card, PageHeader } from '../../components/Card'

export function Insights() {
  const settings = useLiveQuery(() => db.settings.get('singleton'), [], undefined)
  const cycles = useLiveQuery(() => getAllCycles(), [], [])
  const logs = useLiveQuery(() => getAllLogs(), [], [])

  const stats = useMemo(
    () => (settings ? computeCycleStats(cycles, settings) : null),
    [cycles, settings],
  )

  const cycleLengthData = useMemo(
    () => stats?.cycleLengths.map((len, i) => ({ name: `Cycle ${i + 1}`, days: len })) ?? [],
    [stats],
  )

  const symptomFrequency = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const log of logs) {
      for (const s of log.symptoms) {
        counts[s] = (counts[s] ?? 0) + 1
      }
    }
    return SYMPTOM_OPTIONS.map((s) => ({ name: SYMPTOM_LABELS[s], count: counts[s] ?? 0 }))
      .filter((d) => d.count > 0)
      .sort((a, b) => b.count - a.count)
  }, [logs])

  if (!settings) return null

  return (
    <div className="pb-24">
      <PageHeader title="Insights" />
      <div className="px-5 space-y-4">
        <Card>
          <p className="text-sm font-semibold text-ink-light mb-1">Average cycle length</p>
          <p className="text-3xl font-semibold text-ink">{stats?.avgCycleLength ?? settings.avgCycleLength} days</p>
        </Card>

        {cycleLengthData.length > 0 && (
          <Card>
            <p className="text-sm font-semibold text-ink-light mb-3">Cycle length trend</p>
            <div style={{ width: '100%', height: 200 }}>
              <ResponsiveContainer>
                <LineChart data={cycleLengthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#efdcc4" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="#93897c" />
                  <YAxis tick={{ fontSize: 10 }} stroke="#93897c" />
                  <Tooltip />
                  <Line type="monotone" dataKey="days" stroke="#e2748c" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}

        {symptomFrequency.length > 0 ? (
          <Card>
            <p className="text-sm font-semibold text-ink-light mb-3">Most logged symptoms</p>
            <div style={{ width: '100%', height: Math.max(160, symptomFrequency.length * 32) }}>
              <ResponsiveContainer>
                <BarChart data={symptomFrequency} layout="vertical" margin={{ left: 16 }}>
                  <XAxis type="number" tick={{ fontSize: 10 }} allowDecimals={false} stroke="#93897c" />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={90} stroke="#93897c" />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3fa79f" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        ) : (
          <Card>
            <p className="text-sm text-ink-light">Log symptoms daily to see trends here.</p>
          </Card>
        )}
      </div>
    </div>
  )
}
