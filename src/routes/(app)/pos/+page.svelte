<script lang="ts">
	import {
		Search,
		ShoppingCart,
		Minus,
		Plus,
		Trash2,
		CreditCard,
		Wallet,
		QrCode,
		Users
	} from 'lucide-svelte';

	import Input from '$lib/components/ui/input.svelte';
	import Button from '$lib/components/ui/button.svelte';
	import Select from '$lib/components/ui/select.svelte';
	import Textarea from '$lib/components/ui/textarea.svelte';
	import Card from '$lib/components/ui/card.svelte';
	import CardHeader from '$lib/components/ui/card-header.svelte';
	import CardTitle from '$lib/components/ui/card-title.svelte';
	import CardContent from '$lib/components/ui/card-content.svelte';
	import Label from '$lib/components/ui/label.svelte';

	export let data: {
		products: Array<{ id: string; name: string; sku: string | null; price: string; categoryId: number | null; categoryName?: string | null }>;
		categories: Array<{ id: number; name: string }>;
		customers: Array<{ id: string; name: string }>;
		success: string | null;
		filters: { category: string };
		form?: { form?: string; errors?: Record<string, string[]> } | null;
	};

	type CartItem = { id: string; name: string; price: number; quantity: number };

	let search = '';
	let categoryFilter = data.filters.category;
	let paymentMethod: 'cash' | 'qris' | 'debit' | 'credit' = 'cash';
	let customerId = '';
	let discount = 0;
	let taxRate = '0.1';
	let note = '';
	let cart: CartItem[] = [];

	const normalize = (value: string) => value.trim().toLowerCase();
	let filteredProducts = data.products;
	$: {
		const keyword = normalize(search);
		filteredProducts = data.products.filter((product) => {
			const nameMatch = product.name.toLowerCase().includes(keyword);
			const skuMatch = product.sku ? product.sku.toLowerCase().includes(keyword) : false;
			const matchesKeyword = keyword ? nameMatch || skuMatch : true;
			let matchesCategory = true;
			if (categoryFilter === 'uncategorized') {
				matchesCategory = product.categoryId === null;
			} else if (categoryFilter) {
				matchesCategory = String(product.categoryId ?? '') === categoryFilter;
			}
			return matchesKeyword && matchesCategory;
		});
	}

	function addToCart(product: typeof data.products[number]) {
		const existing = cart.find((item) => item.id === product.id);
		if (existing) {
			existing.quantity += 1;
			cart = [...cart];
		} else {
			cart = [...cart, { id: product.id, name: product.name, price: Number(product.price), quantity: 1 }];
		}
	}

	function removeFromCart(id: string) {
		cart = cart.filter((item) => item.id !== id);
	}

	function decreaseQuantity(item: CartItem) {
		if (item.quantity <= 1) {
			removeFromCart(item.id);
			return;
		}
		item.quantity -= 1;
		cart = [...cart];
	}

	function increaseQuantity(item: CartItem) {
		item.quantity += 1;
		cart = [...cart];
	}

	const formatCurrency = (value: number) => `Rp ${value.toLocaleString('id-ID', { maximumFractionDigits: 0 })}`;

$: subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
$: taxRateValue = Number(taxRate);
$: taxAmount = subtotal * taxRateValue;
$: grandTotal = Math.max(subtotal + taxAmount - discount, 0);
	$: cartJson = JSON.stringify({
		items: cart.map((item) => ({ productId: item.id, quantity: item.quantity })),
		paymentMethod,
		customerId: customerId || null,
		discount,
		taxRate: taxRateValue,
		note
	});

	function resetCart() {
		cart = [];
		customerId = '';
		discount = 0;
		note = '';
		paymentMethod = 'cash';
		taxRate = '0.1';
	}
</script>

<div class="space-y-6">
	{#if data.success}
		<div class="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
			Transaksi <span class="font-semibold">{data.success}</span> berhasil disimpan.
		</div>
	{/if}

	<section class="grid gap-6 xl:grid-cols-[2fr_1fr]">
		<div class="space-y-4">
			<div class="flex flex-wrap gap-3">
				<div class="relative flex-1 min-w-[220px]">
					<Input placeholder="Cari produk atau SKU" bind:value={search} className="pl-10" />
					<Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
				</div>
				<Select bind:value={categoryFilter} className="w-48">
					<option value="">Semua kategori</option>
					<option value="uncategorized">Tanpa kategori</option>
					{#each data.categories as category}
						<option value={category.id}>{category.name}</option>
					{/each}
				</Select>
			</div>

			<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{#each filteredProducts as product}
					<Card className="border-slate-200">
						<CardHeader>
							<CardTitle className="text-base">{product.name}</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<p class="text-sm text-slate-500">{product.sku ?? 'SKU -'}</p>
							<p class="text-lg font-semibold text-slate-900">{formatCurrency(Number(product.price))}</p>
							<Button className="w-full gap-2" on:click={() => addToCart(product)}>
								<ShoppingCart class="h-4 w-4" />
								Tambah
							</Button>
						</CardContent>
					</Card>
				{:else}
					<p class="col-span-full rounded-xl border border-dashed border-slate-200 px-4 py-10 text-center text-sm text-slate-500">
						Tidak ada produk yang cocok dengan pencarian.
					</p>
				{/each}
			</div>
		</div>

		<Card className="sticky top-24 h-fit border-slate-200">
			<CardHeader>
				<CardTitle>Keranjang</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				{#if cart.length}
					<ul class="space-y-3">
						{#each cart as item}
							<li class="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
								<div class="flex items-center justify-between gap-3">
									<div>
										<p class="font-medium text-slate-900">{item.name}</p>
										<p class="text-xs text-slate-500">{formatCurrency(item.price)}</p>
									</div>
									<Button variant="ghost" size="icon" className="text-red-500" on:click={() => removeFromCart(item.id)}>
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
						<Select id="customer" name="customerId" bind:value={customerId} className="w-full">
							<option value="">Umum</option>
							{#each data.customers as customer}
								<option value={customer.id}>{customer.name}</option>
							{/each}
						</Select>
					</div>

					<div class="space-y-2">
						<Label for="note">Catatan</Label>
						<Textarea id="note" name="note" bind:value={note} rows={2} placeholder="Permintaan khusus" />
					</div>

					<div class="grid gap-3 md:grid-cols-2">
						<div class="space-y-2">
							<Label for="discount">Diskon</Label>
							<Input id="discount" name="discount" type="number" min="0" step="100" bind:value={discount} />
						</div>
					<div class="space-y-2">
						<Label for="taxRate">Pajak</Label>
						<Select id="taxRate" name="taxRate" bind:value={taxRate}>
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
						<span>Pajak ({(taxRateValue * 100).toFixed(0)}%)</span>
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
							<label class={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 ${paymentMethod === 'cash' ? 'border-blue-400 bg-blue-50' : 'border-slate-200 bg-white'}`}>
								<input type="radio" name="paymentMethod" value="cash" bind:group={paymentMethod} class="hidden" />
								<Wallet class="h-5 w-5" /> Tunai
							</label>
							<label class={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 ${paymentMethod === 'qris' ? 'border-blue-400 bg-blue-50' : 'border-slate-200 bg-white'}`}>
								<input type="radio" name="paymentMethod" value="qris" bind:group={paymentMethod} class="hidden" />
								<QrCode class="h-5 w-5" /> QRIS
							</label>
							<label class={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 ${paymentMethod === 'debit' ? 'border-blue-400 bg-blue-50' : 'border-slate-200 bg-white'}`}>
								<input type="radio" name="paymentMethod" value="debit" bind:group={paymentMethod} class="hidden" />
								<CreditCard class="h-5 w-5" /> Debit
							</label>
							<label class={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 ${paymentMethod === 'credit' ? 'border-blue-400 bg-blue-50' : 'border-slate-200 bg-white'}`}>
								<input type="radio" name="paymentMethod" value="credit" bind:group={paymentMethod} class="hidden" />
								<Users class="h-5 w-5" /> Kredit
							</label>
						</div>
					</div>

					{#if data.form?.form === 'checkout' && data.form.errors}
						{#each Object.entries(data.form.errors) as [field, messages]}
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
					<button type="button" class="text-xs text-slate-400 hover:text-slate-500" on:click={resetCart}>Kosongkan keranjang</button>
				{/if}
			</CardContent>
		</Card>
	</section>
</div>
