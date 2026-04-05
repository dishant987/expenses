import { db, transactions, users, eq, and, desc, count, sum, gte, isNull } from '../../db/index.js'

export async function getSummary() {
  const [incomeResult, expenseResult, [{ transactionCount }], [{ userCount }]] = await Promise.all([
    db.select({ total: sum(transactions.amount) })
      .from(transactions)
      .where(and(eq(transactions.type, 'INCOME'), isNull(transactions.deletedAt))),
    db.select({ total: sum(transactions.amount) })
      .from(transactions)
      .where(and(eq(transactions.type, 'EXPENSE'), isNull(transactions.deletedAt))),
    db.select({ transactionCount: count() })
      .from(transactions)
      .where(isNull(transactions.deletedAt)),
    db.select({ userCount: count() })
      .from(users),
  ])

  const totalIncome = Number(incomeResult[0]?.total ?? 0)
  const totalExpenses = Number(expenseResult[0]?.total ?? 0)
  const netBalance = totalIncome - totalExpenses

  return { totalIncome, totalExpenses, netBalance, transactionCount, userCount }
}

export async function getTrends() {
  // Last 12 months of income vs expenses grouped by month
  const twelveMonthsAgo = new Date()
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11)
  twelveMonthsAgo.setDate(1)
  twelveMonthsAgo.setHours(0, 0, 0, 0)

  const txs = await db.select({
    amount: transactions.amount,
    type: transactions.type,
    date: transactions.date,
  })
    .from(transactions)
    .where(and(isNull(transactions.deletedAt), gte(transactions.date, twelveMonthsAgo)))

  // Group by year-month
  const monthMap = new Map<string, { income: number; expense: number }>()
  for (const tx of txs) {
    const key = `${tx.date.getFullYear()}-${String(tx.date.getMonth() + 1).padStart(2, '0')}`
    const current = monthMap.get(key) ?? { income: 0, expense: 0 }
    if (tx.type === 'INCOME') current.income += Number(tx.amount)
    else current.expense += Number(tx.amount)
    monthMap.set(key, current)
  }

  // Fill missing months
  const result = []
  for (let i = 11; i >= 0; i--) {
    const d = new Date()
    d.setMonth(d.getMonth() - i)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const label = d.toLocaleString('default', { month: 'short', year: '2-digit' })
    const data = monthMap.get(key) ?? { income: 0, expense: 0 }
    result.push({ month: label, key, ...data })
  }

  return result
}

export async function getCategories() {
  const result = await db.select({
    category: transactions.category,
    type: transactions.type,
    total: sum(transactions.amount),
    count: count(transactions.id),
  })
    .from(transactions)
    .where(isNull(transactions.deletedAt))
    .groupBy(transactions.category, transactions.type)
    .orderBy(desc(sum(transactions.amount)))

  return result.map((c) => ({
    category: c.category,
    type: c.type,
    total: Number(c.total ?? 0),
    count: c.count,
  }))
}

export async function getRecent(limit = 10) {
  return db.query.transactions.findMany({
    where: isNull(transactions.deletedAt),
    limit,
    orderBy: [desc(transactions.date)],
    with: {
      user: {
        columns: { id: true, name: true, email: true }
      }
    }
  })
}

