import type { NewMedicalService, MedicalService, NewMedicalServiceCategory, MedicalServiceCategory } from '$lib/db/schema';
import { MedicalServicesRepository } from '$lib/server/repositories/simklinik/medical-services.repository';

export class MedicalServicesService {
	private medicalServicesRepository: MedicalServicesRepository;

	constructor() {
		this.medicalServicesRepository = new MedicalServicesRepository();
	}

	async getAllServices(search?: string, categoryId?: string, page = 1, limit = 20) {
		const offset = (page - 1) * limit;
		return await this.medicalServicesRepository.findAll(search, categoryId, limit, offset);
	}

	async getAllCategories() {
		return await this.medicalServicesRepository.findAllCategories();
	}

	async getServiceById(id: string) {
		return await this.medicalServicesRepository.findById(id);
	}

	async getServiceByCode(code: string): Promise<MedicalService | null> {
		return await this.medicalServicesRepository.findByCode(code);
	}

	async createService(data: Omit<NewMedicalService, 'id' | 'createdAt' | 'updatedAt'>): Promise<MedicalService> {
		// Validate required fields
		if (!data.name || !data.code) {
			throw new Error('Name and code are required');
		}

		// Check if code already exists
		const existingService = await this.medicalServicesRepository.findByCode(data.code);
		if (existingService) {
			throw new Error('Service code already exists');
		}

		// Validate price
		if (data.price !== undefined && Number(data.price) < 0) {
			throw new Error('Price cannot be negative');
		}

		// Validate duration
		if (data.duration !== undefined && data.duration !== null && data.duration <= 0) {
			throw new Error('Duration must be greater than 0');
		}

		return await this.medicalServicesRepository.createService(data);
	}

	async createCategory(data: Omit<NewMedicalServiceCategory, 'id' | 'createdAt' | 'updatedAt'>): Promise<MedicalServiceCategory> {
		// Validate required fields
		if (!data.name) {
			throw new Error('Category name is required');
		}

		return await this.medicalServicesRepository.createCategory(data);
	}

	async updateService(id: string, data: Partial<NewMedicalService>): Promise<MedicalService> {
		const existingService = await this.getServiceById(id);
		if (!existingService) {
			throw new Error('Medical service not found');
		}

		// If code is being updated, check if it already exists
		if (data.code && data.code !== existingService.code) {
			const existingCode = await this.medicalServicesRepository.findByCode(data.code);
			if (existingCode) {
				throw new Error('Service code already exists');
			}
		}

		// Validate price
		if (data.price !== undefined && Number(data.price) < 0) {
			throw new Error('Price cannot be negative');
		}

		// Validate duration
		if (data.duration !== undefined && data.duration !== null && data.duration <= 0) {
			throw new Error('Duration must be greater than 0');
		}

		return await this.medicalServicesRepository.updateService(id, data);
	}

	async deleteService(id: string): Promise<void> {
		const existingService = await this.getServiceById(id);
		if (!existingService) {
			throw new Error('Medical service not found');
		}

		// Check if service is used in any appointments
		// This would be implemented when we add appointments table
		// For now, we'll allow deletion

		await this.medicalServicesRepository.deleteService(id);
	}

	async getServiceCount(search?: string, categoryId?: string): Promise<number> {
		return await this.medicalServicesRepository.count(search, categoryId);
	}

	async searchServices(query: string, categoryId?: string, limit = 10) {
		return await this.medicalServicesRepository.searchServices(query, categoryId, limit);
	}
}
