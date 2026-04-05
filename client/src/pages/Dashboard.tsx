import { SummaryCards } from '../components/dashboard/SummaryCards'
import { TrendChart } from '../components/dashboard/TrendChart'
import { RecentActivity } from '../components/dashboard/RecentActivity'

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Summary */}
      <SummaryCards />

      {/* Charts & Activity */}
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <TrendChart />
        </div>
        <div className="lg:col-span-2">
          <RecentActivity />
        </div>
      </div>
    </div>
  )
}
