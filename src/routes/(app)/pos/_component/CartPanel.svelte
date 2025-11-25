<script lang="ts">
import Button from '$lib/components/ui/button.svelte';
import Input from '$lib/components/ui/input.svelte';
import Select from '$lib/components/ui/select.svelte';
import Textarea from '$lib/components/ui/textarea.svelte';
import Label from '$lib/components/ui/label.svelte';
import Card from '$lib/components/ui/card.svelte';
import CardHeader from '$lib/components/ui/card-header.svelte';
import CardTitle from '$lib/components/ui/card-title.svelte';
import CardContent from '$lib/components/ui/card-content.svelte';
import { Minus, Plus, Trash2, Users, Building2, BedDouble, Phone, CreditCard, Wallet, QrCode } from 'lucide-svelte';
import type { CartItem, Customer, Tenant, PaymentMethod } from './types';

	export let cart: CartItem[] = [];
	export let customers: Customer[] = [];
	export let customerId = '';
	export let paymentMethod: PaymentMethod = 'cash';
	export let discount = 0;
	export let taxRate = '0.1';
	export let note = '';
	export let cartJson = '';
	export let subtotal = 0;
	export let taxAmount = 0;
	export let grandTotal = 0;
	export let selectedTenant: Tenant | null = null;
	export let checkoutErrors: Record<string, string[]> | undefined;

	export let onCustomerChange: (value: string) => void;
	export let increaseQuantity: (item: CartItem) => void;
	export let decreaseQuantity: (item: CartItem) => void;
	export let removeItem: (id: string) => void;
	export let setDiscount: (value: number) => void;
	export let setTaxRate: (value: string) => void;
	export let setNote: (value: string) => void;
	export let setPaymentMethod: (method: PaymentMethod) => void;
export let showTenantModal: () => void;
export let clearTenantSelection: () => void;
	export let resetCart: () => void;

	const formatCurrency = (value: number) => `Rp ${value.toLocaleString('id-ID', { maximumFractionDigits: 0 })}`;
</script>

<Card className="sticky top-24 h-fit border-slate-200">
	<CardHeader>
		<CardTitle>Keranjang</CardTitle>
	</CardHeader>
	<CardContent className="space-y-4">
		{#if cart.length}
			<ul class="space-y-3">
				{#each cart as item (item.id)}
					<li class="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
						<div class="flex items-center justify-between gap-3">
							<div>
								<p class="font-medium text-slate-900">{item.name}</p>
								<p class="text-xs text-slate-500">{formatCurrency(item.price)}</p>
							</div>
							<Button variant="ghost" size="icon" className="text-red-500" on:click={() => removeItem(item.id)}>
								<Trash2 class="h-4 w-4" />
							</Button>
						</div>
						<div class="mt-3 flex items-center justify-between rounded-lg border border-slate-200 bg-white px-2 py-1">
							<button type="button" class="rounded-md p-1 hover:bg-slate-100" on:click={() => decreaseQuantity(item)}>
								<Minus class="h-4 w-4" />
							</button>
							<span class="text-sm font-semibold text-slate-700">{item.quantity}</span>
							<button type="button" class="rounded-md p-1 hover:bg-slate-100" on:click={() => increaseQuantity(item)}>
								<Plus class="h-4 w-4" />
							</button>
						</div>
					</li>
				{/each}
			</ul>
		{:else}
			<div class="rounded-xl border border-dashed border-slate-200 px-4 py-10 text-center text-sm text-slate-500">
				Keranjang masih kosong.
			</div>
		{/if}

		<form method="POST" action="?/checkout" class="space-y-4">
			<input type="hidden" name="cart" value={cartJson} />

			<div class="space-y-2">
				<Label for="customer">Pelanggan</Label>
				<Select id="customer" name="customerId" value={customerId} on:change={(event) => onCustomerChange((event.currentTarget as HTMLSelectElement).value)} className="w-full">
					<option value="">Umum</option>
					{#each customers as customer (customer.id)}
						<option value={customer.id}>{customer.name}</option>
					{/each}
				</Select>
				<Button type="button" variant="outline" className="mt-2 w-full gap-2" on:click={showTenantModal}>
					<Users class="h-4 w-4" /> Cari Penghuni Aktif
				</Button>
				{#if selectedTenant}
					<div class="mt-2 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
						<p class="font-semibold text-slate-900">{selectedTenant.pelangganNama}</p>
						<p class="mt-1 flex items-center gap-2">
							<Building2 class="h-3.5 w-3.5 text-slate-400" /> {selectedTenant.gedungNama}
						</p>
						<p class="flex items-center gap-2">
							<BedDouble class="h-3.5 w-3.5 text-slate-400" /> Kamar {selectedTenant.ruanganNama}
						</p>
						{#if selectedTenant.pelangganKontak}
							<p class="flex items-center gap-2">
								<Phone class="h-3.5 w-3.5 text-slate-400" /> {selectedTenant.pelangganKontak}
							</p>
						{/if}
						<button type="button" class="mt-2 text-xs font-semibold text-slate-500 hover:text-slate-700" on:click={clearTenantSelection}>
							Batalkan pilihan penghuni
						</button>
					</div>
				{/if}
			</div>

			<div class="space-y-2">
				<Label for="note">Catatan</Label>
				<Textarea id="note" name="note" value={note} on:input={(event) => setNote((event.currentTarget as HTMLTextAreaElement).value)} rows={2} placeholder="Permintaan khusus" />
			</div>

			<div class="grid gap-3 md:grid-cols-2">
				<div class="space-y-2">
					<Label for="discount">Diskon</Label>
					<Input id="discount" name="discount" type="number" min="0" step="100" value={discount} on:input={(event) => setDiscount(Number((event.currentTarget as HTMLInputElement).value) || 0)} />
				</div>
				<div class="space-y-2">
					<Label for="taxRate">Pajak</Label>
					<Select id="taxRate" name="taxRate" value={taxRate} on:change={(event) => setTaxRate((event.currentTarget as HTMLSelectElement).value)}>
						<option value="0">0%</option>
						<option value="0.05">5%</option>
						<option value="0.1">10%</option>
						<option value="0.11">11%</option>
					</Select>
				</div>
			</div>

			<div class="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm">
				<div class="flex items-center justify-between text-slate-600">
					<span>Subtotal</span>
					<span class="font-medium text-slate-900">{formatCurrency(subtotal)}</span>
				</div>
				<div class="flex items-center justify-between text-slate-600">
					<span>Pajak ({(Number(taxRate) * 100).toFixed(0)}%)</span>
					<span class="font-medium text-slate-900">{formatCurrency(taxAmount)}</span>
				</div>
				<div class="flex items-center justify-between text-slate-600">
					<span>Diskon</span>
					<span class="font-medium text-slate-900">{formatCurrency(discount)}</span>
				</div>
				<hr class="border-dashed border-slate-200" />
				<div class="flex items-center justify-between text-lg font-semibold text-slate-900">
					<span>Total</span>
					<span>{formatCurrency(grandTotal)}</span>
				</div>
			</div>

			<div class="space-y-3">
				<p class="text-xs font-medium uppercase text-slate-500">Metode Pembayaran</p>
				<div class="grid gap-3 sm:grid-cols-2">
					{#each [
						{ value: 'cash', label: 'Tunai', icon: Wallet },
						{ value: 'qris', label: 'QRIS', icon: QrCode },
						{ value: 'debit', label: 'Debit', icon: CreditCard },
						{ value: 'credit', label: 'Kredit', icon: Users }
					] as method (method.value)}
						<label class={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 ${paymentMethod === method.value ? 'border-blue-400 bg-blue-50' : 'border-slate-200 bg-white'}`}>
							<input type="radio" name="paymentMethod" value={method.value} checked={paymentMethod === method.value} on:change={() => setPaymentMethod(method.value as PaymentMethod)} class="hidden" />
							<svelte:component this={method.icon} class="h-5 w-5" /> {method.label}
						</label>
					{/each}
				</div>
			</div>

			{#if checkoutErrors}
				{#each Object.entries(checkoutErrors) as [field, messages] (field)}
					{#if messages?.length}
						<p class="text-sm text-red-500">{messages[0]}</p>
					{/if}
				{/each}
			{/if}

			<Button type="submit" className="w-full" disabled={!cart.length}>
				<CreditCard class="h-4 w-4" />
				Proses Pembayaran
			</Button>
		</form>

		{#if cart.length}
			<button type="button" class="text-xs text-slate-400 hover:text-slate-500" on:click={resetCart}>
				Kosongkan keranjang
			</button>
		{/if}
	</CardContent>
</Card>
