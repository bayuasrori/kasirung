import { eq, and, desc, between, inArray } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { 
	appointments, 
	patients, 
	medicalStaff, 
	medicalServices,
	appointmentStatusEnum,
	type Appointment, 
	type NewAppointment,
	type Patient,
	type MedicalStaff,
	type MedicalService
} from '$lib/db/schema';

type AppointmentStatus = (typeof appointmentStatusEnum.enumValues)[number];

const appointmentSelect = {
	id: appointments.id,
	patientId: appointments.patientId,
	staffId: appointments.staffId,
	serviceId: appointments.serviceId,
	appointmentDate: appointments.appointmentDate,
	appointmentTime: appointments.appointmentTime,
	duration: appointments.duration,
	type: appointments.type,
	status: appointments.status,
	notes: appointments.notes,
	reason: appointments.reason,
	createdAt: appointments.createdAt,
	updatedAt: appointments.updatedAt,
	patient: {
		id: patients.id,
		name: patients.name,
		mrNumber: patients.mrNumber,
		gender: patients.gender,
		phone: patients.phone
	},
	staff: {
		id: medicalStaff.id,
		name: medicalStaff.name,
		role: medicalStaff.role,
		specialization: medicalStaff.specialization,
		phone: medicalStaff.phone
	},
	service: {
		id: medicalServices.id,
		name: medicalServices.name,
		code: medicalServices.code,
		price: medicalServices.price,
		duration: medicalServices.duration
	}
};

const normalizeStatuses = (status?: string | string[]): AppointmentStatus[] => {
	if (!status) return [];

	const rawStatuses = Array.isArray(status)
		? status
		: status.split(',').map((value) => value.trim());

	const isValidStatus = (value: string): value is AppointmentStatus =>
		appointmentStatusEnum.enumValues.includes(value as AppointmentStatus);

	return rawStatuses.filter(isValidStatus);
};

export class AppointmentsRepository {
	async findAll(filters?: {
		patientId?: string;
		staffId?: string;
		status?: string | string[];
		dateFrom?: string;
		dateTo?: string;
	}, limit = 50, offset = 0) {
		const query = db
			.select(appointmentSelect)
			.from(appointments)
			.leftJoin(patients, eq(appointments.patientId, patients.id))
			.leftJoin(medicalStaff, eq(appointments.staffId, medicalStaff.id))
			.leftJoin(medicalServices, eq(appointments.serviceId, medicalServices.id))
			.$dynamic();

		const whereConditions = [];
		
		if (filters?.patientId) {
			whereConditions.push(
				eq(appointments.patientId, filters.patientId)
			);
		}
		
		if (filters?.staffId) {
			whereConditions.push(
				eq(appointments.staffId, filters.staffId)
			);
		}
		
		const statusFilters = normalizeStatuses(filters?.status);

		if (statusFilters.length === 1) {
			whereConditions.push(eq(appointments.status, statusFilters[0]));
		} else if (statusFilters.length > 1) {
			whereConditions.push(inArray(appointments.status, statusFilters));
		}
		
		if (filters?.dateFrom && filters?.dateTo) {
			whereConditions.push(
				between(appointments.appointmentDate, filters.dateFrom, filters.dateTo)
			);
		}
		
		if (whereConditions.length > 0) {
			query.where(and(...whereConditions));
		}
		
		query.orderBy(desc(appointments.appointmentDate), appointments.appointmentTime).limit(limit).offset(offset);
		
		return await query;
	}

	async findById(id: string) {
		const result = await db
			.select(appointmentSelect)
			.from(appointments)
			.leftJoin(patients, eq(appointments.patientId, patients.id))
			.leftJoin(medicalStaff, eq(appointments.staffId, medicalStaff.id))
			.leftJoin(medicalServices, eq(appointments.serviceId, medicalServices.id))
			.where(eq(appointments.id, id))
			.limit(1);
		
		return result[0] || null;
	}

	async getTodayAppointments(limit = 50) {
		const today = new Date().toISOString().split('T')[0];
		return await this.findAll({ dateFrom: today, dateTo: today }, limit, 0);
	}

	async getStaffAppointments(staffId: string, dateFrom?: string, dateTo?: string) {
		const filters: any = { staffId };
		if (dateFrom && dateTo) {
			filters.dateFrom = dateFrom;
			filters.dateTo = dateTo;
		}
		return await this.findAll(filters, 50, 0);
	}

	async getPatientAppointments(patientId: string) {
		return await this.findAll({ patientId }, 50, 0);
	}

	async create(data: Omit<NewAppointment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Appointment> {
		const result = await db
			.insert(appointments)
			.values(data)
			.returning();
		
		return result[0];
	}

	async update(id: string, data: Partial<NewAppointment>): Promise<Appointment> {
		const result = await db
			.update(appointments)
			.set({ ...data, updatedAt: new Date() })
			.where(eq(appointments.id, id))
			.returning();
		
		return result[0];
	}

	async delete(id: string): Promise<void> {
		await db.delete(appointments).where(eq(appointments.id, id));
	}

	async count(filters?: {
		patientId?: string;
		staffId?: string;
		status?: string | string[];
		dateFrom?: string;
		dateTo?: string;
	}): Promise<number> {
		const query = db.select({ count: appointments.id }).from(appointments).$dynamic();
		
		const whereConditions = [];
		
		if (filters?.patientId) {
			whereConditions.push(
				eq(appointments.patientId, filters.patientId)
			);
		}
		
		if (filters?.staffId) {
			whereConditions.push(
				eq(appointments.staffId, filters.staffId)
			);
		}
		
		const statusFilters = normalizeStatuses(filters?.status);

		if (statusFilters.length === 1) {
			whereConditions.push(eq(appointments.status, statusFilters[0]));
		} else if (statusFilters.length > 1) {
			whereConditions.push(inArray(appointments.status, statusFilters));
		}
		
		if (filters?.dateFrom && filters?.dateTo) {
			whereConditions.push(
				between(appointments.appointmentDate, filters.dateFrom, filters.dateTo)
			);
		}
		
		if (whereConditions.length > 0) {
			query.where(and(...whereConditions));
		}
		
		const result = await query;
		return result.length;
	}

	async getAvailableSlots(staffId: string, date: string) {
		// This would check staff schedules and existing appointments
		// For now, return basic time slots
		return [
			'08:00', '08:30', '09:00', '09:30',
			'10:00', '10:30', '11:00', '11:30',
			'13:00', '13:30', '14:00', '14:30',
			'15:00', '15:30', '16:00', '16:30'
		];
	}
}
