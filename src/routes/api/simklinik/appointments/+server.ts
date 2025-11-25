import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { AppointmentsService } from '$lib/server/services/simklinik/appointments.service';

export const GET: RequestHandler = async ({ url }) => {
	const patientId = url.searchParams.get('patientId');
	const staffId = url.searchParams.get('staffId');
	const status = url.searchParams.get('status');
	const dateFrom = url.searchParams.get('dateFrom');
	const dateTo = url.searchParams.get('dateTo');
	const page = parseInt(url.searchParams.get('page') || '1');
	const limit = parseInt(url.searchParams.get('limit') || '20');

	try {
		const appointmentsService = new AppointmentsService();
		
		const filters: any = {};
		if (patientId) filters.patientId = patientId;
		if (staffId) filters.staffId = staffId;
		if (status) filters.status = status;
		if (dateFrom && dateTo) {
			filters.dateFrom = dateFrom;
			filters.dateTo = dateTo;
		}

		const appointments = await appointmentsService.getAllAppointments(filters, page, limit);
		const total = await appointmentsService.getAppointmentCount(filters);

		return json({
			success: true,
			data: appointments,
			pagination: {
				page,
				limit,
				total,
				totalPages: Math.ceil(total / limit)
			}
		});
	} catch (error) {
		console.error('Error fetching appointments:', error);
		return json({
			success: false,
			error: error instanceof Error ? error.message : 'Failed to fetch appointments'
		}, { status: 500 });
	}
};

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const appointmentsService = new AppointmentsService();
		
		const appointment = await appointmentsService.createAppointment(body);

		return json({
			success: true,
			data: appointment,
			message: 'Appointment created successfully'
		});
	} catch (error) {
		console.error('Error creating appointment:', error);
		return json({
			success: false,
			error: error instanceof Error ? error.message : 'Failed to create appointment'
		}, { status: 400 });
	}
};
