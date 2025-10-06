import 'dotenv/config';
import { randomUUID } from 'node:crypto';
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
	payments
} from './schema';

const adminPermissions = [
	'dashboard',
	'pos',
	'transactions.history',
	'reports',
	'master.products',
	'master.categories',
	'master.customers',
	'management.users',
	'management.roles'
];

const cashierPermissions = ['pos', 'transactions.history'];

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
		payments
	}
});

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
