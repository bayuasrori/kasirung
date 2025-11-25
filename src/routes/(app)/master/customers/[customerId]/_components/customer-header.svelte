<script lang="ts">
  import { ArrowLeft, Download } from 'lucide-svelte';
  import type { Customer } from './types';
  import Button from '$lib/components/ui/button.svelte';

  export let customer: Customer;
  export let outstandingAmount: number;
  export let debtDownloadUrl: string;
</script>

<div class="flex flex-wrap items-center justify-between gap-4">
  <div class="space-y-1">
    <a href="/master/customers" class="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700">
      <ArrowLeft class="h-4 w-4" />
      Kembali ke daftar pelanggan
    </a>
    <h1 class="text-xl font-semibold text-slate-900">Buku Transaksi - {customer.name}</h1>
    <p class="text-sm text-slate-500">Pantau riwayat transaksi dan piutang pelanggan untuk tindak lanjut penagihan.</p>
  </div>
  <Button
    type="button"
    variant="outline"
    className="gap-2"
    href={outstandingAmount > 0 ? debtDownloadUrl : undefined}
    disabled={outstandingAmount === 0}
  >
    <Download class="h-4 w-4" />
    Cetak daftar hutang
  </Button>
</div>
