<script lang="ts">
	import Card from '$lib/components/ui/card.svelte';
	import CardHeader from '$lib/components/ui/card-header.svelte';
	import CardContent from '$lib/components/ui/card-content.svelte';
	import CardTitle from '$lib/components/ui/card-title.svelte';
	import CardDescription from '$lib/components/ui/card-description.svelte';
	import Badge from '$lib/components/ui/badge.svelte';

	import type { KosanDashboardSummary } from '$lib/types/kosan';

	export let summary: KosanDashboardSummary | null = null;

	const formatNumber = (value: number) => Number(value ?? 0).toLocaleString('id-ID');
	const formatPercent = (value: number) =>
		`${value % 1 === 0 ? value.toFixed(0) : value.toFixed(1)}%`;
	const clampPercent = (value: number) => Math.min(Math.max(value, 0), 100);

	$: progressWidth = clampPercent(summary?.occupancyRate ?? 0);
</script>

{#if summary}
	<Card className="border-teal-100 bg-white/95 shadow-sm backdrop-blur">
		<CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
			<div>
				<CardTitle>Analisa Hunian Kosan</CardTitle>
				<CardDescription>Ringkasan okupansi dan rekomendasi tindakan.</CardDescription>
			</div>
			<Badge variant={summary.highlight.variant}>{summary.highlight.title}</Badge>
		</CardHeader>
		<CardContent>
			<div class="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
				<div>
					<p class="text-sm font-medium text-slate-600">Tingkat okupansi</p>
					<div class="mt-2 flex flex-wrap items-baseline gap-3">
						<p class="text-4xl font-semibold text-slate-900">
							{formatPercent(summary.occupancyRate)}
						</p>
						<span class="text-sm text-slate-500">
							{summary.ruanganTerisi}/{summary.totalRuangan} kamar terisi
						</span>
					</div>
					<div class="mt-4 h-2 rounded-full bg-slate-100">
						<span class="block h-2 rounded-full bg-emerald-500 transition-all" style={`width: ${progressWidth}%`}></span>
					</div>
					<p class="mt-3 text-sm text-slate-600">{summary.highlight.message}</p>
					<div class="mt-6 grid gap-4 sm:grid-cols-3">
						<div>
							<p class="text-xs uppercase tracking-wide text-slate-500">Gedung</p>
							<p class="text-lg font-semibold text-slate-900">
								{formatNumber(summary.totalGedung)}
							</p>
						</div>
						<div>
							<p class="text-xs uppercase tracking-wide text-slate-500">Penghuni aktif</p>
							<p class="text-lg font-semibold text-slate-900">
								{formatNumber(summary.penghuniAktif)}
							</p>
						</div>
						<div>
							<p class="text-xs uppercase tracking-wide text-slate-500">Kamar kosong</p>
							<p class="text-lg font-semibold text-slate-900">
								{formatNumber(summary.ruanganKosong)}
							</p>
						</div>
					</div>
				</div>
				<div class="space-y-4">
					{#if summary.bestGedung}
						<div class="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
							<p class="text-xs font-semibold uppercase text-emerald-700">Gedung paling ramai</p>
							<p class="mt-1 text-lg font-semibold text-emerald-900">{summary.bestGedung.name}</p>
							<p class="text-sm text-emerald-700">
								{formatPercent(summary.bestGedung.occupancyRate)} hunian (
								{summary.bestGedung.occupiedRooms}/{summary.bestGedung.totalRooms} kamar)
							</p>
						</div>
					{/if}

					{#if summary.attentionGedung}
						<div class="rounded-2xl border border-amber-100 bg-amber-50/60 p-4">
							<p class="text-xs font-semibold uppercase text-amber-700">Perlu perhatian</p>
							<p class="mt-1 text-lg font-semibold text-amber-900">
								{summary.attentionGedung.name}
							</p>
							<p class="text-sm text-amber-700">
								{summary.attentionGedung.availableRooms} kamar kosong dari
								{summary.attentionGedung.totalRooms} unit
							</p>
						</div>
					{:else if !summary.bestGedung}
						<p class="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 text-sm text-slate-600">
							Belum ada gedung kosan yang terdaftar. Tambahkan gedung dan kamar untuk melihat analisa.
						</p>
					{/if}
				</div>
			</div>
		</CardContent>
	</Card>
{/if}
