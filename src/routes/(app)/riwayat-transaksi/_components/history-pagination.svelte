<script lang="ts">
	export let page: number;
	export let pageCount: number;
	export let buildQuery: (updates: Record<string, string | number | undefined>) => string;
</script>

{#if pageCount > 1}
	<div class="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 md:flex-row md:items-center md:justify-between">
		<p>
			Halaman {page} dari {pageCount}
		</p>
		<div class="flex items-center gap-2">
			{#if page > 1}
				<a class="rounded-lg border border-slate-200 px-3 py-1 hover:bg-slate-100" href={buildQuery({ page: page - 1 })}>
					Sebelumnya
				</a>
			{/if}
			{#if page < pageCount}
				<a class="rounded-lg border border-slate-200 px-3 py-1 hover:bg-slate-100" href={buildQuery({ page: page + 1 })}>
					Berikutnya
				</a>
			{/if}
		</div>
	</div>
{/if}
