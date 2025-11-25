import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import { tick } from 'svelte';
import Page from './+page.svelte';
import type { PageData } from './$types';

// Mock page data
const mockPageData: PageData = {
	session: null,
	user: null,
	allowedMenus: [],
	search: '',
	patients: [
		{
			id: 'patient-1',
			mrNumber: 'MR20240001',
			name: 'John Doe',
			gender: 'male',
			dateOfBirth: '1990-01-01',
			phone: '1234567890',
			email: 'john@example.com',
			address: '123 Main St',
			bloodType: 'A_positive',
			status: 'aktif',
			allergies: null,
			emergencyContact: null,
			insuranceId: null,
			notes: null,
			createdAt: new Date('2024-01-01T00:00:00Z'),
			updatedAt: new Date('2024-01-01T00:00:00Z')
		},
		{
			id: 'patient-2',
			mrNumber: 'MR20240002',
			name: 'Jane Smith',
			gender: 'female',
			dateOfBirth: '1985-05-15',
			phone: '0987654321',
			email: 'jane@example.com',
			address: '456 Oak Ave',
			bloodType: 'O_positive',
			status: 'aktif',
			allergies: null,
			emergencyContact: null,
			insuranceId: null,
			notes: null,
			createdAt: new Date('2024-01-02T00:00:00Z'),
			updatedAt: new Date('2024-01-02T00:00:00Z')
		}
	],
	total: 2,
	page: 1,
	totalPages: 1
};

describe('Simklinik Pasien Page', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mock('$app/stores', () => ({
			page: {
				subscribe: vi.fn((callback) => {
					callback({ url: new URL('http://localhost/') });
					return vi.fn();
				})
			}
		}));
	});

	it('should render patient list page correctly', async () => {
		const { container } = render(Page, { data: mockPageData });

		expect(container.querySelector('h2')).toBeInTheDocument();
		expect(container.querySelector('h2')?.textContent).toBe('Daftar Pasien');
	});

	it('should display patient information correctly', async () => {
		const { container } = render(Page, { data: mockPageData });
		
		await tick();

		// Check for patient table headers
		expect(screen.getByText('No. RM')).toBeInTheDocument();
		expect(screen.getByText('Nama Lengkap')).toBeInTheDocument();
		expect(screen.getByText('Tgl Lahir')).toBeInTheDocument();
		expect(screen.getByText('Alamat')).toBeInTheDocument();
		expect(screen.getByText('Gol. Darah')).toBeInTheDocument();
		expect(screen.getByText('Status')).toBeInTheDocument();
		expect(screen.getByText('Aksi')).toBeInTheDocument();

		// Check patient data
		expect(screen.getByText('MR20240001')).toBeInTheDocument();
		expect(screen.getByText('John Doe')).toBeInTheDocument();
		expect(screen.getByText('01/01/1990')).toBeInTheDocument();
		expect(screen.getByText('123 Main St')).toBeInTheDocument();
		expect(screen.getByText('A POSITIF')).toBeInTheDocument();
		expect(screen.getByText('Aktif')).toBeInTheDocument();

		// Check second patient
		expect(screen.getByText('MR20240002')).toBeInTheDocument();
		expect(screen.getByText('Jane Smith')).toBeInTheDocument();
		expect(screen.getByText('15/05/1985')).toBeInTheDocument();
		expect(screen.getByText('456 Oak Ave')).toBeInTheDocument();
		expect(screen.getByText('O POSITIF')).toBeInTheDocument();
	});

	it('should show correct patient age calculation', async () => {
		const { container } = render(Page, { data: mockPageData });
		
		await tick();

		// John Doe should be calculated as 34 years old (as of 2024)
		const johnRow = screen.getAllByText('34 tahun');
		expect(johnRow.length).toBeGreaterThan(0);

		// Jane Smith should be calculated as 39 years old (as of 2024)
		const janeRow = screen.getAllByText('39 tahun');
		expect(janeRow.length).toBeGreaterThan(0);
	});

	it('should display patient count correctly', async () => {
		const { container } = render(Page, { data: mockPageData });
		
		await tick();

		const cardContent = container.querySelector('.text-2xl');
		expect(cardContent?.textContent).toBe('2');
		
		expect(container.querySelector('.text-muted-foreground')?.textContent)
			.toBe('Total pasien terdaftar');
	});

	it('should display gender correctly', async () => {
		const { container } = render(Page, { data: mockPageData });
		
		await tick();

		expect(container.querySelector('div:first-child .text-sm.text-muted-foreground')?.textContent)
			.toBe('L, 1234567890'); // Male patient

		expect(container.querySelector('div:nth-child(2) .text-sm.text-muted-foreground')?.textContent)
			.toBe('P, 0987654321'); // Female patient
	});

	it('should render action buttons', async () => {
		const { container } = render(Page, { data: mockPageData });
		
		await tick();

		// Check for view and edit buttons for each patient
		const viewButtons = container.querySelectorAll('button:has(.eye)');
		const editButtons = container.querySelectorAll('button:has(.edit)');

		expect(viewButtons.length).toBe(2); // One for each patient
		expect(editButtons.length).toBe(2); // One for each patient
	});

	it('should render tambah pasien button', async () => {
		const { container } = render(Page, { data: mockPageData });
		
		await tick();

		const addButton = container.querySelector('button.font-medium');
		expect(addButton).toBeInTheDocument();
		expect(addButton?.textContent).toContain('Tambah Pasien');
	});

	it('should display empty state when no patients', async () => {
		const emptyPageData = {
			...mockPageData,
			patients: [],
			total: 0,
			page: 1,
			totalPages: 0
		} as PageData;

		const { container } = render(Page, { data: emptyPageData });
		
		await tick();

		// Check that table still renders headers
		expect(screen.getByText('No. RM')).toBeInTheDocument();
		expect(screen.getByText('Nama Lengkap')).toBeInTheDocument();

		// Should show empty message (this would need to be added to the component)
		expect(container.querySelector('.text-center.py-8')).toBeInTheDocument();
	});

	describe('status badges', () => {
		it('should show "Aktif" badge for active patients', async () => {
			const { container } = render(Page, { data: mockPageData });
			
			await tick();

			const activeBadges = container.querySelectorAll('.badge.bg-primary');
			expect(activeBadges.length).toBe(2); // Both patients are active
		});

		it('should show correct status colors', async () => {
			const inactivePageData = {
				...mockPageData,
				patients: [{
					...mockPageData.patients[0],
					status: 'tidak_aktif'
				} as any]
			};

			const { container } = render(Page, { data: inactivePageData });
			
			await tick();

			// Inactive patient should have secondary badge
			const badges = container.querySelectorAll('.badge.bg-secondary');
			expect(Array.from(badges).some((badge) => badge.textContent?.includes('Tidak Aktif'))).toBe(true);
		});
	});

	describe('blood type display', () => {
		it('should display blood type with proper formatting', async () => {
			const { container } = render(Page, { data: mockPageData });
			
			await tick();

			// Check for blood type values
			expect(container.textContent).toContain('A POSITIF');
			expect(container.textContent).toContain('O POSITIF');
		});

		it('should handle missing blood type', async () => {
			const patientWithoutBloodType = {
				...mockPageData,
				patients: [{
					...mockPageData.patients[0],
					bloodType: null
				} as any]
			};

			const { container } = render(Page, { data: patientWithoutBloodType });
			
			await tick();

			expect(container.textContent).toContain('-');
		});
	});
});
