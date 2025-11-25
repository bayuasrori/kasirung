type Gender = 'male' | 'female' | 'other';

const genderOptions: Gender[] = ['male', 'female', 'other'];
const bloodTypes = ['A', 'B', 'AB', 'O', 'O_positive', 'O_negative', 'unknown'];

export interface PatientData {
	name?: string | null;
	dateOfBirth?: string | null;
	gender?: Gender | '' | null;
	phone?: string | null;
	email?: string | null;
	address?: string | null;
	bloodType?: string | null;
	allergies?: string | null;
	emergencyContactName?: string | null;
	emergencyContactPhone?: string | null;
	emergencyContactRelation?: string | null;
	insuranceId?: string | null;
	insuranceProvider?: string | null;
	notes?: string | null;
}

export type PatientValidationResult = {
	errors: Partial<Record<keyof PatientData, string>>;
	isValid: boolean;
};

const isValidDate = (value?: string | null) => {
	if (!value) return false;
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) {
		return false;
	}

	const today = new Date();
	const oldestAllowed = new Date(1900, 0, 1);
	return date <= today && date >= oldestAllowed;
};

const isValidAge = (value?: string | null) => {
	if (!isValidDate(value)) return false;
	const dob = new Date(value as string);
	const today = new Date();
	const age = today.getFullYear() - dob.getFullYear();
	if (age > 150) return false;
	if (age === 150) {
		// Ensure we haven't exceeded the exact day/month
		const monthDiff = today.getMonth() - dob.getMonth();
		if (monthDiff > 0) return false;
		if (monthDiff === 0 && today.getDate() >= dob.getDate()) return false;
	}
	return true;
};

const isValidPhone = (value?: string | null) => {
	if (!value) return true;
	const digits = value.replace(/\D/g, '');
	return digits.length === value.length && digits.length >= 8;
};

const isValidEmail = (value?: string | null) => {
	if (!value) return true;
	return /\S+@\S+\.\S+/.test(value);
};

export const validatePatientData = (data: PatientData): PatientValidationResult => {
	const errors: PatientValidationResult['errors'] = {};

	if (!data.name?.trim()) {
		errors.name = 'Nama pasien wajib diisi';
	}

	if (!data.dateOfBirth?.trim()) {
		errors.dateOfBirth = 'Tanggal lahir wajib diisi';
	} else if (!isValidDate(data.dateOfBirth) || !isValidAge(data.dateOfBirth)) {
		errors.dateOfBirth = 'Tanggal lahir tidak valid';
	}

	if (!data.gender?.toString().trim()) {
		errors.gender = 'Jenis kelamin wajib dipilih';
	} else if (!genderOptions.includes(data.gender as Gender)) {
		errors.gender = 'Jenis kelamin tidak valid';
	}

	if (!isValidPhone(data.phone)) {
		errors.phone = 'Format nomor telepon tidak valid';
	}

	if (!isValidEmail(data.email)) {
		errors.email = 'Format email tidak valid';
	}

	if (data.bloodType && !bloodTypes.includes(data.bloodType)) {
		errors.bloodType = 'Golongan darah tidak valid';
	}

	return {
		errors,
		isValid: Object.keys(errors).length === 0
	};
};
