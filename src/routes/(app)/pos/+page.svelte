<script lang="ts">
	import { browser } from '$app/environment';

	import SuccessAlert from './_component/SuccessAlert.svelte';
	import ProductFilters from './_component/ProductFilters.svelte';
	import ProductGrid from './_component/ProductGrid.svelte';
	import CartPanel from './_component/CartPanel.svelte';
	import TenantModal from './_component/TenantModal.svelte';
	import type {
		CartItem,
		Category,
		Customer,
		PaymentMethod,
		Product,
		Tenant,
		FormState
	} from './_component/types';

	export let data: {
		products: Product[];
		categories: Category[];
		customers: Customer[];
		tenants: Tenant[];
		success: string | null;
		receipt: string | null;
		filters: { category: string };
		form?: FormState | null;
	};

	let search = '';
	let categoryFilter = data.filters.category;
	let paymentMethod: PaymentMethod = 'cash';
	let customerId = '';
	let showTenantModal = false;
	let tenantSearch = '';
	let selectedTenant: Tenant | null = null;
	let discount = 0;
	let taxRate = '0.1';
	let note = '';
	let cart: CartItem[] = [];
	let receiptDownloaded = false;
	let isDownloadingReceipt = false;
	let receiptError: string | null = null;

	let filteredProducts: Product[] = data.products;
	let filteredTenants: Tenant[] = data.tenants;

	$: {
		const keyword = search.trim().toLowerCase();
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

	$: {
		const keyword = tenantSearch.trim().toLowerCase();
		filteredTenants = data.tenants.filter((tenant) => {
			if (!keyword) return true;
			return (
				tenant.pelangganNama.toLowerCase().includes(keyword) ||
				tenant.ruanganNama.toLowerCase().includes(keyword) ||
				tenant.gedungNama.toLowerCase().includes(keyword)
			);
		});
	}

	function addToCart(product: Product) {
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

	function selectTenant(tenant: Tenant) {
		selectedTenant = tenant;
		customerId = tenant.pelangganId;
		showTenantModal = false;
	}

	function clearTenant() {
		selectedTenant = null;
	}

	function handleCustomerChange(value: string) {
		customerId = value;
		if (!selectedTenant || selectedTenant.pelangganId !== customerId) {
			selectedTenant = null;
		}
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

	async function downloadReceipt(transactionId: string) {
		if (!browser || !transactionId) {
			return;
		}

		try {
			isDownloadingReceipt = true;
			receiptError = null;
			const response = await fetch(`/pos/receipt/${transactionId}`);
			if (!response.ok) {
				throw new Error('Failed to download receipt');
			}
			const blob = await response.blob();
			const disposition = response.headers.get('Content-Disposition');
			let filename = `kwitansi-${transactionId}.pdf`;
			if (disposition) {
				const match = disposition.match(/filename="?([^";]+)"?/i);
				if (match?.[1]) {
					filename = match[1];
				}
			}
			const url = URL.createObjectURL(blob);
			const anchor = document.createElement('a');
			anchor.href = url;
			anchor.download = filename;
			anchor.style.display = 'none';
			document.body.appendChild(anchor);
			anchor.click();
			document.body.removeChild(anchor);
			URL.revokeObjectURL(url);
		} catch (error) {
			console.error(error);
			receiptError = 'Gagal mengunduh kwitansi. Silakan coba lagi.';
		} finally {
			isDownloadingReceipt = false;
		}
	}

	$: if (browser && data.receipt && !receiptDownloaded) {
		receiptDownloaded = true;
		downloadReceipt(data.receipt);
	}

	$: subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
	$: taxRateValue = Number(taxRate);
	$: taxAmount = subtotal * taxRateValue;
	$: grandTotal = Math.max(subtotal + taxAmount - discount, 0);
	$: cartJson = JSON.stringify({
		items: cart.map((item) => ({ productId: item.id, quantity: item.quantity })),
		paymentMethod,
		customerId: customerId || null,
		tenantId: selectedTenant?.id ?? null,
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
		selectedTenant = null;
		tenantSearch = '';
	}

	const checkoutErrors = data.form?.form === 'checkout' ? data.form.errors : undefined;
</script>

<div class="space-y-6">
	<SuccessAlert
		transactionId={data.success}
		receiptId={data.receipt}
		isDownloading={isDownloadingReceipt}
		receiptError={receiptError}
		on:download={(event) => downloadReceipt(event.detail)}
	/>

	<section class="grid gap-6 xl:grid-cols-[2fr_1fr]">
		<div class="space-y-4">
			<ProductFilters bind:search bind:category={categoryFilter} categories={data.categories} />
			<ProductGrid products={filteredProducts} on:add={(event) => addToCart(event.detail)} />
		</div>

		<CartPanel
			{cart}
			customers={data.customers}
			{customerId}
			{paymentMethod}
			{discount}
			{taxRate}
			{note}
			{cartJson}
			{subtotal}
			{taxAmount}
			{grandTotal}
			{selectedTenant}
			checkoutErrors={checkoutErrors}
			onCustomerChange={handleCustomerChange}
			increaseQuantity={increaseQuantity}
			decreaseQuantity={decreaseQuantity}
			removeItem={removeFromCart}
			setDiscount={(value) => (discount = value)}
			setTaxRate={(value) => (taxRate = value)}
			setNote={(value) => (note = value)}
			setPaymentMethod={(method) => (paymentMethod = method)}
			showTenantModal={() => (showTenantModal = true)}
			clearTenantSelection={clearTenant}
			resetCart={resetCart}
		/>
	</section>

	<TenantModal
		bind:open={showTenantModal}
		tenants={filteredTenants}
		search={tenantSearch}
		on:select={(event) => selectTenant(event.detail)}
		on:search={(event) => (tenantSearch = event.detail)}
	/>
</div>
