import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { PasienService } from '$lib/server/services/simklinik/pasien.service';
import type { NewPatient } from '$lib/db/schema';

const allowedGenders = ['male', 'female', 'other'] as const;

const isValidGender = (value: string): value is (typeof allowedGenders)[number] => {
	return allowedGenders.includes(value as (typeof allowedGenders)[number]);
};

const createEmptyForm = () => ({
	name: '',
	dateOfBirth: '',
	gender: '',
	phone: '',
	email: '',
	address: '',
	bloodType: 'unknown',
	allergies: '',
	emergencyContactName: '',
	emergencyContactPhone: '',
	emergencyContactRelation: '',
	insuranceId: '',
	insuranceProvider: '',
	notes: ''
});

export const load: PageServerLoad = async () => {
	return {
		form: createEmptyForm()
	};
};

export const actions: Actions = {
	default: async ({ request }) => {
		const formData = await request.formData();
		
		// Extract form data
		const name = formData.get('name') as string;
		const dateOfBirth = formData.get('dateOfBirth') as string;
		const gender = formData.get('gender') as string;
		const phone = formData.get('phone') as string;
		const email = formData.get('email') as string;
		const address = formData.get('address') as string;
		const bloodType = formData.get('bloodType') as string || 'unknown';
		const allergies = formData.get('allergies') as string;
		const emergencyContactName = formData.get('emergencyContactName') as string;
		const emergencyContactPhone = formData.get('emergencyContactPhone') as string;
		const emergencyContactRelation = formData.get('emergencyContactRelation') as string;
		const insuranceId = formData.get('insuranceId') as string;
		const insuranceProvider = formData.get('insuranceProvider') as string;
		const notes = formData.get('notes') as string;

		// Basic validation
		const errors = {
			name: !name?.trim() ? 'Nama pasien wajib diisi' : null,
			dateOfBirth: !dateOfBirth ? 'Tanggal lahir wajib diisi' : null,
			gender: !gender || !isValidGender(gender) ? 'Jenis kelamin wajib dipilih' : null,
			email: email && email.trim() !== '' && !email.includes('@') ? 'Format email tidak valid' : null,
		};

		// Filter out null errors
		const hasError = Object.values(errors).some(error => error !== null);

		if (hasError) {
			return fail(400, {
				errors,
				data: {
					name,
					dateOfBirth, 
					gender,
					phone,
					email,
					address,
					bloodType,
					allergies,
					emergencyContactName,
					emergencyContactPhone,
					emergencyContactRelation,
					insuranceId,
					insuranceProvider,
					notes
				}
			});
		}

		try {
			const pasienService = new PasienService();

			// Prepare emergency contact as JSON
			const emergencyContact = {
				name: emergencyContactName || null,
				phone: emergencyContactPhone || null,
				relation: emergencyContactRelation || null
			};

			// Create patient data
			if (!isValidGender(gender)) {
				throw new Error('Invalid gender selection');
			}

			const patientData: Omit<NewPatient, 'mrNumber' | 'id' | 'createdAt' | 'updatedAt'> = {
				name: name.trim(),
				dateOfBirth,
				gender,
				phone: phone?.trim() || null,
				email: email?.trim() || null,
				address: address?.trim() || null,
				bloodType: (bloodType?.trim() || 'unknown') as NewPatient['bloodType'],
				allergies: allergies?.trim() || null,
				emergencyContact: emergencyContact,
				insuranceId: insuranceProvider === '' ? null : (insuranceId?.trim() || null),
				notes: notes?.trim() || null,
				status: 'aktif' as const
			};

			const patient = await pasienService.createPatient(patientData);
			const message = `Pasien ${patient.name} dengan No.RM ${patient.mrNumber} berhasil didaftarkan`;

			// Create success message without immediate redirect
			return {
				form: createEmptyForm(),
				success: true,
				message,
				patient,
				redirectUrl: `/simklinik/pasien?success=true&message=${encodeURIComponent(message)}`
			};

		} catch (error) {
			if (error instanceof Response) {
				throw error;
			}
			
			console.error('Error creating patient:', error);
			
			return fail(500, { 
				message: error instanceof Error ? error.message : 'Terjadi kesalahan saat menyimpan data pasien',
				data: {
					name,
					dateOfBirth, 
					gender,
					phone,
					email,
					address,
					bloodType,
					allergies,
					emergencyContactName,
					emergencyContactPhone,
					emergencyContactRelation,
					insuranceId,
					insuranceProvider,
					notes
				}
			});
		}
	}
};
