import type { SQL } from 'drizzle-orm';
import { sql } from 'drizzle-orm';
import { and, asc, desc, eq, gte, inArray, lte } from 'drizzle-orm';
import { randomUUID } from 'crypto';

import { db } from '$lib/db/client';
import type { DB } from '$lib/db/client';
import type { AccountingJournalEntry } from '$lib/db/schema';
import {
	accountingAccounts,
	accountingJournalEntries,
	accountingJournalLines
} from '$lib/db/schema';

type DBTransaction = Parameters<Parameters<DB['transaction']>[0]>[0];
type DBClient = DB | DBTransaction;

export async function listAccounts() {
	return db
		.select({
			id: accountingAccounts.id,
			code: accountingAccounts.code,
			name: accountingAccounts.name,
			type: accountingAccounts.type,
			parentId: accountingAccounts.parentId,
			description: accountingAccounts.description,
			isActive: accountingAccounts.isActive,
			createdAt: accountingAccounts.createdAt,
			updatedAt: accountingAccounts.updatedAt
		})
		.from(accountingAccounts)
		.orderBy(asc(accountingAccounts.code));
}

export async function findAccountsByCodes(client: DBClient, codes: string[]) {
	if (codes.length === 0) return [] as Array<{ id: string; code: string }>;
	return client
		.select({
			id: accountingAccounts.id,
			code: accountingAccounts.code
		})
		.from(accountingAccounts)
		.where(inArray(accountingAccounts.code, codes));
}

export async function findAccountById(id: string) {
	const [account] = await db
		.select()
		.from(accountingAccounts)
		.where(eq(accountingAccounts.id, id))
		.limit(1);
	return account ?? null;
}

export async function findAccountByCode(code: string) {
	const [account] = await db
		.select({ id: accountingAccounts.id, code: accountingAccounts.code })
		.from(accountingAccounts)
		.where(eq(accountingAccounts.code, code))
		.limit(1);
	return account ?? null;
}

export async function insertAccount(values: typeof accountingAccounts.$inferInsert) {
	const [row] = await db
		.insert(accountingAccounts)
		.values(values)
		.returning({ id: accountingAccounts.id });
	return row;
}

export async function updateAccount(id: string, values: Partial<typeof accountingAccounts.$inferInsert>) {
	const [row] = await db
		.update(accountingAccounts)
		.set(values)
		.where(eq(accountingAccounts.id, id))
		.returning({ id: accountingAccounts.id });
	return row;
}

export async function deleteAccount(id: string) {
	return db.delete(accountingAccounts).where(eq(accountingAccounts.id, id));
}

export async function countChildAccounts(parentId: string) {
	const [row] = await db
		.select({ count: sql<number>`count(*)` })
		.from(accountingAccounts)
		.where(eq(accountingAccounts.parentId, parentId));
	return Number(row?.count ?? 0);
}

export async function countJournalLinesForAccount(accountId: string) {
	const [row] = await db
		.select({ count: sql<number>`count(*)` })
		.from(accountingJournalLines)
		.where(eq(accountingJournalLines.accountId, accountId));
	return Number(row?.count ?? 0);
}

export function generateJournalNumber(date = new Date()) {
	const pad = (value: number) => value.toString().padStart(2, '0');
	return `JRN-${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}-${randomUUID().slice(0, 6).toUpperCase()}`;
}

export async function insertJournalEntryWithLines(
	client: DBClient,
	entry: typeof accountingJournalEntries.$inferInsert,
	lines: Array<typeof accountingJournalLines.$inferInsert>
) {
	await client.insert(accountingJournalEntries).values(entry);
	if (lines.length > 0) {
		await client.insert(accountingJournalLines).values(lines);
	}
	return entry;
}

interface JournalFilters {
	status?: AccountingJournalEntry['status'];
	from?: Date;
	to?: Date;
	limit?: number;
}

export async function listJournalEntries(filters: JournalFilters = {}) {
	const conditions: SQL[] = [];

	if (filters.status) {
		conditions.push(eq(accountingJournalEntries.status, filters.status));
	}

	if (filters.from) {
		conditions.push(gte(accountingJournalEntries.entryDate, filters.from));
	}

	if (filters.to) {
		conditions.push(lte(accountingJournalEntries.entryDate, filters.to));
	}

	const baseQuery = db
		.select({
			id: accountingJournalEntries.id,
			number: accountingJournalEntries.number,
			entryDate: accountingJournalEntries.entryDate,
			memo: accountingJournalEntries.memo,
			reference: accountingJournalEntries.reference,
			status: accountingJournalEntries.status,
			postedAt: accountingJournalEntries.postedAt,
			totalDebit: sql<string>`coalesce(sum(${accountingJournalLines.debit}), 0)`,
			totalCredit: sql<string>`coalesce(sum(${accountingJournalLines.credit}), 0)`
		})
		.from(accountingJournalEntries)
		.leftJoin(
			accountingJournalLines,
			eq(accountingJournalLines.entryId, accountingJournalEntries.id)
		)
		.groupBy(accountingJournalEntries.id)
		.orderBy(desc(accountingJournalEntries.entryDate), desc(accountingJournalEntries.createdAt));

	const withFilters = conditions.length ? baseQuery.where(and(...conditions)) : baseQuery;

	return filters.limit ? withFilters.limit(filters.limit) : withFilters;
}

interface LedgerFilters {
	from?: Date;
	to?: Date;
}

export async function listGeneralLedger(accountId: string, filters: LedgerFilters = {}) {
	const conditions: SQL[] = [eq(accountingJournalLines.accountId, accountId)];

	if (filters.from) {
		conditions.push(gte(accountingJournalEntries.entryDate, filters.from));
	}

	if (filters.to) {
		conditions.push(lte(accountingJournalEntries.entryDate, filters.to));
	}

	const balanceWindow = sql<string>`sum(${accountingJournalLines.debit} - ${accountingJournalLines.credit}) over (order by ${accountingJournalEntries.entryDate}, ${accountingJournalLines.sequence}, ${accountingJournalLines.id})`;

	return db
		.select({
			lineId: accountingJournalLines.id,
			entryId: accountingJournalEntries.id,
			number: accountingJournalEntries.number,
			entryDate: accountingJournalEntries.entryDate,
			memo: accountingJournalEntries.memo,
			description: accountingJournalLines.description,
			debit: accountingJournalLines.debit,
			credit: accountingJournalLines.credit,
			balance: balanceWindow
		})
		.from(accountingJournalLines)
		.innerJoin(
			accountingJournalEntries,
			eq(accountingJournalEntries.id, accountingJournalLines.entryId)
		)
		.where(and(...conditions))
		.orderBy(
			asc(accountingJournalEntries.entryDate),
			asc(accountingJournalLines.sequence),
			asc(accountingJournalLines.id)
		);
}
