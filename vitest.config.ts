import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
	plugins: [sveltekit()],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}'],
		exclude: ['node_modules', '.svelte-kit', 'build'],
		globals: true,
		environment: 'jsdom',
		setupFiles: ['src/vitest.setup.ts'],
		coverage: {
			include: ['src/lib/server/**/*.ts', 'src/routes/**/*.ts'],
			exclude: [
				'src/lib/server/db/schema.ts',
				'**/*.d.ts',
				'**/*.spec.ts',
				'**/*.test.ts'
			],
			reporter: ['text', 'html'],
			reportsDirectory: 'coverage'
		}
	},
	// Configure test timeout timeout
	testTimeout: 10000,
	onTestStart: async () => {
		// Setup test environment
		console.log('Starting Simklinik tests...');
	},
	onTestFinished: async () => {
		console.log('Simklinik tests completed!');
	}
});
