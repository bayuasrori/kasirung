import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Appointment, NewAppointment } from '$lib/db/schema';
import { AppointmentsService } from '$lib/server/services/simklinik/appointments.service';
import { AppointmentsRepository } from '$lib/server/repositories/simklinik/appointments.repository';

// Mock the repository
vi.mock('$lib/server/repositories/simklinik/appointments.repository');

type AppointmentInput = Omit<NewAppointment, 'id' | 'createdAt' | 'updatedAt'>;

const createAppointmentStub = (overrides: Partial<Appointment> = {}): Appointment => ({
	id: overrides.id ?? '1',
	patientId: overrides.patientId ?? 'patient-1',
	staffId: overrides.staffId ?? 'staff-1',
	serviceId: overrides.serviceId ?? null,
	appointmentDate: overrides.appointmentDate ?? '2024-01-01',
	appointmentTime: overrides.appointmentTime ?? '09:00',
	duration: overrides.duration ?? null,
	type: overrides.type ?? 'consultation',
	status: overrides.status ?? 'scheduled',
	notes: overrides.notes ?? null,
	reason: overrides.reason ?? null,
	createdAt: overrides.createdAt ?? new Date(),
	updatedAt: overrides.updatedAt ?? new Date()
});

describe('AppointmentsService', () => {
	let appointmentsService: AppointmentsService;
	let mockRepository: any;

	beforeEach(() => {
		vi.clearAllMocks();
		mockRepository = vi.mocked(new AppointmentsRepository());
		appointmentsService = new AppointmentsService();
		appointmentsService['appointmentsRepository'] = mockRepository;
	});

	describe('createAppointment', () => {
		const validAppointmentData: AppointmentInput = {
			patientId: 'patient-1',
			staffId: 'staff-1',
			appointmentDate: '2024-01-01',
			appointmentTime: '09:00',
			type: 'consultation',
			serviceId: 'service-1'
		};

		it('should create appointment with valid data', async () => {
			const createdAppointment = createAppointmentStub();

			mockRepository.findByMrNumber.mockResolvedValue(null);
			mockRepository.findAll.mockResolvedValue([]); // No existing bookings
			mockRepository.create.mockResolvedValue(createdAppointment);

			const result = await appointmentsService.createAppointment(validAppointmentData);

			expect(result).toEqual(createdAppointment);
			expect(mockRepository.create).toHaveBeenCalledWith(validAppointmentData);
		});

		it('should throw error when required fields are missing', async () => {
			const invalidData = { 
				patientId: 'patient-1',
				staffId: 'staff-1',
				// Missing date, time, and type
			};

			await expect(appointmentsService.createAppointment(invalidData as any))
				.rejects.toThrow('Patient, staff, date, time, and type are required');
		});

		it('should throw error when appointment date is in the past', async () => {
			const yesterday = new Date();
			yesterday.setDate(yesterday.getDate() - 1);

			const invalidData = {
				patientId: 'patient-1',
				staffId: 'staff-1',
				appointmentDate: yesterday.toISOString().split('T')[0],
				appointmentTime: '09:00',
				type: 'consultation'
			};

			await expect(appointmentsService.createAppointment(invalidData as any))
				.rejects.toThrow('Appointment date cannot be in the past');
		});

		it('should throw error when time format is invalid', async () => {
			const invalidData = {
				patientId: 'patient-1',
				staffId: 'staff-1',
				appointmentDate: '2024-01-01',
				appointmentTime: '25:00', // Invalid time
				type: 'consultation'
			};

			await expect(appointmentsService.createAppointment(invalidData as any))
				.rejects.toThrow('Invalid time format. Use HH:MM format');
		});

		it('should detect time slot conflicts', async () => {
			const conflictingAppointment = createAppointmentStub();

			mockRepository.findAll.mockResolvedValue([conflictingAppointment]);
			mockRepository.create.mockResolvedValue({ id: '1' });

			await expect(appointmentsService.createAppointment(validAppointmentData))
				.rejects.toThrow('Time slot is already booked');
			expect(mockRepository.create).not.toHaveBeenCalled();
		});
	});

	describe('rescheduleAppointment', () => {
		const existingAppointment = createAppointmentStub();

		it('should reschedule appointment successfully', async () => {
			const updatedAppointment = { ...existingAppointment, appointmentDate: '2024-01-02', appointmentTime: '10:00' };

			mockRepository.findById.mockResolvedValue(existingAppointment);
			mockRepository.findAll.mockResolvedValue([]); // No conflicts for new slot
			mockRepository.update.mockResolvedValue(updatedAppointment);

			const result = await appointmentsService.rescheduleAppointment('1', '2024-01-02', '10:00');

			expect(result).toEqual(updatedAppointment);
			expect(mockRepository.update).toHaveBeenCalledWith('1', {
				appointmentDate: '2024-01-02',
				appointmentTime: '10:00'
			});
		});

		it('should throw error when appointment not found', async () => {
			mockRepository.findById.mockResolvedValue(null);

			await expect(appointmentsService.rescheduleAppointment('nonexistent', '2024-01-02', '10:00'))
				.rejects.toThrow('Appointment not found');
		});

		it('should validate new date is not in the past', async () => {
			const yesterday = new Date();
			yesterday.setDate(yesterday.getDate() - 1);

			mockRepository.findById.mockResolvedValue(existingAppointment);

			await expect(appointmentsService.rescheduleAppointment('1', yesterday.toISOString().split('T')[0], '10:00'))
				.rejects.toThrow('Appointment date cannot be in the past');
		});
	});

	describe('cancelAppointment', () => {
		const scheduledAppointment = createAppointmentStub();

		it('should cancel appointment successfully', async () => {
			const cancelledAppointment = { ...scheduledAppointment, status: 'cancelled' };

			mockRepository.findById.mockResolvedValue(scheduledAppointment);
			mockRepository.update.mockResolvedValue(cancelledAppointment);

			const result = await appointmentsService.cancelAppointment('1', 'Patient requested cancellation');

			expect(result).toEqual(cancelledAppointment);
		});

		it('should throw error when appointment not found', async () => {
			mockRepository.findById.mockResolvedValue(null);

			await expect(appointmentsService.cancelAppointment('nonexistent', 'Reason'))
				.rejects.toThrow('Appointment not found');
		});
	});

	describe('confirmAppointment', () => {
		const scheduledAppointment = {
			id: '1',
			patientId: 'patient-1',
			staffId: 'staff-1',
			status: 'scheduled'
		};

		it('should confirm appointment successfully', async () => {
			const confirmedAppointment = { ...scheduledAppointment, status: 'confirmed' };

			mockRepository.findById.mockResolvedValue(scheduledAppointment);
			mockRepository.update.mockResolvedValue(confirmedAppointment);

			const result = await appointmentsService.confirmAppointment('1');

			expect(result).toEqual(confirmedAppointment);
		});

		it('should throw error when appointment is not scheduled', async () => {
			const completedAppointment = { ...scheduledAppointment, status: 'completed' };

			mockRepository.findById.mockResolvedValue(completedAppointment);

			await expect(appointmentsService.confirmAppointment('1'))
				.rejects.toThrow('Only scheduled appointments can be confirmed');
		});
	});

	describe('completeAppointment', () => {
		const confirmedAppointment = {
			id: '1',
			patientId: 'patient-1',
			staffId: 'staff-1',
			status: 'confirmed'
		};

		it('should complete appointment successfully', async () => {
			const completedAppointment = { ...confirmedAppointment, status: 'completed' };

			mockRepository.findById.mockResolvedValue(confirmedAppointment);
			mockRepository.update.mockResolvedValue(completedAppointment);

			const result = await appointmentsService.completeAppointment('1');

			expect(result).toEqual(completedAppointment);
		});

		it('should throw error when appointment is not confirmed', async () => {
			const scheduledAppointment = { ...confirmedAppointment, status: 'scheduled' };

			mockRepository.findById.mockResolvedValue(scheduledAppointment);

			await expect(appointmentsService.completeAppointment('1'))
				.rejects.toThrow('Only confirmed appointments can be completed');
		});
	});

	describe('getAvailableSlots', () => {
		it('should return time slots in correct format', async () => {
			const availableSlots = await appointmentsService.getAvailableSlots('staff-1', '2024-01-01');

			expect(Array.isArray(availableSlots)).toBe(true);
			availableSlots.forEach(slot => {
				expect(typeof slot).toBe('string');
				expect(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(slot)).toBe(true);
			});
		});

		it('should return standard clinic hours', async () => {
			const availableSlots = await appointmentsService.getAvailableSlots('staff-1', '2024-01-01');

			const expectedSlots = [
				'08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
				'11:00', '11:30', '13:00', '13:30', '14:00', '14:30',
				'15:00', '15:30', '16:00', '16:30'
			];

			expect(availableSlots).toEqual(expectedSlots);
		});
	});

	describe('getPatientAppointments', () => {
		it('_should get appointments for patient', async () => {
			const mockAppointments = [
				{
					appointment: { id: '1', patientId: 'patient-1' },
					patient: { name: 'John Doe' }
				}
			];

			mockRepository.getPatientAppointments.mockResolvedValue(mockAppointments);

			const result = await appointmentsService.getPatientAppointments('patient-1');

			expect(mockRepository.getPatientAppointments).toHaveBeenCalledWith('patient-1');
			expect(result).toEqual(mockAppointments);
		});
	});

	describe('getTodayAppointments', () => {
		it('should get today appointments', async () => {
			const mockAppointments = [
				{
					appointment: { id: '1', appointmentDate: new Date().toISOString().split('T')[0] }
				}
			];

			mockRepository.getTodayAppointments.mockResolvedValue(mockAppointments);

			const result = await appointmentsService.getTodayAppointments();

			expect(mockRepository.getTodayAppointments).toHaveBeenCalled();
			expect(result).toEqual(mockAppointments);
		});
	});

	describe('deleteAppointment', () => {
		const completedAppointment = {
			id: '1',
			status: 'completed'
		};

		it('should throw error when trying to delete completed appointment', async () => {
			mockRepository.findById.mockResolvedValue(completedAppointment);

			await expect(appointmentsService.deleteAppointment('1'))
				.rejects.toThrow('Cannot delete completed appointments');
		});

		it('should delete scheduled appointment successfully', async () => {
			const scheduledAppointment = {
				id: '1',
				status: 'scheduled'
			};

			mockRepository.findById.mockResolvedValue(scheduledAppointment);

			await appointmentsService.deleteAppointment('1');

			expect(mockRepository.delete).toHaveBeenCalledWith('1');
		});
	});

	describe('getAppointmentCount', () => {
		it('should return appointment count with filters', async () => {
			mockRepository.count.mockResolvedValue(10);

			const result = await appointmentsService.getAppointmentCount({
				patientId: 'patient-1',
				staffId: 'staff-1',
				status: 'scheduled'
			});

			expect(mockRepository.count).toHaveBeenCalledWith({
				patientId: 'patient-1',
				staffId: 'staff-1',
				status: 'scheduled'
			});
			expect(result).toBe(10);
		});
	});

	describe('edge cases and validation', () => {
		it('should handle various appointment types', async () => {
			const appointmentTypes: AppointmentInput['type'][] = [
				'consultation',
				'checkup',
				'follow_up',
				'emergency',
				'vaccination',
				'procedure'
			];
			
			for (const type of appointmentTypes) {
				const validData: AppointmentInput = {
					patientId: 'patient-1',
					staffId: 'staff-1',
					appointmentDate: '2024-01-01',
					appointmentTime: '09:00',
					type
				};

				const createdAppointment = createAppointmentStub({
					type,
					appointmentDate: validData.appointmentDate,
					appointmentTime: validData.appointmentTime
				});

				mockRepository.findAll.mockResolvedValue([]);
				mockRepository.create.mockResolvedValue(createdAppointment);

				const result = await appointmentsService.createAppointment(validData);

				expect(result).toEqual(createdAppointment);
			}
		});

		it('should handle boundary time values', async () => {
			const edgeCaseTimes = ['00:00', '23:59', '12:30'];
			
			for (const time of edgeCaseTimes) {
				const validData: AppointmentInput = {
					patientId: 'patient-1',
					staffId: 'staff-1',
					appointmentDate: '2024-01-01',
					appointmentTime: time,
					type: 'consultation'
				};

				const createdAppointment = createAppointmentStub({
					appointmentDate: validData.appointmentDate,
					appointmentTime: time
				});

				mockRepository.findAll.mockResolvedValue([]);
				mockRepository.create.mockResolvedValue(createdAppointment);

				const result = await appointmentsService.createAppointment(validData);

				expect(result).toEqual(createdAppointment);
			}
		});

		it('should handle maximum allowed date values', async () => {
			const farFutureDate = new Date();
			farFutureDate.setFullYear(farFutureDate.getFullYear() + 10);

			const validData: AppointmentInput = {
				patientId: 'patient-1',
				staffId: 'staff-1',
				appointmentDate: farFutureDate.toISOString().split('T')[0],
				appointmentTime: '09:00',
				type: 'consultation'
			};

			const createdAppointment = createAppointmentStub({
				appointmentDate: validData.appointmentDate,
				appointmentTime: validData.appointmentTime
			});

			mockRepository.findAll.mockResolvedValue([]);
			mockRepository.create.mockResolvedValue(createdAppointment);

			const result = await appointmentsService.createAppointment(validData);

			expect(result).toEqual(createdAppointment);
		});
	});
});
