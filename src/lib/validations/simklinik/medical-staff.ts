import { z } from 'zod';

export const medicalStaffRoles = [
	'doctor',
	'nurse',
	'midwife',
	'specialist',
	'pharmacist',
	'lab_technician',
	'receptionist'
] as const;

const phoneRegex = /^[0-9+\-\s]*$/;

export const medicalStaffCreateSchema = z.object({
	nip: z.string().min(1, 'NIP wajib diisi').max(20),
	name: z.string().min(1, 'Nama wajib diisi').max(100),
	specialization: z.string().max(255).optional(),
	phone: z
		.string()
		.regex(phoneRegex, 'Nomor telepon hanya boleh berisi angka, spasi, atau tanda hubung')
		.optional(),
	email: z.union([z.string().email('Format email tidak valid'), z.literal('')]).optional(),
	role: z.enum(medicalStaffRoles),
	isActive: z.coerce.boolean().default(true)
});

export const medicalStaffUpdateSchema = medicalStaffCreateSchema.extend({
	isActive: z.coerce.boolean().default(true)
});

export type MedicalStaffCreateInput = z.infer<typeof medicalStaffCreateSchema>;
export type MedicalStaffUpdateInput = z.infer<typeof medicalStaffUpdateSchema>;
