import { browser } from '$app/environment';
import { writable } from 'svelte/store';

import type { RoomOption } from './types';

interface RegistrationFormState {
	selectedGedung: string;
	selectedRoom: string;
	rooms: RoomOption[];
	loadingRooms: boolean;
}

const createRegistrationStore = (initialRooms: RoomOption[], initialGedung: string, initialRoom: string) => {
	const { subscribe, update } = writable<RegistrationFormState>({
		selectedGedung: initialGedung,
		selectedRoom: initialRoom,
		rooms: initialRooms,
		loadingRooms: false
	});

	async function fetchRooms(gedungId: string) {
		if (!browser) return;
		update((state) => ({ ...state, loadingRooms: true }));
		try {
			const params = new URLSearchParams({ kondisi: 'kosong' });
			if (gedungId) params.set('gedungId', gedungId);
			const response = await fetch(`/api/kosan/ruangan?${params.toString()}`);
			if (!response.ok) throw new Error('Gagal mengambil data ruangan');
			const body = await response.json();
			const rooms = body.data ?? [];
			update((state) => {
				const hasSelected = rooms.some((room: RoomOption) => room.id === state.selectedRoom);
				return {
					...state,
					rooms,
					selectedRoom: hasSelected ? state.selectedRoom : rooms[0]?.id ?? ''
				};
			});
		} catch (error) {
			console.error(error);
		} finally {
			update((state) => ({ ...state, loadingRooms: false }));
		}
	}

	function setGedung(gedungId: string) {
		update((state) => ({ ...state, selectedGedung: gedungId }));
		void fetchRooms(gedungId);
	}

	function setRoom(roomId: string) {
		update((state) => ({ ...state, selectedRoom: roomId }));
	}

	return {
		subscribe,
		setGedung,
		setRoom,
		refetch: () =>
			update((state) => {
				void fetchRooms(state.selectedGedung);
				return state;
			})
	};
};

export function initRegistrationFormStore(initialRooms: RoomOption[], initialGedung: string, initialRoom: string) {
	return createRegistrationStore(initialRooms, initialGedung, initialRoom);
}
