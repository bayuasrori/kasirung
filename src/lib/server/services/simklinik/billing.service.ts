import { nanoid } from 'nanoid';
import { db } from '$lib/server/db';
import {
	medicalInvoices,
	medicalInvoiceItems,
	medicalServices,
	medicalInventory,
	patients,
	type MedicalInvoice,
	type NewMedicalInvoice,
	type MedicalInvoiceItem,
	type NewMedicalInvoiceItem
} from '$lib/db/schema';
import { eq, and, ilike, between, desc } from 'drizzle-orm';

const toDateFilterValue = (value: string | Date, endOfDay = false): Date | null => {
	if (!value) {
		return null;
	}

	if (value instanceof Date) {
		return new Date(value);
	}

	if (value.trim() === '') {
		return null;
	}

	const normalizedValue = value.includes('T')
		? value
		: `${value}T${endOfDay ? '23:59:59.999' : '00:00:00.000'}Z`;

	const date = new Date(normalizedValue);

	return Number.isNaN(date.getTime()) ? null : date;
};

export class BillingService {
	async createInvoice(data: {
		patientId: string;
		appointmentId?: string;
		serviceItems: Array<{
			serviceId?: string;
			itemId?: string;
			description: string;
			quantity: number;
			unitPrice: string;
		}>;
		notes?: string;
		createdBy: string;
	}): Promise<MedicalInvoice> {
		// Validate input
		if (!data.patientId || !data.createdBy || data.serviceItems.length === 0) {
			throw new Error('Patient ID, created by ID, and at least one service item are required');
		}

		// Validate patient exists
		const patientPromise = db
			.select()
			.from(patients)
			.where(eq(patients.id, data.patientId))
			.limit(1);

		const patient = (await patientPromise)[0];
		if (!patient) {
			throw new Error('Patient not found');
		}

		// Generate invoice number
		const invoiceNumber = this.generateInvoiceNumber();
		const dueDate = new Date();
		dueDate.setDate(dueDate.getDate() + 7); // Due in 7 days

		// Calculate totals
		let totalAmount = 0;
		const invoiceItems: Omit<NewMedicalInvoiceItem, 'id' | 'invoiceId' | 'createdAt' | 'updatedAt'>[] = [];

		for (const item of data.serviceItems) {
			const unitPriceValue = parseFloat(item.unitPrice);
			const totalPriceValue = unitPriceValue * item.quantity;
			totalAmount += totalPriceValue;

			invoiceItems.push({
				serviceId: item.serviceId || null,
				itemId: item.itemId || null,
				description: item.description,
				quantity: item.quantity,
				unitPrice: unitPriceValue.toString(),
				totalPrice: totalPriceValue.toString()
			});
		}

		// Create invoice
		const invoice: NewMedicalInvoice = {
			patientId: data.patientId,
			appointmentId: data.appointmentId || null,
			invoiceNumber,
			totalAmount: totalAmount.toString(),
			paidAmount: "0",
			status: "unpaid",
			paymentMethod: null,
			dueDate: dueDate.toISOString().split('T')[0],
			notes: data.notes || null,
			createdBy: data.createdBy
		};

		const result = await db
			.transaction(async (tx) => {
				const invoiceResult = await tx
					.insert(medicalInvoices)
					.values(invoice)
					.returning();
				
				const createdInvoice = invoiceResult[0];

				// Insert invoice items
				if (invoiceItems.length > 0) {
					const invoiceItemPromises = invoiceItems.map((item) =>
						tx
							.insert(medicalInvoiceItems)
							.values({
								...item,
								invoiceId: createdInvoice.id
							} satisfies Omit<NewMedicalInvoiceItem, 'id' | 'createdAt' | 'updatedAt'>)
					);

					await Promise.all(invoiceItemPromises);
				}

				return createdInvoice;
			});

		return result;
	}

	async getInvoiceById(id: string) {
		const invoiceResult = await db
			.select({
				invoice: medicalInvoices,
				patient: patients
			})
			.from(medicalInvoices)
			.leftJoin(patients, eq(medicalInvoices.patientId, patients.id))
			.where(eq(medicalInvoices.id, id))
			.limit(1);

		if (!invoiceResult[0]) {
			return null;
		}

		// Get invoice items with service details
		const itemsResult = await db
			.select({
				item: medicalInvoiceItems,
				service: medicalServices,
				inventory: medicalInventory
			})
			.from(medicalInvoiceItems)
			.leftJoin(medicalServices, eq(medicalInvoiceItems.serviceId, medicalServices.id))
			.leftJoin(medicalInventory, eq(medicalInvoiceItems.itemId, medicalInventory.id))
			.where(eq(medicalInvoiceItems.invoiceId, id));

		return {
			...invoiceResult[0],
			items: itemsResult
		};
	}

	async getInvoices(filters?: {
		patientId?: string;
		status?: string;
		dateFrom?: string;
		dateTo?: string;
		page?: number;
		limit?: number;
	}) {
		const limit = filters?.limit || 20;
		const offset = (filters?.page || 1 - 1) * limit;

		const query = db
			.select({
				invoice: medicalInvoices,
				patient: patients
			})
			.from(medicalInvoices)
			.leftJoin(patients, eq(medicalInvoices.patientId, patients.id))
			.$dynamic();

		const whereConditions = [];
		
		if (filters?.patientId) {
			whereConditions.push(eq(medicalInvoices.patientId, filters.patientId));
		}
		
		if (filters?.status) {
			whereConditions.push(ilike(medicalInvoices.status, filters.status));
		}
		
		if (filters?.dateFrom && filters?.dateTo) {
			const dateFromValue = toDateFilterValue(filters.dateFrom);
			const dateToValue = toDateFilterValue(filters.dateTo, true);

			if (dateFromValue && dateToValue) {
				whereConditions.push(
					between(medicalInvoices.createdAt, dateFromValue, dateToValue)
				);
			}
		}
		
		if (whereConditions.length > 0) {
			query.where(and(...whereConditions));
		}
		
		query.orderBy(desc(medicalInvoices.createdAt)).limit(limit).offset(offset);
		
		return await query;
	}

	async payInvoice(invoiceId: string, paymentData: {
		amount: string;
		paymentMethod: any;
		paidBy: string;
	}): Promise<MedicalInvoice> {
		const invoice = await this.getInvoiceById(invoiceId);
		if (!invoice) {
			throw new Error('Invoice not found');
		}

		if (invoice.invoice.status === 'paid') {
			throw new Error('Invoice is already paid');
		}

		const paymentAmount = parseFloat(paymentData.amount);
		const currentPaid = parseFloat(invoice.invoice.paidAmount);
		const totalAmount = parseFloat(invoice.invoice.totalAmount);
		
		if (paymentAmount <= 0) {
			throw new Error('Payment amount must be greater than 0');
		}

		if (currentPaid + paymentAmount > totalAmount) {
			throw new Error('Payment amount exceeds invoice total');
		}

		const newPaidAmount = (currentPaid + paymentAmount).toString();
		const newStatus = parseFloat(newPaidAmount) >= totalAmount ? 'paid' : 'partial_paid';

		const result = await db
			.update(medicalInvoices)
			.set({
				paidAmount: newPaidAmount,
				status: newStatus,
				paymentMethod: paymentData.paymentMethod,
				paidAt: newStatus === 'paid' ? new Date() : null,
				updatedAt: new Date()
			})
			.where(eq(medicalInvoices.id, invoiceId))
			.returning();
		
		return result[0];
	}

	async cancelInvoice(invoiceId: string, reason: string, cancelledBy: string): Promise<MedicalInvoice> {
		const invoice = await this.getInvoiceById(invoiceId);
		if (!invoice) {
			throw new Error('Invoice not found');
		}

		if (invoice.invoice.status === 'paid') {
			throw new Error('Cannot cancel paid invoice');
		}

		if (invoice.invoice.status === 'cancelled') {
			throw new Error('Invoice is already cancelled');
		}

		const result = await db
			.update(medicalInvoices)
			.set({
				status: 'cancelled',
				notes: `${invoice.invoice.notes || ''}\n\nCANCELLED: ${reason} (${new Date().toLocaleString('id-ID')})`,
				updatedAt: new Date()
			})
			.where(eq(medicalInvoices.id, invoiceId))
			.returning();
		
		return result[0];
	}

	async getUnpaidInvoices(limit = 50) {
		return await this.getInvoices({ status: 'unpaid', limit });
	}

	async getOverdueInvoices(limit = 50) {
		const today = new Date().toISOString().split('T')[0];
		
		return await db
			.select({
				invoice: medicalInvoices,
				patient: patients
			})
			.from(medicalInvoices)
			.leftJoin(patients, eq(medicalInvoices.patientId, patients.id))
			.where(and(
				eq(medicalInvoices.status, 'unpaid'),
				eq(medicalInvoices.dueDate, today)
			))
			.orderBy(desc(medicalInvoices.dueDate))
			.limit(limit);
	}

	async getInvoiceCount(filters?: {
		patientId?: string;
		status?: string;
		dateFrom?: string;
		dateTo?: string;
	}): Promise<number> {
		const query = db.select({ count: medicalInvoices.id }).from(medicalInvoices);
		
		const whereConditions = [];
		
		if (filters?.patientId) {
			whereConditions.push(eq(medicalInvoices.patientId, filters.patientId));
		}
		
		if (filters?.status) {
			whereConditions.push(ilike(medicalInvoices.status, filters.status));
		}
		
		if (filters?.dateFrom && filters?.dateTo) {
			const dateFromValue = toDateFilterValue(filters.dateFrom);
			const dateToValue = toDateFilterValue(filters.dateTo, true);

			if (dateFromValue && dateToValue) {
				whereConditions.push(
					between(medicalInvoices.createdAt, dateFromValue, dateToValue)
				);
			}
		}
		
		if (whereConditions.length > 0) {
			query.where(and(...whereConditions));
		}
		
		const result = await query;
		return result.length;
	}

	// Helper method to generate invoice numbers
	private generateInvoiceNumber(): string {
		const date = new Date();
		const year = date.getFullYear().toString().slice(-2);
		const month = (date.getMonth() + 1).toString().padStart(2, '0');
		const day = date.getDate().toString().padStart(2, '0');
		const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
		
		return `INV-${year}${month}${day}-${random}`;
	}

	// Reporting methods
	async getBillingSummary(dateFrom?: string, dateTo?: string) {
		const thirtyDaysAgo = new Date();
		thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

		const defaultFrom = dateFrom || thirtyDaysAgo.toISOString().split('T')[0];
		const defaultTo = dateTo || new Date().toISOString().split('T')[0];

		const [totalInvoices, paidInvoices, unpaidInvoices, overdueInvoices] = await Promise.all([
			this.getInvoiceCount({ dateFrom: defaultFrom, dateTo: defaultTo }),
			this.getInvoiceCount({ status: 'paid', dateFrom: defaultFrom, dateTo: defaultTo }),
			this.getInvoiceCount({ status: 'unpaid', dateFrom: defaultFrom, dateTo: defaultTo }),
			this.getOverdueInvoices()
		]);

		return {
			totalInvoices,
			paidInvoices,
			unpaidInvoices,
			overdueInvoices: overdueInvoices.length,
			paymentRate: totalInvoices > 0 ? (paidInvoices / totalInvoices) * 100 : 0
		};
	}

	async getRevenueSummary(dateFrom?: string, dateTo?: string) {
		const defaultFrom = dateFrom || new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0];
		const defaultTo = dateTo || new Date().toISOString().split('T')[0];

		const createdFrom = toDateFilterValue(defaultFrom);
		const createdTo = toDateFilterValue(defaultTo, true);

		if (!createdFrom || !createdTo) {
			return { total: 0, paid: 0, pending: 0 };
		}

		const revenueResult = await db
			.select({
				totalRevenue: medicalInvoices.totalAmount,
				paidRevenue: medicalInvoices.paidAmount
			})
			.from(medicalInvoices)
			.where(between(medicalInvoices.createdAt, createdFrom, createdTo));

		const revenue = revenueResult.reduce(
			(acc, row) => {
				const total = parseFloat(row.totalRevenue);
				const paid = parseFloat(row.paidRevenue);

				acc.total += total;
				acc.paid += paid;
				acc.pending += Math.max(total - paid, 0);

				return acc;
			},
			{ total: 0, paid: 0, pending: 0 }
		);

		return revenue;
	}
}
