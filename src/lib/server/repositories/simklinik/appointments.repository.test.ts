import { describe, it, expect, vi, beforeEach } from 'vitest';
import { db } from '$lib/server/db';
import { appointments, type NewAppointment } from '$lib/db/schema';
import { AppointmentsRepository } from '$lib/server/repositories/simklinik/appointments.repository';

// Mock database and schema
vi.mock('$lib/server/db', () => ({
	db: {
		select: vi.fn(),
		insert: vi.fn(),
		update: vi.fn(),
		delete: vi.fn()
	}
}));

vi.mock('$lib/db/schema', () => ({
	appointments: {
		id: 'id',
		patientId: 'patientId',
		staffId: 'staffId',
		serviceId: 'serviceId',
		appointmentDate: 'appointmentDate',
		appointmentTime: 'appointmentTime',
		duration: 'duration',
		type: 'type',
		status: 'status',
		notes: 'notes',
		reason: 'reason',
		createdAt: 'createdAt',
		updatedAt: 'updatedAt'
	},
	patients: {
		id: 'id',
		name: 'name',
		mrNumber: 'mrNumber'
	},
	medicalStaff: {
		id: 'id',
		name: 'name',
		role: 'role'
	},
	medicalServices: {
		id: 'id',
		name: 'name',
		price: 'price'
	},
	eq: vi.fn(),
	ilike: vi.fn(),
	and: vi.fn(),
	between: vi.fn(),
	desc: vi.fn(),
	pgTable: vi.fn(),
	uuid: vi.fn(),
	text: vi.fn(),
	numeric: vi.fn(),
	integer: vi.fn(),
	date: vi.fn(),
	timestamp: vi.fn(),
	notNull: vi.fn(),
	default: vi.fn(),
	patientStatusEnum: vi.fn(),
	appointmentTypeEnum: vi.fn(),
	appointmentStatusEnum: vi.fn()
}));

describe('AppointmentsRepository', () => {
	let repository: AppointmentsRepository;
	let mockDb: any;
	let mockAppointments: any;

	beforeEach(() => {
		vi.clearAllMocks();
		repository = new AppointmentsRepository();
		mockDb = vi.mocked(db);
		mockAppointments = vi.mocked(appointments);

		const mockQuery = {
			from: vi.fn().mockReturnThis(),
			leftJoin: vi.fn().mockReturnThis(),
			where: vi.fn().mockReturnThis(),
			orderBy: vi.fn().mockReturnThis(),
			limit: vi.fn().mockReturnThis(),
			offset: vi.fn().mockReturnThis(),
			groupBy: vi.fn().mockReturnThis()
		};

		mockDb.select = vi.fn().mockReturnValue(mockQuery);
	});

	describe('findAll', () => {
		it('should find appointments with filters', async () => {
			const mockAppointmentData = [
				{
					appointment: {
						id: '1',
						appointmentDate: '2024-01-01',
						appointmentTime: '09:00',
						status: 'scheduled'
					},
					patient: { name: 'John Doe', mrNumber: 'MR20240001' },
					staff: { name: 'Dr. Smith', role: 'doctor' },
					service: { name: 'General Consultation', price: '100000' }
				}
			];

			mockDb.select().from().leftJoin().leftJoin().leftJoin()
				.where().orderBy().limit().offset().mockResolvedValue(mockAppointmentData);

			const result = await repository.findAll({
				patientId: 'patient-1',
				staffId: 'staff-1',
				status: 'scheduled'
			}, 20, 0);

			expect(Array.isArray(result)).toBe(true);
			expect(result).toEqual(mockAppointmentData);
		});

		it('should find today appointments', async () => {
			const mockAppointmentData = [
				{
					appointment: { id: '1', status: 'confirmed' },
					patient: { name: 'Jane Doe' },
					staff: { name: 'Dr. Brown' },
					service: { name: 'Check-up', price: '50000' }
				}
			];

			mockDb.select().from().leftJoin().leftJoin().leftJoin()
				.where().orderBy().limit().mockResolvedValue(mockAppointmentData);

			const result = await repository.getTodayAppointments();

			expect(result).toEqual(mockAppointmentData);
		});
	});

	describe('findById', () => {
		it('should find appointment by ID with related data', async () => {
			const mockAppointmentData = {
				appointment: {
					id: '1',
					patientId: 'patient-1',
					staffId: 'staff-1',
					status: 'scheduled'
				},
				patient: { name: 'John Doe', mrNumber: 'MR20240001' },
				staff: { name: 'Dr. Smith', role: 'doctor' },
				service: { name: 'General Consultation' }
			};

			mockDb.select().from().leftJoin().leftJoin().leftJoin()
				.where().limit().mockResolvedValue([mockAppointmentData]);

			const result = await repository.findById('1');

			expect(result).toEqual(mockAppointmentData);
		});

		it('should return null when appointment not found', async () => {
			mockDb.select().from().leftJoin().leftJoin().leftJoin()
				.where().limit().mockResolvedValue([]);

			const result = await repository.findById('nonexistent');

			expect(result).toBeNull();
		});
	});

	describe('create', () => {
		it('should create new appointment successfully', async () => {
			const newAppointmentData: Omit<NewAppointment, 'id' | 'createdAt' | 'updatedAt'> = {
				patientId: 'patient-1',
				staffId: 'staff-1',
				serviceId: 'service-1',
				appointmentDate: '2024-01-01',
				appointmentTime: '09:00',
				duration: 60,
				type: 'consultation',
				status: 'scheduled'
			};

			const createdAppointment = { 
				id: '1', 
				...newAppointmentData 
			};

			mockDb.insert().returning().mockResolvedValue([createdAppointment]);

			const result = await repository.create(newAppointmentData);

			expect(result).toEqual(createdAppointment);
			expect(mockDb.insert).toHaveBeenCalledWith(appointments);
		});
	});

	describe('update', () => {
		it('should update appointment successfully', async () => {
			const updateData: Partial<NewAppointment> = { 
				status: 'confirmed',
				notes: 'Patient confirmed appointment'
			};

			const updatedAppointment = { 
				id: '1', 
				...updateData,
				updatedAt: new Date()
			};

			mockDb.update().returning().mockResolvedValue([updatedAppointment]);

			const result = await repository.update('1', updateData);

			expect(result).toEqual(updatedAppointment);
		});
	});

	describe('delete', () => {
		it('should delete appointment successfully', async () => {
			await repository.delete('1');

			expect(mockDb.delete).toHaveBeenCalledWith(appointments);
			expect(mockDb.delete().where).toHaveBeenCalled();
		});
	});

	describe('getAvailableSlots', () => {
		it('should return available time slots for a staff and date', async () => {
			const result = await repository.getAvailableSlots('staff-1', '2024-01-01');

			expect(Array.isArray(result)).toBe(true);
			expect(result.length).toBeGreaterThan(0);
			result.forEach(slot => {
				expect(typeof slot).toBe('string');
				expect(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(slot)).toBe(true);
			});
		});
	});

	describe('count', () => {
		it('should return appointment count with filters', async () => {
			const mockCount = [{ id: '1' }, { id: '2' }];

			mockDb.select().where().mockResolvedValue(mockCount);

			const result = await repository.count({
				patientId: 'patient-1',
				staffId: 'staff-1',
				status: 'scheduled'
			});

			expect(result).toBe(2);
		});

		it('should count all appointments when no filters provided', async () => {
			const mockCount = [{ id: '1' }, { id: '2' }, { id: '3' }];

			mockDb.select().mockResolvedValue(mockCount);

			const result = await repository.count();

			expect(result).toBe(3);
		});
	});

	describe('getPatientAppointments', () => {
		it('should get appointments for a specific patient', async () => {
			const mockAppointmentData = [
				{
					appointment: { id: '1', patientId: 'patient-1' },
					patient: { name: 'John Doe' },
					staff: { name: 'Dr. Smith' },
					service: { name: 'Consultation' }
				}
			];

			mockDb.select().from().leftJoin().leftJoin().leftJoin()
				.where().orderBy().limit().offset().mockResolvedValue(mockAppointmentData);

			const result = await repository.getPatientAppointments('patient-1');

			expect(result).toEqual(mockAppointmentData);
		});
	});

	describe('getStaffAppointments', () => {
		it('should get appointments for a specific staff', async () => {
			const mockAppointmentData = [
				{
					appointment: { id: '1', staffId: 'staff-1' },
					patient: { name: 'Jane Doe' },
					staff: { name: 'Dr. Smith' },
					service: { name: 'Check-up' }
				}
			];

			mockDb.select().from().leftJoin().leftJoin().leftJoin()
				.where().orderBy().limit().offset().mockResolvedValue(mockAppointmentData);

			const result = await repository.getStaffAppointments('staff-1');

			expect(result).toEqual(mockAppointmentData);
		});
	});
});
