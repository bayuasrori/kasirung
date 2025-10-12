import { PDFDocument, PDFPage, PDFFont, StandardFonts } from 'pdf-lib';

import { findTransactionForReceipt } from '$lib/server/repositories/transactions.repository';

interface ReceiptItem {
	productId: string;
	name: string | null;
	sku: string | null;
	quantity: number;
	unitPrice: string;
	totalPrice: string;
}

const currencyFormat = new Intl.NumberFormat('id-ID', {
	style: 'currency',
	currency: 'IDR',
	maximumFractionDigits: 0
});

const dateFormat = new Intl.DateTimeFormat('id-ID', {
	dateStyle: 'medium',
	timeStyle: 'short'
});

function formatMoney(value: string | number) {
	const numeric = typeof value === 'number' ? value : Number(value ?? 0);
	return currencyFormat.format(Number.isFinite(numeric) ? numeric : 0);
}


function ensurePageSpace(
	doc: PDFDocument,
	state: { page: PDFPage; y: number },
	minY: number,
	margin: number,
	pageSize: [number, number]
) {
	if (state.y < minY) {
		state.page = doc.addPage(pageSize);
		state.y = state.page.getHeight() - margin;
	}
}

function drawRightAlignedText(
	page: PDFPage,
	text: string,
	options: { font: PDFFont; size: number; xRight: number; y: number }
) {
	const width = options.font.widthOfTextAtSize(text, options.size);
	page.drawText(text, { x: options.xRight - width, y: options.y, size: options.size, font: options.font });
}

export async function buildTransactionReceiptPdf(transactionId: string) {
	const details = await findTransactionForReceipt(transactionId);
	if (!details) {
		return null;
	}

	const doc = await PDFDocument.create();
	const pageSize: [number, number] = [595.28, 841.89];
	const page = doc.addPage(pageSize);
	const boldFont = await doc.embedFont(StandardFonts.HelveticaBold);
	const regularFont = await doc.embedFont(StandardFonts.Helvetica);

	const state = { page, y: page.getHeight() - 40 };
	const margin = 40;
	const contentWidth = state.page.getWidth() - margin * 2;

	const drawText = (text: string, font = regularFont, size = 12, lineHeight = 16) => {
		ensurePageSpace(doc, state, margin + lineHeight, margin, pageSize);
		state.page.drawText(text, { x: margin, y: state.y, size, font });
		state.y -= lineHeight;
	};

	drawText('Kwitansi Pembayaran', boldFont, 18, 26);
	drawText(`Nomor: ${details.number}`, regularFont, 12);
	drawText(`Tanggal: ${dateFormat.format(new Date(details.createdAt))}`, regularFont, 12);
	drawText(`Kasir: ${details.cashier ?? '-'}`, regularFont, 12);
	drawText(`Pelanggan: ${details.customer ?? 'Umum'}`, regularFont, 12);

	state.y -= 10;
	const nameX = margin;
	const qtyX = margin + contentWidth * 0.55;
	const priceX = margin + contentWidth * 0.7;
	const totalX = margin + contentWidth * 0.85;

	ensurePageSpace(doc, state, margin + 32, margin, pageSize);
	state.page.drawText('Item', { x: nameX, y: state.y, size: 12, font: boldFont });
	state.page.drawText('Qty', { x: qtyX, y: state.y, size: 12, font: boldFont });
	state.page.drawText('Harga', { x: priceX, y: state.y, size: 12, font: boldFont });
	state.page.drawText('Jumlah', { x: totalX, y: state.y, size: 12, font: boldFont });
	state.y -= 14;
	state.page.drawLine({
		start: { x: margin, y: state.y },
		end: { x: margin + contentWidth, y: state.y },
		thickness: 1
	});
	state.y -= 12;

	for (const item of details.items) {
		ensurePageSpace(doc, state, margin + 40, margin, pageSize);
		const productName = item.name ?? 'Produk';
		const skuText = item.sku ? ` (${item.sku})` : '';
		const fullName = `${productName}${skuText}`;
		state.page.drawText(fullName, { x: nameX, y: state.y, size: 11, font: regularFont });
		state.page.drawText(String(item.quantity), { x: qtyX, y: state.y, size: 11, font: regularFont });
		state.page.drawText(formatMoney(item.unitPrice), { x: priceX, y: state.y, size: 11, font: regularFont });
		state.page.drawText(formatMoney(item.totalPrice), { x: totalX, y: state.y, size: 11, font: regularFont });
		state.y -= 14;
	}

	state.y -= 10;
	const summaryLabelX = margin + contentWidth * 0.55;
	const summaryValueRight = margin + contentWidth;

	const summaryRows: Array<{ label: string; value: string }> = [
		{ label: 'Subtotal', value: formatMoney(details.subtotal) },
		{ label: `Pajak`, value: formatMoney(details.tax) },
		{ label: 'Diskon', value: formatMoney(details.discount) },
		{ label: 'Total', value: formatMoney(details.total) }
	];

	for (const row of summaryRows) {
		ensurePageSpace(doc, state, margin + 24, margin, pageSize);
		state.page.drawText(row.label, { x: summaryLabelX, y: state.y, size: 12, font: regularFont });
		drawRightAlignedText(state.page, row.value, {
			font: row.label === 'Total' ? boldFont : regularFont,
			size: row.label === 'Total' ? 13 : 12,
			xRight: summaryValueRight,
			y: state.y
		});
		state.y -= 16;
	}

	if (details.note) {
		state.y -= 8;
		ensurePageSpace(doc, state, margin + 48, margin, pageSize);
		state.page.drawText('Catatan:', { x: margin, y: state.y, size: 12, font: boldFont });
		state.y -= 14;
		state.page.drawText(details.note, {
			x: margin,
			y: state.y,
			size: 11,
			font: regularFont
		});
		state.y -= 14;
	}

	state.y -= 20;
	drawText('Terima kasih atas pembelian Anda!', boldFont, 12);

	const pdfBytes = await doc.save();
	return { pdfBytes, number: details.number };
}
