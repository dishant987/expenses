export type Role = 'VIEWER' | 'ANALYST' | 'ADMIN'
export type UserStatus = 'ACTIVE' | 'INACTIVE'
export type TransactionType = 'INCOME' | 'EXPENSE'

export interface User {
  id: string
  name: string
  email: string
  role: Role
  status: UserStatus
  deletedAt?: string | null
  createdAt: string
}

export interface Transaction {
  id: string
  amount: string | number
  type: TransactionType
  category: string
  date: string
  notes?: string | null
  deletedAt?: string | null
  createdAt: string
  userId: string
  user?: Pick<User, 'id' | 'name' | 'email'>
}

export interface DashboardSummary {
  totalIncome: number
  totalExpenses: number
  netBalance: number
  transactionCount: number
  userCount: number
}

export interface TrendItem {
  month: string
  key: string
  income: number
  expense: number
}

export interface CategoryItem {
  category: string
  type: TransactionType
  total: number
  count: number
}

export interface PaginationMeta {
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface PaginatedResponse<T> {
  success: boolean
  data?: T[]
  transactions?: T[]
  users?: T[]
  meta: PaginationMeta
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

export interface AuthData {
  user: User
  token: string
}
