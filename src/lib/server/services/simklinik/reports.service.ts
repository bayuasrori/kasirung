import { eq, ilike, and, between, desc, sql } from 'drizzle-orm';
import { db } from '$lib/server/db';
import {
	consultations,
	patients,
	medicalInventory,
	medicalInvoices,
	medicalInvoiceItems,
	appointments,
	medicalServices,
	medicalStaff,
	prescriptions,
	vitalSigns,
	stockMovements
} from '$lib/db/schema';

export class ReportsService {
	// Clinical Reports
	async getPatientVisitReports(dateFrom: string, dateTo: string) {
		const result = await db
			.select({
				date: sql`DATE(${consultations.startTime})`,
				totalVisits: sql`COUNT(${consultations.id})`,
				newPatients: sql`COUNT(CASE WHEN DATE(${patients.createdAt}) = DATE(${consultations.startTime}) THEN 1 END)`,
				returningPatients: sql`COUNT(CASE WHEN DATE(${patients.createdAt}) != DATE(${consultations.startTime}) THEN 1 END)`
			})
			.from(consultations)
			.leftJoin(patients, eq(consultations.patientId, patients.id))
			.where(and(
				eq(consultations.status, 'completed'),
				between(sql`DATE(${consultations.startTime})`, dateFrom, dateTo)
			))
			.groupBy(sql`DATE(${consultations.startTime})`)
			.orderBy(desc(sql`DATE(${consultations.startTime})`));

		return result;
	}

	async getStaffPerformanceReports(dateFrom: string, dateTo: string) {
		const result = await db
			.select({
				staffId: medicalStaff.id,
				staffName: medicalStaff.name,
				staffRole: medicalStaff.role,
				totalConsultations: sql`COUNT(${consultations.id})`,
				avgConsulutationTime: sql`AVG(EXTRACT(EPOCH FROM (${consultations.endTime} - ${consultations.startTime}) / 60))`,
				prescriptionsGiven: sql`COUNT(DISTINCT ${prescriptions.consultationId})`,
				revenue: sql`COALESCE(SUM(${medicalInvoices.totalAmount}), 0)`
			})
			.from(consultations)
			.leftJoin(medicalStaff, eq(consultations.staffId, medicalStaff.id))
			.leftJoin(prescriptions, eq(consultations.id, prescriptions.consultationId))
			.leftJoin(medicalInvoices, eq(consultations.patientId, medicalInvoices.patientId))
			.where(and(
				between(sql`DATE(${consultations.startTime})`, dateFrom, dateTo)
			))
			.groupBy(medicalStaff.id, medicalStaff.name, medicalStaff.role)
			.orderBy(desc(sql`COUNT(${consultations.id})`));

		return result;
	}

	async getDiseaseStatistics(dateFrom: string, dateTo: string, limit = 20) {
		const result = await db
			.select({
				diagnosis: sql`SPLIT_PART(${consultations.diagnosis}, ',', 1)`,
				count: sql`COUNT(*)`,
				percentage: sql`(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM consultations))`
			})
			.from(consultations)
			.where(and(
				eq(consultations.status, 'completed'),
				between(sql`DATE(${consultations.startTime})`, dateFrom, dateTo),
				sql`${consultations.diagnosis} IS NOT NULL AND ${consultations.diagnosis} != ''`
			))
			.groupBy(sql`SPLIT_PART(${consultations.diagnosis}, ',', 1)`)
			.orderBy(desc(sql`COUNT(*)`))
			.limit(limit);

		return result;
	}

	async getMedicalServiceAnalytics(dateFrom: string, dateTo: string) {
		const result = await db
			.select({
				serviceId: medicalServices.id,
				serviceName: medicalServices.name,
				serviceCode: medicalServices.code,
				totalBookings: sql`COUNT(${appointments.id})`,
				totalCompleted: sql`COUNT(CASE WHEN ${appointments.status} = 'completed' THEN 1 END)`,
				completionRate: sql`(COUNT(CASE WHEN ${appointments.status} = 'completed' THEN 1 END) * 100.0 / COUNT(${appointments.id}))`,
				totalRevenue: sql`COALESCE(SUM(${medicalInvoiceItems.totalPrice}), 0)`
			})
			.from(appointments)
			.leftJoin(medicalServices, eq(appointments.serviceId, medicalServices.id))
			.leftJoin(medicalInvoices, eq(appointments.patientId, medicalInvoices.patientId))
			.leftJoin(medicalInvoiceItems, sql`${medicalInvoices.id} = ${medicalInvoiceItems.invoiceId}`)
			.where(and(
				between(sql`DATE(${appointments.appointmentDate})`, dateFrom, dateTo)
			))
			.groupBy(medicalServices.id, medicalServices.name, medicalServices.code)
			.orderBy(desc(sql`COUNT(${appointments.id})`));

		return result;
	}

	// Financial Reports
	async getRevenueReports(dateFrom: string, dateTo: string) {
		const result = await db
			.select({
				date: sql`DATE(${medicalInvoices.createdAt})`,
				totalRevenue: sql`COALESCE(SUM(${medicalInvoices.totalAmount}), 0)`,
				paidRevenue: sql`COALESCE(SUM(${medicalInvoices.paidAmount}), 0)`,
				unpaidRevenue: sql`COALESCE(SUM(${medicalInvoices.totalAmount} - ${medicalInvoices.paidAmount}), 0)`,
				invoiceCount: sql`COUNT(${medicalInvoices.id})`,
				paidInvoices: sql`COUNT(CASE WHEN ${medicalInvoices.status} = 'paid' THEN 1 END)`,
				paymentRate: sql`(COUNT(CASE WHEN ${medicalInvoices.status} = 'paid' THEN 1 END) * 100.0 / COUNT(${medicalInvoices.id}))`
			})
			.from(medicalInvoices)
			.where(between(sql`DATE(${medicalInvoices.createdAt})`, dateFrom, dateTo))
			.groupBy(sql`DATE(${medicalInvoices.createdAt})`)
			.orderBy(desc(sql`DATE(${medicalInvoices.createdAt})`));

		return result;
	}

	async getTopRevenueServices(dateFrom: string, dateTo: string, limit = 10) {
		const result = await db
			.select({
				serviceName: medicalServices.name,
				serviceCode: medicalServices.code,
				totalRevenue: sql`COALESCE(SUM(${medicalInvoiceItems.totalPrice}), 0)`,
				usageCount: sql`COUNT(${medicalInvoiceItems.id})`,
				revenuePerUsage: sql`COALESCE(SUM(${medicalInvoiceItems.totalPrice}) / COUNT(${medicalInvoiceItems.id}), 0)`
			})
			.from(medicalInvoiceItems)
			.leftJoin(medicalInvoices, eq(medicalInvoiceItems.invoiceId, medicalInvoices.id))
			.leftJoin(medicalServices, eq(medicalInvoiceItems.serviceId, medicalServices.id))
			.where(and(
				between(sql`DATE(${medicalInvoices.createdAt})`, dateFrom, dateTo)
			))
			.groupBy(medicalServices.id, medicalServices.name, medicalServices.code)
			.orderBy(desc(sql`COALESCE(SUM(${medicalInvoiceItems.totalPrice}), 0)`))
			.limit(limit);

		return result;
	}

	async getPatientRevenueAnalytics(dateFrom: string, dateTo: string, limit = 20) {
		const result = await db
			.select({
				patientId: patients.id,
				patientName: patients.name,
				mrNumber: patients.mrNumber,
				totalVisits: sql`COUNT(DISTINCT ${consultations.id})`,
				totalSpent: sql`COALESCE(SUM(${medicalInvoices.totalAmount}), 0)`,
				paidAmount: sql`COALESCE(SUM(${medicalInvoices.paidAmount}), 0)`,
				balanceDue: sql`COALESCE(SUM(${medicalInvoices.totalAmount} - ${medicalInvoices.paidAmount}), 0)`,
				averageSpent: sql`COALESCE(SUM(${medicalInvoices.totalAmount}) / COUNT(DISTINCT ${consultations.id}), 0)`
			})
			.from(patients)
			.leftJoin(consultations, eq(patients.id, consultations.patientId))
			.leftJoin(medicalInvoices, eq(patients.id, medicalInvoices.patientId))
			.where(and(
				between(sql`DATE(${medicalInvoices.createdAt})`, dateFrom, dateTo)
			))
			.groupBy(patients.id, patients.name, patients.mrNumber)
			.orderBy(desc(sql`COALESCE(SUM(${medicalInvoices.totalAmount}), 0)`))
			.limit(limit);

		return result;
	}

	// Inventory Reports
	async getInventoryConsumptionReport(dateFrom: string, dateTo: string) {
		const result = await db
			.select({
				itemName: medicalInventory.name,
				itemCode: medicalInventory.code,
				itemType: medicalInventory.type,
				currentStock: medicalInventory.stock,
				consumed: sql`COALESCE(SUM(CASE WHEN ${stockMovements.type} = 'out' THEN ${stockMovements.quantity} ELSE 0 END), 0)`,
				received: sql`COALESCE(SUM(CASE WHEN ${stockMovements.type} = 'in' THEN ${stockMovements.quantity} ELSE 0 END), 0)`,
				expired: sql`COALESCE(SUM(CASE WHEN ${stockMovements.type} = 'expired' THEN ${stockMovements.quantity} ELSE 0 END), 0)`,
				adjusted: sql`COALESCE(SUM(CASE WHEN ${stockMovements.type} = 'adjust' THEN ABS(${stockMovements.quantity}) ELSE 0 END), 0)`,
				netConsumption: sql`(COALESCE(SUM(CASE WHEN ${stockMovements.type} = 'out' THEN ${stockMovements.quantity} ELSE 0 END), 0) - COALESCE(SUM(CASE WHEN ${stockMovements.type} = 'in' THEN ${stockMovements.quantity} ELSE 0 END), 0))`
			})
			.from(medicalInventory)
			.leftJoin(stockMovements, eq(medicalInventory.id, stockMovements.itemId))
			.where(between(sql`DATE(${stockMovements.createdAt})`, dateFrom, dateTo))
			.groupBy(medicalInventory.id, medicalInventory.name, medicalInventory.code, medicalInventory.type, medicalInventory.stock)
			.orderBy(desc(sql`(COALESCE(SUM(CASE WHEN ${stockMovements.type} = 'out' THEN ${stockMovements.quantity} ELSE 0 END), 0))`));

		return result;
	}

	async getPrescriptionAnalytics(dateFrom: string, dateTo: string) {
		const result = await db
			.select({
				medication: prescriptions.medication,
				totalPrescriptions: sql`COUNT(${prescriptions.id})`,
				completedPrescriptions: sql`COUNT(CASE WHEN ${prescriptions.status} = 'completed' THEN 1 END)`,
				dosageFrequency: prescriptions.dosage,
				mostCommonDuration: prescriptions.frequency,
				prescribingStaff: medicalStaff.name
			})
			.from(prescriptions)
			.leftJoin(consultations, eq(prescriptions.consultationId, consultations.id))
			.leftJoin(medicalStaff, eq(consultations.staffId, medicalStaff.id))
			.where(between(sql`DATE(${prescriptions.createdAt})`, dateFrom, dateTo))
			.groupBy(prescriptions.medication, prescriptions.dosage, prescriptions.frequency, medicalStaff.name)
			.orderBy(desc(sql`COUNT(${prescriptions.id})`))
			.limit(50);

		return result;
	}

	// Vital Signs Analytics
	async getVitalSignsAnalytics(dateFrom: string, dateTo: string) {
		const result = await db
			.select({
				date: sql`DATE(${vitalSigns.createdAt})`,
				avgBloodPressure: sql`AVG(CAST(${vitalSigns.systolic} AS INTEGER))`,
				avgHeartRate: sql`AVG(CAST(${vitalSigns.heartRate} AS INTEGER))`,
				avgTemperature: sql`AVG(${vitalSigns.temperature})`,
				avgBMI: sql`AVG(${vitalSigns.bmi})`,
				avgWeight: sql`AVG(${vitalSigns.weight})`,
				totalReadings: sql`COUNT(${vitalSigns.id})`
			})
			.from(vitalSigns)
			.where(between(sql`DATE(${vitalSigns.createdAt})`, dateFrom, dateTo))
			.groupBy(sql`DATE(${vitalSigns.createdAt})`)
			.orderBy(desc(sql`DATE(${vitalSigns.createdAt})`));

		return result;
	}

	// Summary Reports
	async getDashboardSummary(dateFrom?: string, dateTo?: string) {
		const defaultFrom = dateFrom || new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0];
		const defaultTo = dateTo || new Date().toISOString().split('T')[0];

		const [
			patientVisits,
			revenue,
			inventoryAlerts,
			staffPerformance,
			topServices
		] = await Promise.all([
			this.getPatientVisitReports(defaultFrom, defaultTo),
			this.getRevenueReports(defaultFrom, defaultTo),
			this.getAlertSummary(),
			this.getStaffPerformanceReports(defaultFrom, defaultTo),
			this.getTopRevenueServices(defaultFrom, defaultTo, 5)
		]);

		type VisitStats = { totalVisits: number; newPatients: number };
		type RevenueStats = { paidRevenue: string | number; paymentRate: number };

		const visitStats = (patientVisits as VisitStats[]) ?? [];
		const revenueStats = (revenue as RevenueStats[]) ?? [];

		const totalVisits = visitStats.reduce((acc, day) => acc + Number(day.totalVisits ?? 0), 0);
		const totalRevenue = revenueStats.reduce((acc, day) => acc + Number(day.paidRevenue ?? 0), 0);
		const totalPatients = new Set(visitStats.map((v) => Number(v.newPatients ?? 0))).size;

		return {
			clinical: {
				totalVisits,
				totalPatients,
				visitsGrowth:
					visitStats.length > 1
						? ((visitStats[0].totalVisits - visitStats[visitStats.length - 1].totalVisits) /
								visitStats[visitStats.length - 1].totalVisits) *
							100
						: 0
			},
			financial: {
				totalRevenue,
				revenueGrowth:
					revenueStats.length > 1
						? ((Number(revenueStats[0].paidRevenue ?? 0) -
								Number(revenueStats[revenueStats.length - 1].paidRevenue ?? 0)) /
								Number(revenueStats[revenueStats.length - 1].paidRevenue ?? 1)) *
							100
						: 0,
				paymentRate:
					revenueStats.length > 0
						? revenueStats.reduce((acc, day) => acc + Number(day.paymentRate ?? 0), 0) / revenueStats.length
						: 0
			},
			inventory: inventoryAlerts,
			staff: staffPerformance.slice(0, 5),
			services: topServices
		};
	}

	private async getAlertSummary() {
		const today = new Date();
		const expiryThreshold = new Date();
		expiryThreshold.setDate(expiryThreshold.getDate() + 30);

		const [lowStock, expiring, expired] = await Promise.all([
			db.select().from(medicalInventory)
				.where(sql`${medicalInventory.stock} <= ${medicalInventory.minStock} AND ${medicalInventory.isActive} = true`)
				.limit(10),
			db.select().from(medicalInventory)
				.where(sql`${medicalInventory.expiryDate} <= ${expiryThreshold.toISOString()} AND ${medicalInventory.expiryDate} > ${today.toISOString()} AND ${medicalInventory.isActive} = true`)
				.limit(10),
			db.select().from(medicalInventory)
				.where(sql`${medicalInventory.expiryDate} < ${today.toISOString()} AND ${medicalInventory.isActive} = true`)
				.limit(10)
		]);

		return {
			lowStockCount: lowStock.length,
			expiringCount: expiring.length,
			expiredCount: expired.length,
			totalAlerts: lowStock.length + expiring.length + expired.length
		};
	}
}
