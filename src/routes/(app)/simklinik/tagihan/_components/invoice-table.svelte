<script lang="ts">
	import Badge from '$lib/components/ui/badge.svelte';
	import Button from '$lib/components/ui/button.svelte';
	import { DollarSign, Edit, Eye, FileText } from 'lucide-svelte';

	export let data: any[];

const getStatusBadge = (status: string) => {
	switch (status) {
		case 'paid':
			return { label: 'Lunas', variant: 'success' as const };
		case 'partial_paid':
			return { label: 'Sebagian', variant: 'warning' as const };
		case 'unpaid':
			return { label: 'Belum Bayar', variant: 'destructive' as const };
		case 'cancelled':
			return { label: 'Dibatalkan', variant: 'muted' as const };
		default:
			return { label: status, variant: 'muted' as const };
	}
};

	function getPaymentMethodBadge(method: string) {
		if (!method) return '-';

		switch (method) {
			case 'cash': return 'Tunai';
			case 'debit': return 'Kartu Debit';
			case 'credit': return 'Kartu Kredit';
			case 'qris': return 'QRIS';
			default: return method;
		}
	}

	function formatPrice(amount: string) {
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR'
		}).format(parseFloat(amount));
	}

	function getDaysUntilDue(dueDate: string) {
		const today = new Date();
		const due = new Date(dueDate);
		const diffTime = due.getTime() - today.getTime();
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
		return diffDays;
	}
</script>

<div class="w-full">
	<div class="rounded-md border">
		<div class="relative w-full overflow-auto">
			<table class="w-full caption-bottom text-sm">
				<thead class="[&_tr]:border-b">
					<tr class="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
						<th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground">No. Tagihan</th>
						<th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Pasien</th>
						<th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Total</th>
						<th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Dibayar</th>
						<th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Jatuh Tempo</th>
						<th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Metode</th>
						<th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
						<th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Aksi</th>
					</tr>
				</thead>
				<tbody class="[&_tr:last-child]:border-0">
					{#each data as invoice (invoice.invoiceId)}
						{@const status = getStatusBadge(invoice.invoice.status)}
						<tr class="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
							<td class="p-4 align-middle">
								<div class="font-mono font-medium">{invoice.invoice.invoiceNumber}</div>
								<div class="text-xs text-muted-foreground">
									{new Date(invoice.invoice.createdAt).toLocaleDateString('id-ID')}
								</div>
							</td>
							<td class="p-4 align-middle">
								<div class="font-medium">{invoice.patient.name}</div>
								<div class="text-sm text-muted-foreground">
									{invoice.patient.mrNumber}
								</div>
							</td>
							<td class="p-4 align-middle">
								<div class="font-semibold">
									{formatPrice(invoice.invoice.totalAmount)}
								</div>
							</td>
							<td class="p-4 align-middle">
								<div class="flex items-center space-x-2">
									<span>{formatPrice(invoice.invoice.paidAmount)}</span>
									{#if invoice.invoice.paidAmount > '0' && invoice.invoice.paidAmount < invoice.invoice.totalAmount}
										<Badge variant="muted">
											{(parseFloat(invoice.invoice.paidAmount) / parseFloat(invoice.invoice.totalAmount) * 100).toFixed(0)}%
										</Badge>
									{/if}
								</div>
							</td>
							<td class="p-4 align-middle">
								<div>
									<span class="
										{getDaysUntilDue(invoice.invoice.dueDate) < 0 ? 'text-red-600' : 
										 getDaysUntilDue(invoice.invoice.dueDate) <= 3 ? 'text-yellow-600' : ''}
									">
										{new Date(invoice.invoice.dueDate).toLocaleDateString('id-ID')}
									</span>
									{#if invoice.invoice.status === 'unpaid' && getDaysUntilDue(invoice.invoice.dueDate) < 0}
										<Badge variant="destructive" class="ml-2">
											Terlambat {Math.abs(getDaysUntilDue(invoice.invoice.dueDate))} hari
										</Badge>
									{/if}
								</div>
							</td>
							<td class="p-4 align-middle">
								<span class="text-sm">
									{getPaymentMethodBadge(invoice.invoice.paymentMethod)}
								</span>
							</td>
							<td class="p-4 align-middle">
								<Badge variant={status.variant}>{status.label}</Badge>
							</td>
							<td class="p-4 align-middle">
								<div class="flex items-center space-x-2">
									<Button variant="ghost" size="sm" href={`/simklinik/tagihan/${invoice.invoiceId}`}>
										<Eye class="h-4 w-4" />
									</Button>
									{#if invoice.invoice.status !== 'paid' && invoice.invoice.status !== 'cancelled'}
										<Button variant="ghost" size="sm" href={`/simklinik/tagihan/${invoice.invoiceId}/bayar`}>
											<DollarSign class="h-4 w-4" />
										</Button>
									{/if}
									<Button variant="ghost" size="sm" href={`/simklinik/tagihan/${invoice.invoiceId}/print`}>
										<FileText class="h-4 w-4" />
									</Button>
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</div>
