import { relations, sql } from 'drizzle-orm';
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
	boolean,
	uniqueIndex,
	date
} from 'drizzle-orm/pg-core';

export const paymentMethodEnum = pgEnum('payment_method', ['cash', 'qris', 'debit', 'credit']);

export const transactionStatusEnum = pgEnum('transaction_status', ['pending', 'completed', 'void']);

export const savingTransactionTypeEnum = pgEnum('saving_transaction_type', ['deposit', 'withdraw']);

export const loanStatusEnum = pgEnum('loan_status', ['active', 'closed', 'defaulted']);

export const loanTransactionTypeEnum = pgEnum('loan_transaction_type', [
	'disbursement',
	'repayment',
	'interest',
	'penalty',
	'adjustment'
]);

export const accountTypeEnum = pgEnum('account_type', [
	'asset',
	'liability',
	'equity',
	'revenue',
	'expense',
	'other'
]);

export const journalStatusEnum = pgEnum('journal_status', ['draft', 'posted', 'void']);

export const budgetScenarioEnum = pgEnum('budget_scenario', ['baseline', 'optimistic', 'conservative']);

export const budgetTypeEnum = pgEnum('budget_type', ['revenue', 'expense']);

export const kosanRoomStatusEnum = pgEnum('kosan_room_status', ['kosong', 'terisi']);

export const kosanTenantStatusEnum = pgEnum('kosan_tenant_status', ['aktif', 'keluar']);

// Simklinik Enums
export const pasienStatusEnum = pgEnum('pasien_status', ['aktif', 'tidak_aktif', 'alih']);
export const appointmentStatusEnum = pgEnum('appointment_status', ['scheduled', 'confirmed', 'completed', 'cancelled', 'no_show']);
export const genderEnum = pgEnum('gender', ['male', 'female', 'other']);
export const bloodTypeEnum = pgEnum('blood_type', ['A_positive', 'A_negative', 'B_positive', 'B_negative', 'AB_positive', 'AB_negative', 'O_positive', 'O_negative', 'unknown']);
export const medicalStaffRoleEnum = pgEnum('medical_staff_role', ['doctor', 'nurse', 'midwife', 'specialist', 'pharmacist', 'lab_technician', 'receptionist']);
export const appointmentTypeEnum = pgEnum('appointment_type', ['consultation', 'checkup', 'follow_up', 'emergency', 'vaccination', 'procedure']);
export const consultationStatusEnum = pgEnum('consultation_status', ['ongoing', 'completed', 'cancelled']);
export const prescriptionStatusEnum = pgEnum('prescription_status', ['active', 'completed', 'cancelled']);
export const inventoryTypeEnum = pgEnum('inventory_type', ['medicine', 'consumable', 'equipment']);
export const stockMovementTypeEnum = pgEnum('stock_movement_type', ['in', 'out', 'adjust', 'expired', 'returned']);
export const bedStatusEnum = pgEnum('bed_status', ['available', 'occupied', 'maintenance', 'cleaning']);
export const admissionStatusEnum = pgEnum('admission_status', ['admitted', 'discharged', 'transferred']);

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

export const gedungKosan = pgTable('gedung_kosan', {
	id: uuid('id').defaultRandom().primaryKey(),
	namaGedung: text('nama_gedung').notNull(),
	alamat: text('alamat').notNull(),
	keterangan: text('keterangan'),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
});

export const ruanganKosan = pgTable(
	'ruangan_kosan',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		gedungId: uuid('gedung_id')
			.references(() => gedungKosan.id, { onDelete: 'restrict', onUpdate: 'cascade' })
			.notNull(),
		namaRuangan: text('nama_ruangan').notNull(),
		lantai: text('lantai'),
		kapasitas: integer('kapasitas').default(1).notNull(),
		status: kosanRoomStatusEnum('status').default('kosong').notNull(),
		hargaBulanan: numeric('harga_bulanan', { precision: 12, scale: 2 }).notNull(),
		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
	},
	(table) => ({
		ruanganGedungIdx: index('ruangan_kosan_gedung_idx').on(table.gedungId),
		ruanganStatusIdx: index('ruangan_kosan_status_idx').on(table.status)
	})
);

export const penghuniKosan = pgTable(
	'penghuni_kosan',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		pelangganId: uuid('pelanggan_id')
			.references(() => customers.id, { onDelete: 'restrict', onUpdate: 'cascade' })
			.notNull(),
		gedungId: uuid('gedung_id')
			.references(() => gedungKosan.id, { onDelete: 'restrict', onUpdate: 'cascade' })
			.notNull(),
		ruanganId: uuid('ruangan_id')
			.references(() => ruanganKosan.id, { onDelete: 'restrict', onUpdate: 'cascade' })
			.notNull(),
		tanggalMasuk: date('tanggal_masuk').notNull(),
		tanggalKeluar: date('tanggal_keluar'),
		status: kosanTenantStatusEnum('status').default('aktif').notNull(),
		catatan: text('catatan'),
		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
	},
	(table) => ({
		penghuniPelangganIdx: index('penghuni_kosan_pelanggan_idx').on(table.pelangganId),
		penghuniRuanganIdx: index('penghuni_kosan_ruangan_idx').on(table.ruanganId),
		penghuniStatusIdx: index('penghuni_kosan_status_idx').on(table.status),
		penghuniGedungIdx: index('penghuni_kosan_gedung_idx').on(table.gedungId)
	})
);

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

export const savingsTransactions = pgTable(
	'savings_transactions',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		customerId: uuid('customer_id')
			.references(() => customers.id, { onDelete: 'cascade' })
			.notNull(),
		type: savingTransactionTypeEnum('type').notNull(),
		amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
		note: text('note'),
		reference: text('reference'),
		createdBy: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
	},
	(table) => ({
		savingsCustomerIdx: index('savings_transactions_customer_idx').on(table.customerId)
	})
);

export const loanAccounts = pgTable(
	'loan_accounts',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		customerId: uuid('customer_id')
			.references(() => customers.id, { onDelete: 'cascade' })
			.notNull(),
		principal: numeric('principal', { precision: 12, scale: 2 }).notNull(),
		balance: numeric('balance', { precision: 12, scale: 2 }).notNull(),
		interestRate: numeric('interest_rate', { precision: 5, scale: 2 }).default(sql`0`).notNull(),
		termMonths: integer('term_months'),
		status: loanStatusEnum('status').default('active').notNull(),
		issuedAt: timestamp('issued_at', { withTimezone: true }).defaultNow().notNull(),
		dueDate: timestamp('due_date', { withTimezone: true }),
		notes: text('notes'),
		createdBy: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
	},
	(table) => ({
		loanCustomerIdx: index('loan_accounts_customer_idx').on(table.customerId),
		loanStatusIdx: index('loan_accounts_status_idx').on(table.status)
	})
);

export const loanTransactions = pgTable(
	'loan_transactions',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		loanId: uuid('loan_id')
			.references(() => loanAccounts.id, { onDelete: 'cascade' })
			.notNull(),
		type: loanTransactionTypeEnum('type').notNull(),
		amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
		note: text('note'),
		reference: text('reference'),
		createdBy: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
	},
	(table) => ({
		loanTransactionLoanIdx: index('loan_transactions_loan_idx').on(table.loanId),
		loanTransactionTypeIdx: index('loan_transactions_type_idx').on(table.type)
	})
);

export const accountingAccounts = pgTable(
	'accounting_accounts',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		code: text('code').notNull().unique(),
		name: text('name').notNull(),
		type: accountTypeEnum('type').notNull(),
		parentId: uuid('parent_id'),
		description: text('description'),
		isActive: boolean('is_active').default(true).notNull(),
		createdBy: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
	},
	(table) => ({
		accountParentIdx: index('accounting_accounts_parent_idx').on(table.parentId),
		accountTypeIdx: index('accounting_accounts_type_idx').on(table.type)
	})
);

export const accountingJournalEntries = pgTable(
	'accounting_journal_entries',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		number: text('number').notNull().unique(),
		entryDate: timestamp('entry_date', { withTimezone: true }).defaultNow().notNull(),
		memo: text('memo'),
		reference: text('reference'),
		status: journalStatusEnum('status').default('draft').notNull(),
		postedAt: timestamp('posted_at', { withTimezone: true }),
		createdBy: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
		updatedBy: uuid('updated_by').references(() => users.id, { onDelete: 'set null' }),
		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
	},
	(table) => ({
		journalDateIdx: index('accounting_journal_entries_date_idx').on(table.entryDate),
		journalStatusIdx: index('accounting_journal_entries_status_idx').on(table.status)
	})
);

export const accountingJournalLines = pgTable(
	'accounting_journal_lines',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		entryId: uuid('entry_id')
			.references(() => accountingJournalEntries.id, { onDelete: 'cascade' })
			.notNull(),
		accountId: uuid('account_id')
			.references(() => accountingAccounts.id, { onDelete: 'restrict', onUpdate: 'cascade' })
			.notNull(),
		description: text('description'),
		sequence: integer('sequence').default(0).notNull(),
		debit: numeric('debit', { precision: 14, scale: 2 }).default(sql`0`).notNull(),
		credit: numeric('credit', { precision: 14, scale: 2 }).default(sql`0`).notNull(),
		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
	},
	(table) => ({
		journalEntryIdx: index('accounting_journal_lines_entry_idx').on(table.entryId),
		journalAccountIdx: index('accounting_journal_lines_account_idx').on(table.accountId)
	})
);

export const accountingBudgetPlans = pgTable(
	'accounting_budget_plans',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		year: integer('year').notNull(),
		scenario: budgetScenarioEnum('scenario').notNull(),
		notes: text('notes'),
		createdBy: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
	},
	(table) => ({
		planUniqueIdx: uniqueIndex('accounting_budget_plans_year_scenario_idx').on(table.year, table.scenario)
	})
);

export const accountingBudgetItems = pgTable(
	'accounting_budget_items',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		planId: uuid('plan_id')
			.references(() => accountingBudgetPlans.id, { onDelete: 'cascade' })
			.notNull(),
		type: budgetTypeEnum('type').notNull(),
		accountId: uuid('account_id').references(() => accountingAccounts.id, {
			onDelete: 'set null',
			onUpdate: 'cascade'
		}),
		accountCode: text('account_code').notNull(),
		accountName: text('account_name').notNull(),
		currentAmount: numeric('current_amount', { precision: 14, scale: 2 }).default(sql`0`).notNull(),
		plannedAmount: numeric('planned_amount', { precision: 14, scale: 2 }).default(sql`0`).notNull(),
		note: text('note'),
		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
	},
	(table) => ({
		budgetPlanIdx: index('accounting_budget_items_plan_idx').on(table.planId),
		budgetTypeIdx: index('accounting_budget_items_type_idx').on(table.type)
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

export type SavingsTransaction = typeof savingsTransactions.$inferSelect;
export type NewSavingsTransaction = typeof savingsTransactions.$inferInsert;

export type LoanAccount = typeof loanAccounts.$inferSelect;
export type NewLoanAccount = typeof loanAccounts.$inferInsert;

export type LoanTransaction = typeof loanTransactions.$inferSelect;
export type NewLoanTransaction = typeof loanTransactions.$inferInsert;

export type AccountingAccount = typeof accountingAccounts.$inferSelect;
export type NewAccountingAccount = typeof accountingAccounts.$inferInsert;

export type AccountingJournalEntry = typeof accountingJournalEntries.$inferSelect;
export type NewAccountingJournalEntry = typeof accountingJournalEntries.$inferInsert;

export type AccountingJournalLine = typeof accountingJournalLines.$inferSelect;
export type NewAccountingJournalLine = typeof accountingJournalLines.$inferInsert;

export type AccountingBudgetPlan = typeof accountingBudgetPlans.$inferSelect;
export type NewAccountingBudgetPlan = typeof accountingBudgetPlans.$inferInsert;

export type AccountingBudgetItem = typeof accountingBudgetItems.$inferSelect;
export type NewAccountingBudgetItem = typeof accountingBudgetItems.$inferInsert;

// SIMKLINIK TABLES

// Master Patients
export const patients = pgTable('patients', {
	id: uuid('id').defaultRandom().primaryKey(),
	mrNumber: text('mr_number').notNull().unique(),
	name: text('name').notNull(),
	dateOfBirth: date('date_of_birth').notNull(),
	gender: genderEnum('gender').notNull(),
	phone: text('phone'),
	email: text('email'),
	address: text('address'),
	bloodType: bloodTypeEnum('blood_type').default('unknown'),
	allergies: text('allergies'),
	emergencyContact: jsonb('emergency_contact'),
	insuranceId: text('insurance_id'),
	status: pasienStatusEnum('status').default('aktif').notNull(),
	notes: text('notes'),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
	mrNumberIdx: index('patients_mr_number_idx').on(table.mrNumber),
	patientStatusIdx: index('patients_status_idx').on(table.status)
}));

// Medical Staff
export const medicalStaff = pgTable('medical_staff', {
	id: uuid('id').defaultRandom().primaryKey(),
	userId: uuid('user_id').references(() => users.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
	nip: text('nip').notNull().unique(),
	name: text('name').notNull(),
	role: medicalStaffRoleEnum('role').notNull(),
	specialization: text('specialization'),
	phone: text('phone'),
	email: text('email'),
	licenseNumber: text('license_number'),
	education: text('education'),
	experience: integer('experience'), // years
	isActive: boolean('is_active').default(true).notNull(),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
	staffUserIdx: index('medical_staff_user_idx').on(table.userId),
	staffRoleIdx: index('medical_staff_role_idx').on(table.role)
}));

// Staff Schedules
export const staffSchedules = pgTable('staff_schedules', {
	id: uuid('id').defaultRandom().primaryKey(),
	staffId: uuid('staff_id').references(() => medicalStaff.id, { onDelete: 'cascade', onUpdate: 'cascade' }).notNull(),
	dayOfWeek: integer('day_of_week').notNull(), // 0 = Sunday, 6 = Saturday
	startTime: text('start_time').notNull(), // HH:MM format
	endTime: text('end_time').notNull(), // HH:MM format
	location: text('location'),
	isActive: boolean('is_active').default(true).notNull(),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
	scheduleStaffIdx: index('staff_schedules_staff_idx').on(table.staffId),
	scheduleDayIdx: index('staff_schedules_day_idx').on(table.dayOfWeek)
}));

// Medical Services
export const medicalServices = pgTable('medical_services', {
	id: uuid('id').defaultRandom().primaryKey(),
	categoryId: uuid('category_id'),
	code: text('code').notNull().unique(),
	name: text('name').notNull(),
	description: text('description'),
	price: numeric('price', { precision: 12, scale: 2 }).default(sql`0`).notNull(),
	duration: integer('duration'), // minutes
	isActive: boolean('is_active').default(true).notNull(),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
	servicesCategoryIdx: index('medical_services_category_idx').on(table.categoryId),
	servicesCodeIdx: index('medical_services_code_idx').on(table.code)
}));

// Medical Service Categories
export const medicalServiceCategories = pgTable('medical_service_categories', {
	id: uuid('id').defaultRandom().primaryKey(),
	name: text('name').notNull().unique(),
	description: text('description'),
	parentId: uuid('parent_id'),
	isActive: boolean('is_active').default(true).notNull(),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
});

// Appointments
export const appointments = pgTable('appointments', {
	id: uuid('id').defaultRandom().primaryKey(),
	patientId: uuid('patient_id').references(() => patients.id, { onDelete: 'restrict', onUpdate: 'cascade' }).notNull(),
	staffId: uuid('staff_id').references(() => medicalStaff.id, { onDelete: 'restrict', onUpdate: 'cascade' }).notNull(),
	serviceId: uuid('service_id').references(() => medicalServices.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
	appointmentDate: date('appointment_date').notNull(),
	appointmentTime: text('appointment_time').notNull(), // HH:MM format
	duration: integer('duration'), // minutes
	type: appointmentTypeEnum('type').notNull(),
	status: appointmentStatusEnum('status').default('scheduled').notNull(),
	notes: text('notes'),
	reason: text('reason'),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
	appointmentPatientIdx: index('appointments_patient_idx').on(table.patientId),
	appointmentStaffIdx: index('appointments_staff_idx').on(table.staffId),
	appointmentDateIdx: index('appointments_date_idx').on(table.appointmentDate),
	appointmentStatusIdx: index('appointments_status_idx').on(table.status)
}));

// Consultations
export const consultations = pgTable('consultations', {
	id: uuid('id').defaultRandom().primaryKey(),
	appointmentId: uuid('appointment_id').references(() => appointments.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
	admissionId: uuid('admission_id'),
	patientId: uuid('patient_id').references(() => patients.id, { onDelete: 'restrict', onUpdate: 'cascade' }).notNull(),
	staffId: uuid('staff_id').references(() => medicalStaff.id, { onDelete: 'restrict', onUpdate: 'cascade' }).notNull(),
	chiefComplaint: text('chief_complaint'),
	history: text('history'),
	physicalExamination: text('physical_examination'),
	diagnosis: text('diagnosis'),
	treatment: text('treatment'),
	notes: text('notes'),
	status: consultationStatusEnum('status').default('ongoing').notNull(),
	startTime: timestamp('start_time', { withTimezone: true }).defaultNow().notNull(),
	endTime: timestamp('end_time', { withTimezone: true }),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
	consultationAppointmentIdx: index('consultations_appointment_idx').on(table.appointmentId),
	consultationPatientIdx: index('consultations_patient_idx').on(table.patientId),
	consultationStaffIdx: index('consultations_staff_idx').on(table.staffId),
	consultationStatusIdx: index('consultations_status_idx').on(table.status)
}));

// Vital Signs
export const vitalSigns = pgTable('vital_signs', {
	id: uuid('id').defaultRandom().primaryKey(),
	consultationId: uuid('consultation_id').references(() => consultations.id, { onDelete: 'cascade', onUpdate: 'cascade' }).notNull(),
	patientId: uuid('patient_id').references(() => patients.id, { onDelete: 'restrict', onUpdate: 'cascade' }).notNull(),
	systolic: integer('systolic'), // mmHg
	diastolic: integer('diastolic'), // mmHg
	heartRate: integer('heart_rate'), // bpm
	respiratoryRate: integer('respiratory_rate'), // breaths per minute
	temperature: numeric('temperature', { precision: 4, scale: 1 }), // Celsius
	oxygenSaturation: integer('oxygen_saturation'), // %
	weight: numeric('weight', { precision: 5, scale: 2 }), // kg
	height: numeric('height', { precision: 5, scale: 2 }), // cm
	bmi: numeric('bmi', { precision: 4, scale: 1 }),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
	vitalSignsConsultationIdx: index('vital_signs_consultation_idx').on(table.consultationId),
	vitalSignsPatientIdx: index('vital_signs_patient_idx').on(table.patientId)
}));

// Prescriptions
export const prescriptions = pgTable('prescriptions', {
	id: uuid('id').defaultRandom().primaryKey(),
	consultationId: uuid('consultation_id').references(() => consultations.id, { onDelete: 'cascade', onUpdate: 'cascade' }).notNull(),
	patientId: uuid('patient_id').references(() => patients.id, { onDelete: 'restrict', onUpdate: 'cascade' }).notNull(),
	staffId: uuid('staff_id').references(() => medicalStaff.id, { onDelete: 'restrict', onUpdate: 'cascade' }).notNull(),
	medication: text('medication').notNull(),
	dosage: text('dosage').notNull(),
	frequency: text('frequency').notNull(),
	duration: text('duration').notNull(),
	instructions: text('instructions'),
	status: prescriptionStatusEnum('status').default('active').notNull(),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
	prescriptionConsultationIdx: index('prescriptions_consultation_idx').on(table.consultationId),
	prescriptionPatientIdx: index('prescriptions_patient_idx').on(table.patientId),
	prescriptionStaffIdx: index('prescriptions_staff_idx').on(table.staffId)
}));

// Medical Inventory
export const medicalInventory = pgTable('medical_inventory', {
	id: uuid('id').defaultRandom().primaryKey(),
	code: text('code').notNull().unique(),
	name: text('name').notNull(),
	description: text('description'),
	type: inventoryTypeEnum('type').notNull(),
	unit: text('unit').notNull(), // pcs, box, bottle, etc
	stock: integer('stock').default(0).notNull(),
	minStock: integer('min_stock').default(10).notNull(),
	maxStock: integer('max_stock').default(100).notNull(),
	price: numeric('price', { precision: 12, scale: 2 }).notNull(),
	expiryDate: date('expiry_date'),
	supplier: text('supplier'),
	categoryId: uuid('category_id'),
	isActive: boolean('is_active').default(true).notNull(),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
	inventoryCodeIdx: index('medical_inventory_code_idx').on(table.code),
	inventoryTypeIdx: index('medical_inventory_type_idx').on(table.type)
}));

// Stock Movements
export const stockMovements = pgTable('stock_movements', {
	id: uuid('id').defaultRandom().primaryKey(),
	itemId: uuid('item_id').references(() => medicalInventory.id, { onDelete: 'restrict', onUpdate: 'cascade' }).notNull(),
	type: stockMovementTypeEnum('type').notNull(),
	quantity: integer('quantity').notNull(),
	reference: text('reference'), // invoice number, patient name, etc
	notes: text('notes'),
	createdBy: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
	stockMovementItemIdx: index('stock_movements_item_idx').on(table.itemId),
	stockMovementTypeIdx: index('stock_movements_type_idx').on(table.type)
}));

// Medical Invoices
export const medicalInvoices = pgTable('medical_invoices', {
	id: uuid('id').defaultRandom().primaryKey(),
	appointmentId: uuid('appointment_id').references(() => appointments.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
	patientId: uuid('patient_id').references(() => patients.id, { onDelete: 'restrict', onUpdate: 'cascade' }).notNull(),
	invoiceNumber: text('invoice_number').notNull().unique(),
	totalAmount: numeric('total_amount', { precision: 12, scale: 2 }).notNull(),
	paidAmount: numeric('paid_amount', { precision: 12, scale: 2 }).default(sql`0`).notNull(),
	status: text('status').default('unpaid').notNull(),
	paymentMethod: paymentMethodEnum('payment_method'),
	paidAt: timestamp('paid_at', { withTimezone: true }),
	dueDate: date('due_date').notNull(),
	notes: text('notes'),
	createdBy: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
	medicalInvoicePatientIdx: index('medical_invoices_patient_idx').on(table.patientId),
	medicalInvoiceAppointmentIdx: index('medical_invoices_appointment_idx').on(table.appointmentId),
	medicalInvoiceStatusIdx: index('medical_invoices_status_idx').on(table.status)
}));

// Medical Invoice Items
export const medicalInvoiceItems = pgTable('medical_invoice_items', {
	id: uuid('id').defaultRandom().primaryKey(),
	invoiceId: uuid('invoice_id').references(() => medicalInvoices.id, { onDelete: 'cascade', onUpdate: 'cascade' }).notNull(),
	serviceId: uuid('service_id').references(() => medicalServices.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
	itemId: uuid('item_id').references(() => medicalInventory.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
	description: text('description').notNull(),
	quantity: integer('quantity').default(1).notNull(),
	unitPrice: numeric('unit_price', { precision: 12, scale: 2 }).notNull(),
	totalPrice: numeric('total_price', { precision: 12, scale: 2 }).notNull(),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
	medicalInvoiceItemInvoiceIdx: index('medical_invoice_items_invoice_idx').on(table.invoiceId)
}));

// Inpatient Rooms
export const inpatientRooms = pgTable('inpatient_rooms', {
	id: uuid('id').defaultRandom().primaryKey(),
	name: text('name').notNull(), // e.g., "Mawar", "Melati", "VIP A"
	type: text('type').notNull(), // e.g., "VIP", "Kelas 1", "Kelas 2", "Kelas 3"
	rate: numeric('rate', { precision: 12, scale: 2 }).notNull(), // Daily rate
	description: text('description'),
	isActive: boolean('is_active').default(true).notNull(),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
});

// Inpatient Beds
export const inpatientBeds = pgTable('inpatient_beds', {
	id: uuid('id').defaultRandom().primaryKey(),
	roomId: uuid('room_id').references(() => inpatientRooms.id, { onDelete: 'cascade', onUpdate: 'cascade' }).notNull(),
	bedNumber: text('bed_number').notNull(), // e.g., "1", "2", "A", "B"
	status: bedStatusEnum('status').default('available').notNull(),
	notes: text('notes'),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
	bedRoomIdx: index('inpatient_beds_room_idx').on(table.roomId),
	bedStatusIdx: index('inpatient_beds_status_idx').on(table.status)
}));

// Inpatient Admissions
export const inpatientAdmissions = pgTable('inpatient_admissions', {
	id: uuid('id').defaultRandom().primaryKey(),
	patientId: uuid('patient_id').references(() => patients.id, { onDelete: 'restrict', onUpdate: 'cascade' }).notNull(),
	bedId: uuid('bed_id').references(() => inpatientBeds.id, { onDelete: 'restrict', onUpdate: 'cascade' }).notNull(),
	admissionDate: timestamp('admission_date', { withTimezone: true }).defaultNow().notNull(),
	dischargeDate: timestamp('discharge_date', { withTimezone: true }),
	status: admissionStatusEnum('status').default('admitted').notNull(),
	diagnosis: text('diagnosis'),
	notes: text('notes'),
	admittedBy: uuid('admitted_by').references(() => users.id, { onDelete: 'set null' }),
	dischargedBy: uuid('discharged_by').references(() => users.id, { onDelete: 'set null' }),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
	admissionPatientIdx: index('inpatient_admissions_patient_idx').on(table.patientId),
	admissionBedIdx: index('inpatient_admissions_bed_idx').on(table.bedId),
	admissionStatusIdx: index('inpatient_admissions_status_idx').on(table.status)
}));

// Inpatient Relations
export const inpatientRoomsRelations = relations(inpatientRooms, ({ many }) => ({
	beds: many(inpatientBeds)
}));

export const inpatientBedsRelations = relations(inpatientBeds, ({ one, many }) => ({
	room: one(inpatientRooms, {
		fields: [inpatientBeds.roomId],
		references: [inpatientRooms.id]
	}),
	admissions: many(inpatientAdmissions)
}));

export const inpatientAdmissionsRelations = relations(inpatientAdmissions, ({ one, many }) => ({
	patient: one(patients, {
		fields: [inpatientAdmissions.patientId],
		references: [patients.id]
	}),
	bed: one(inpatientBeds, {
		fields: [inpatientAdmissions.bedId],
		references: [inpatientBeds.id]
	}),
	admittedBy: one(users, {
		fields: [inpatientAdmissions.admittedBy],
		references: [users.id]
	}),
	dischargedBy: one(users, {
		fields: [inpatientAdmissions.dischargedBy],
		references: [users.id]
	}),
	rekamMedis: many(rekamMedisInap)
}));

// Inpatient Medical Records (SOAPI)
export const rekamMedisInap = pgTable('rekam_medis_inap', {
	id: uuid('id').defaultRandom().primaryKey(),
	admissionId: uuid('admission_id').references(() => inpatientAdmissions.id, { onDelete: 'cascade', onUpdate: 'cascade' }).notNull(),
	patientId: uuid('patient_id').references(() => patients.id, { onDelete: 'restrict', onUpdate: 'cascade' }).notNull(),
	staffId: uuid('staff_id').references(() => medicalStaff.id, { onDelete: 'restrict', onUpdate: 'cascade' }).notNull(),
	date: date('date').notNull(),
	time: text('time'), // HH:MM
	notes: text('notes'),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
	rekamMedisInapAdmissionIdx: index('rekam_medis_inap_admission_idx').on(table.admissionId),
	rekamMedisInapPatientIdx: index('rekam_medis_inap_patient_idx').on(table.patientId),
	rekamMedisInapStaffIdx: index('rekam_medis_inap_staff_idx').on(table.staffId)
}));

export const rekamMedisInapRelations = relations(rekamMedisInap, ({ one, many }) => ({
	admission: one(inpatientAdmissions, {
		fields: [rekamMedisInap.admissionId],
		references: [inpatientAdmissions.id]
	}),
	patient: one(patients, {
		fields: [rekamMedisInap.patientId],
		references: [patients.id]
	}),
	staff: one(medicalStaff, {
		fields: [rekamMedisInap.staffId],
		references: [medicalStaff.id]
	}),
	soapi: many(rekamMedisInapSoapi)
}));

export const rekamMedisInapSoapi = pgTable('rekam_medis_inap_soapi', {
	id: uuid('id').defaultRandom().primaryKey(),
	rekamMedisInapId: uuid('rekam_medis_inap_id').references(() => rekamMedisInap.id, { onDelete: 'cascade', onUpdate: 'cascade' }).notNull(),
	subjective: text('subjective'),
	objective: text('objective'),
	assessment: text('assessment'),
	plan: text('plan'),
	instruction: text('instruction'),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
	soapiRekamMedisInapIdx: index('rekam_medis_inap_soapi_rekam_medis_inap_idx').on(table.rekamMedisInapId)
}));

export const rekamMedisInapSoapiRelations = relations(rekamMedisInapSoapi, ({ one }) => ({
	rekamMedis: one(rekamMedisInap, {
		fields: [rekamMedisInapSoapi.rekamMedisInapId],
		references: [rekamMedisInap.id]
	})
}));


// SIMKLINIK TYPE EXPORTS
export type Patient = typeof patients.$inferSelect;
export type NewPatient = typeof patients.$inferInsert;

export type MedicalStaff = typeof medicalStaff.$inferSelect;
export type NewMedicalStaff = typeof medicalStaff.$inferInsert;

export type StaffSchedule = typeof staffSchedules.$inferSelect;
export type NewStaffSchedule = typeof staffSchedules.$inferInsert;

export type MedicalService = typeof medicalServices.$inferSelect;
export type NewMedicalService = typeof medicalServices.$inferInsert;

export type MedicalServiceCategory = typeof medicalServiceCategories.$inferSelect;
export type NewMedicalServiceCategory = typeof medicalServiceCategories.$inferInsert;

export type Appointment = typeof appointments.$inferSelect;
export type NewAppointment = typeof appointments.$inferInsert;

export type Consultation = typeof consultations.$inferSelect;
export type NewConsultation = typeof consultations.$inferInsert;

export type VitalSign = typeof vitalSigns.$inferSelect;
export type NewVitalSign = typeof vitalSigns.$inferInsert;

export type Prescription = typeof prescriptions.$inferSelect;
export type NewPrescription = typeof prescriptions.$inferInsert;

export type MedicalInventory = typeof medicalInventory.$inferSelect;
export type NewMedicalInventory = typeof medicalInventory.$inferInsert;

export type StockMovement = typeof stockMovements.$inferSelect;
export type NewStockMovement = typeof stockMovements.$inferInsert;

export type MedicalInvoice = typeof medicalInvoices.$inferSelect;
export type NewMedicalInvoice = typeof medicalInvoices.$inferInsert;

export type MedicalInvoiceItem = typeof medicalInvoiceItems.$inferSelect;
export type NewMedicalInvoiceItem = typeof medicalInvoiceItems.$inferInsert;

export type InpatientRoom = typeof inpatientRooms.$inferSelect;
export type NewInpatientRoom = typeof inpatientRooms.$inferInsert;

export type InpatientBed = typeof inpatientBeds.$inferSelect;
export type NewInpatientBed = typeof inpatientBeds.$inferInsert;

export type InpatientAdmission = typeof inpatientAdmissions.$inferSelect;
export type NewInpatientAdmission = typeof inpatientAdmissions.$inferInsert;

export type RekamMedisInap = typeof rekamMedisInap.$inferSelect;
export type NewRekamMedisInap = typeof rekamMedisInap.$inferInsert;

export type RekamMedisInapSoapi = typeof rekamMedisInapSoapi.$inferSelect;
export type NewRekamMedisInapSoapi = typeof rekamMedisInapSoapi.$inferInsert;
