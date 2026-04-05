import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  ArrowLeftRight,
  Users,
  DollarSign,
  ChevronRight,
  Trash2,
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { cn } from '../../lib/utils'

const navItems = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    roles: ['VIEWER', 'ANALYST', 'ADMIN'],
  },
  {
    label: 'Transactions',
    href: '/transactions',
    icon: ArrowLeftRight,
    roles: ['VIEWER', 'ANALYST', 'ADMIN'],
  },
  {
    label: 'Users',
    href: '/users',
    icon: Users,
    roles: ['ANALYST', 'ADMIN'],
  },
  {
    label: 'Recycle Bin',
    href: '/recycle-bin',
    icon: Trash2,
    roles: ['ADMIN'],
  },
] as const

export function Sidebar({ className }: { className?: string }) {
  const { user } = useAuthStore()
  const location = useLocation()

  const visibleItems = navItems.filter((item) =>
    user ? item.roles.includes(user.role as any) : false
  )

  return (
    <aside className={cn("h-full w-64 flex-col border-r border-border bg-card", className)}>
      {/* Brand */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-border">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
          <DollarSign className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-sm font-semibold text-foreground">FinanceFlow</h1>
          <p className="text-xs text-muted-foreground">Dashboard</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Navigation
        </p>
        {visibleItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.href
          return (
            <NavLink
              key={item.href}
              to={item.href}
              className={cn(
                'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="flex-1">{item.label}</span>
              {isActive && <ChevronRight className="h-3.5 w-3.5 opacity-60" />}
            </NavLink>
          )
        })}
      </nav>

      {/* User info */}
      {user && (
        <div className="border-t border-border px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-semibold">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">{user.name}</p>
              <span className="inline-flex items-center rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary uppercase tracking-wide">
                {user.role}
              </span>
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}
