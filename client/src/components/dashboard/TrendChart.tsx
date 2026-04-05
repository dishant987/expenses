import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useDashboardTrends } from '../../hooks/useDashboard'
import { useAuthStore } from '../../store/authStore'
import { Lock } from 'lucide-react'

function formatK(value: number) {
  if (value >= 1000) return `₹${(value / 1000).toFixed(0)}k`
  return `₹${value}`
}

export function TrendChart() {
  const { user } = useAuthStore()
  const canView = user?.role === 'ANALYST' || user?.role === 'ADMIN'
  const { data, isLoading, error } = useDashboardTrends()

  if (!canView) {
    return (
      <Card className="flex flex-col items-center justify-center min-h-[300px]">
        <Lock className="h-8 w-8 text-muted-foreground mb-3" />
        <p className="text-sm font-medium text-foreground">Analyst & Admin Only</p>
        <p className="text-xs text-muted-foreground mt-1">You need Analyst or Admin role to view trends</p>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-4 w-52" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[280px] w-full" />
        </CardContent>
      </Card>
    )
  }

  if (error || !data) {
    return <Card className="p-6 text-sm text-muted-foreground">Failed to load trends.</Card>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Income vs Expenses</CardTitle>
        <CardDescription>Monthly breakdown — last 12 months</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} className="text-muted-foreground" />
            <YAxis tickFormatter={formatK} tick={{ fontSize: 11 }} className="text-muted-foreground" />
            <Tooltip
              formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, '']}
              contentStyle={{
                borderRadius: '8px',
                border: '1px solid hsl(var(--border))',
                background: 'hsl(var(--card))',
                color: 'hsl(var(--foreground))',
                fontSize: '12px',
              }}
            />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <Area
              type="monotone"
              dataKey="income"
              name="Income"
              stroke="#10b981"
              fillOpacity={1}
              fill="url(#incomeGrad)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="expense"
              name="Expenses"
              stroke="#f43f5e"
              fillOpacity={1}
              fill="url(#expenseGrad)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
