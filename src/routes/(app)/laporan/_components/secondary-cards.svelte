<script lang="ts">
  import Card from '$lib/components/ui/card.svelte';
  import CardHeader from '$lib/components/ui/card-header.svelte';
  import CardTitle from '$lib/components/ui/card-title.svelte';
  import CardContent from '$lib/components/ui/card-content.svelte';
  import { createSecondaryCards } from './helpers';
  import type { ReportPayload } from './types';

  export let report: ReportPayload | null;

  const cards = createSecondaryCards(report);
</script>

{#if cards.length > 0}
  <div class="grid gap-4 md:grid-cols-3">
    {#each cards as card (card.title)}
      <Card className="border-slate-200">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{card.title}</CardTitle>
          <div class={`flex h-9 w-9 items-center justify-center rounded-lg ${card.accent}`}>
            <svelte:component this={card.icon} class="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <p class="text-2xl font-semibold text-slate-900">{card.value}</p>
        </CardContent>
      </Card>
    {/each}
  </div>
{/if}
