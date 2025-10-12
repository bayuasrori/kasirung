import { PDFDocument, PDFPage, PDFFont, StandardFonts } from 'pdf-lib';
import { z } from 'zod';

import { findCustomerById } from '$lib/server/repositories/customers.repository';
import {
	findCustomerTransactions,
	getCustomerLedgerSummary,
	listCustomerOutstandingTransactions
} from '$lib/server/repositories/transactions.repository';

const DEFAULT_PAGE_SIZE = 10;

const filtersSchema = z.object({
	page: z.coerce.number().min(1).default(1),
	startDate: z
		.string()
		.optional()
		.refine((value) => !value || !Number.isNaN(Date.parse(value)), 'Tanggal mulai tidak valid'),
	endDate: z
		.string()
		.optional()
		.refine((value) => !value || !Number.isNaN(Date.parse(value)), 'Tanggal akhir tidak valid'),
	status: z.enum(['all', 'paid', 'pending']).default('all')
});

const currencyFormat = new Intl.NumberFormat('id-ID', {
	style: 'currency',
	currency: 'IDR',
	maximumFractionDigits: 0
});

const dateFormat = new Intl.DateTimeFormat('id-ID', {
	dateStyle: 'medium'
});

function parseDate(value?: string | null) {
	if (!value) return undefined;
	const time = Date.parse(value);
	if (Number.isNaN(time)) return undefined;
	return new Date(time);
}

function slugify(value: string) {
	return value
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		|| 'pelanggan';
}

function toInputDate(date: Date) {
	return date.toISOString().slice(0, 10);
}

function formatMoney(value: string | number) {
	const numeric = typeof value === 'number' ? value : Number(value ?? 0);
	return currencyFormat.format(Number.isFinite(numeric) ? numeric : 0);
}

interface LedgerFilters {
	startDate?: string;
	endDate?: string;
	status: 'all' | 'paid' | 'pending';
}

export async function getCustomerLedger(customerId: string, query: URLSearchParams) {
	const parsed = filtersSchema.safeParse({
		page: query.get('page') ?? undefined,
		startDate: query.get('startDate') ?? undefined,
		endDate: query.get('endDate') ?? undefined,
		status: query.get('status') ?? undefined
	});

	let validationErrors: Record<string, string[]> | null = null;
	const normalized = parsed.success ? parsed.data : filtersSchema.parse({});
	if (!parsed.success) {
		validationErrors = parsed.error.flatten().fieldErrors;
	}

	const filters: LedgerFilters = {
		startDate: normalized.startDate ?? undefined,
		endDate: normalized.endDate ?? undefined,
		status: normalized.status
	};

	const today = new Date();
	const defaultStart = new Date(today.getFullYear(), today.getMonth(), 1);

	if (!filters.startDate) {
		filters.startDate = toInputDate(defaultStart);
	}

	if (!filters.endDate) {
		filters.endDate = toInputDate(today);
	}

	const customer = await findCustomerById(customerId);
	if (!customer) {
		return null;
	}

	let startDate = parseDate(filters.startDate);
	if (startDate) {
		startDate.setHours(0, 0, 0, 0);
	}

	let endDate = parseDate(filters.endDate);
	if (endDate) {
		endDate.setHours(23, 59, 59, 999);
	}
	const page = normalized.page;
	const offset = (page - 1) * DEFAULT_PAGE_SIZE;

	const [transactionsResult, summary, outstandingRows] = await Promise.all([
		findCustomerTransactions({
			customerId,
			startDate,
			endDate,
			paymentStatus: filters.status === 'all' ? undefined : filters.status,
			limit: DEFAULT_PAGE_SIZE,
			offset
		}),
		getCustomerLedgerSummary({
			customerId,
			startDate,
			endDate,
			paymentStatus: filters.status === 'all' ? undefined : filters.status,
			limit: DEFAULT_PAGE_SIZE,
			offset: 0
		}),
		listCustomerOutstandingTransactions(customerId)
	]);

	const ledgerItems = transactionsResult.data.map((item) => {
		const paymentAmount = Math.max(0, Number(item.paymentAmount ?? 0));
		const rawStatus = item.paymentStatus ?? 'paid';
		const normalizedStatus =
			item.paymentMethod === 'credit' && paymentAmount > 0
				? 'pending'
				: rawStatus === 'paid'
					?
						'paid'
					: 'pending';

		return {
			id: item.id,
			number: item.number,
			createdAt: item.createdAt,
			subtotal: Number(item.subtotal ?? 0),
			tax: Number(item.tax ?? 0),
			discount: Number(item.discount ?? 0),
			total: Number(item.total ?? 0),
			status: item.status,
			paymentStatus: normalizedStatus,
			paymentMethod: item.paymentMethod,
			paymentAmount,
			cashier: item.cashier
		};
	});

	const outstanding = outstandingRows.map((row) => ({
		id: row.id,
		number: row.number,
		createdAt: row.createdAt,
		total: Number(row.total ?? 0),
		paymentAmount: Math.max(0, Number(row.paymentAmount ?? 0)),
		paymentStatus: 'pending'
	}));

	const outstandingAmount = outstanding.reduce((sum, row) => sum + row.paymentAmount, 0);

	const pageCount = Math.max(Math.ceil(transactionsResult.total / DEFAULT_PAGE_SIZE), 1);

	return {
		customer,
		ledger: {
			items: ledgerItems,
			total: transactionsResult.total,
			page,
			pageSize: DEFAULT_PAGE_SIZE,
			pageCount,
			filters
		},
		summary: {
			totalTransactions: summary.totalTransactions,
			totalAmount: summary.totalAmount,
			pendingAmount: summary.pendingAmount,
			pendingCount: summary.pendingCount,
			lastTransactionAt: summary.lastTransactionAt
		},
		outstanding,
		outstandingAmount,
		filters,
		validationErrors
	} as const;
}

function ensurePageSpace(
	doc: PDFDocument,
	state: { page: PDFPage; y: number },
	minY: number,
	margin: number,
	pageSize: [number, number]
) {
	if (state.y < minY) {
		state.page = doc.addPage(pageSize);
		state.y = state.page.getHeight() - margin;
	}
}

function drawRightAlignedText(
	page: PDFPage,
	text: string,
	options: { font: PDFFont; size: number; xRight: number; y: number }
) {
	const width = options.font.widthOfTextAtSize(text, options.size);
	page.drawText(text, { x: options.xRight - width, y: options.y, size: options.size, font: options.font });
}

export async function buildCustomerDebtPdf(customerId: string) {
	const customer = await findCustomerById(customerId);
	if (!customer) {
		return null;
	}

	const outstanding = await listCustomerOutstandingTransactions(customerId);
	if (!outstanding.length) {
		return null;
	}

	const doc = await PDFDocument.create();
	const pageSize: [number, number] = [595.28, 841.89];
	const page = doc.addPage(pageSize);
	const boldFont = await doc.embedFont(StandardFonts.HelveticaBold);
	const regularFont = await doc.embedFont(StandardFonts.Helvetica);

	const state = { page, y: page.getHeight() - 40 };
	const margin = 40;
	const contentWidth = state.page.getWidth() - margin * 2;

	const drawText = (text: string, font = regularFont, size = 12, lineHeight = 16) => {
		ensurePageSpace(doc, state, margin + lineHeight, margin, pageSize);
		state.page.drawText(text, { x: margin, y: state.y, size, font });
		state.y -= lineHeight;
	};

	drawText('Daftar Piutang Pelanggan', boldFont, 18, 26);
	drawText(`Nama: ${customer.name}`, regularFont, 12);
	if (customer.phone) {
		drawText(`Telepon: ${customer.phone}`, regularFont, 12);
	}
	if (customer.email) {
		drawText(`Email: ${customer.email}`, regularFont, 12);
	}
	if (customer.address) {
		drawText(`Alamat: ${customer.address}`, regularFont, 12);
	}

	state.y -= 10;
	const columns = {
		index: margin,
		date: margin + contentWidth * 0.1,
		number: margin + contentWidth * 0.32,
		total: margin + contentWidth * 0.7,
		status: margin + contentWidth * 0.85
	};

	ensurePageSpace(doc, state, margin + 32, margin, pageSize);
	state.page.drawText('No', { x: columns.index, y: state.y, size: 12, font: boldFont });
	state.page.drawText('Tanggal', { x: columns.date, y: state.y, size: 12, font: boldFont });
	state.page.drawText('Nomor', { x: columns.number, y: state.y, size: 12, font: boldFont });
	state.page.drawText('Total', { x: columns.total, y: state.y, size: 12, font: boldFont });
	state.page.drawText('Status', { x: columns.status, y: state.y, size: 12, font: boldFont });
	state.y -= 14;
	state.page.drawLine({
		start: { x: margin, y: state.y },
		end: { x: margin + contentWidth, y: state.y },
		thickness: 1
	});
	state.y -= 12;

	let runningTotal = 0;

	outstanding.forEach((row, index) => {
		ensurePageSpace(doc, state, margin + 40, margin, pageSize);
		const amount = Number(row.paymentAmount ?? row.total ?? 0);
		runningTotal += row.paymentStatus === 'paid' ? 0 : amount;

		state.page.drawText(String(index + 1), { x: columns.index, y: state.y, size: 11, font: regularFont });
		state.page.drawText(dateFormat.format(new Date(row.createdAt)), {
			x: columns.date,
			y: state.y,
			size: 11,
			font: regularFont
		});
		state.page.drawText(row.number, { x: columns.number, y: state.y, size: 11, font: regularFont });
		drawRightAlignedText(state.page, formatMoney(amount), {
			font: regularFont,
			size: 11,
			xRight: columns.total + 60,
			y: state.y
		});
		state.page.drawText('Belum Lunas', { x: columns.status, y: state.y, size: 11, font: boldFont });
		state.y -= 14;
	});

	state.y -= 12;
	drawRightAlignedText(state.page, `Total Piutang: ${formatMoney(runningTotal)}`, {
		font: boldFont,
		size: 13,
		xRight: margin + contentWidth,
		y: state.y
	});
	state.y -= 24;
	drawText('Harap lakukan penagihan sesuai jadwal yang telah disepakati.', regularFont, 11);

	const pdfBytes = await doc.save();
	const filename = `piutang-${slugify(customer.name)}.pdf`;
	return { pdfBytes, filename };
}
