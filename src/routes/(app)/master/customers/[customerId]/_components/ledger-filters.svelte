<script lang="ts">
  import Button from '$lib/components/ui/button.svelte';
  import Input from '$lib/components/ui/input.svelte';
  import Label from '$lib/components/ui/label.svelte';
  import Select from '$lib/components/ui/select.svelte';
  import { FileText } from 'lucide-svelte';
  import type { LedgerFilters } from './types';

  export let filters: LedgerFilters;
  export let validationErrors: Record<string, string[]> | null;
  export let hasFilters: boolean;
  export let resetHref: string;
</script>

<form
  method="GET"
  class="grid gap-4 rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm backdrop-blur md:grid-cols-[repeat(4,minmax(0,1fr))]"
>
  <div class="space-y-2">
    <Label for="startDate">Dari Tanggal</Label>
    <Input id="startDate" name="startDate" type="date" value={filters.startDate} />
    {#if validationErrors?.startDate?.length}
      <p class="text-xs text-red-500">{validationErrors.startDate[0]}</p>
    {/if}
  </div>
  <div class="space-y-2">
    <Label for="endDate">Sampai Tanggal</Label>
    <Input id="endDate" name="endDate" type="date" value={filters.endDate} />
    {#if validationErrors?.endDate?.length}
      <p class="text-xs text-red-500">{validationErrors.endDate[0]}</p>
    {/if}
  </div>
  <div class="space-y-2">
    <Label for="status">Status Pembayaran</Label>
    <Select id="status" name="status" value={filters.status}>
      <option value="all">Semua</option>
      <option value="paid">Lunas</option>
      <option value="pending">Belum lunas</option>
    </Select>
  </div>
  <div class="flex items-end gap-2">
    <Button type="submit" className="w-full gap-2">
      <FileText class="h-4 w-4" />
      Terapkan
    </Button>
    {#if hasFilters}
      <a href={resetHref} class="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100">
        Reset
      </a>
    {/if}
  </div>
</form>
