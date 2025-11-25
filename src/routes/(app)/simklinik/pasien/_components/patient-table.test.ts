import { render, screen, fireEvent } from '@testing-library/svelte';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { tick } from 'svelte';
import PatientTable from './patient-table.svelte';
import type { Patient } from '$lib/db/schema';

describe('PatientTable Component', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mock('$lib/components/ui/badge', () => ({
			default: ({ children, variant }: { children: any; variant: any }) => ({
				render: () => `<span class="badge badge-${variant}">${children}</span>`,
				$$: () => ({})
			})
		}));
		vi.mock('$lib/components/ui/button', () => ({
			default: ({ children, href, variant, size }: { children: any; href: any; variant: any; size: any }) => ({
				render: () => `<a href="${href}" class="btn btn-${variant} btn-${size}">${children}</a>`,
				$$: () => ({})
			})
		}));
	});

	const mockPatients: Patient[] = [
		{
			id: 'patient-1',
			mrNumber: 'MR20240001',
			name: 'John Doe',
			gender: 'male',
			dateOfBirth: '1990-01-01',
			phone: '1234567890',
			email: 'john@example.com',
			address: '123 Main St, City',
			bloodType: 'A_positive',
			status: 'aktif',
			allergies: null,
			emergencyContact: null,
			insuranceId: null,
			notes: null,
			createdAt: new Date('2024-01-01'),
			updatedAt: new Date('2024-01-01')
		},
		{
			id: 'patient-2',
			mrNumber: 'MR20240002',
			name: 'Jane Smith',
			gender: 'female',
			dateOfBirth: '1985-05-15',
			phone: '0987654321',
			email: 'jane@example.com',
			address: '456 Oak Ave, Town',
			bloodType: null,
			status: 'tidak_aktif',
			allergies: null,
			emergencyContact: null,
			insuranceId: null,
			notes: null,
			createdAt: new Date('2024-01-02'),
			updatedAt: new Date('2024-01-02')
		}
	];

	it('should render patient table headers', async () => {
		const { container } = render(PatientTable, { data: mockPatients });
		await tick();

		expect(screen.getByText('No. RM')).toBeInTheDocument();
		expect(screen.getByText('Nama Lengkap')).toBeInTheDocument();
		expect(screen.getByText('Tgl Lahir')).toBeInTheDocument();
		expect(screen.getByText('Alamat')).toBeInTheDocument();
		expect(screen.getByText('Gol. Darah')).toBeInTheDocument();
		expect(screen.getByText('Status')).toBeInTheDocument();
		expect(screen.getByText('Aksi')).toBeInTheDocument();
	});

	it('should render patient data correctly', async () => {
		const { container } = render(PatientTable, { data: mockPatients });
		await tick();

		// First patient
		expect(screen.getByText('MR20240001')).toBeInTheDocument();
		expect(screen.getByText('John Doe')).toBeInTheDocument();
		expect(screen.getByText('01/01/1990')).toBeInTheDocument();
		expect(screen.getByText('123 Main St, City')).toBeInTheDocument();
		expect(screen.getByText('A POSITIF')).toBeInTheDocument();
		expect(screen.getByText('Aktif')).toBeInTheDocument();

		// Second patient
		expect(screen.getByText('MR20240002')).toBeInTheDocument();
		expect(screen.getByText('Jane Smith')).toBeInTheDocument();
		expect(screen.getByText('15/05/1985')).toBeInTheDocument();
		expect(screen.getByText('456 Oak Ave, Town')).toBeInTheDocument();
		expect(screen.getByText('Tidak Aktif')).toBeInTheDocument();
	});

	it('should display gender and phone correctly', async () => {
		const { container } = render(PatientTable, { data: mockPatients });
		await tick();

		// Check first patient details
		expect(screen.getByText('L, 1234567890')).toBeInTheDocument();
		expect(screen.getByText('P, 0987654321')).toBeInTheDocument();
	});

	it('should calculate and display age correctly', async () => {
		const { container } = render(PatientTable, { data: mockPatients });
		await tick();

		// John should be 34 years old (2024 - 1990)
		const johnAge = screen.getAllByText('34 tahun');
		expect(johnAge.length).toBeGreaterThan(0);

		// Jane should be 39 years old (2024 - 1985)
		const janeAge = screen.getAllByText('39 tahun');
		expect(janeAge.length).toBeGreaterThan(0);
	});

	it('should display action buttons for each patient', async () => {
		const { container } = render(PatientTable, { data: mockPatients });
		await tick();

		// Should have 2 view buttons (one for each patient)
		const viewButtons = screen.getAllByRole('button', { name: /view/i });
		expect(viewButtons.length).toBe(2);

		// Should have 2 edit buttons (one for each patient)
		const editButtons = screen.getAllByRole('button', { name: /edit/i });
		expect(editButtons.length).toBe(2);
	});

	it('should handle empty patient list', async () => {
		const { container } = render(PatientTable, { data: [] });
		await tick();

		// Should still render headers
		expect(screen.getByText('No. RM')).toBeInTheDocument();
		expect(screen.getByText('Nama Lengkap')).toBeInTheDocument();

		// Should show empty message if component supports it
		// This would need to be implemented in the actual component
	});

	describe('status badge rendering', () => {
		it('should apply correct variant for aktif status', async () => {
			const { container } = render(PatientTable, { data: mockPatients.slice(0, 1) });
			await tick();

			const statusBadge = screen.getByText('Aktif');
			expect(statusBadge.closest('.badge')?.className).toContain('badge-default');
		});

		it('should apply correct variant for tidak_aktif status', async () => {
			const { container } = render(PatientTable, { data: mockPatients.slice(1, 2) });
			await tick();

			const statusBadge = screen.getByText('Tidak Aktif');
			expect(statusBadge.closest('.badge')?.className).toContain('badge-secondary');
		});
	});

	describe('missing data handling', () => {
		it('should display hyphen for missing blood type', async () => {
			const patientWithoutBloodType = [{
				...mockPatients[0],
				bloodType: null
			}];

			const { container } = render(PatientTable, { data: patientWithoutBloodType });
			await tick();

			// Should show - for blood type column
			const bloodTypeColumn = screen.getByText('-');
			expect(bloodTypeColumn).toBeInTheDocument();
		});

		it('should display hyphen for missing phone', async () => {
			const patientWithoutPhone = [{
				...mockPatients[0],
				phone: null
			}];

			const { container } = render(PatientTable, { data: patientWithoutPhone });
			await tick();

			// Should show - for phone field
			expect(container.textContent).toContain('L, -');
		});

		it('should display hyphen for missing address', async () => {
			const patientWithoutAddress = [{
				...mockPatients[0],
				address: null
			}];

			const { container } = render(PatientTable, { data: patientWithoutAddress });
			await tick();

			// Should show - for address
			expect(container.textContent).toContain('-');
		});
	});

	describe('click interactions', () => {
		it('should render correct href for view button', async () => {
			const { container } = render(PatientTable, { data: mockPatients });
			await tick();

			const viewButton = screen.getAllByRole('button', { name: /view/i })[0];
			expect(viewButton).toHaveAttribute('href', '/simklinik/pasien/patient-1');
		});

		it('should render correct href for edit button', async () => {
			const { container } = render(PatientTable, { data: mockPatients });
			await tick();

			const editButton = screen.getAllByRole('button', { name: /edit/i })[0];
			expect(editButton).toHaveAttribute('href', '/simklinik/pasien/patient-1/edit');
		});
	});

	describe('table structure', () => {
		it('should use proper table structure', async () => {
			const { container } = render(PatientTable, { data: mockPatients });
			await tick();

			const table = container.querySelector('table');
			const thead = table?.querySelector('thead');
			const tbody = table?.querySelector('tbody');
			const trows = tbody?.querySelectorAll('tr');

			expect(table).toBeInTheDocument();
			expect(thead).toBeInTheDocument();
			expect(tbody).toBeInTheDocument();
			expect(trows?.length).toBe(2); // Two patient rows
		});

		it('should have correct number of columns', async () => {
			const { container } = render(PatientTable, { data: mockPatients });
			await tick();

			const headerRow = container.querySelector('thead tr');
			const headerCells = headerRow?.querySelectorAll('th');

			expect(headerCells?.length).toBe(7); // No. RM, Nama Lengkap, Tgl Lahir, Alamat, Gol. Darah, Status, Aksi
		});
	});

	describe('responsive behavior', () => {
		it('should be responsive on small screens', async () => {
			const { container } = render(PatientTable, { data: mockPatients });
			await tick();

			const table = container.querySelector('table');
			const wrapper = container.querySelector('.relative.w-full.overflow-auto');

			expect(wrapper).toBeInTheDocument();
			expect(table).toBe(wrapper?.querySelector('table'));
		});

		it('should maintain accessibility with proper headings', async () => {
			const { container } = render(PatientTable, { data: mockPatients });
			await tick();

			// Should have proper table headers
			const headers = container.querySelectorAll('thead th');
			headers.forEach((header: any) => {
				expect(header.textContent).not.toBe('');
			});
		});
	});
});
