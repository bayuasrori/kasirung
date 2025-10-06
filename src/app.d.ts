declare global {
	namespace App {
		interface Locals {
			session: import('lucia').Session | null;
			user: import('lucia').User | null;
		}
		interface PageData {
			session: import('lucia').Session | null;
			user: import('lucia').User | null;
		}
	}
}

declare module 'lucia' {
	interface Register {
		Lucia: typeof import('$lib/auth/lucia').auth;
		DatabaseUserAttributes: {
			email: string;
			fullName: string;
			roleId: number;
			avatarUrl: string | null;
			isActive: boolean;
		};
		DatabaseSessionAttributes: Record<string, never>;
	}
}

export {};
