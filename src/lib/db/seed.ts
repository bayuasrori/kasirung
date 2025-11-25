import 'dotenv/config';
import { randomUUID } from 'crypto';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq } from 'drizzle-orm';
import { hash } from '@node-rs/argon2';

import {
	roles,
	users,
	categories,
	products,
	customers,
	transactions,
	transactionItems,
	payments,
	savingsTransactions,
	loanAccounts,
	loanTransactions,
	accountingAccounts,
	accountingJournalEntries,
	accountingJournalLines,
	gedungKosan,
	ruanganKosan,
	penghuniKosan
} from './schema';
import type { AccountingAccount } from './schema';

const adminPermissions = [
	'dashboard',
	'pos',
	'transactions.history',
	'reports',
	'master.products',
	'master.categories',
	'master.customers',
	'management.users',
	'management.roles',
	'kosan.gedung',
	'kosan.ruangan',
	'kosan.penghuni',
	'kosan.pendaftaran'
];

const cashierPermissions = ['pos', 'transactions.history', 'kosan.penghuni', 'kosan.pendaftaran'];

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
	throw new Error('DATABASE_URL environment variable is not defined');
}

const client = postgres(connectionString, { max: 1, prepare: false });
const db = drizzle(client, {
	schema: {
		roles,
		users,
		categories,
		products,
		customers,
		transactions,
		transactionItems,
		payments,
		savingsTransactions,
		loanAccounts,
		loanTransactions,
		accountingAccounts,
		accountingJournalEntries,
		accountingJournalLines
	}
});

const accountingAccountSeeds: Array<{
	code: string;
	name: string;
	type: AccountingAccount['type'];
	description: string;
}> = [
	{ code: '1101', name: 'Kas', type: 'asset', description: 'Kas utama POS' },
	{ code: '1102', name: 'Kas QRIS', type: 'asset', description: 'Dana masuk via QRIS' },
	{ code: '1103', name: 'Kas Kartu Debit', type: 'asset', description: 'Dana masuk via debit' },
	{ code: '1301', name: 'Piutang Dagang', type: 'asset', description: 'Piutang penjualan kredit' },
	{ code: '1302', name: 'Piutang Pinjaman', type: 'asset', description: 'Piutang pinjaman anggota' },
	{ code: '2201', name: 'Utang Pajak Penjualan', type: 'liability', description: 'Kewajiban pajak penjualan' },
	{ code: '2202', name: 'Liabilitas Tabungan Anggota', type: 'liability', description: 'Dana tabungan anggota' },
	{ code: '4101', name: 'Pendapatan Penjualan', type: 'revenue', description: 'Pendapatan operasional POS' },
	{ code: '4102', name: 'Pendapatan Bunga Pinjaman', type: 'revenue', description: 'Pendapatan bunga pinjaman' },
	{ code: '5101', name: 'Diskon Penjualan', type: 'expense', description: 'Diskon yang diberikan ke pelanggan' }
];

async function main() {
	const passwordHash = await hash('Admin123!', {
		memoryCost: 19456,
		timeCost: 2,
		outputLen: 32,
		parallelism: 1
	});

	await db.transaction(async (tx) => {
		await tx
			.insert(roles)
			.values([
				{
					name: 'admin',
					description: 'Administrator with full access',
					permissions: adminPermissions
				},
				{
					name: 'cashier',
					description: 'Cashier role with POS access',
					permissions: cashierPermissions
				}
			])
			.onConflictDoNothing();

		const [adminRole] = await tx.select().from(roles).where(eq(roles.name, 'admin')).limit(1);

		const [cashierRole] = await tx.select().from(roles).where(eq(roles.name, 'cashier')).limit(1);

		if (!adminRole || !cashierRole) {
			throw new Error('Failed to seed base roles');
		}

		await tx
			.update(roles)
			.set({ permissions: adminPermissions, updatedAt: new Date() })
			.where(eq(roles.id, adminRole.id));

		await tx
			.update(roles)
			.set({ permissions: cashierPermissions, updatedAt: new Date() })
			.where(eq(roles.id, cashierRole.id));

		const now = new Date();

		await tx
			.insert(users)
			.values({
				id: randomUUID(),
				roleId: adminRole.id,
				email: 'admin@kasirung.local',
				passwordHash,
				fullName: 'Administrator',
				avatarUrl: null
			})
			.onConflictDoNothing({ target: users.email });

		await tx
			.insert(accountingAccounts)
			.values(
				accountingAccountSeeds.map((account) => ({
					id: randomUUID(),
					code: account.code,
					name: account.name,
					type: account.type,
					description: account.description,
					isActive: true,
					parentId: null,
					createdBy: null,
					createdAt: now,
					updatedAt: now
				}))
			)
			.onConflictDoNothing({ target: accountingAccounts.code });

		await tx
			.insert(categories)
			.values([
				{ name: 'Makanan', description: 'Menu makanan utama' },
				{ name: 'Minuman', description: 'Pilihan minuman dingin & hangat' },
				{ name: 'Layanan', description: 'Jasa tambahan kasir' }
			])
			.onConflictDoNothing();

		const [foodCategory] = await tx
			.select()
			.from(categories)
			.where(eq(categories.name, 'Makanan'))
			.limit(1);
		const [drinkCategory] = await tx
			.select()
			.from(categories)
			.where(eq(categories.name, 'Minuman'))
			.limit(1);
		const [serviceCategory] = await tx
			.select()
			.from(categories)
			.where(eq(categories.name, 'Layanan'))
			.limit(1);

		await tx
			.insert(products)
			.values([
				{
					id: randomUUID(),
					categoryId: foodCategory?.id ?? null,
					sku: 'FOOD-001',
					name: 'Nasi Goreng Spesial',
					description: 'Nasi goreng dengan topping komplit',
					price: '25000.00'
				},
				{
					id: randomUUID(),
					categoryId: drinkCategory?.id ?? null,
					sku: 'DRINK-001',
					name: 'Es Teh Manis',
					description: 'Teh manis dingin',
					price: '5000.00'
				},
				{
					id: randomUUID(),
					categoryId: serviceCategory?.id ?? null,
					sku: 'SRV-001',
					name: 'Biaya Layanan',
					description: 'Layanan tambahan kasir',
					price: '10000.00'
				}
			])
			.onConflictDoNothing({ target: products.sku });

		const [existingCustomer] = await tx
			.select({ id: customers.id })
			.from(customers)
			.where(eq(customers.phone, '08123456789'))
			.limit(1);

		if (!existingCustomer) {
			await tx.insert(customers).values({
				id: randomUUID(),
				name: 'Pelanggan Umum',
				email: 'pelanggan@example.com',
				phone: '08123456789',
				address: 'Jl. Melati No. 10, Surabaya'
			});
		}

		const [tenantCustomer] = await tx
			.select({ id: customers.id })
			.from(customers)
			.where(eq(customers.phone, '081122334455'))
			.limit(1);

		const penghuniCustomerId = tenantCustomer?.id ?? randomUUID();

		if (!tenantCustomer) {
			await tx.insert(customers).values({
				id: penghuniCustomerId,
				name: 'Ridwan Prasetyo',
				email: 'ridwan@kosan.local',
				phone: '081122334455',
				address: 'Jl. Kenanga No. 5, Bandung'
			});
		}

		const [gedungSample] = await tx
			.select()
			.from(gedungKosan)
			.where(eq(gedungKosan.namaGedung, 'Gedung Mawar'))
			.limit(1);

		const gedungId = gedungSample?.id ?? randomUUID();

		if (!gedungSample) {
			await tx.insert(gedungKosan).values({
				id: gedungId,
				namaGedung: 'Gedung Mawar',
				alamat: 'Jl. Dahlia No. 12, Bandung',
				keterangan: 'Gedung utama untuk penyewa bulanan'
			});
		}

		const existingRooms = await tx
			.select({ id: ruanganKosan.id })
			.from(ruanganKosan)
			.where(eq(ruanganKosan.gedungId, gedungId))
			.limit(1);

		if (!existingRooms.length) {
			await tx.insert(ruanganKosan).values([
				{
					id: randomUUID(),
					gedungId,
					namaRuangan: 'Mawar-101',
					lantai: '1',
					kapasitas: 1,
					hargaBulanan: '1500000.00',
					status: 'kosong'
				},
				{
					id: randomUUID(),
					gedungId,
					namaRuangan: 'Mawar-102',
					lantai: '1',
					kapasitas: 1,
					hargaBulanan: '1500000.00',
					status: 'kosong'
				},
				{
					id: randomUUID(),
					gedungId,
					namaRuangan: 'Mawar-201',
					lantai: '2',
					kapasitas: 2,
					hargaBulanan: '2200000.00',
					status: 'kosong'
				}
			]);
		}

		const [ruanganUntukPenghuni] = await tx
			.select()
			.from(ruanganKosan)
			.where(eq(ruanganKosan.namaRuangan, 'Mawar-101'))
			.limit(1);

		const [existingTenant] = await tx
			.select()
			.from(penghuniKosan)
			.where(eq(penghuniKosan.pelangganId, penghuniCustomerId))
			.limit(1);

		if (!existingTenant && ruanganUntukPenghuni) {
			const today = new Date().toISOString().slice(0, 10);
			await tx.insert(penghuniKosan).values({
				id: randomUUID(),
				pelangganId: penghuniCustomerId,
				gedungId,
				ruanganId: ruanganUntukPenghuni.id,
				tanggalMasuk: today,
				status: 'aktif'
			});

			await tx
				.update(ruanganKosan)
				.set({ status: 'terisi', updatedAt: new Date() })
				.where(eq(ruanganKosan.id, ruanganUntukPenghuni.id));
		}

		const [adminUser] = await tx
			.select()
			.from(users)
			.where(eq(users.email, 'admin@kasirung.local'))
			.limit(1);

		const [defaultCustomer] = await tx
			.select()
			.from(customers)
			.where(eq(customers.name, 'Pelanggan Umum'))
			.limit(1);

		const [productFood] = await tx
			.select()
			.from(products)
			.where(eq(products.sku, 'FOOD-001'))
			.limit(1);
		const [productDrink] = await tx
			.select()
			.from(products)
			.where(eq(products.sku, 'DRINK-001'))
			.limit(1);

		if (adminUser && productFood && productDrink) {
			const transactionId = randomUUID();
			const subtotal = 2 * Number(productFood.price) + Number(productDrink.price);
			const tax = subtotal * 0.1;
			const total = subtotal + tax;

			await tx
				.insert(transactions)
				.values({
					id: transactionId,
					number: 'TRX-0001',
					userId: adminUser.id,
					customerId: defaultCustomer?.id ?? null,
					subtotal: subtotal.toFixed(2),
					tax: tax.toFixed(2),
					discount: '0.00',
					total: total.toFixed(2),
					status: 'completed'
				})
				.onConflictDoNothing({ target: transactions.number });

			await tx
				.insert(transactionItems)
				.values([
					{
						id: randomUUID(),
						transactionId,
						productId: productFood.id,
						quantity: 2,
						unitPrice: productFood.price,
						totalPrice: (2 * Number(productFood.price)).toFixed(2)
					},
					{
						id: randomUUID(),
						transactionId,
						productId: productDrink.id,
						quantity: 1,
						unitPrice: productDrink.price,
						totalPrice: Number(productDrink.price).toFixed(2)
					}
				])
				.onConflictDoNothing();

			await tx
				.insert(payments)
				.values({
					id: randomUUID(),
					transactionId,
					amount: total.toFixed(2),
					method: 'cash',
					status: 'paid'
				})
				.onConflictDoNothing();
			const existingJournal = await tx
				.select({ id: accountingJournalEntries.id })
				.from(accountingJournalEntries)
				.where(eq(accountingJournalEntries.number, 'JRN-SEED-001'))
				.limit(1);

			if (!existingJournal.length) {
				const [cashAccount] = await tx
					.select({ id: accountingAccounts.id })
					.from(accountingAccounts)
					.where(eq(accountingAccounts.code, '1101'))
					.limit(1);
				const [revenueAccount] = await tx
					.select({ id: accountingAccounts.id })
					.from(accountingAccounts)
					.where(eq(accountingAccounts.code, '4101'))
					.limit(1);
				const [taxAccount] = await tx
					.select({ id: accountingAccounts.id })
					.from(accountingAccounts)
					.where(eq(accountingAccounts.code, '2201'))
					.limit(1);

				if (cashAccount && revenueAccount && taxAccount) {
					const journalId = randomUUID();
					const journalDate = new Date();

					await tx.insert(accountingJournalEntries).values({
						id: journalId,
						number: 'JRN-SEED-001',
						entryDate: journalDate,
						memo: 'Jurnal penjualan awal',
						reference: 'TRX-0001',
						status: 'posted',
						postedAt: journalDate,
						createdBy: adminUser.id,
						updatedBy: adminUser.id,
						createdAt: journalDate,
						updatedAt: journalDate
					});

					const lines = [
						{
							id: randomUUID(),
							entryId: journalId,
							accountId: cashAccount.id,
							description: 'Kas diterima',
							sequence: 0,
							debit: total.toFixed(2),
							credit: '0.00',
							createdAt: journalDate,
							updatedAt: journalDate
						},
						{
							id: randomUUID(),
							entryId: journalId,
							accountId: revenueAccount.id,
							description: 'Pendapatan penjualan',
							sequence: 1,
							debit: '0.00',
							credit: subtotal.toFixed(2),
							createdAt: journalDate,
							updatedAt: journalDate
						},
						{
							id: randomUUID(),
							entryId: journalId,
							accountId: taxAccount.id,
							description: 'Pajak penjualan',
							sequence: 2,
							debit: '0.00',
							credit: tax.toFixed(2),
							createdAt: journalDate,
							updatedAt: journalDate
						}
					];

					await tx.insert(accountingJournalLines).values(lines);
				}
			}
		}

		if (defaultCustomer && adminUser) {
			const [existingSavings] = await tx
				.select({ id: savingsTransactions.id })
				.from(savingsTransactions)
				.where(eq(savingsTransactions.customerId, defaultCustomer.id))
				.limit(1);

			if (!existingSavings) {
				await tx.insert(savingsTransactions).values([
					{
						id: randomUUID(),
						customerId: defaultCustomer.id,
						type: 'deposit',
						amount: '500000.00',
						note: 'Setoran awal anggota',
						reference: 'SETOR-001',
						createdBy: adminUser.id
					},
					{
						id: randomUUID(),
						customerId: defaultCustomer.id,
						type: 'withdraw',
						amount: '50000.00',
						note: 'Penarikan awal anggota',
						reference: 'TARIK-001',
						createdBy: adminUser.id
					}
				]);
				const savingsJournalDate = new Date();
				const [cashAccount] = await tx
					.select({ id: accountingAccounts.id })
					.from(accountingAccounts)
					.where(eq(accountingAccounts.code, '1101'))
					.limit(1);
				const [savingsAccount] = await tx
					.select({ id: accountingAccounts.id })
					.from(accountingAccounts)
					.where(eq(accountingAccounts.code, '2202'))
					.limit(1);

				if (cashAccount && savingsAccount) {
					const depositEntryId = randomUUID();

					await tx.insert(accountingJournalEntries).values({
						id: depositEntryId,
						number: 'JRN-SAV-001',
						entryDate: savingsJournalDate,
						memo: 'Setoran awal tabungan',
						reference: 'SETOR-001',
						status: 'posted',
						postedAt: savingsJournalDate,
						createdBy: adminUser.id,
						updatedBy: adminUser.id,
						createdAt: savingsJournalDate,
						updatedAt: savingsJournalDate
					});

					await tx.insert(accountingJournalLines).values([
						{
							id: randomUUID(),
							entryId: depositEntryId,
							accountId: cashAccount.id,
							description: 'Kas diterima',
							sequence: 0,
							debit: '500000.00',
							credit: '0.00',
							createdAt: savingsJournalDate,
							updatedAt: savingsJournalDate
						},
						{
							id: randomUUID(),
							entryId: depositEntryId,
							accountId: savingsAccount.id,
							description: 'Liabilitas tabungan',
							sequence: 1,
							debit: '0.00',
							credit: '500000.00',
							createdAt: savingsJournalDate,
							updatedAt: savingsJournalDate
						}
					]);

					const withdrawEntryId = randomUUID();
					await tx.insert(accountingJournalEntries).values({
						id: withdrawEntryId,
						number: 'JRN-SAV-002',
						entryDate: savingsJournalDate,
						memo: 'Penarikan tabungan',
						reference: 'TARIK-001',
						status: 'posted',
						postedAt: savingsJournalDate,
						createdBy: adminUser.id,
						updatedBy: adminUser.id,
						createdAt: savingsJournalDate,
						updatedAt: savingsJournalDate
					});

					await tx.insert(accountingJournalLines).values([
						{
							id: randomUUID(),
							entryId: withdrawEntryId,
							accountId: savingsAccount.id,
							description: 'Pengurangan tabungan',
							sequence: 0,
							debit: '50000.00',
							credit: '0.00',
							createdAt: savingsJournalDate,
							updatedAt: savingsJournalDate
						},
						{
							id: randomUUID(),
							entryId: withdrawEntryId,
							accountId: cashAccount.id,
							description: 'Kas keluar',
							sequence: 1,
							debit: '0.00',
							credit: '50000.00',
							createdAt: savingsJournalDate,
							updatedAt: savingsJournalDate
						}
					]);
				}
			}

			const [existingLoan] = await tx
				.select({ id: loanAccounts.id })
				.from(loanAccounts)
				.where(eq(loanAccounts.customerId, defaultCustomer.id))
				.limit(1);

			if (!existingLoan) {
				const loanAccountId = randomUUID();
				const issuedAt = new Date();
				const dueDate = new Date(issuedAt.getTime());
				dueDate.setMonth(dueDate.getMonth() + 6);

				await tx.insert(loanAccounts).values({
					id: loanAccountId,
					customerId: defaultCustomer.id,
					principal: '500000.00',
					balance: '400000.00',
					interestRate: '5.00',
					termMonths: 6,
					status: 'active',
					issuedAt,
					dueDate,
					notes: 'Pinjaman modal awal Pelanggan Umum',
					createdBy: adminUser.id
				});

				await tx.insert(loanTransactions).values([
					{
						id: randomUUID(),
						loanId: loanAccountId,
						type: 'disbursement',
						amount: '500000.00',
						note: 'Pencairan pinjaman awal',
						reference: 'PINJ-001',
						createdBy: adminUser.id
					},
					{
						id: randomUUID(),
						loanId: loanAccountId,
						type: 'repayment',
						amount: '100000.00',
						note: 'Angsuran pertama',
						reference: 'ANGS-001',
						createdBy: adminUser.id
					}
				]);
				const [cashAccount] = await tx
					.select({ id: accountingAccounts.id })
					.from(accountingAccounts)
					.where(eq(accountingAccounts.code, '1101'))
					.limit(1);
				const [loanAccount] = await tx
					.select({ id: accountingAccounts.id })
					.from(accountingAccounts)
					.where(eq(accountingAccounts.code, '1302'))
					.limit(1);
				const [interestAccount] = await tx
					.select({ id: accountingAccounts.id })
					.from(accountingAccounts)
					.where(eq(accountingAccounts.code, '4102'))
					.limit(1);

				if (cashAccount && loanAccount && interestAccount) {
					const loanJournalId = randomUUID();
					await tx.insert(accountingJournalEntries).values({
						id: loanJournalId,
						number: 'JRN-LOAN-001',
						entryDate: issuedAt,
						memo: 'Pencairan pinjaman anggota',
						reference: 'PINJ-001',
						status: 'posted',
						postedAt: issuedAt,
						createdBy: adminUser.id,
						updatedBy: adminUser.id,
						createdAt: issuedAt,
						updatedAt: issuedAt
					});

					await tx.insert(accountingJournalLines).values([
						{
							id: randomUUID(),
							entryId: loanJournalId,
							accountId: loanAccount.id,
							description: 'Piutang pinjaman',
							sequence: 0,
							debit: '500000.00',
							credit: '0.00',
							createdAt: issuedAt,
							updatedAt: issuedAt
						},
						{
							id: randomUUID(),
							entryId: loanJournalId,
							accountId: cashAccount.id,
							description: 'Kas keluar',
							sequence: 1,
							debit: '0.00',
							credit: '500000.00',
							createdAt: issuedAt,
							updatedAt: issuedAt
						}
					]);

					const repaymentJournalId = randomUUID();
					await tx.insert(accountingJournalEntries).values({
						id: repaymentJournalId,
						number: 'JRN-LOAN-002',
						entryDate: issuedAt,
						memo: 'Angsuran pertama pinjaman',
						reference: 'ANGS-001',
						status: 'posted',
						postedAt: issuedAt,
						createdBy: adminUser.id,
						updatedBy: adminUser.id,
						createdAt: issuedAt,
						updatedAt: issuedAt
					});

					await tx.insert(accountingJournalLines).values([
						{
							id: randomUUID(),
							entryId: repaymentJournalId,
							accountId: cashAccount.id,
							description: 'Kas diterima',
							sequence: 0,
							debit: '100000.00',
							credit: '0.00',
							createdAt: issuedAt,
							updatedAt: issuedAt
						},
						{
							id: randomUUID(),
							entryId: repaymentJournalId,
							accountId: loanAccount.id,
							description: 'Pelunasan pokok pinjaman',
							sequence: 1,
							debit: '0.00',
							credit: '100000.00',
							createdAt: issuedAt,
							updatedAt: issuedAt
						}
					]);
				}
			}
		}
	});

	console.log('Seed data inserted successfully.');
}

main()
	.catch((error) => {
		console.error('Seed failed:', error);
		process.exit(1);
	})
	.finally(async () => {
		await client.end();
	});
