import bcrypt from 'bcryptjs'
import { db, users, eq, and, or, desc, count, ilike, sql, inArray, isNull, isNotNull } from '../../db/index.js'
import { createError } from '../../middleware/error.middleware.js'
import { randomUUID } from 'crypto'

interface ListUsersQuery {
  page?: string
  limit?: string
  role?: 'VIEWER' | 'ANALYST' | 'ADMIN'
  status?: 'ACTIVE' | 'INACTIVE'
  search?: string
}

export async function listUsers(query: ListUsersQuery) {
  const page = Math.max(1, parseInt(query.page ?? '1'))
  const limit = Math.min(100, parseInt(query.limit ?? '20'))
  const offset = (page - 1) * limit

  const filters = [isNull(users.deletedAt)]
  if (query.role && (query.role as string) !== 'all') filters.push(eq(users.role, query.role as any))
  if (query.status && (query.status as string) !== 'all') filters.push(eq(users.status, query.status as any))
  if (query.search) {
    filters.push(or(
      ilike(users.name, `%${query.search}%`),
      ilike(users.email, `%${query.search}%`)
    ))
  }

  const where = filters.length > 1 ? and(...filters)! : filters[0]!

  const [usersList, [{ total }]] = await Promise.all([
    db.select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      status: users.status,
      createdAt: users.createdAt,
    })
      .from(users)
      .where(where)
      .limit(limit)
      .offset(offset)
      .orderBy(desc(users.createdAt)),
    db.select({ total: count() }).from(users).where(where)
  ])

  return { users: usersList, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } }
}

export async function createUser(data: {
  name: string
  email: string
  password: string
  role: 'VIEWER' | 'ANALYST' | 'ADMIN'
}) {
  const [existing] = await db.select().from(users).where(eq(users.email, data.email)).limit(1)
  if (existing) throw createError('Email already in use', 409)

  const hashed = await bcrypt.hash(data.password, 12)
  const id = randomUUID().replace(/-/g, '')

  const [user] = await db.insert(users).values({
    ...data,
    id,
    password: hashed,
    role: data.role as any,
  }).returning({
    id: users.id,
    name: users.name,
    email: users.email,
    role: users.role,
    status: users.status,
    createdAt: users.createdAt,
  })

  return user
}

export async function updateUser(
  id: string,
  data: { name?: string; email?: string; role?: 'VIEWER' | 'ANALYST' | 'ADMIN'; status?: 'ACTIVE' | 'INACTIVE' }
) {
  const [user] = await db.select().from(users).where(and(eq(users.id, id), isNull(users.deletedAt))).limit(1)
  if (!user) throw createError('User not found', 404)

  const [updated] = await db.update(users)
    .set({ ...data, role: data.role as any, status: data.status as any, updatedAt: new Date() })
    .where(eq(users.id, id))
    .returning({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      status: users.status,
      updatedAt: users.updatedAt,
    })

  return updated
}

export async function softDeleteUser(id: string) {
  const [user] = await db.select().from(users).where(and(eq(users.id, id), isNull(users.deletedAt))).limit(1)
  if (!user) throw createError('User not found', 404)
  await db.update(users).set({ deletedAt: new Date() }).where(eq(users.id, id))
}

export async function bulkSoftDeleteUsers(ids: string[]) {
  await db.update(users).set({ deletedAt: new Date() }).where(inArray(users.id, ids))
}

export async function listDeletedUsers() {
  return db.select({
    id: users.id,
    name: users.name,
    email: users.email,
    role: users.role,
    status: users.status,
    deletedAt: users.deletedAt,
  })
    .from(users)
    .where(isNotNull(users.deletedAt))
    .orderBy(desc(users.deletedAt))
}

export async function restoreUsers(ids: string[]) {
  await db.update(users).set({ deletedAt: null }).where(inArray(users.id, ids))
}

export async function permanentlyDeleteUsers(ids: string[]) {
  await db.delete(users).where(inArray(users.id, ids))
}
