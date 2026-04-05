import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { db, users, eq } from '../../db/index.js'
import { createError } from '../../middleware/error.middleware.js'
import { randomUUID } from 'crypto'

interface RegisterInput {
  name: string
  email: string
  password: string
  role?: 'VIEWER' | 'ANALYST' | 'ADMIN'
}

interface LoginInput {
  email: string
  password: string
}

function signToken(userId: string, email: string, role: string) {
  return jwt.sign(
    { userId, email, role },
    process.env.JWT_SECRET!,
    { expiresIn: process.env.JWT_EXPIRES_IN ?? '7d' } as jwt.SignOptions
  )
}

export async function register(data: RegisterInput) {
  const [existing] = await db.select().from(users).where(eq(users.email, data.email)).limit(1)
  if (existing) throw createError('Email already in use', 409)

  const hashed = await bcrypt.hash(data.password, 12)
  const id = randomUUID().replace(/-/g, '')

  const [user] = await db.insert(users).values({
    id,
    name: data.name,
    email: data.email,
    password: hashed,
    role: (data.role ?? 'VIEWER') as any,
  }).returning({
    id: users.id,
    name: users.name,
    email: users.email,
    role: users.role,
    status: users.status,
    createdAt: users.createdAt,
  })

  const token = signToken(user.id, user.email, user.role)
  return { user, token }
}

export async function login(data: LoginInput) {
  console.log('Login attempt for:', data.email)
  try {
    const [user] = await db.select().from(users).where(eq(users.email, data.email)).limit(1)
    if (!user) {
      console.log('User not found:', data.email)
      throw createError('Invalid email or password', 401)
    }
    console.log('User found, checking status...')
    if (user.status === 'INACTIVE') throw createError('Account is inactive', 403)

    console.log('Comparing passwords...')
    const valid = await bcrypt.compare(data.password, user.password)
    if (!valid) {
      console.log('Invalid password for:', data.email)
      throw createError('Invalid email or password', 401)
    }

    console.log('Signing token...')
    const token = signToken(user.id, user.email, user.role)
    const { password: _p, ...safeUser } = user
    console.log('Login successful for:', data.email)
    return { user: safeUser, token }
  } catch (error) {
    console.error('Login error:', error)
    throw error
  }
}


export async function getMe(userId: string) {
  const [user] = await db.select({
    id: users.id,
    name: users.name,
    email: users.email,
    role: users.role,
    status: users.status,
    createdAt: users.createdAt,
  }).from(users).where(eq(users.id, userId)).limit(1)

  if (!user) throw createError('User not found', 404)
  return user
}

