import { TrendingUp, TrendingDown, Wallet, Receipt } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useDashboardSummary } from '../../hooks/useDashboard'

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value)
}

interface StatCardProps {
  title: string
  value: string
  icon: React.ElementType
  trend?: 'up' | 'down' | 'neutral'
  subtitle?: string
  color: string
}

function StatCard({ title, value, icon: Icon, trend, subtitle, color }: StatCardProps) {
  return (
    <Card className="relative overflow-hidden transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        {subtitle && (
          <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            {trend === 'up' && <TrendingUp className="h-3 w-3 text-emerald-500" />}
            {trend === 'down' && <TrendingDown className="h-3 w-3 text-rose-500" />}
            {subtitle}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

export function SummaryCards() {
  const { data, isLoading, error } = useDashboardSummary()

  if (isLoading) {
    return (
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-28" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-36" />
              <Skeleton className="mt-1 h-3 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error || !data) {
    return <p className="text-sm text-muted-foreground">Failed to load summary.</p>
  }

  const netPositive = data.netBalance >= 0

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Income"
        value={formatCurrency(data.totalIncome)}
        icon={TrendingUp}
        trend="up"
        subtitle="All time income"
        color="bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400"
      />
      <StatCard
        title="Total Expenses"
        value={formatCurrency(data.totalExpenses)}
        icon={TrendingDown}
        trend="down"
        subtitle="All time expenses"
        color="bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400"
      />
      <StatCard
        title="Net Balance"
        value={formatCurrency(data.netBalance)}
        icon={Wallet}
        trend={netPositive ? 'up' : 'down'}
        subtitle={netPositive ? 'Positive balance' : 'Negative balance'}
        color={netPositive
          ? 'bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400'
          : 'bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400'
        }
      />
      <StatCard
        title="Transactions"
        value={data.transactionCount.toString()}
        icon={Receipt}
        subtitle={`${data.userCount} active users`}
        color="bg-violet-100 text-violet-600 dark:bg-violet-950 dark:text-violet-400"
      />
    </div>
  )
}
