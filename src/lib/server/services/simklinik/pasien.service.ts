import type { NewPatient, Patient } from '$lib/db/schema';
import { PasienRepository } from '$lib/server/repositories/simklinik/pasien.repository';

export class PasienService {
	private pasienRepository: PasienRepository;

	constructor() {
		this.pasienRepository = new PasienRepository();
	}

	async getAllPatients(search?: string, page = 1, limit = 20) {
		const offset = (page - 1) * limit;
		return await this.pasienRepository.findAll(search, limit, offset);
	}

	async getPatientById(id: string): Promise<Patient | null> {
		return await this.pasienRepository.findById(id);
	}

	async getPatientByMrNumber(mrNumber: string): Promise<Patient | null> {
		return await this.pasienRepository.findByMrNumber(mrNumber);
	}

	async createPatient(data: Omit<NewPatient, 'mrNumber' | 'id' | 'createdAt' | 'updatedAt'>): Promise<Patient> {
		// Validate required fields
		if (!data.name || !data.dateOfBirth || !data.gender) {
			throw new Error('Name, date of birth, and gender are required');
		}

		// Validate date of birth
		const birthDate = new Date(data.dateOfBirth);
		if (birthDate > new Date()) {
			throw new Error('Date of birth cannot be in the future');
		}

		// Calculate age for validation
		const today = new Date();
		let age = today.getFullYear() - birthDate.getFullYear();
		const monthDiff = today.getMonth() - birthDate.getMonth();
		if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
			age--;
		}

		if (age > 150) {
			throw new Error('Invalid date of birth');
		}

		return await this.pasienRepository.create(data);
	}

	async updatePatient(id: string, data: Partial<NewPatient>): Promise<Patient> {
		const existingPatient = await this.getPatientById(id);
		if (!existingPatient) {
			throw new Error('Patient not found');
		}

		// Validate date of birth if provided
		if (data.dateOfBirth) {
			const birthDate = new Date(data.dateOfBirth);
			if (birthDate > new Date()) {
				throw new Error('Date of birth cannot be in the future');
			}

			// Calculate age for validation
			const today = new Date();
			let age = today.getFullYear() - birthDate.getFullYear();
			const monthDiff = today.getMonth() - birthDate.getMonth();
			if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
				age--;
			}

			if (age > 150) {
				throw new Error('Invalid date of birth');
			}
		}

		return await this.pasienRepository.update(id, data);
	}

	async deletePatient(id: string): Promise<void> {
		const existingPatient = await this.getPatientById(id);
		if (!existingPatient) {
			throw new Error('Patient not found');
		}

		// Check if patient has any consultations or appointments
		// This would be implemented when we add those tables
		// For now, we'll allow deletion

		await this.pasienRepository.delete(id);
	}

	async getPatientCount(search?: string): Promise<number> {
		return await this.pasienRepository.count(search);
	}

	async searchPatients(query: string, limit = 10): Promise<Patient[]> {
		return await this.pasienRepository.findAll(query, limit, 0);
	}
}
