import { Buffer } from 'node:buffer';
import { error } from '@sveltejs/kit';

import { buildTransactionReceiptPdf } from '$lib/server/services/receipt.service';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, locals }) => {
	if (!locals.session) {
		throw error(401, 'Tidak memiliki akses');
	}

	const transactionId = params.transactionId;
	if (!transactionId) {
		throw error(400, 'Transaksi tidak valid');
	}

	const receipt = await buildTransactionReceiptPdf(transactionId);
	if (!receipt) {
		throw error(404, 'Kwitansi tidak ditemukan');
	}

	const body = Buffer.from(receipt.pdfBytes);

	return new Response(body, {
		headers: {
			'Content-Type': 'application/pdf',
			'Content-Disposition': `attachment; filename="kwitansi-${receipt.number}.pdf"`
		}
	});
};
