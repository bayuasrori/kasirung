export interface RoleOption {
	id: number;
	name: string;
}

export interface UserItem {
	id: string;
	fullName: string;
	email: string;
	avatarUrl: string | null;
	roleId: number;
	roleName: string;
	isActive: boolean;
	createdAt: Date;
	updatedAt: Date;
}

export interface UserFiltersState {
	search: string;
	roleId: string;
	status: string;
	sortBy: string;
	sortDir: string;
}

export interface FormState {
	form?: 'create' | 'update' | 'reset';
	errors?: Record<string, string[]>;
}
