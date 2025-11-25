import type { NewAppointment, Appointment } from '$lib/db/schema';
import { AppointmentsRepository } from '$lib/server/repositories/simklinik/appointments.repository';

export class AppointmentsService {
	private appointmentsRepository: AppointmentsRepository;

	constructor() {
		this.appointmentsRepository = new AppointmentsRepository();
	}

	async getAllAppointments(filters?: {
		patientId?: string;
		staffId?: string;
		status?: string | string[];
		dateFrom?: string;
		dateTo?: string;
	}, page = 1, limit = 20) {
		const offset = (page - 1) * limit;
		return await this.appointmentsRepository.findAll(filters, limit, offset);
	}

	async getAppointmentById(id: string) {
		return await this.appointmentsRepository.findById(id);
	}

	async getTodayAppointments(limit = 50) {
		return await this.appointmentsRepository.getTodayAppointments(limit);
	}

	async getStaffAppointments(staffId: string, dateFrom?: string, dateTo?: string) {
		return await this.appointmentsRepository.getStaffAppointments(staffId, dateFrom, dateTo);
	}

	async getPatientAppointments(patientId: string) {
		return await this.appointmentsRepository.getPatientAppointments(patientId);
	}

	async createAppointment(data: Omit<NewAppointment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Appointment> {
		// Validate required fields
		if (!data.patientId || !data.staffId || !data.appointmentDate || !data.appointmentTime || !data.type) {
			throw new Error('Patient, staff, date, time, and type are required');
		}

		// Validate appointment date is not in the past
		const appointmentDate = new Date(data.appointmentDate);
		if (appointmentDate < new Date(new Date().toDateString())) {
			throw new Error('Appointment date cannot be in the past');
		}

		// Validate time format (HH:MM)
		const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
		if (!timeRegex.test(data.appointmentTime)) {
			throw new Error('Invalid time format. Use HH:MM format');
		}

		// Check if time slot is available for the staff and date
		const existingBookings = await this.appointmentsRepository.findAll({
			staffId: data.staffId,
			dateFrom: data.appointmentDate,
			dateTo: data.appointmentDate
		});

		const isSlotTaken = existingBookings.some(
			(booking: any) =>
				booking.appointmentTime === data.appointmentTime && booking.status !== 'cancelled'
		);

		if (isSlotTaken) {
			throw new Error('Time slot is already booked');
		}

		return await this.appointmentsRepository.create(data);
	}

	async rescheduleAppointment(id: string, newDate: string, newTime: string): Promise<Appointment> {
		const existingAppointment = await this.getAppointmentById(id);
		if (!existingAppointment) {
			throw new Error('Appointment not found');
		}

		// Validate new appointment date is not in the past
		const appointmentDate = new Date(newDate);
		if (appointmentDate < new Date(new Date().toDateString())) {
			throw new Error('Appointment date cannot be in the past');
		}

		// Validate time format
		const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
		if (!timeRegex.test(newTime)) {
			throw new Error('Invalid time format. Use HH:MM format');
		}

		// Check if new time slot is available
		const existingBookings = await this.appointmentsRepository.findAll({
			staffId: existingAppointment.staffId,
			dateFrom: newDate,
			dateTo: newDate
		});

		const isSlotTaken = existingBookings.some(
			(booking: any) =>
				booking.appointmentTime === newTime && booking.id !== id && booking.status !== 'cancelled'
		);

		if (isSlotTaken) {
			throw new Error('Time slot is already booked');
		}

		return await this.appointmentsRepository.update(id, {
			appointmentDate: newDate,
			appointmentTime: newTime
		});
	}

	async cancelAppointment(id: string, reason?: string): Promise<Appointment> {
		const existingAppointment = await this.getAppointmentById(id);
		if (!existingAppointment) {
			throw new Error('Appointment not found');
		}

		return await this.appointmentsRepository.update(id, {
			status: 'cancelled',
			notes: reason || 'Cancelled by user'
		});
	}

	async confirmAppointment(id: string): Promise<Appointment> {
		const existingAppointment = await this.getAppointmentById(id);
		if (!existingAppointment) {
			throw new Error('Appointment not found');
		}

		if (existingAppointment.status !== 'scheduled') {
			throw new Error('Only scheduled appointments can be confirmed');
		}

		return await this.appointmentsRepository.update(id, {
			status: 'confirmed'
		});
	}

	async completeAppointment(id: string): Promise<Appointment> {
		const existingAppointment = await this.getAppointmentById(id);
		if (!existingAppointment) {
			throw new Error('Appointment not found');
		}

		if (existingAppointment.status !== 'confirmed') {
			throw new Error('Only confirmed appointments can be completed');
		}

		// This would trigger consultation creation
		// Implementation would be added when consultations are implemented

		return await this.appointmentsRepository.update(id, {
			status: 'completed'
		});
	}

	async deleteAppointment(id: string): Promise<void> {
		const existingAppointment = await this.getAppointmentById(id);
		if (!existingAppointment) {
			throw new Error('Appointment not found');
		}

		if (existingAppointment.status === 'completed') {
			throw new Error('Cannot delete completed appointments');
		}

		await this.appointmentsRepository.delete(id);
	}

	async getAppointmentCount(filters?: {
		patientId?: string;
		staffId?: string;
		status?: string | string[];
		dateFrom?: string;
		dateTo?: string;
	}): Promise<number> {
		return await this.appointmentsRepository.count(filters);
	}

	async getAvailableSlots(staffId: string, date: string): Promise<string[]> {
		return await this.appointmentsRepository.getAvailableSlots(staffId, date);
	}
}
