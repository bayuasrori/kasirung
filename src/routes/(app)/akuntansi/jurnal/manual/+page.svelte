<script lang="ts">
	import { Plus, Trash2 } from 'lucide-svelte';
	import Button from '$lib/components/ui/button.svelte';
	import Input from '$lib/components/ui/input.svelte';
	import Select from '$lib/components/ui/select.svelte';
	import Label from '$lib/components/ui/label.svelte';
	import Textarea from '$lib/components/ui/textarea.svelte';
	import Card from '$lib/components/ui/card.svelte';
	import CardHeader from '$lib/components/ui/card-header.svelte';
	import CardTitle from '$lib/components/ui/card-title.svelte';
	import CardContent from '$lib/components/ui/card-content.svelte';

	const accountOptions = [
		{ code: '1101', name: 'Kas' },
		{ code: '1102', name: 'Kas QRIS' },
		{ code: '1301', name: 'Piutang Dagang' },
		{ code: '2201', name: 'Utang Pajak Penjualan' },
		{ code: '4101', name: 'Pendapatan Penjualan' },
		{ code: '5101', name: 'Diskon Penjualan' }
	];

	type JournalRow = { id: string; accountCode: string; description: string; debit: string; credit: string };

	let entryDate = '';
	let memo = '';
	let reference = '';
	let rows: JournalRow[] = [
		{ id: crypto.randomUUID(), accountCode: '', description: '', debit: '', credit: '' },
		{ id: crypto.randomUUID(), accountCode: '', description: '', debit: '', credit: '' }
	];

	function addRow() {
		rows = [...rows, { id: crypto.randomUUID(), accountCode: '', description: '', debit: '', credit: '' }];
	}

	function removeRow(id: string) {
		if (rows.length <= 2) return;
		rows = rows.filter((row) => row.id !== id);
	}

	function totalDebit() {
		return rows.reduce((sum, row) => sum + Number(row.debit || 0), 0);
	}

	function totalCredit() {
		return rows.reduce((sum, row) => sum + Number(row.credit || 0), 0);
	}
</script>

<div class="space-y-6">
	<div class="flex flex-wrap items-center justify-between gap-4">
		<div>
			<h1 class="text-xl font-semibold text-slate-900">Posting Manual Jurnal</h1>
			<p class="text-sm text-slate-500">Catat jurnal umum manual untuk penyesuaian atau koreksi pembukuan.</p>
		</div>
		<Button className="gap-2" disabled>
			<Plus class="h-4 w-4" />
			Simpan Jurnal (Coming Soon)
		</Button>
	</div>

	<Card class="bg-white/90 shadow-sm backdrop-blur">
		<CardHeader>
			<CardTitle>Informasi Jurnal</CardTitle>
		</CardHeader>
		<CardContent class="space-y-4">
			<div class="grid gap-4 md:grid-cols-3">
				<div class="space-y-2">
					<Label for="entryDate">Tanggal</Label>
					<Input id="entryDate" type="date" bind:value={entryDate} />
				</div>
				<div class="space-y-2">
					<Label for="reference">Referensi</Label>
					<Input id="reference" placeholder="Contoh: ADJ-001" bind:value={reference} />
				</div>
				<div class="space-y-2">
					<Label for="memo">Memo</Label>
					<Input id="memo" placeholder="Deskripsi ringkas" bind:value={memo} />
				</div>
			</div>
			<div class="space-y-2">
				<Label for="notes">Catatan Detail</Label>
				<Textarea id="notes" rows={3} placeholder="Catatan tambahan untuk jurnal ini (opsional)" bind:value={memo} />
			</div>
		</CardContent>
	</Card>

	<Card class="bg-white/90 shadow-sm backdrop-blur">
		<CardHeader>
			<CardTitle>Detail Baris Jurnal</CardTitle>
		</CardHeader>
		<CardContent class="space-y-4">
			<div class="overflow-x-auto">
				<table class="min-w-full text-sm text-slate-600">
					<thead class="text-xs uppercase text-slate-400">
						<tr>
							<th class="pb-2 pr-4">Kode Akun</th>
							<th class="pb-2 pr-4">Deskripsi</th>
							<th class="pb-2 pr-4 text-right">Debit</th>
							<th class="pb-2 pr-4 text-right">Kredit</th>
							<th class="pb-2 text-right"></th>
						</tr>
					</thead>
					<tbody class="divide-y divide-slate-100">
						{#each rows as row (row.id)}
							<tr class="align-top">
								<td class="py-3 pr-4">
									<Select bind:value={row.accountCode}>
										<option value="">Pilih akun…</option>
										{#each accountOptions as option (option.code)}
											<option value={option.code}>{option.code} — {option.name}</option>
										{/each}
									</Select>
								</td>
								<td class="py-3 pr-4">
									<Textarea rows={2} bind:value={row.description} placeholder="Catatan baris" />
								</td>
								<td class="py-3 pr-4 text-right">
									<Input type="number" min="0" step="0.01" bind:value={row.debit} placeholder="0.00" className="text-right" />
								</td>
								<td class="py-3 pr-4 text-right">
									<Input type="number" min="0" step="0.01" bind:value={row.credit} placeholder="0.00" className="text-right" />
								</td>
								<td class="py-3 text-right">
									<Button type="button" variant="ghost" className="h-9 w-9 p-0 text-red-500 hover:bg-red-50" on:click={() => removeRow(row.id)}>
										<Trash2 class="h-4 w-4" />
									</Button>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
			<div class="flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 pt-4 text-sm text-slate-600">
				<Button type="button" variant="ghost" className="gap-2" on:click={addRow}>
					<Plus class="h-4 w-4" />
					Tambah Baris Jurnal
				</Button>
				<div class="flex gap-6 text-right">
					<div>
						<p class="text-xs uppercase tracking-wide text-slate-400">Total Debit</p>
						<p class="font-semibold text-slate-900">Rp {totalDebit().toLocaleString('id-ID')}</p>
					</div>
					<div>
						<p class="text-xs uppercase tracking-wide text-slate-400">Total Kredit</p>
						<p class="font-semibold text-slate-900">Rp {totalCredit().toLocaleString('id-ID')}</p>
					</div>
				</div>
			</div>
		</CardContent>
	</Card>

	<Card class="bg-white/90 shadow-sm backdrop-blur">
		<CardHeader>
			<CardTitle>Catatan</CardTitle>
		</CardHeader>
		<CardContent class="space-y-2 text-sm text-slate-600">
			<p>
				Fitur penyimpanan dan posting jurnal manual akan dikaitkan dengan backend akuntansi pada iterasi berikutnya.
				Gunakan layout ini untuk mendiskusikan kebutuhan validasi, template, dan approval workflow.
			</p>
		</CardContent>
	</Card>
</div>
