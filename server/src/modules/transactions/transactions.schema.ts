import { z } from 'zod'

export const createTransactionSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  type: z.enum(['INCOME', 'EXPENSE']),
  category: z.string().min(1, 'Category is required'),
  date: z.string().datetime({ offset: true }).or(z.string().date()),
  notes: z.string().optional(),
  userId: z.string().optional(),
})

export const updateTransactionSchema = z.object({
  amount: z.number().positive().optional(),
  type: z.enum(['INCOME', 'EXPENSE']).optional(),
  category: z.string().min(1).optional(),
  date: z.string().datetime({ offset: true }).or(z.string().date()).optional(),
  notes: z.string().nullable().optional(),
})

export const listTransactionsQuerySchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('20'),
  type: z.enum(['INCOME', 'EXPENSE']).optional(),
  category: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  search: z.string().optional(),
})

export const bulkDeleteTransactionsSchema = z.object({
  ids: z.array(z.string()).min(1, 'At least one ID is required'),
})
