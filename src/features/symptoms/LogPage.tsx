import { format } from 'date-fns'
import { PageHeader } from '../../components/Card'
import { LogForm } from './LogForm'

export function LogPage() {
  const today = format(new Date(), 'yyyy-MM-dd')
  return (
    <div className="pb-24">
      <PageHeader title="Log today" subtitle={format(new Date(), 'EEEE, MMMM d')} />
      <div className="px-5">
        <LogForm date={today} />
      </div>
    </div>
  )
}
