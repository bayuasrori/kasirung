<script lang="ts">
  import Card from '$lib/components/ui/card.svelte';
  import CardHeader from '$lib/components/ui/card-header.svelte';
  import CardTitle from '$lib/components/ui/card-title.svelte';
  import CardDescription from '$lib/components/ui/card-description.svelte';
  import CardContent from '$lib/components/ui/card-content.svelte';
  import Label from '$lib/components/ui/label.svelte';
  import Select from '$lib/components/ui/select.svelte';
  import Input from '$lib/components/ui/input.svelte';
  import Button from '$lib/components/ui/button.svelte';
  import Badge from '$lib/components/ui/badge.svelte';
  import type { ReportFilters } from './types';

  export let filters: ReportFilters;
  export let requiresCustomRange: boolean;
  export let badgeLabel: string;
</script>

<Card className="border-slate-200">
  <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
    <div>
      <CardTitle>Laporan Penjualan</CardTitle>
      <CardDescription>Pantau kinerja penjualan berdasarkan periode yang dipilih.</CardDescription>
    </div>
    <Badge variant="muted">Periode: {badgeLabel}</Badge>
  </CardHeader>
  <CardContent>
    <form method="GET" class="grid gap-4 md:grid-cols-[200px_repeat(2,minmax(0,1fr))] md:items-end">
      <div class="space-y-2">
        <Label for="range">Rentang Waktu</Label>
        <Select id="range" name="range" value={filters.range}>
          {#each filters.options as option (option.value)}
            <option value={option.value}>{option.label}</option>
          {/each}
        </Select>
      </div>
      {#if requiresCustomRange}
        <div class="space-y-2">
          <Label for="start-date">Tanggal Awal</Label>
          <Input id="start-date" name="startDate" type="date" value={filters.startDateInput} required />
        </div>
        <div class="space-y-2">
          <Label for="end-date">Tanggal Akhir</Label>
          <Input id="end-date" name="endDate" type="date" value={filters.endDateInput} required />
        </div>
      {:else}
        <input type="hidden" name="startDate" value={filters.startDateInput} />
        <input type="hidden" name="endDate" value={filters.endDateInput} />
      {/if}
      <div class="flex items-end gap-2">
        <Button type="submit" className="w-full">Terapkan</Button>
        <a
          href="?"
          class="flex h-10 w-full items-center justify-center rounded-md border border-slate-200 text-sm font-medium text-slate-600 transition hover:border-slate-300"
        >
          Reset
        </a>
      </div>
    </form>
  </CardContent>
</Card>
