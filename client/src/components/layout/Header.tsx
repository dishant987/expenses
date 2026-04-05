import { useLocation } from 'react-router-dom'
import { LogOut, Sun, Moon, Menu } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Sidebar } from './Sidebar'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useState } from 'react'

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  '/dashboard': { title: 'Dashboard', subtitle: 'Overview of your finances' },
  '/transactions': { title: 'Transactions', subtitle: 'Manage financial records' },
  '/users': { title: 'Users', subtitle: 'Manage team members and roles' },
}

export function Header() {
  const location = useLocation()
  const { user, logout } = useAuth()
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'))

  const page = pageTitles[location.pathname] ?? { title: 'Finance Dashboard', subtitle: '' }

  const toggleTheme = () => {
    const root = document.documentElement
    root.classList.toggle('dark')
    setIsDark(root.classList.contains('dark'))
  }

  return (
    <header className="flex h-19 items-center justify-between border-b border-border bg-card px-4 sm:px-6">
      <div className="flex items-center gap-4">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden h-9 w-9">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64 border-r-0">
            <Sidebar className="w-full border-r-0" />
          </SheetContent>
        </Sheet>
        
        <div>
          <h2 className="text-lg font-semibold text-foreground leading-tight">{page.title}</h2>
          {page.subtitle && <p className="hidden xs:block text-[11px] text-muted-foreground">{page.subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-9 w-9">
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 px-2" id="user-menu">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <div className="px-3 py-2">
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-xs text-muted-foreground">{user?.role}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={logout}
              className="text-destructive focus:text-destructive cursor-pointer"
              id="logout-btn"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
