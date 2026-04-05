import { pgTable, varchar, text, timestamp, decimal, pgEnum, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const roleEnum = pgEnum('role', ['VIEWER', 'ANALYST', 'ADMIN']);
export const statusEnum = pgEnum('status', ['ACTIVE', 'INACTIVE']);
export const transactionTypeEnum = pgEnum('transaction_type', ['INCOME', 'EXPENSE']);

// User Table
export const users = pgTable('users', {
  id: varchar('id', { length: 32 }).primaryKey(), // Using length for cuid-like behavior
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  role: roleEnum('role').default('VIEWER').notNull(),
  status: statusEnum('status').default('ACTIVE').notNull(),
  deletedAt: timestamp('deleted_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Transaction Table
export const transactions = pgTable('transactions', {
  id: varchar('id', { length: 32 }).primaryKey(),
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  type: transactionTypeEnum('type').notNull(),
  category: text('category').notNull(),
  date: timestamp('date').notNull(),
  notes: text('notes'),
  deletedAt: timestamp('deleted_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  userId: varchar('user_id', { length: 32 }).references(() => users.id).notNull(),
}, (table) => ({
  typeCategoryDateIdx: index('type_category_date_idx').on(table.type, table.category, table.date),
}));

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  transactions: many(transactions),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id],
  }),
}));
