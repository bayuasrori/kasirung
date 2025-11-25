import { z } from 'zod';

const decimalRegex = /^\d+(\.\d{1,2})?$/;

export const medicalServiceFormSchema = z.object({
	code: z.string().min(1, 'Kode layanan wajib diisi').max(50, 'Kode maksimal 50 karakter'),
	name: z.string().min(1, 'Nama layanan wajib diisi').max(150, 'Nama maksimal 150 karakter'),
	categoryId: z.string().optional().default(''),
	price: z
		.string()
		.optional()
		.default('')
		.refine((value) => value === '' || decimalRegex.test(value), {
			message: 'Harga hanya boleh berisi angka'
		}),
	duration: z
		.string()
		.optional()
		.default('')
		.refine((value) => value === '' || /^\d+$/.test(value), {
			message: 'Durasi hanya boleh berisi angka'
		}),
	description: z.string().max(500, 'Deskripsi maksimal 500 karakter').optional().default(''),
	isActive: z.coerce.boolean().default(true)
});

export type MedicalServiceFormInput = z.infer<typeof medicalServiceFormSchema>;
