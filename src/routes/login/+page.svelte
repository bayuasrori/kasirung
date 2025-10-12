<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { animate } from 'motion';
	import { page } from '$app/stores';
	import { Mail, Lock, LogIn } from 'lucide-svelte';

	import Button from '$lib/components/ui/button.svelte';
	import Input from '$lib/components/ui/input.svelte';
	import Label from '$lib/components/ui/label.svelte';
	import Card from '$lib/components/ui/card.svelte';
	import CardHeader from '$lib/components/ui/card-header.svelte';
	import CardContent from '$lib/components/ui/card-content.svelte';
	import CardTitle from '$lib/components/ui/card-title.svelte';
	import CardDescription from '$lib/components/ui/card-description.svelte';

	export let data: {
		errors: Record<string, string[] | undefined> | null;
		message?: string | null;
		values?: { email?: string };
	};

	let isSubmitting = false;
	$: formErrors = data?.errors ?? {};
	$: message = data?.message ?? null;
	$: emailValue = data?.values?.email ?? '';

	let unsubscribe: (() => void) | null = null;

	onMount(() => {
		const elements = document.querySelectorAll<HTMLElement>('[data-animate]');
		const easeOut = { duration: 0.5, easing: 'ease-out' } as const;
		Array.from(elements).forEach((element, index) => {
			animate(
				element,
				{ opacity: [0, 1], y: [20, 0] },
				{ ...easeOut, delay: index * 0.08 }
			);
		});

		unsubscribe = page.subscribe(() => {
			isSubmitting = false;
		});
	});

	function handleSubmit() {
		isSubmitting = true;
	}

	onDestroy(() => {
		unsubscribe?.();
	});
</script>

<div class="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-slate-200">
	<div class="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center gap-12 px-6 py-16 lg:flex-row lg:items-center">
		<div class="mx-auto w-full max-w-xl" data-animate>
			<h1 class="text-4xl font-semibold text-slate-900 sm:text-5xl">
				Selamat Datang di
				<span class="bg-gradient-to-r from-blue-500 to-emerald-500 bg-clip-text text-transparent"> Kasirung POS</span>
			</h1>
			<p class="mt-4 text-lg text-slate-600">
				Kelola transaksi kasir Anda dengan mudah, pantau performa toko, dan hadirkan pengalaman terbaik untuk pelanggan.
			</p>
			<div class="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2" data-animate>
				<div class="rounded-2xl border border-blue-100 bg-white/80 p-4 shadow-sm backdrop-blur">
					<h3 class="text-sm font-semibold text-slate-700">Konektivitas Real-time</h3>
					<p class="mt-1 text-sm text-slate-500">Pantau transaksi kasir dan laporan penjualan kapan pun.</p>
				</div>
				<div class="rounded-2xl border border-emerald-100 bg-white/80 p-4 shadow-sm backdrop-blur">
					<h3 class="text-sm font-semibold text-slate-700">Desain Modern Kasir</h3>
					<p class="mt-1 text-sm text-slate-500">Tampilan responsif untuk perangkat desktop maupun tablet kasir.</p>
				</div>
			</div>
		</div>

		<Card className="mx-auto w-full max-w-lg overflow-hidden bg-white/90 backdrop-blur" data-animate>
			<CardHeader className="space-y-1 pb-2">
				<CardTitle>Masuk ke akun Anda</CardTitle>
				<CardDescription>Masukkan kredensial yang terdaftar untuk mulai menggunakan dashboard.</CardDescription>
			</CardHeader>
			<CardContent>
				{#if message}
					<p class="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
						{message}
					</p>
				{/if}
				<form method="POST" class="space-y-4" on:submit={handleSubmit}>
					<div class="space-y-2">
						<Label for="email">Email</Label>
						<div class="relative">
							<Mail class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
							<Input
								id="email"
								type="email"
								name="email"
								value={emailValue}
								required
								placeholder="admin@kasirung.local"
								className="pl-10"
							/>
						</div>
						{#if formErrors.email?.length}
							<p class="text-sm text-red-500">{formErrors.email[0]}</p>
						{/if}
					</div>
					<div class="space-y-2">
						<Label for="password">Kata Sandi</Label>
						<div class="relative">
							<Lock class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
							<Input
								id="password"
								type="password"
								name="password"
								required
								placeholder="●●●●●●"
								className="pl-10"
							/>
						</div>
						{#if formErrors.password?.length}
							<p class="text-sm text-red-500">{formErrors.password[0]}</p>
						{/if}
					</div>
					<Button type="submit" className="w-full bg-blue-600 hover:bg-blue-500" disabled={isSubmitting}>
						<LogIn class="h-4 w-4" />
						<span>{isSubmitting ? 'Memproses...' : 'Masuk Sekarang'}</span>
					</Button>
				</form>
				<p class="mt-6 text-center text-xs text-slate-400">
					Dilindungi dengan autentikasi aman menggunakan Argon2id & Lucia Auth.
				</p>
			</CardContent>
		</Card>
	</div>
</div>
