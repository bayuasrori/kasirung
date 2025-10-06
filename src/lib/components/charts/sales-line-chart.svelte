<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import {
		Chart,
		LineController,
		LineElement,
		PointElement,
		LinearScale,
		CategoryScale,
		Tooltip,
		Filler
	} from 'chart.js';

	Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Filler);

	export let labels: string[] = [];
	export let totals: number[] = [];

	let canvas: HTMLCanvasElement | null = null;
	let chart: Chart | null = null;

	onMount(() => {
		if (!canvas) return;
		chart = new Chart(canvas.getContext('2d')!, {
			type: 'line',
			data: {
				labels,
				datasets: [
					{
						label: 'Penjualan',
						data: totals,
						borderColor: '#2563eb',
						backgroundColor: 'rgba(37, 99, 235, 0.15)',
						tension: 0.4,
						fill: true,
						pointRadius: 3,
						pointBackgroundColor: '#1d4ed8'
					}
				]
			},
			options: {
				plugins: {
					legend: { display: false },
					tooltip: {
						enabled: true,
						callbacks: {
							label: (context) => `Rp ${Number(context.parsed.y ?? 0).toLocaleString('id-ID')}`
						}
					}
				},
				scales: {
					y: {
						beginAtZero: true,
						grid: { color: 'rgba(148, 163, 184, 0.2)' }
					},
					x: {
						grid: { display: false }
					}
				}
			}
		});
	});

	$: if (chart) {
		chart.data.labels = labels;
		chart.data.datasets[0].data = totals;
		chart.update();
	}

	onDestroy(() => {
		chart?.destroy();
	});
</script>

<canvas bind:this={canvas} class="w-full"></canvas>
