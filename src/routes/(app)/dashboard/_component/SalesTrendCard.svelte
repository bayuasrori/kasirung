<script lang="ts">
	import Card from '$lib/components/ui/card.svelte';
	import CardHeader from '$lib/components/ui/card-header.svelte';
	import CardContent from '$lib/components/ui/card-content.svelte';
	import CardTitle from '$lib/components/ui/card-title.svelte';
	import CardDescription from '$lib/components/ui/card-description.svelte';
	import Badge from '$lib/components/ui/badge.svelte';
	import SalesLineChart from '$lib/components/charts/sales-line-chart.svelte';
	import { ArrowUpRight } from 'lucide-svelte';

	export let labels: string[] = [];
	export let totals: number[] = [];
</script>

<Card className="lg:col-span-2">
	<CardHeader className="flex flex-row items-center justify-between">
		<div>
			<CardTitle>Tren Penjualan 7 Hari</CardTitle>
			<CardDescription>Monitor performa kasir setiap hari.</CardDescription>
		</div>
		<Badge variant="muted" className="gap-1">
			<ArrowUpRight class="h-3.5 w-3.5" />
			Tren Positif
		</Badge>
	</CardHeader>
	<CardContent>
		<SalesLineChart {labels} {totals} />
	</CardContent>
</Card>
