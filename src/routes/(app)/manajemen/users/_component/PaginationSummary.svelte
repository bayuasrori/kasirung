<script lang="ts">
	export let currentPage = 1;
	export let pageCount = 1;
	export let filters: Record<string, string> = {};

	const buildLink = (page: number) => {
		const params = new URLSearchParams({ ...filters, page: String(page) });
		return `?${params.toString()}`;
	};
</script>

<div class="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
	<p>Halaman {currentPage} dari {pageCount}</p>
	<div class="flex items-center gap-2">
		{#if currentPage > 1}
			<a class="rounded-lg border border-slate-200 px-3 py-1" href={buildLink(currentPage - 1)}>Sebelumnya</a>
		{/if}
		{#if currentPage < pageCount}
			<a class="rounded-lg border border-slate-200 px-3 py-1" href={buildLink(currentPage + 1)}>Berikutnya</a>
		{/if}
	</div>
</div>
