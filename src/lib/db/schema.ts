import { sql } from 'drizzle-orm';
import {
	index,
	integer,
	jsonb,
	numeric,
	pgEnum,
    pgTable,
	serial,
	text,
	timestamp,
	uuid,
	boolean
} from 'drizzle-orm/pg-core';

export const paymentMethodEnum = pgEnum('payment_method', ['cash', 'qris', 'debit', 'credit']);

export const transactionStatusEnum = pgEnum('transaction_status', ['pending', 'completed', 'void']);

export const roles = pgTable('roles', {
	id: serial('id').primaryKey(),
	name: text('name').notNull().unique(),
	description: text('description'),
	permissions: jsonb('permissions').$type<string[]>().notNull().default(sql`'[]'::jsonb`),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
});

export const users = pgTable('users', {
	id: uuid('id').defaultRandom().primaryKey(),
	roleId: integer('role_id')
		.references(() => roles.id, { onDelete: 'restrict', onUpdate: 'cascade' })
		.notNull(),
	email: text('email').notNull().unique(),
	passwordHash: text('password_hash').notNull(),
	fullName: text('full_name').notNull(),
	avatarUrl: text('avatar_url'),
	isActive: boolean('is_active').default(true).notNull(),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
});

export const sessions = pgTable('sessions', {
	id: text('id').primaryKey(),
	userId: uuid('user_id')
		.references(() => users.id, { onDelete: 'cascade' })
		.notNull(),
	expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
});

export const categories = pgTable('categories', {
	id: serial('id').primaryKey(),
	name: text('name').notNull().unique(),
	description: text('description'),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
});

export const products = pgTable(
	'products',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		categoryId: integer('category_id').references(() => categories.id, {
			onDelete: 'set null',
			onUpdate: 'cascade'
		}),
		sku: text('sku').notNull().unique(),
		name: text('name').notNull(),
		description: text('description'),
		price: numeric('price', { precision: 12, scale: 2 }).default(sql`0`).notNull(),
		isActive: boolean('is_active').default(true).notNull(),
		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
	},
	(table) => ({
		categoryIdx: index('products_category_idx').on(table.categoryId)
	})
);

export const customers = pgTable('customers', {
	id: uuid('id').defaultRandom().primaryKey(),
	name: text('name').notNull(),
	email: text('email'),
	phone: text('phone'),
	address: text('address'),
	notes: text('notes'),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
});

export const transactions = pgTable(
	'transactions',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		number: text('number').notNull().unique(),
		userId: uuid('user_id')
			.references(() => users.id, { onDelete: 'restrict', onUpdate: 'cascade' })
			.notNull(),
		customerId: uuid('customer_id').references(() => customers.id, {
			onDelete: 'set null',
			onUpdate: 'cascade'
		}),
		subtotal: numeric('subtotal', { precision: 12, scale: 2 }).default(sql`0`).notNull(),
		tax: numeric('tax', { precision: 12, scale: 2 }).default(sql`0`).notNull(),
		discount: numeric('discount', { precision: 12, scale: 2 }).default(sql`0`).notNull(),
		total: numeric('total', { precision: 12, scale: 2 }).notNull(),
		status: transactionStatusEnum('status').default('completed').notNull(),
		note: text('note'),
		metadata: jsonb('metadata'),
		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
	},
	(table) => ({
		transactionUserIdx: index('transactions_user_idx').on(table.userId),
		transactionCustomerIdx: index('transactions_customer_idx').on(table.customerId)
	})
);

export const transactionItems = pgTable(
	'transaction_items',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		transactionId: uuid('transaction_id')
			.references(() => transactions.id, { onDelete: 'cascade' })
			.notNull(),
		productId: uuid('product_id')
			.references(() => products.id, { onDelete: 'restrict', onUpdate: 'cascade' })
			.notNull(),
		quantity: integer('quantity').default(1).notNull(),
		unitPrice: numeric('unit_price', { precision: 12, scale: 2 }).notNull(),
		totalPrice: numeric('total_price', { precision: 12, scale: 2 }).notNull(),
		note: text('note'),
		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
	},
	(table) => ({
		transactionItemTransactionIdx: index('transaction_items_transaction_idx').on(table.transactionId),
		transactionItemProductIdx: index('transaction_items_product_idx').on(table.productId)
	})
);

export const payments = pgTable(
	'payments',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		transactionId: uuid('transaction_id')
			.references(() => transactions.id, { onDelete: 'cascade' })
			.notNull(),
		amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
		method: paymentMethodEnum('method').notNull(),
		status: text('status').default('paid').notNull(),
		reference: text('reference'),
		paidAt: timestamp('paid_at', { withTimezone: true }).defaultNow().notNull(),
		metadata: jsonb('metadata'),
		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
	},
	(table) => ({
		paymentsTransactionIdx: index('payments_transaction_idx').on(table.transactionId)
	})
);

export type Role = typeof roles.$inferSelect;
export type NewRole = typeof roles.$inferInsert;

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;

export type Customer = typeof customers.$inferSelect;
export type NewCustomer = typeof customers.$inferInsert;

export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;

export type TransactionItem = typeof transactionItems.$inferSelect;
export type NewTransactionItem = typeof transactionItems.$inferInsert;

export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;
