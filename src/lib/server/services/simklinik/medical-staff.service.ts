import type { NewMedicalStaff, MedicalStaff } from '$lib/db/schema';
import { MedicalStaffRepository } from '$lib/server/repositories/simklinik/medical-staff.repository';

export class MedicalStaffService {
	private medicalStaffRepository: MedicalStaffRepository;

	constructor() {
		this.medicalStaffRepository = new MedicalStaffRepository();
	}

	async getAllStaff(search?: string, role?: string, page = 1, limit = 20) {
		const offset = (page - 1) * limit;
		return await this.medicalStaffRepository.findAll(search, role, limit, offset);
	}

	async getStaffById(id: string) {
		return await this.medicalStaffRepository.findById(id);
	}

	async getStaffByNip(nip: string): Promise<MedicalStaff | null> {
		return await this.medicalStaffRepository.findByNip(nip);
	}

	async getStaffByUserId(userId: string): Promise<MedicalStaff | null> {
		return await this.medicalStaffRepository.findByUserId(userId);
	}

	async createStaff(data: Omit<NewMedicalStaff, 'id' | 'createdAt' | 'updatedAt'>): Promise<MedicalStaff> {
		// Validate required fields
		if (!data.name || !data.role || !data.nip) {
			throw new Error('Name, role, and NIP are required');
		}

		// Check if NIP already exists
		const existingStaff = await this.medicalStaffRepository.findByNip(data.nip);
		if (existingStaff) {
			throw new Error('NIP already exists');
		}

		return await this.medicalStaffRepository.create(data);
	}

	async updateStaff(id: string, data: Partial<NewMedicalStaff>): Promise<MedicalStaff> {
		const existingStaff = await this.getStaffById(id);
		if (!existingStaff) {
			throw new Error('Medical staff not found');
		}

		// If NIP is being updated, check if it already exists
		if (data.nip && data.nip !== existingStaff.nip) {
			const existingNip = await this.medicalStaffRepository.findByNip(data.nip);
			if (existingNip) {
				throw new Error('NIP already exists');
			}
		}

		return await this.medicalStaffRepository.update(id, data);
	}

	async deleteStaff(id: string): Promise<void> {
		const existingStaff = await this.getStaffById(id);
		if (!existingStaff) {
			throw new Error('Medical staff not found');
		}

		// Check if staff has any appointments or consultations
		// This would be implemented when we add those tables
		// For now, we'll allow deletion

		await this.medicalStaffRepository.delete(id);
	}

	async getStaffCount(search?: string, role?: string): Promise<number> {
		return await this.medicalStaffRepository.count(search, role);
	}

	async searchStaff(query: string, role?: string, limit = 10) {
		return await this.medicalStaffRepository.findAll(query, role, limit, 0);
	}

	async getDoctorsBySpecialization(specialization: string) {
		return await this.medicalStaffRepository.findAll(undefined, 'doctor', 50, 0);
	}
}
