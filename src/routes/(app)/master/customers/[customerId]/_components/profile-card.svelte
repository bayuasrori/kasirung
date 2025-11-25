<script lang="ts">
  import Card from '$lib/components/ui/card.svelte';
  import CardHeader from '$lib/components/ui/card-header.svelte';
  import CardTitle from '$lib/components/ui/card-title.svelte';
  import CardDescription from '$lib/components/ui/card-description.svelte';
  import CardContent from '$lib/components/ui/card-content.svelte';
  import { Wallet } from 'lucide-svelte';
  import type { Customer } from './types';

  export let customer: Customer;
</script>

<Card className="border-slate-200">
  <CardHeader className="flex flex-col gap-3">
    <div class="flex items-center gap-3">
      <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
        <Wallet class="h-5 w-5" />
      </div>
      <div>
        <CardTitle>Profil Pelanggan</CardTitle>
        <CardDescription>Gunakan informasi ini untuk konfirmasi penagihan.</CardDescription>
      </div>
    </div>
  </CardHeader>
  <CardContent className="space-y-3 text-sm text-slate-600">
    <p><span class="font-medium text-slate-900">Nama:</span> {customer.name}</p>
    <p><span class="font-medium text-slate-900">Telepon:</span> {customer.phone ?? '-'}</p>
    <p><span class="font-medium text-slate-900">Email:</span> {customer.email ?? '-'}</p>
    <p><span class="font-medium text-slate-900">Alamat:</span> {customer.address ?? '-'}</p>
    {#if customer.notes}
      <p class="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-500">{customer.notes}</p>
    {/if}
  </CardContent>
</Card>
