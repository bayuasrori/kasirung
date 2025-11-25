import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ConsultationsService } from '$lib/server/services/simklinik/consultations.service';
import { 
	ConsultationsRepository, 
	VitalSignsRepository, 
	PrescriptionsRepository 
} from '$lib/server/repositories/simklinik/consultations.repository';

// Mock the repositories
vi.mock('$lib/server/repositories/simklinik/consultations.repository');

describe('ConsultationsService (Rekam Medis)', () => {
	let consultationsService: ConsultationsService;
	let mockConsultationsRepo: any;
	let mockVitalSignsRepo: any;
	let mockPrescriptionsRepo: any;

	const mockDate = new Date('2024-01-01T10:00:00Z');

	beforeEach(() => {
		vi.clearAllMocks();
		vi.setSystemTime(mockDate);

		mockConsultationsRepo = vi.mocked(new ConsultationsRepository());
		mockVitalSignsRepo = vi.mocked(new VitalSignsRepository());
		mockPrescriptionsRepo = vi.mocked(new PrescriptionsRepository());

		consultationsService = new ConsultationsService();
		// Inject mocks
		consultationsService['consultationsRepository'] = mockConsultationsRepo;
		consultationsService['vitalSignsRepository'] = mockVitalSignsRepo;
		consultationsService['prescriptionsRepository'] = mockPrescriptionsRepo;
	});

	describe('startConsultation', () => {
		const validData = {
			appointmentId: 'appt-1',
			admissionId: 'admission-1',
			staffId: 'staff-1',
			patientId: 'patient-1'
		};

		it('should start a consultation successfully', async () => {
			mockConsultationsRepo.create.mockResolvedValue({
				id: 'consultation-1',
				...validData,
				status: 'ongoing',
				startTime: mockDate
			});
			mockVitalSignsRepo.create.mockResolvedValue({ id: 'vitals-1' });

			const result = await consultationsService.startConsultation(validData);

			expect(result.id).toBe('consultation-1');
			expect(result.status).toBe('ongoing');
			expect(mockConsultationsRepo.create).toHaveBeenCalledWith(expect.objectContaining({
				appointmentId: validData.appointmentId,
				admissionId: validData.admissionId,
				patientId: validData.patientId,
				staffId: validData.staffId,
				status: 'ongoing'
			}));
			// Verify vital signs record is created
			expect(mockVitalSignsRepo.create).toHaveBeenCalledWith(expect.objectContaining({
				consultationId: 'consultation-1',
				patientId: validData.patientId
			}));
		});

		it('should throw error if required fields are missing', async () => {
			await expect(consultationsService.startConsultation({ appointmentId: '', staffId: '', patientId: '' }))
				.rejects.toThrow('Staff ID and patient ID are required');
		});
	});

	describe('recordVitalSigns', () => {
		const consultationId = 'consultation-1';
		const patientId = 'patient-1';
		const vitalsInput = {
			systolic: 120,
			diastolic: 80,
			weight: 70,
			height: 175
		};

		it('should record new vital signs', async () => {
			mockConsultationsRepo.findById.mockResolvedValue({
				consultation: { id: consultationId, status: 'ongoing' }
			});
			mockVitalSignsRepo.findByConsultationId.mockResolvedValue(null);
			mockVitalSignsRepo.create.mockResolvedValue({ id: 'vitals-1', ...vitalsInput });

			const result = await consultationsService.recordVitalSigns(consultationId, patientId, vitalsInput);

			expect(mockVitalSignsRepo.create).toHaveBeenCalledWith(expect.objectContaining({
				consultationId,
				patientId,
				systolic: 120,
				diastolic: 80,
				weight: "70",
				height: "175"
			}));
		});

		it('should update existing vital signs', async () => {
			mockConsultationsRepo.findById.mockResolvedValue({
				consultation: { id: consultationId, status: 'ongoing' }
			});
			mockVitalSignsRepo.findByConsultationId.mockResolvedValue({ id: 'vitals-1' });
			mockVitalSignsRepo.update.mockResolvedValue({ id: 'vitals-1', ...vitalsInput });

			await consultationsService.recordVitalSigns(consultationId, patientId, vitalsInput);

			expect(mockVitalSignsRepo.update).toHaveBeenCalledWith('vitals-1', expect.objectContaining({
				consultationId,
				patientId,
				systolic: 120,
				diastolic: 80
			}));
		});

		it('should throw error if consultation not found', async () => {
			mockConsultationsRepo.findById.mockResolvedValue(null);

			await expect(consultationsService.recordVitalSigns(consultationId, patientId, vitalsInput))
				.rejects.toThrow('Consultation not found');
		});

		it('should throw error if consultation is not ongoing', async () => {
			mockConsultationsRepo.findById.mockResolvedValue({
				consultation: { id: consultationId, status: 'completed' }
			});

			await expect(consultationsService.recordVitalSigns(consultationId, patientId, vitalsInput))
				.rejects.toThrow('Vital signs can only be recorded for ongoing consultations');
		});
	});

	describe('addPrescription', () => {
		const consultationId = 'consultation-1';
		const patientId = 'patient-1';
		const staffId = 'staff-1';
		const prescriptionData = {
			medication: 'Paracetamol',
			dosage: '500mg',
			frequency: '3x1',
			duration: '3 days',
			instructions: 'After meal'
		};

		it('should add prescription successfully', async () => {
			mockConsultationsRepo.findById.mockResolvedValue({
				consultation: { id: consultationId, status: 'ongoing' }
			});
			mockPrescriptionsRepo.create.mockResolvedValue({ id: 'presc-1', ...prescriptionData });

			await consultationsService.addPrescription(consultationId, patientId, staffId, prescriptionData);

			expect(mockPrescriptionsRepo.create).toHaveBeenCalledWith(expect.objectContaining({
				consultationId,
				patientId,
				staffId,
				...prescriptionData
			}));
		});

		it('should throw error if consultation is not ongoing', async () => {
			mockConsultationsRepo.findById.mockResolvedValue({
				consultation: { id: consultationId, status: 'completed' }
			});

			await expect(consultationsService.addPrescription(consultationId, patientId, staffId, prescriptionData))
				.rejects.toThrow('Prescriptions can only be added to ongoing consultations');
		});
	});

	describe('endConsultation', () => {
		const consultationId = 'consultation-1';
		const clinicalData = {
			diagnosis: 'Common Cold',
			treatment: 'Rest and fluids',
			notes: 'Patient advised to rest'
		};

		it('should end consultation successfully', async () => {
			mockConsultationsRepo.findById.mockResolvedValue({
				consultation: { id: consultationId, status: 'ongoing' }
			});
			mockConsultationsRepo.endConsultation.mockResolvedValue({
				id: consultationId,
				status: 'completed',
				endTime: mockDate
			});

			const result = await consultationsService.endConsultation(consultationId, clinicalData);

			expect(mockConsultationsRepo.update).toHaveBeenCalledWith(consultationId, clinicalData);
			expect(mockConsultationsRepo.endConsultation).toHaveBeenCalledWith(consultationId);
			expect(result.status).toBe('completed');
		});

		it('should throw error if consultation is already completed', async () => {
			mockConsultationsRepo.findById.mockResolvedValue({
				consultation: { id: consultationId, status: 'completed' }
			});

			await expect(consultationsService.endConsultation(consultationId, clinicalData))
				.rejects.toThrow('Only ongoing consultations can be ended');
		});
	});

	describe('updateConsultation', () => {
		const consultationId = 'consultation-1';
		const updateData = { notes: 'Updated notes' };

		it('should update consultation successfully', async () => {
			mockConsultationsRepo.findById.mockResolvedValue({
				consultation: { id: consultationId }
			});
			mockConsultationsRepo.update.mockResolvedValue({ id: consultationId, ...updateData });

			await consultationsService.updateConsultation(consultationId, updateData);

			expect(mockConsultationsRepo.update).toHaveBeenCalledWith(consultationId, updateData);
		});

		it('should throw error if consultation not found', async () => {
			mockConsultationsRepo.findById.mockResolvedValue(null);

			await expect(consultationsService.updateConsultation(consultationId, updateData))
				.rejects.toThrow('Consultation not found');
		});
	});
});
