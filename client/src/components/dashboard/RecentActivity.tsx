import { format } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useDashboardRecent } from '../../hooks/useDashboard'
import { cn } from '@/lib/utils'

function formatCurrency(value: string | number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(Number(value))
}

export function RecentActivity() {
  const { data, isLoading, error } = useDashboardRecent()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Recent Activity</CardTitle>
        <CardDescription>Latest 10 transactions</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-9 w-9 rounded-full" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        )}

        {error && <p className="text-sm text-muted-foreground">Failed to load recent activity.</p>}

        {data && data.length === 0 && (
          <p className="text-sm text-muted-foreground py-4 text-center">No transactions yet.</p>
        )}

        {data && data.length > 0 && (
          <div className="space-y-1">
            {data.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center gap-3 rounded-lg p-2 hover:bg-accent/40 transition-colors"
              >
                <div
                  className={cn(
                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                    tx.type === 'INCOME'
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                      : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400'
                  )}
                >
                  {tx.type === 'INCOME' ? '+' : '-'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{tx.category}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(tx.date), 'MMM d, yyyy')}
                    {tx.user && ` · ${tx.user.name}`}
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className={cn(
                      'text-sm font-semibold',
                      tx.type === 'INCOME' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                    )}
                  >
                    {tx.type === 'INCOME' ? '+' : '-'}{formatCurrency(tx.amount)}
                  </p>
                  <Badge variant="secondary" className="text-[10px]">
                    {tx.type}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
