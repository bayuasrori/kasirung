export default async function setup() {
	const globalWithVite = globalThis as typeof globalThis & {
		__vite?: { wrapDynamicImport?: <T>(promise: Promise<T>) => Promise<T> };
	};

	if (!globalWithVite.__vite) {
		globalWithVite.__vite = {};
	}

	if (typeof globalWithVite.__vite.wrapDynamicImport !== 'function') {
		globalWithVite.__vite.wrapDynamicImport = <T>(promise: Promise<T>) => promise;
	}
}
