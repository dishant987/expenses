import { db, transactions, users, eq, and, or, desc, asc, count, ilike, gte, lte, isNull, isNotNull, inArray } from '../../db/index.js'
import { createError } from '../../middleware/error.middleware.js'
import { randomUUID } from 'crypto'

interface ListQuery {
  page?: string
  limit?: string
  type?: 'INCOME' | 'EXPENSE'
  category?: string
  startDate?: string
  endDate?: string
  search?: string
}

export async function listTransactions(query: ListQuery) {
  const page = Math.max(1, parseInt(query.page ?? '1'))
  const limit = Math.min(100, parseInt(query.limit ?? '20'))
  const offset = (page - 1) * limit

  const filters = [isNull(transactions.deletedAt)]
  if (query.type && (query.type as string) !== 'all') filters.push(eq(transactions.type, query.type as any))
  if (query.category && (query.category as string) !== 'all') filters.push(ilike(transactions.category, `%${query.category}%`))

  if (query.startDate) filters.push(gte(transactions.date, new Date(query.startDate)))
  if (query.endDate) filters.push(lte(transactions.date, new Date(query.endDate)))

  if (query.search) {
    filters.push(or(
      ilike(transactions.category, `%${query.search}%`),
      ilike(transactions.notes, `%${query.search}%`)
    ))
  }

  const where = filters.length > 1 ? and(...filters)! : filters[0]!

  const [txs, [{ total }]] = await Promise.all([
    db.query.transactions.findMany({
      where,
      limit,
      offset,
      orderBy: [desc(transactions.date)],
      with: {
        user: {
          columns: { id: true, name: true, email: true }
        }
      }
    }),
    db.select({ total: count() }).from(transactions).where(where)
  ])

  return { transactions: txs, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } }
}

export async function createTransaction(data: {
  amount: number
  type: 'INCOME' | 'EXPENSE'
  category: string
  date: string
  notes?: string
  userId: string
}) {
  const id = randomUUID().replace(/-/g, '')

  const [newTx] = await db.insert(transactions).values({
    id,
    amount: data.amount.toString(),
    type: data.type as any,
    category: data.category,
    date: new Date(data.date),
    notes: data.notes,
    userId: data.userId,
  }).returning()

  // To return the with: { user } structure, we refetch or just return basic
  // Backend code was returning with user, so let's refetch to keep it consistent
  return db.query.transactions.findFirst({
    where: eq(transactions.id, id),
    with: { user: { columns: { id: true, name: true, email: true } } }
  })
}

export async function updateTransaction(
  id: string,
  data: { amount?: number; type?: 'INCOME' | 'EXPENSE'; category?: string; date?: string; notes?: string | null }
) {
  const [tx] = await db.select().from(transactions).where(and(eq(transactions.id, id), isNull(transactions.deletedAt))).limit(1)
  if (!tx) throw createError('Transaction not found', 404)

  await db.update(transactions)
    .set({
      ...(data.amount !== undefined && { amount: data.amount.toString() }),
      ...(data.type !== undefined && { type: data.type as any }),
      ...(data.category !== undefined && { category: data.category }),
      ...(data.date !== undefined && { date: new Date(data.date) }),
      ...(data.notes !== undefined && { notes: data.notes }),
      updatedAt: new Date(),
    })
    .where(eq(transactions.id, id))

  return db.query.transactions.findFirst({
    where: eq(transactions.id, id),
    with: { user: { columns: { id: true, name: true, email: true } } }
  })
}

export async function softDeleteTransaction(id: string) {
  const [tx] = await db.select().from(transactions).where(and(eq(transactions.id, id), isNull(transactions.deletedAt))).limit(1)
  if (!tx) throw createError('Transaction not found', 404)

  await db.update(transactions)
    .set({ deletedAt: new Date() })
    .where(eq(transactions.id, id))
}

export async function bulkSoftDeleteTransactions(ids: string[]) {
  await db.update(transactions)
    .set({ deletedAt: new Date() })
    .where(and(inArray(transactions.id, ids), isNull(transactions.deletedAt)))
}

export async function listDeletedTransactions(query: { page?: string, limit?: string }) {
  const page = Math.max(1, parseInt(query.page ?? '1'))
  const limit = Math.min(100, parseInt(query.limit ?? '20'))
  const offset = (page - 1) * limit

  const where = isNotNull(transactions.deletedAt)

  const [txs, [{ total }]] = await Promise.all([
    db.query.transactions.findMany({
      where,
      limit,
      offset,
      orderBy: [desc(transactions.deletedAt)],
      with: {
        user: {
          columns: { id: true, name: true, email: true }
        }
      }
    }),
    db.select({ total: count() }).from(transactions).where(where)
  ])

  return { transactions: txs, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } }
}

export async function restoreTransactions(ids: string[]) {
  await db.update(transactions)
    .set({ deletedAt: null })
    .where(inArray(transactions.id, ids))
}

export async function permanentlyDeleteTransactions(ids: string[]) {
  await db.delete(transactions)
    .where(inArray(transactions.id, ids))
}
