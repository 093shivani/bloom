import { useState } from 'react'
import { useLiveQuery } from '../../lib/useLiveQuery'
import { format, parseISO } from 'date-fns'
import { getActivePregnancy, startTrying, markPregnant, endPregnancy } from '../../db/queries'
import { dueDateFromLMP, getGestationalAge } from '../../lib/pregnancy'
import { Card, PageHeader } from '../../components/Card'
import { Button } from '../../components/Button'

export function PregnancyPage() {
  const pregnancy = useLiveQuery(() => getActivePregnancy(), [], null)
  const [lmp, setLmp] = useState('')

  if (!pregnancy) {
    return (
      <div className="pb-24">
        <PageHeader title="Pregnancy" subtitle="Trying to conceive or already expecting?" />
        <div className="px-5">
          <Card>
            <p className="text-sm text-ink-light mb-4">
              Start tracking if you're trying to conceive, or jump straight to pregnancy mode once you know
              your last period date.
            </p>
            <Button className="w-full" onClick={() => startTrying()}>
              I'm trying to conceive
            </Button>
          </Card>
        </div>
      </div>
    )
  }

  if (pregnancy.status === 'trying') {
    return (
      <div className="pb-24">
        <PageHeader title="Trying to conceive" />
        <div className="px-5">
          <Card>
            <p className="text-sm text-ink-light mb-3">
              Enter the first day of your last period to switch to pregnancy tracking.
            </p>
            <input
              type="date"
              value={lmp}
              onChange={(e) => setLmp(e.target.value)}
              className="w-full rounded-xl border border-cream-200 px-3 py-2 text-sm mb-3"
            />
            <Button
              className="w-full"
              disabled={!lmp}
              onClick={() => markPregnant(pregnancy.id, lmp, dueDateFromLMP(lmp))}
            >
              I'm pregnant
            </Button>
          </Card>
        </div>
      </div>
    )
  }

  if (pregnancy.status === 'pregnant' && pregnancy.lmpDate && pregnancy.dueDate) {
    const g = getGestationalAge(pregnancy.lmpDate, pregnancy.dueDate)
    return (
      <div className="pb-24">
        <PageHeader title="Your pregnancy" subtitle={`Week ${g.weeks} · Trimester ${g.trimester}`} />
        <div className="px-5 space-y-4">
          <Card className="bg-rose-500 text-white text-center">
            <p className="text-sm opacity-90">You are</p>
            <p className="text-5xl font-bold mt-1">
              {g.weeks}w {g.days}d
            </p>
          </Card>
          <Card>
            <p className="text-sm text-ink-light">Due date</p>
            <p className="text-lg font-semibold">{format(parseISO(pregnancy.dueDate), 'PPP')}</p>
            <p className="text-sm text-ink-light mt-1">
              {g.daysUntilDueDate >= 0 ? `${g.daysUntilDueDate} days to go` : `${Math.abs(g.daysUntilDueDate)} days overdue`}
            </p>
          </Card>
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => endPregnancy(pregnancy.id, format(new Date(), 'yyyy-MM-dd'))}
          >
            End pregnancy tracking
          </Button>
        </div>
      </div>
    )
  }

  return null
}
