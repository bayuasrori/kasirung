<script lang="ts">
  export let page: number;
  export let pageCount: number;
  export let filters: { search: string; sortBy: string; sortDir: string };

  const buildQuery = (targetPage: number) => {
    const params = new URLSearchParams({ ...filters, page: String(targetPage) });
    return `?${params.toString()}`;
  };
</script>

{#if pageCount > 1}
  <div class="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
    <p>Halaman {page} dari {pageCount}</p>
    <div class="flex items-center gap-2">
      {#if page > 1}
        <a class="rounded-lg border border-slate-200 px-3 py-1" href={buildQuery(page - 1)}>
          Sebelumnya
        </a>
      {/if}
      {#if page < pageCount}
        <a class="rounded-lg border border-slate-200 px-3 py-1" href={buildQuery(page + 1)}>
          Berikutnya
        </a>
      {/if}
    </div>
  </div>
{/if}
