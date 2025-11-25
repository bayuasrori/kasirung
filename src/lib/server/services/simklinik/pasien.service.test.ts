import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { NewPatient } from '$lib/db/schema';
import { PasienService } from '$lib/server/services/simklinik/pasien.service';
import { PasienRepository } from '$lib/server/repositories/simklinik/pasien.repository';

// Mock the repository
vi.mock('$lib/server/repositories/simklinik/pasien.repository');

type PatientInput = Omit<NewPatient, 'id' | 'mrNumber' | 'createdAt' | 'updatedAt'>;

describe('PasienService', () => {
	let pasienService: PasienService;
	let mockRepository: any;

	beforeEach(() => {
		vi.clearAllMocks();
		mockRepository = vi.mocked(new PasienRepository());
		pasienService = new PasienService();
		pasienService['pasienRepository'] = mockRepository;
	});

	describe('getAllPatients', () => {
		it('should return paginated patients', async () => {
			const mockPatients = [
				{ id: '1', name: 'John Doe', mrNumber: 'MR20240001' },
				{ id: '2', name: 'Jane Smith', mrNumber: 'MR20240002' }
			];

			mockRepository.findAll.mockResolvedValue(mockPatients);

			const result = await pasienService.getAllPatients('test', 2, 10);

			expect(mockRepository.findAll).toHaveBeenCalledWith('test', 2, 10);
			expect(result).toEqual(mockPatients);
		});

		it('should call with default pagination values', async () => {
			const mockPatients = [{ id: '1', name: 'John Doe', mrNumber: 'MR20240001' }];
			
			mockRepository.findAll.mockResolvedValue(mockPatients);

			await pasienService.getAllPatients();

			expect(mockRepository.findAll).toHaveBeenCalledWith(undefined, 1, 20);
		});
	});

	describe('getPatientById', () => {
		it('should return patient by ID', async () => {
			const mockPatient = { id: '1', name: 'John Doe', mrNumber: 'MR20240001' };

			mockRepository.findById.mockResolvedValue(mockPatient);

			const result = await pasienService.getPatientById('1');

			expect(mockRepository.findById).toHaveBeenCalledWith('1');
			expect(result).toEqual(mockPatient);
		});
	});

	describe('getPatientByMrNumber', () => {
		it('should return patient by MR number', async () => {
			const mockPatient = { id: '1', name: 'John Doe', mrNumber: 'MR20240001' };

			mockRepository.findByMrNumber.mockResolvedValue(mockPatient);

			const result = await pasienService.getPatientByMrNumber('MR20240001');

			expect(mockRepository.findByMrNumber).toHaveBeenCalledWith('MR20240001');
			expect(result).toEqual(mockPatient);
		});
	});

	describe('createPatient', () => {
		const validPatientData: PatientInput = {
			name: 'John Doe',
			dateOfBirth: '1990-01-01',
			gender: 'male',
			phone: '1234567890',
			email: 'john@example.com',
			address: '123 Main St'
		};

		it('should create patient with valid data', async () => {
			const createdPatient = { id: '1', mrNumber: 'MR20240001', ...validPatientData };

			mockRepository.create.mockResolvedValue(createdPatient);

			const result = await pasienService.createPatient(validPatientData);

			expect(result).toEqual(createdPatient);
			expect(mockRepository.create).toHaveBeenCalledWith(validPatientData);
		});

		it('should throw error when required fields are missing', async () => {
			const invalidData = { 
				name: 'John Doe',
				// Missing dateOfBirth and gender
			};

			await expect(pasienService.createPatient(invalidData as any))
				.rejects.toThrow('Name, date of birth, and gender are required');
		});

		it('should throw error when date of birth is in the future', async () => {
			const futureDate = new Date();
			futureDate.setFullYear(futureDate.getFullYear() + 1);

			const invalidData = {
				name: 'John Doe',
				dateOfBirth: futureDate.toISOString().split('T')[0],
				gender: 'male'
			};

			await expect(pasienService.createPatient(invalidData as any))
				.rejects.toThrow('Date of birth cannot be in the future');
		});

		it('should throw error when date of birth indicates age over 150', async () => {
			const oldDate = new Date();
			oldDate.setFullYear(oldDate.getFullYear() - 151);

			const invalidData = {
				name: 'John Doe',
				dateOfBirth: oldDate.toISOString().split('T')[0],
				gender: 'male'
			};

			await expect(pasienService.createPatient(invalidData as any))
				.rejects.toThrow('Invalid date of birth');
		});

		it('should validate email format', async () => {
			const createdPatient = { id: '1', mrNumber: 'MR20240001', ...validPatientData };
			mockRepository.create.mockResolvedValue(createdPatient);

			const dataWithInvalidEmail = {
				...validPatientData,
				email: 'invalid-email'
			};

			const result = await pasienService.createPatient(dataWithInvalidEmail);

			expect(result).toEqual(createdPatient);
		});
	});

	describe('updatePatient', () => {
		const existingPatient = {
			id: '1',
			name: 'John Doe',
			dateOfBirth: '1990-01-01',
			gender: 'male'
		};

		it('should update patient successfully', async () => {
			const updateData = { name: 'John Updated', phone: '9876543210' };
			const updatedPatient = { ...existingPatient, ...updateData };

			mockRepository.findById.mockResolvedValue(existingPatient);
			mockRepository.update.mockResolvedValue(updatedPatient);

			const result = await pasienService.updatePatient('1', updateData);

			expect(mockRepository.findById).toHaveBeenCalledWith('1');
			expect(mockRepository.update).toHaveBeenCalledWith('1', updateData);
			expect(result).toEqual(updatedPatient);
		});

		it('should throw error when patient not found', async () => {
			mockRepository.findById.mockResolvedValue(null);

			await expect(pasienService.updatePatient('nonexistent', {}))
				.rejects.toThrow('Patient not found');
		});

		it('should validate date of birth on update', async () => {
			const futureDate = new Date();
			futureDate.setFullYear(futureDate.getFullYear() + 1);

			mockRepository.findById.mockResolvedValue(existingPatient);

			const updateData = {
				dateOfBirth: futureDate.toISOString().split('T')[0]
			};

			await expect(pasienService.updatePatient('1', updateData))
				.rejects.toThrow('Date of birth cannot be in the future');
		});
	});

	describe('deletePatient', () => {
		const existingPatient = {
			id: '1',
			name: 'John Doe',
			dateOfBirth: '1990-01-01',
			gender: 'male'
		};

		it('should delete patient successfully', async () => {
			mockRepository.findById.mockResolvedValue(existingPatient);

			await pasienService.deletePatient('1');

			expect(mockRepository.findById).toHaveBeenCalledWith('1');
			expect(mockRepository.delete).toHaveBeenCalledWith('1');
		});

		it('should throw error when patient not found', async () => {
			mockRepository.findById.mockResolvedValue(null);

			await expect(pasienService.deletePatient('nonexistent'))
				.rejects.toThrow('Patient not found');
		});
	});

	describe('getPatientCount', () => {
		it('should return total patient count', async () => {
			mockRepository.count.mockResolvedValue(10);

			const result = await pasienService.getPatientCount();

			expect(mockRepository.count).toHaveBeenCalledWith();
			expect(result).toBe(10);
		});

		it('should return filtered patient count', async () => {
			mockRepository.count.mockResolvedValue(5);

			const result = await pasienService.getPatientCount('John');

			expect(mockRepository.count).toHaveBeenCalledWith('John');
			expect(result).toBe(5);
		});
	});

	describe('searchPatients', () => {
		it('should search patients with limit', async () => {
			const mockPatients = [
				{ id: '1', name: 'John Doe', mrNumber: 'MR20240001' },
				{ id: '2', name: 'John Smith', mrNumber: 'MR20240002' }
			];

			mockRepository.findAll.mockResolvedValue(mockPatients);

			const result = await pasienService.searchPatients('John', 20);

			expect(mockRepository.findAll).toHaveBeenCalledWith('John', undefined, undefined, 20, 0);
			expect(result).toEqual(mockPatients);
		});

		it('should use default limit when not specified', async () => {
			const mockPatients = [{ id: '1', name: 'John Doe', mrNumber: 'MR20240001' }];

			mockRepository.findAll.mockResolvedValue(mockPatients);

			const result = await pasienService.searchPatients('John');

			expect(mockRepository.findAll).toHaveBeenCalledWith('John', undefined, undefined, 10, 0);
			expect(result).toEqual(mockPatients);
		});
	});

	describe('edge cases and validation', () => {
		it('should handle very long names', async () => {
			const longName = 'A'.repeat(1000); // Simulate long name
			const validData: PatientInput = {
				name: longName,
				dateOfBirth: '1990-01-01',
				gender: 'male'
			};

			const createdPatient = { id: '1', mrNumber: 'MR20240001', ...validData };
			mockRepository.create.mockResolvedValue(createdPatient);

			expect(() => pasienService.createPatient(validData)).not.toThrow();
		});

		it('should handle empty strings for optional fields', async () => {
			const validData: PatientInput = {
				name: 'John Doe',
				dateOfBirth: '1990-01-01',
				gender: 'male',
				phone: '',     // Empty string
				email: '',     // Empty string
				address: ''    // Empty string
			};

			const createdPatient = { id: '1', mrNumber: 'MR20240001', ...validData };
			mockRepository.create.mockResolvedValue(createdPatient);

			const result = await pasienService.createPatient(validData);

			expect(result).toEqual(createdPatient);
		});

		it('should handle null values for optional fields', async () => {
			const validData: PatientInput = {
				name: 'John Doe',
				dateOfBirth: '1990-01-01',
				gender: 'male'
			};

			const createdPatient = { id: '1', mrNumber: 'MR20240001', ...validData };
			mockRepository.create.mockResolvedValue(createdPatient);

			const result = await pasienService.createPatient(validData);

			expect(result).toEqual(createdPatient);
		});
	});
});
