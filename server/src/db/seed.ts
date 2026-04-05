import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { db, users, transactions } from './index.js'
import { randomUUID } from 'crypto'

const categories = {
  INCOME: ['Salary', 'Freelance', 'Investment', 'Bonus', 'Rental Income', 'Dividends'],
  EXPENSE: ['Food & Dining', 'Transportation', 'Utilities', 'Healthcare', 'Shopping', 'Entertainment', 'Housing', 'Education'],
}

function randomDate(start: Date, end: Date) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

async function main() {
  console.log('🌱 Seeding database...')

  // Clear existing data (order matters due to foreign keys)
  await db.delete(transactions)
  await db.delete(users)

  const hashedPassword = await bcrypt.hash('password123', 12)

  // Create users
  const adminId = randomUUID().replace(/-/g, '')
  const analystId = randomUUID().replace(/-/g, '')
  const viewerId = randomUUID().replace(/-/g, '')

  const [adminUser] = await db.insert(users).values({
    id: adminId,
    name: 'Admin User',
    email: 'admin@finance.com',
    password: hashedPassword,
    role: 'ADMIN',
    status: 'ACTIVE',
  }).returning()

  const [analystUser] = await db.insert(users).values({
    id: analystId,
    name: 'Analyst User',
    email: 'analyst@finance.com',
    password: hashedPassword,
    role: 'ANALYST',
    status: 'ACTIVE',
  }).returning()

  const [viewerUser] = await db.insert(users).values({
    id: viewerId,
    name: 'Viewer User',
    email: 'viewer@finance.com',
    password: hashedPassword,
    role: 'VIEWER',
    status: 'ACTIVE',
  }).returning()

  console.log('✅ Created users:', { admin: adminUser.email, analyst: analystUser.email, viewer: viewerUser.email })

  // Create 60 transactions spread across the last 12 months
  const now = new Date()
  const twelveMonthsAgo = new Date(now)
  twelveMonthsAgo.setMonth(now.getMonth() - 12)

  const userList = [adminUser, analystUser, viewerUser]
  const transactionData = []

  for (let i = 0; i < 60; i++) {
    const type = (Math.random() > 0.45 ? 'EXPENSE' : 'INCOME') as any
    const category = randomItem(categories[type as 'INCOME' | 'EXPENSE'])
    const user = randomItem(userList)
    const amount = type === 'INCOME'
      ? Math.round((Math.random() * 110000 + 40000) * 100) / 100  // 40,000 to 150,000
      : Math.round((Math.random() * 24500 + 500) * 100) / 100   // 500 to 25,000

    transactionData.push({
      id: randomUUID().replace(/-/g, ''),
      amount: amount.toString(),
      type: type as any,
      category,
      date: randomDate(twelveMonthsAgo, now),
      notes: Math.random() > 0.5 ? `${category} - ${new Date().toLocaleString('default', { month: 'long' })}` : null,
      userId: user.id,
    })
  }

  await db.insert(transactions).values(transactionData)
  console.log(`✅ Created ${transactionData.length} transactions`)

  console.log('\n🎉 Seed complete!')
  console.log('📧 Login credentials (all use password: password123):')
  console.log('   Admin:   admin@finance.com')
  console.log('   Analyst: analyst@finance.com')
  console.log('   Viewer:  viewer@finance.com')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
