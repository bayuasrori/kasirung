import { db } from '$lib/server/db';
import { inpatientRooms, inpatientBeds, inpatientAdmissions, patients, users } from '$lib/server/db/schema';
import { and, eq, desc } from 'drizzle-orm';
import type { NewInpatientRoom, NewInpatientBed, NewInpatientAdmission } from '$lib/server/db/schema';

export class InpatientService {
	static async updateRoom(id: string, data: Partial<Omit<NewInpatientRoom, 'id'>>) {
		return await db.update(inpatientRooms)
			.set(data)
			.where(eq(inpatientRooms.id, id))
			.returning();
	}

	static async deleteRoom(id: string) {
		return await db.delete(inpatientRooms)
			.where(eq(inpatientRooms.id, id))
			.returning();
	}

	static async updateBed(id: string, data: Partial<Omit<NewInpatientBed, 'id'>>) {
		return await db.update(inpatientBeds)
			.set(data)
			.where(eq(inpatientBeds.id, id))
			.returning();
	}

	static async deleteBed(id: string) {
		return await db.delete(inpatientBeds)
			.where(eq(inpatientBeds.id, id))
			.returning();
	}

	// Rooms & Beds
	static async getRooms() {
		return await db.query.inpatientRooms.findMany({
			where: eq(inpatientRooms.isActive, true),
			with: {
				beds: {
					orderBy: [desc(inpatientBeds.bedNumber)]
				}
			},
			orderBy: [desc(inpatientRooms.name)]
		});
	}

	static async getRoomById(id: string) {
		return await db.query.inpatientRooms.findFirst({
			where: eq(inpatientRooms.id, id),
			with: {
				beds: true
			}
		});
	}

	static async createRoom(data: NewInpatientRoom) {
		return await db.insert(inpatientRooms).values(data).returning();
	}

	static async addBed(data: NewInpatientBed) {
		return await db.insert(inpatientBeds).values(data).returning();
	}

	static async updateBedStatus(bedId: string, status: 'available' | 'occupied' | 'maintenance' | 'cleaning') {
		return await db.update(inpatientBeds)
			.set({ status })
			.where(eq(inpatientBeds.id, bedId))
			.returning();
	}

	static async getAvailableBeds() {
		return await db.query.inpatientBeds.findMany({
			where: eq(inpatientBeds.status, 'available'),
			with: {
				room: true
			},
			orderBy: [desc(inpatientBeds.bedNumber)]
		});
	}

	// Admissions
	static async getActiveAdmissionForPatient(patientId: string) {
		return await db.query.inpatientAdmissions.findFirst({
			where: and(eq(inpatientAdmissions.patientId, patientId), eq(inpatientAdmissions.status, 'admitted')),
			with: {
				patient: true,
				bed: {
					with: {
						room: true
					}
				},
				admittedBy: true
			},
			orderBy: [desc(inpatientAdmissions.admissionDate)]
		});
	}

	static async admitPatient(data: NewInpatientAdmission) {
		return await db.transaction(async (tx) => {
			// Create admission record
			const [admission] = await tx.insert(inpatientAdmissions).values(data).returning();

			// Update bed status to occupied
			await tx.update(inpatientBeds)
				.set({ status: 'occupied' })
				.where(eq(inpatientBeds.id, data.bedId));

			return admission;
		});
	}

	static async dischargePatient(admissionId: string, dischargedBy: string, notes?: string) {
		return await db.transaction(async (tx) => {
			// Get admission to find bed
			const admission = await tx.query.inpatientAdmissions.findFirst({
				where: eq(inpatientAdmissions.id, admissionId)
			});

			if (!admission) throw new Error('Admission not found');

			// Update admission
			const [updatedAdmission] = await tx.update(inpatientAdmissions)
				.set({
					status: 'discharged',
					dischargeDate: new Date(),
					dischargedBy,
					notes: notes ? `${admission.notes || ''}\n${notes}` : admission.notes
				})
				.where(eq(inpatientAdmissions.id, admissionId))
				.returning();

			// Update bed status to cleaning (standard procedure after discharge)
			await tx.update(inpatientBeds)
				.set({ status: 'cleaning' })
				.where(eq(inpatientBeds.id, admission.bedId));

			return updatedAdmission;
		});
	}

	static async getActiveAdmissions() {
		return await db.query.inpatientAdmissions.findMany({
			where: eq(inpatientAdmissions.status, 'admitted'),
			with: {
				patient: true,
				bed: {
					with: {
						room: true
					}
				},
				admittedBy: true
			},
			orderBy: [desc(inpatientAdmissions.admissionDate)]
		});
	}
}
