import { Buffer } from 'node:buffer';
import { error } from '@sveltejs/kit';

import { buildCustomerDebtPdf } from '$lib/server/services/customer-ledger.service';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, locals }) => {
	if (!locals.session) {
		throw error(401, 'Tidak memiliki akses');
	}

	const customerId = params.customerId;
	if (!customerId) {
		throw error(400, 'Pelanggan tidak valid');
	}

	const pdf = await buildCustomerDebtPdf(customerId);
	if (!pdf) {
		throw error(404, 'Tidak ada piutang aktif untuk pelanggan ini');
	}

	const body = Buffer.from(pdf.pdfBytes);

	return new Response(body, {
		headers: {
			'Content-Type': 'application/pdf',
			'Content-Disposition': `attachment; filename="${pdf.filename}"`
		}
	});
};
