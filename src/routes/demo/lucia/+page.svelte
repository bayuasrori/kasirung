<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageServerData } from './$types';

	export let data: PageServerData;
</script>

{#if data.user}
	<h1>Hi, {data.user.fullName ?? data.user.email}!</h1>
	<p>User ID: {data.user.id}</p>
{:else}
	<p class="text-sm text-slate-600">Anda belum masuk.</p>
{/if}
<form method="post" action="?/logout" use:enhance>
	<button>Sign out</button>
</form>
