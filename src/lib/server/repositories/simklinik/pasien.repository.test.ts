import { describe, it, expect, vi, beforeEach } from 'vitest';
import { db } from '$lib/server/db';
import { patients, type NewPatient } from '$lib/db/schema';
import { PasienRepository } from '$lib/server/repositories/simklinik/pasien.repository';

// Mock the database
vi.mock('$lib/server/db', () => ({
	db: {
		select: vi.fn(),
		insert: vi.fn(),
		update: vi.fn(),
		delete: vi.fn()
	}
}));

// Mock the schema
vi.mock('$lib/db/schema', () => ({
	patients: {
		id: 'id',
		mrNumber: 'mrNumber',
		name: 'name',
		dateOfBirth: 'dateOfBirth',
		gender: 'gender',
		phone: 'phone',
		email: 'email',
		address: 'address',
		bloodType: 'bloodType',
		allergies: 'allergies',
		emergencyContact: 'emergencyContact',
		insuranceId: 'insuranceId',
		status: 'status',
		notes: 'notes',
		createdAt: 'createdAt',
		updatedAt: 'updatedAt'
	},
	eq: vi.fn(),
	ilike: vi.fn(),
	and: vi.fn(),
	desc: vi.fn(),
	index: vi.fn(),
	pgTable: vi.fn(),
	uuid: vi.fn(),
	text: vi.fn(),
	date: vi.fn(),
	timestamp: vi.fn(),
	notNull: vi.fn(),
	default: vi.fn(),
	unique: vi.fn(),
	defaultNow: vi.fn(),
	genderEnum: vi.fn(),
	pasienStatusEnum: vi.fn(),
	bloodTypeEnum: vi.fn(),
	jsonb: vi.fn()
}));

describe('PasienRepository', () => {
	let pasienRepository: PasienRepository;
	let mockDb: any;
	let mockPatients: any;

	beforeEach(() => {
		vi.clearAllMocks();
		pasienRepository = new PasienRepository();
		mockDb = vi.mocked(db);
		mockPatients = vi.mocked(patients);

		// Setup default mock responses
		const mockQuery = {
			where: vi.fn().mockReturnThis(),
			orderBy: vi.fn().mockReturnThis(),
			limit: vi.fn().mockReturnThis(),
			offset: vi.fn().mockReturnThis()
		};

		mockDb.select = vi.fn().mockReturnValue(mockQuery);
		mockDb.insert = vi.fn().mockReturnValue(mockQuery);
		mockDb.update = vi.fn().mockReturnValue(mockQuery);
		mockDb.delete = vi.fn().mockReturnValue(mockQuery);
	});

	describe('findAll', () => {
		it('should return all patients without search', async () => {
			const mockPatients = [
				{ id: '1', name: 'John Doe', mrNumber: 'MR20240001' },
				{ id: '2', name: 'Jane Smith', mrNumber: 'MR20240002' }
			];

			mockDb.select().orderBy().limit().offset().mockResolvedValue(mockPatients);

			const result = await pasienRepository.findAll();

			expect(mockDb.select).toHaveBeenCalledWith(patients);
			expect(result).toEqual(mockPatients);
		});

		it('should return filtered patients with search', async () => {
			const mockPatients = [{ id: '1', name: 'John Doe', mrNumber: 'MR20240001' }];
			const search = 'John';

			mockDb.select().orderBy().limit().offset().mockResolvedValue(mockPatients);

			const result = await pasienRepository.findAll(search);

			const mockWhere = mockDb.select().orderBy().limit().offset().where;
			expect(mockWhere).toHaveBeenCalledWith(
				expect.objectContaining({ pattern: `%${search}%`, field: 'name' })
			);
			expect(result).toEqual(mockPatients);
		});

		it('should apply pagination', async () => {
			const mockPatients = [{ id: '1', name: 'John Doe', mrNumber: 'MR20240001' }];

			mockDb.select().orderBy().limit().offset().mockResolvedValue(mockPatients);

			await pasienRepository.findAll('test', 20, 10);

			expect(mockDb.select().orderBy().limit).toHaveBeenCalledWith(20);
			expect(mockDb.select().orderBy().limit().offset).toHaveBeenCalledWith(10);
		});
	});

	describe('findById', () => {
		it('should return patient by ID', async () => {
			const mockPatient = { id: '1', name: 'John Doe', mrNumber: 'MR20240001' };

			mockDb.select().orderBy().limit().mockResolvedValue([mockPatient]);

			const result = await pasienRepository.findById('1');

			expect(result).toEqual(mockPatient);
			expect(mockDb.select().orderBy().limit).toHaveBeenCalledWith(1);
		});

		it('should return null when patient not found', async () => {
			mockDb.select().orderBy().limit().mockResolvedValue([]);

			const result = await pasienRepository.findById('nonexistent');

			expect(result).toBeNull();
		});
	});

	describe('findByMrNumber', () => {
		it('should return patient by MR number', async () => {
			const mockPatient = { id: '1', name: 'John Doe', mrNumber: 'MR20240001' };

			mockDb.select().limit().mockResolvedValue([mockPatient]);

			const result = await pasienRepository.findByMrNumber('MR20240001');

			expect(result).toEqual(mockPatient);
		});
	});

	describe('create', () => {
		it('should create new patient successfully', async () => {
			const newPatientData: Omit<NewPatient, 'mrNumber' | 'id' | 'createdAt' | 'updatedAt'> = {
				name: 'John Doe',
				dateOfBirth: '1990-01-01',
				gender: 'male',
				phone: '1234567890',
				email: 'john@example.com',
				address: '123 Main St',
				bloodType: 'A_positive',
				allergies: 'None',
				emergencyContact: { name: 'Jane Doe', phone: '0987654321' },
				insuranceId: 'INS123',
				status: 'aktif',
				notes: 'Regular patient'
			};

			const createdPatient = { id: '1', ...newPatientData, mrNumber: 'MR20240001' };

			mockDb.insert().returning().mockResolvedValue([createdPatient]);

			const result = await pasienRepository.create(newPatientData);

			expect(result).toEqual(createdPatient);
			expect(mockDb.insert).toHaveBeenCalledWith(patients);
			expect(mockDb.insert().returning).toHaveBeenCalled();
		});
	});

	describe('update', () => {
		it('should update patient successfully', async () => {
			const updateData = { name: 'John Updated', phone: '9999999999' };
			const updatedPatient = { 
				id: '1', 
				name: 'John Updated', 
				phone: '9999999999',
				updatedAt: new Date()
			};

			mockDb.update().returning().mockResolvedValue([updatedPatient]);

			const result = await pasienRepository.update('1', updateData);

			expect(result).toEqual(updatedPatient);
			expect(mockDb.update).toHaveBeenCalledWith(patients);
		});
	});

	describe('delete', () => {
		it('should delete patient successfully', async () => {
			await pasienRepository.delete('1');

			expect(mockDb.delete).toHaveBeenCalledWith(patients);
			expect(mockDb.delete().where).toHaveBeenCalled();
		});
	});

	describe('count', () => {
		it('should return patient count', async () => {
			const mockCount = [{ id: '1' }, { id: '2' }];

			mockDb.select().mockResolvedValue(mockCount);

			const result = await pasienRepository.count();

			expect(result).toBe(2);
		});

		it('should count filtered patients with search', async () => {
			const search = 'John';
			const mockCount = [{ id: '1' }];

			mockDb.select().where().mockResolvedValue(mockCount);

			await pasienRepository.count(search);

			expect(mockDb.select().where).toHaveBeenCalledWith(
				expect.objectContaining({ pattern: `%${search}%`, field: 'name' })
			);
		});
	});
});
