import { eq } from 'drizzle-orm';

import {
	vitalSigns,
	type NewConsultation,
	type Consultation,
	type NewVitalSign,
	type VitalSign,
	type NewPrescription,
	type Prescription
} from '$lib/db/schema';
import { db } from '$lib/server/db';
import {
	ConsultationsRepository,
	VitalSignsRepository,
	PrescriptionsRepository
} from '$lib/server/repositories/simklinik/consultations.repository';

type ConsultationFilterInput = {
	patientId?: string;
	staffId?: string;
	status?: string;
	dateFrom?: string;
	dateTo?: string;
	admissionId?: string;
	isInpatient?: boolean;
};

type VitalMeasurementsInput = {
	systolic?: number;
	diastolic?: number;
	heartRate?: number;
	respiratoryRate?: number;
	temperature?: number;
	oxygenSaturation?: number;
	weight?: number;
	height?: number;
};

export class ConsultationsService {
	private consultationsRepository: ConsultationsRepository;
	private vitalSignsRepository: VitalSignsRepository;
	private prescriptionsRepository: PrescriptionsRepository;

	constructor() {
		this.consultationsRepository = new ConsultationsRepository();
		this.vitalSignsRepository = new VitalSignsRepository();
		this.prescriptionsRepository = new PrescriptionsRepository();
	}

	async getAllConsultations(filters?: ConsultationFilterInput, page = 1, limit = 20) {
		const offset = (page - 1) * limit;
		const normalizedFilters = this.normalizeFilters(filters);
		return await this.consultationsRepository.findAll(normalizedFilters, limit, offset);
	}

	async getConsultationById(id: string) {
		return await this.consultationsRepository.findById(id);
	}

	async getPatientConsultations(patientId: string, limit = 50) {
		return await this.consultationsRepository.getPatientConsultations(patientId, limit);
	}

	async getStaffConsultations(staffId: string, limit = 50) {
		return await this.consultationsRepository.getStaffConsultations(staffId, limit);
	}

	async startConsultation(params: {
		appointmentId?: string;
		admissionId?: string;
		staffId: string;
		patientId: string;
	}): Promise<Consultation> {
		const { appointmentId, admissionId, staffId, patientId } = params;

		if (!patientId || !staffId) {
			throw new Error('Staff ID and patient ID are required');
		}

		if (!appointmentId && !admissionId) {
			throw new Error('Either appointment ID or admission ID is required');
		}

		const consultationData: Omit<NewConsultation, 'id' | 'startTime' | 'createdAt' | 'updatedAt'> = {
			appointmentId: appointmentId || null,
			admissionId: admissionId || null,
			patientId,
			staffId,
			status: 'ongoing'
		};

		const consultation = await this.consultationsRepository.create(consultationData);

		await this.vitalSignsRepository.create({
			consultationId: consultation.id,
			patientId
		});

		return consultation;
	}

	async endConsultation(id: string, data: {
		diagnosis?: string;
		treatment?: string;
		notes?: string;
	}): Promise<Consultation> {
		const existingConsultation = await this.getConsultationById(id);
		if (!existingConsultation) {
			throw new Error('Consultation not found');
		}

		if (existingConsultation.consultation.status !== 'ongoing') {
			throw new Error('Only ongoing consultations can be ended');
		}

		// Update consultation with clinical data
		await this.consultationsRepository.update(id, data);

		// End the consultation
		return await this.consultationsRepository.endConsultation(id);
	}

	async updateConsultation(id: string, data: Partial<NewConsultation>): Promise<Consultation> {
		const existingConsultation = await this.getConsultationById(id);
		if (!existingConsultation) {
			throw new Error('Consultation not found');
		}

		return await this.consultationsRepository.update(id, data);
	}

	async cancelConsultation(id: string): Promise<Consultation> {
		const existingConsultation = await this.getConsultationById(id);
		if (!existingConsultation) {
			throw new Error('Consultation not found');
		}

		return await this.consultationsRepository.update(id, { status: 'cancelled' });
	}

	async deleteConsultation(id: string): Promise<void> {
		const existingConsultation = await this.getConsultationById(id);
		if (!existingConsultation) {
			throw new Error('Consultation not found');
		}
		
		// Note: This might fail if there are related records (vitals, prescriptions) 
		// without cascade delete. Ideally we should delete those first or rely on DB cascade.
		// For now assuming DB cascade or manual cleanup if needed, but let's try simple delete.
		await this.consultationsRepository.delete(id);
	}

	async recordVitalSigns(
		consultationId: string,
		patientId: string,
		vitals: VitalMeasurementsInput
	): Promise<VitalSign> {
		const existingConsultation = await this.getConsultationById(consultationId);
		if (!existingConsultation) {
			throw new Error('Consultation not found');
		}

		if (existingConsultation.consultation.status !== 'ongoing') {
			throw new Error('Vital signs can only be recorded for ongoing consultations');
		}

		// Check if vital signs already exist for this consultation
		const existingVitals = await this.vitalSignsRepository.findByConsultationId(consultationId);

		const measurements = this.formatVitalMeasurements(vitals);

		if (existingVitals) {
			// Update existing vital signs
			const updatedData = { ...measurements, consultationId, patientId };
			return await this.vitalSignsRepository.update(existingVitals.id, updatedData);
		} else {
			// Create new vital signs record
			return await this.vitalSignsRepository.create({
				consultationId,
				patientId,
				...measurements
			});
		}
	}

	async addPrescription(consultationId: string, patientId: string, staffId: string, data: {
		medication: string;
		dosage: string;
		frequency: string;
		duration: string;
		instructions?: string;
	}): Promise<Prescription> {
		const existingConsultation = await this.getConsultationById(consultationId);
		if (!existingConsultation) {
			throw new Error('Consultation not found');
		}

		if (existingConsultation.consultation.status !== 'ongoing') {
			throw new Error('Prescriptions can only be added to ongoing consultations');
		}

		const prescriptionData = {
			consultationId,
			patientId,
			staffId,
			...data
		};

		return await this.prescriptionsRepository.create(prescriptionData);
	}

	async updatePrescription(id: string, data: Partial<NewPrescription>): Promise<Prescription> {
		const existingPrescription = await this.prescriptionsRepository.update(id, data);
		return existingPrescription;
	}

	async deletePrescription(id: string): Promise<void> {
		await this.prescriptionsRepository.delete(id);
	}

	async completePrescription(id: string): Promise<Prescription> {
		return await this.prescriptionsRepository.completePrescription(id);
	}

	async getPrescriptions(consultationId: string): Promise<Prescription[]> {
		return await this.prescriptionsRepository.findByConsultationId(consultationId);
	}

	async getVitalSigns(consultationId: string): Promise<VitalSign | null> {
		return await this.vitalSignsRepository.findByConsultationId(consultationId);
	}

	async getConsultationCount(filters?: ConsultationFilterInput): Promise<number> {
		const normalizedFilters = this.normalizeFilters(filters);
		return await this.consultationsRepository.count(normalizedFilters);
	}

	private normalizeStatus(status?: string): Consultation['status'] | undefined {
		if (!status) return undefined;
		const allowed: Consultation['status'][] = ['completed', 'cancelled', 'ongoing'];
		return allowed.includes(status as Consultation['status']) ? (status as Consultation['status']) : undefined;
	}

	private normalizeFilters(filters?: ConsultationFilterInput) {
		if (!filters) return undefined;
		const { status, ...rest } = filters;
		const normalizedStatus = this.normalizeStatus(status);
		return { ...rest, status: normalizedStatus };
	}

	private formatVitalMeasurements(
		vitals: VitalMeasurementsInput
	): Omit<NewVitalSign, 'id' | 'consultationId' | 'patientId' | 'createdAt' | 'updatedAt'> {
		return {
			systolic: vitals.systolic,
			diastolic: vitals.diastolic,
			heartRate: vitals.heartRate,
			respiratoryRate: vitals.respiratoryRate,
			temperature: vitals.temperature !== undefined ? vitals.temperature.toString() : undefined,
			oxygenSaturation: vitals.oxygenSaturation,
			weight: vitals.weight !== undefined ? vitals.weight.toString() : undefined,
			height: vitals.height !== undefined ? vitals.height.toString() : undefined
		};
	}
}
