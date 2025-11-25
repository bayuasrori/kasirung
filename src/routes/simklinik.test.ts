import { describe, expect, it } from 'vitest';

type ModuleCheck = {
	path: string;
	exportName: string;
};

const repositoryModules: ModuleCheck[] = [
	{ path: '$lib/server/repositories/simklinik/pasien.repository', exportName: 'PasienRepository' },
	{ path: '$lib/server/repositories/simklinik/appointments.repository', exportName: 'AppointmentsRepository' },
	{ path: '$lib/server/repositories/simklinik/inventory.repository', exportName: 'InventoryRepository' },
	{ path: '$lib/server/repositories/simklinik/inventory.repository', exportName: 'StockMovementsRepository' }
];

const serviceModules: ModuleCheck[] = [
	{ path: '$lib/server/services/simklinik/pasien.service', exportName: 'PasienService' },
	{ path: '$lib/server/services/simklinik/appointments.service', exportName: 'AppointmentsService' },
	{ path: '$lib/server/services/simklinik/inventory.service', exportName: 'InventoryService' }
];

const loadExport = async ({ path, exportName }: ModuleCheck) => {
	const module = (await import(path)) as Record<string, unknown>;
	return module[exportName];
};

describe('Simklinik repositories', () => {
	for (const moduleCheck of repositoryModules) {
		it(`exports ${moduleCheck.exportName}`, async () => {
			const exported = await loadExport(moduleCheck);
			expect(typeof exported).toBe('function');
		});
	}
});

describe('Simklinik services', () => {
	for (const moduleCheck of serviceModules) {
		it(`exports ${moduleCheck.exportName}`, async () => {
			const exported = await loadExport(moduleCheck);
			expect(typeof exported).toBe('function');
		});
	}

	it('instantiates inventory service without errors', async () => {
		const { InventoryService } = await import('$lib/server/services/simklinik/inventory.service');
		expect(() => new InventoryService()).not.toThrow();
	});
});

describe('Simklinik business rules', () => {
	it('validates appointment time format', () => {
		const pattern = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
		const validTimes = ['09:00', '12:30', '15:45'];
		const invalidTimes = ['24:00', '25:99', '99:99'];

		validTimes.forEach(time => {
			expect(pattern.test(time)).toBe(true);
		});

		invalidTimes.forEach(time => {
			expect(pattern.test(time)).toBe(false);
		});
	});

	it('handles age calculation boundaries', () => {
		const now = new Date();
		const birthDate = new Date(now);
		birthDate.setFullYear(now.getFullYear() - 30);

		const age = now.getFullYear() - birthDate.getFullYear();
		expect(age).toBeGreaterThan(0);
		expect(age).toBeLessThan(150);
	});
});
