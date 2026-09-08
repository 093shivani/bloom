import { useMemo, useState } from 'react'
import { useLiveQuery } from '../../lib/useLiveQuery'
import { useNavigate, type NavigateFunction } from 'react-router-dom'
import { format, parseISO, differenceInCalendarDays } from 'date-fns'
import { Menu, CalendarDays, Droplet, Sparkle } from 'lucide-react'
import { db } from '../../db/schema'
import { getAllCycles, getActiveCycle, startPeriod, endPeriod, getActivePregnancy } from '../../db/queries'
import { predictNextCycle } from '../../lib/cycle-predictions'
import { getGestationalAge } from '../../lib/pregnancy'
import { Card } from '../../components/Card'
import { CycleRing } from '../../components/CycleRing'
import { WeekStrip } from '../../components/WeekStrip'
import { QuickFeelingCard } from '../symptoms/QuickFeelingCard'
import { UpcomingSymptomsCard } from '../symptoms/UpcomingSymptomsCard'

const today = () => format(new Date(), 'yyyy-MM-dd')

export function Home() {
  const navigate = useNavigate()
  const [showFeelingCard, setShowFeelingCard] = useState(true)
  const settings = useLiveQuery(() => db.settings.get('singleton'), [], undefined)
  const cycles = useLiveQuery(() => getAllCycles(), [], [])
  const activeCycle = useLiveQuery(() => getActiveCycle(), [cycles.length], null)
  const activePregnancy = useLiveQuery(() => getActivePregnancy(), [], null)

  const periodDates = useMemo(() => {
    const set = new Set<string>()
    for (const cycle of cycles) Object.keys(cycle.flowIntensity).forEach((d) => set.add(d))
    return set
  }, [cycles])

  if (!settings) return null

  if (activePregnancy?.status === 'pregnant' && activePregnancy.lmpDate && activePregnancy.dueDate) {
    const g = getGestationalAge(activePregnancy.lmpDate, activePregnancy.dueDate)
    return (
      <div className="pb-24">
        <TopBar navigate={navigate} />
        <div className="px-5 space-y-4 mt-2">
          <Card>
            <p className="text-sm text-ink-light">Gestational age</p>
            <p className="text-4xl font-semibold mt-1">
              {g.weeks}w {g.days}d
            </p>
            <p className="mt-2 text-sm text-ink-light">
              {g.daysUntilDueDate >= 0
                ? `${g.daysUntilDueDate} days until due date`
                : `${Math.abs(g.daysUntilDueDate)} days past due date`}
            </p>
          </Card>
          <Card>
            <p className="text-sm text-ink-light">Due date</p>
            <p className="text-lg font-semibold">{format(parseISO(activePregnancy.dueDate), 'PPP')}</p>
          </Card>
        </div>
      </div>
    )
  }

  const predictions = predictNextCycle(cycles, settings)
  const daysUntilNextPeriod = predictions.nextPeriodStart
    ? differenceInCalendarDays(parseISO(predictions.nextPeriodStart), new Date())
    : null

  const isInFertileWindow =
    predictions.fertileWindowStart &&
    predictions.fertileWindowEnd &&
    today() >= predictions.fertileWindowStart &&
    today() <= predictions.fertileWindowEnd

  async function handleLogPeriod() {
    if (activeCycle) {
      await endPeriod(activeCycle.id, today())
    } else {
      await startPeriod(today())
    }
  }

  const lastCycle = [...cycles].sort((a, b) => b.startDate.localeCompare(a.startDate))[0]
  const cycleLength = settings.avgCycleLength
  const cycleDayIndex = lastCycle
    ? ((differenceInCalendarDays(new Date(), parseISO(lastCycle.startDate)) % cycleLength) + cycleLength) % cycleLength
    : 0
  const progressPercent = (cycleDayIndex / cycleLength) * 100

  const ringHeadline = activeCycle ? 'Period day' : daysUntilNextPeriod !== null ? 'Period in' : 'Welcome'
  const ringValue = activeCycle
    ? `${cycleDayIndex + 1}`
    : daysUntilNextPeriod !== null
      ? daysUntilNextPeriod > 0
        ? `${daysUntilNextPeriod} day${daysUntilNextPeriod === 1 ? '' : 's'}`
        : 'today'
      : ''

  return (
    <div className="pb-24">
      <TopBar navigate={navigate} />

      <div className="px-5">
        <div className="mt-4">
          <WeekStrip periodDates={periodDates} />
        </div>

        <div className="mt-10">
          <CycleRing progressPercent={progressPercent} size={248}>
            <div className="flex flex-col items-center text-center px-6">
              <p className="text-sm text-ink-light">{ringHeadline}</p>
              <p className="text-3xl font-semibold text-ink mt-1">
                {ringValue || <span className="text-lg font-normal">Log your first period</span>}
              </p>
              <button
                onClick={handleLogPeriod}
                className="mt-5 rounded-full bg-rose-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-rose-600"
              >
                {activeCycle ? 'End period' : 'Log period'}
              </button>
            </div>
          </CycleRing>
        </div>

        <div className="mt-8 flex items-center justify-center gap-8 text-sm text-ink-light">
          <span className="flex items-center gap-1.5">
            <Droplet size={16} strokeWidth={1.75} />
            Day {cycleDayIndex + 1}
          </span>
          <span className="flex items-center gap-1.5">
            <Sparkle size={16} strokeWidth={1.75} />
            {isInFertileWindow ? 'Fertile window' : 'Low fertility'}
          </span>
        </div>

        <div className="mt-8">
          <UpcomingSymptomsCard />
        </div>

        <div className="mt-4">
          {showFeelingCard && <QuickFeelingCard onDismiss={() => setShowFeelingCard(false)} />}
        </div>
      </div>
    </div>
  )
}

function TopBar({ navigate }: { navigate: NavigateFunction }) {
  return (
    <header className="flex items-center justify-between px-5 pt-6">
      <button onClick={() => navigate('/settings')} className="text-ink">
        <Menu size={22} strokeWidth={1.75} />
      </button>
      <button onClick={() => navigate('/calendar')} className="flex items-center gap-1.5 text-sm font-medium text-ink">
        {format(new Date(), 'MMM')}
        <CalendarDays size={18} strokeWidth={1.75} />
      </button>
    </header>
  )
}
