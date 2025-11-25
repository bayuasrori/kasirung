<script lang="ts">
  import Card from '$lib/components/ui/card.svelte';
  import CardHeader from '$lib/components/ui/card-header.svelte';
  import CardTitle from '$lib/components/ui/card-title.svelte';
  import CardDescription from '$lib/components/ui/card-description.svelte';
  import CardContent from '$lib/components/ui/card-content.svelte';
  import { createSummaryCards } from './helpers';
  import type { ReportPayload } from './types';

  export let report: ReportPayload | null;

  const cards = createSummaryCards(report);
</script>

{#if cards.length > 0}
  <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
    {#each cards as card (card.title)}
      <Card className="border-slate-200">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{card.title}</CardTitle>
            <CardDescription>{card.description}</CardDescription>
          </div>
          <div class={`flex h-11 w-11 items-center justify-center rounded-xl ${card.accent}`}>
            <svelte:component this={card.icon} class="h-5 w-5" />
          </div>
        </CardHeader>
        <CardContent>
          <p class="text-3xl font-semibold text-slate-900">{card.value}</p>
        </CardContent>
      </Card>
    {/each}
  </div>
{/if}
