<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';

	import RegistrationForm from './_component/RegistrationForm.svelte';
	import CustomerModal from './_component/CustomerModal.svelte';
	import type { CustomerOption, GedungOption, RoomOption, FormState } from './_component/types';

	export let data: {
		customers: CustomerOption[];
		gedung: GedungOption[];
		ruanganKosong: RoomOption[];
		form?: FormState | null;
	};

	const today = new Date().toISOString().slice(0, 10);

	let formState: FormState | null = data.form ?? null;
	let showCustomerModal = formState?.form === 'createCustomer' && formState.errors ? true : false;

	page.subscribe(($page) => {
		const form = $page.form as FormState | null;
		formState = form;
		if (!form) {
			showCustomerModal = false;
			return;
		}
		if (form.form === 'createCustomer' && form.errors) {
			showCustomerModal = true;
		}
		if (form.form === 'register') {
			showCustomerModal = false;
		}
	});

	const registerErrors = formState?.form === 'register' ? formState.errors : undefined;

	const openCustomerModal = () => {
		showCustomerModal = true;
	};
</script>

<div class="mx-auto max-w-3xl space-y-6">
	<div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
		<h1 class="text-xl font-semibold text-slate-900">Pendaftaran Penghuni Baru</h1>
		<p class="mt-2 text-sm text-slate-500">
			Lengkapi data berikut untuk menempatkan pelanggan sebagai penghuni kos. Sistem akan otomatis menandai kamar sebagai
			terisi.
		</p>
	</div>

	<RegistrationForm
		customers={data.customers}
		gedungList={data.gedung}
		initialRooms={data.ruanganKosong}
		registerErrors={registerErrors}
		today={today}
		onCreateCustomer={openCustomerModal}
	/>

	<CustomerModal bind:open={showCustomerModal} {formState} />
</div>
