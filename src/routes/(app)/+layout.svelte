<script lang="ts">
	import { page } from '$app/stores';
	import { LayoutDashboard, Package, ShoppingBag, BarChart3, LogOut, History } from 'lucide-svelte';

	import Button from '$lib/components/ui/button.svelte';
	import Avatar from '$lib/components/ui/avatar.svelte';
	import Badge from '$lib/components/ui/badge.svelte';
	import {
		MENU_KEYS,
		NAVIGATION_TREE,
		sanitizeMenuKeys,
		type MenuKey,
		type NavigationItem
	} from '$lib/navigation/menus';

	interface LayoutData {
		session: import('lucia').Session | null;
		user: import('lucia').User | null;
		allowedMenus?: MenuKey[];
	}

	export let data: LayoutData;

	const iconMap: Record<string, typeof Package> = {
		dashboard: LayoutDashboard,
		pos: ShoppingBag,
		history: History,
		reports: BarChart3
	};

	function resolveIcon(icon?: string) {
		return icon ? (iconMap[icon] ?? Package) : Package;
	}

	function buildMenu(allowed: Set<MenuKey>) {
		const items: NavigationItem[] = [];
		for (const item of NAVIGATION_TREE) {
			if (item.children) {
				const children = item.children.filter((child) => allowed.has(child.key));
				if (children.length) {
					items.push({ ...item, children });
				}
			} else if (!item.key || allowed.has(item.key)) {
				items.push(item);
			}
		}
		return items;
	}

	$: allowedMenusArray = data.allowedMenus ? sanitizeMenuKeys(data.allowedMenus) : [...MENU_KEYS];
	$: allowedMenus = new Set<MenuKey>(allowedMenusArray);
	$: menuItems = buildMenu(allowedMenus);

	let sidebarOpen = false;

	function isActive(path: string, current: string) {
		if (path === '/master' || path === '/manajemen') {
			return current.startsWith(path);
		}
		return current === path || current.startsWith(`${path}/`);
	}

	function toggleSidebar() {
		sidebarOpen = !sidebarOpen;
	}

	function closeSidebar() {
		sidebarOpen = false;
	}
</script>

<div class="min-h-screen bg-slate-100/60">
	<div class="flex min-h-screen">
		<div class={`fixed inset-0 z-40 flex lg:hidden ${sidebarOpen ? '' : 'pointer-events-none'}`}>
			<div
				class={`absolute inset-0 bg-slate-900/40 transition-opacity ${sidebarOpen ? 'opacity-100' : 'opacity-0'}`}
				role="presentation"
				tabindex="-1"
				aria-hidden="true"
				on:click={closeSidebar}
				on:keydown={(event) => event.key === 'Escape' && closeSidebar()}
			></div>
			<aside
				class={`relative ml-auto flex w-72 flex-col border-l border-slate-200 bg-white px-6 py-8 shadow-2xl transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}
			>
				<a href="/dashboard" class="flex items-center gap-3" on:click={closeSidebar}>
					<div
						class="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-500 to-emerald-500 text-white shadow"
					>
						POS
					</div>
					<div>
						<p class="text-sm font-semibold text-slate-900">Kasirung POS</p>
						<p class="text-xs text-slate-500">Dashboard transaksi kasir</p>
					</div>
				</a>
				<nav class="mt-10 space-y-2 text-sm">
					{#each menuItems as item}
						{#if item.children}
							<div class="space-y-1">
								<p class="px-3 text-xs font-semibold tracking-wide text-slate-400 uppercase">
									{item.name}
								</p>
								{#each item.children as child}
									<a
										href={child.href}
										class={`flex items-center justify-between rounded-xl px-3 py-2 transition ${isActive(child.href, $page.url.pathname) ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-100'}`}
										on:click={closeSidebar}
									>
										<span>{child.name}</span>
									</a>
								{/each}
							</div>
						{:else}
							<a
								href={item.href}
								class={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition ${isActive(item.href, $page.url.pathname) ? 'bg-blue-500 text-white shadow' : 'text-slate-600 hover:bg-slate-100'}`}
								on:click={closeSidebar}
							>
								<svelte:component this={resolveIcon(item.icon)} class="h-4 w-4" />
								<span>{item.name}</span>
							</a>
						{/if}
					{/each}
				</nav>
				<form method="POST" action="/logout" class="mt-auto">
					<Button
						type="submit"
						variant="ghost"
						className="w-full justify-start gap-3 text-red-500 hover:bg-red-50"
					>
						<LogOut class="h-4 w-4" />
						Keluar
					</Button>
				</form>
			</aside>
		</div>

		<aside
			class="hidden w-72 flex-col border-r border-slate-200 bg-white/90 px-6 py-8 shadow-sm backdrop-blur lg:flex"
		>
			<a href="/dashboard" class="flex items-center gap-3" data-animate>
				<div
					class="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-500 to-emerald-500 text-white shadow"
				>
					POS
				</div>
				<div>
					<p class="text-sm font-semibold text-slate-900">Kasirung POS</p>
					<p class="text-xs text-slate-500">Dashboard transaksi kasir</p>
				</div>
			</a>

			<nav class="mt-10 space-y-2 text-sm">
				{#each menuItems as item}
					{#if item.children}
						<div class="space-y-1">
							<p class="px-3 text-xs font-semibold tracking-wide text-slate-400 uppercase">
								{item.name}
							</p>
							{#each item.children as child}
								<a
									href={child.href}
									class={`flex items-center justify-between rounded-xl px-3 py-2 transition ${isActive(child.href, $page.url.pathname) ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-100'}`}
								>
									<span>{child.name}</span>
								</a>
							{/each}
						</div>
					{:else}
						<a
							href={item.href}
							class={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition ${isActive(item.href, $page.url.pathname) ? 'bg-blue-500 text-white shadow' : 'text-slate-600 hover:bg-slate-100'}`}
						>
							<svelte:component this={resolveIcon(item.icon)} class="h-4 w-4" />
							<span>{item.name}</span>
						</a>
					{/if}
				{/each}
			</nav>

			<form method="POST" action="/logout" class="mt-auto">
				<Button
					type="submit"
					variant="ghost"
					className="w-full justify-start gap-3 text-red-500 hover:bg-red-50"
				>
					<LogOut class="h-4 w-4" />
					Keluar
				</Button>
			</form>
		</aside>

		<main class="flex w-full flex-1 flex-col">
			<header
				class="sticky top-0 z-20 border-b border-slate-200 bg-white/80 px-6 py-4 backdrop-blur"
			>
				<div class="flex items-center justify-between">
					<div class="flex items-center gap-3">
						<button
							class="rounded-lg border border-slate-200 p-2 text-slate-500 lg:hidden"
							on:click={toggleSidebar}
						>
							<LayoutDashboard class="h-5 w-5" />
						</button>
						<h2 class="text-lg font-semibold text-slate-900 capitalize">
							{$page.url.pathname.slice(1) || 'dashboard'}
						</h2>
					</div>
					<div class="flex items-center gap-3">
						<Badge variant="muted">Versi Beta</Badge>
						<Avatar name={data.user?.fullName ?? 'User'} email={data.user?.email ?? ''} />
					</div>
				</div>
			</header>

			<section class="flex-1 px-6 py-8">
				<slot />
			</section>
		</main>
	</div>
</div>
