import { Request } from 'express'

export type Role = 'VIEWER' | 'ANALYST' | 'ADMIN'
export type Status = 'ACTIVE' | 'INACTIVE'
export type TransactionType = 'INCOME' | 'EXPENSE'

export interface JwtPayload {
  userId: string
  email: string
  role: Role
}

export interface AuthRequest extends Request {
  user?: JwtPayload
}

export interface PaginationQuery {
  page?: string
  limit?: string
}

export interface TransactionFilter {
  type?: TransactionType
  category?: string
  startDate?: string
  endDate?: string
  page?: string
  limit?: string
}
