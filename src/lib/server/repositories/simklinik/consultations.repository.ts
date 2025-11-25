import { eq, and, desc, gte, lte, isNull, isNotNull } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { 
	consultations, 
	appointments, 
	patients, 
	medicalStaff,
	vitalSigns,
	prescriptions,
	type Consultation, 
	type NewConsultation,
	type VitalSign,
	type NewVitalSign,
	type Prescription,
	type NewPrescription
} from '$lib/db/schema';

export class ConsultationsRepository {
	async findAll(
		filters?: {
			patientId?: string;
			staffId?: string;
			status?: Consultation['status'];
			dateFrom?: string;
			dateTo?: string;
			admissionId?: string;
			isInpatient?: boolean;
		},
		limit = 50,
		offset = 0
	) {
		const query = db
			.select({
				consultation: consultations,
				appointment: appointments,
				patient: patients,
				staff: medicalStaff
			})
			.from(consultations)
			.leftJoin(appointments, eq(consultations.appointmentId, appointments.id))
			.leftJoin(patients, eq(consultations.patientId, patients.id))
			.leftJoin(medicalStaff, eq(consultations.staffId, medicalStaff.id))
			.$dynamic();

		const whereConditions = [];
		
		if (filters?.patientId) {
			whereConditions.push(
				eq(consultations.patientId, filters.patientId)
			);
		}
		
		if (filters?.staffId) {
			whereConditions.push(
				eq(consultations.staffId, filters.staffId)
			);
		}
		
		if (filters?.status) {
			whereConditions.push(
				eq(consultations.status, filters.status)
			);
		}

		if (filters?.admissionId) {
			whereConditions.push(eq(consultations.admissionId, filters.admissionId));
		} else if (filters?.isInpatient === true) {
			whereConditions.push(isNotNull(consultations.admissionId));
		} else if (filters?.isInpatient === false) {
			whereConditions.push(isNull(consultations.admissionId));
		}

		if (filters?.dateFrom) {
			whereConditions.push(gte(consultations.startTime, new Date(filters.dateFrom)));
		}

		if (filters?.dateTo) {
			const endDate = new Date(filters.dateTo);
			endDate.setHours(23, 59, 59, 999);
			whereConditions.push(lte(consultations.startTime, endDate));
		}
		
		if (whereConditions.length > 0) {
			query.where(and(...whereConditions));
		}
		
		query.orderBy(desc(consultations.startTime)).limit(limit).offset(offset);
		
		return await query;
	}

	async findById(id: string) {
		const result = await db
			.select({
				consultation: consultations,
				appointment: appointments,
				patient: patients,
				staff: medicalStaff
			})
			.from(consultations)
			.leftJoin(appointments, eq(consultations.appointmentId, appointments.id))
			.leftJoin(patients, eq(consultations.patientId, patients.id))
			.leftJoin(medicalStaff, eq(consultations.staffId, medicalStaff.id))
			.where(eq(consultations.id, id))
			.limit(1);
		
		return result[0] || null;
	}

	async getPatientConsultations(patientId: string, limit = 50) {
		return await this.findAll({ patientId }, limit, 0);
	}

	async getStaffConsultations(staffId: string, limit = 50) {
		return await this.findAll({ staffId }, limit, 0);
	}

	async create(data: Omit<NewConsultation, 'id' | 'startTime' | 'createdAt' | 'updatedAt'>): Promise<Consultation> {
		const result = await db
			.insert(consultations)
			.values(data)
			.returning();
		
		return result[0];
	}

	async endConsultation(id: string): Promise<Consultation> {
		const result = await db
			.update(consultations)
			.set({ 
				status: 'completed',
				endTime: new Date(),
				updatedAt: new Date()
			})
			.where(eq(consultations.id, id))
			.returning();
		
		return result[0];
	}

	async update(id: string, data: Partial<NewConsultation>): Promise<Consultation> {
		const result = await db
			.update(consultations)
			.set({ ...data, updatedAt: new Date() })
			.where(eq(consultations.id, id))
			.returning();
		
		return result[0];
	}

	async delete(id: string): Promise<void> {
		await db.delete(consultations).where(eq(consultations.id, id));
	}

	async count(filters?: {
			patientId?: string;
			staffId?: string;
			status?: Consultation['status'];
			dateFrom?: string;
			dateTo?: string;
			admissionId?: string;
			isInpatient?: boolean;
	}): Promise<number> {
		const query = db.select({ count: consultations.id }).from(consultations).$dynamic();
		
		const whereConditions = [];
		
		if (filters?.patientId) {
			whereConditions.push(
				eq(consultations.patientId, filters.patientId)
			);
		}
		
		if (filters?.staffId) {
			whereConditions.push(
				eq(consultations.staffId, filters.staffId)
			);
		}
		
		if (filters?.status) {
			whereConditions.push(
				eq(consultations.status, filters.status)
			);
		}

		if (filters?.admissionId) {
			whereConditions.push(eq(consultations.admissionId, filters.admissionId));
		} else if (filters?.isInpatient === true) {
			whereConditions.push(isNotNull(consultations.admissionId));
		} else if (filters?.isInpatient === false) {
			whereConditions.push(isNull(consultations.admissionId));
		}

		if (filters?.dateFrom) {
			whereConditions.push(gte(consultations.startTime, new Date(filters.dateFrom)));
		}

		if (filters?.dateTo) {
			const endDate = new Date(filters.dateTo);
			endDate.setHours(23, 59, 59, 999);
			whereConditions.push(lte(consultations.startTime, endDate));
		}
		
		if (whereConditions.length > 0) {
			query.where(and(...whereConditions));
		}
		
		const result = await query;
		return result.length;
	}
}

export class VitalSignsRepository {
	async findByConsultationId(consultationId: string) {
		const result = await db
			.select()
			.from(vitalSigns)
			.where(eq(vitalSigns.consultationId, consultationId))
			.limit(1);
		
		return result[0] || null;
	}

	async create(data: Omit<NewVitalSign, 'id' | 'createdAt' | 'updatedAt'>): Promise<VitalSign> {
		// Calculate BMI if weight and height are provided
		if (data.weight && data.height) {
			const weightNum = parseFloat(data.weight.toString());
			const heightNum = parseFloat(data.height.toString()) / 100; // Convert cm to m
			const bmi = weightNum / (heightNum * heightNum);
			data.bmi = bmi.toFixed(1);
		}

		const result = await db
			.insert(vitalSigns)
			.values(data)
			.returning();
		
		return result[0];
	}
	async update(id: string, data: Partial<NewVitalSign>): Promise<VitalSign> {
		// Calculate BMI if weight and height are provided
		if (data.weight && data.height) {
			const weightNum = parseFloat(data.weight.toString());
			const heightNum = parseFloat(data.height.toString()) / 100; // Convert cm to m
			const bmi = weightNum / (heightNum * heightNum);
			data.bmi = bmi.toFixed(1);
		}

		const result = await db
			.update(vitalSigns)
			.set({ ...data, updatedAt: new Date() })
			.where(eq(vitalSigns.id, id))
			.returning();
		
		return result[0];
	}
}

export class PrescriptionsRepository {
	async findByConsultationId(consultationId: string) {
		return await db
			.select()
			.from(prescriptions)
			.where(eq(prescriptions.consultationId, consultationId))
			.orderBy(prescriptions.createdAt);
	}

	async create(data: Omit<NewPrescription, 'id' | 'createdAt' | 'updatedAt'>): Promise<Prescription> {
		const result = await db
			.insert(prescriptions)
			.values(data)
			.returning();
		
		return result[0];
	}

	async update(id: string, data: Partial<NewPrescription>): Promise<Prescription> {
		const result = await db
			.update(prescriptions)
			.set({ ...data, updatedAt: new Date() })
			.where(eq(prescriptions.id, id))
			.returning();
		
		return result[0];
	}

	async delete(id: string): Promise<void> {
		await db.delete(prescriptions).where(eq(prescriptions.id, id));
	}

	async completePrescription(id: string): Promise<Prescription> {
		const result = await db
			.update(prescriptions)
			.set({ 
				status: 'completed',
				updatedAt: new Date()
			})
			.where(eq(prescriptions.id, id))
			.returning();
		
		return result[0];
	}
}
