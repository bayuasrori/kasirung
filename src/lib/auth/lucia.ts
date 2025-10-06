import { Lucia } from 'lucia';
import { DrizzlePostgreSQLAdapter } from '@lucia-auth/adapter-drizzle';
import { dev } from '$app/environment';

import { db } from '$lib/db/client';
import { sessions, users } from '$lib/db/schema';

const adapter = new DrizzlePostgreSQLAdapter(db, sessions, users);

export const auth = new Lucia(adapter, {
	sessionCookie: {
		name: 'kasirung_session',
		attributes: {
			sameSite: 'lax',
			secure: !dev
		}
	},
	getSessionAttributes: () => ({}),
	getUserAttributes: (attributes) => ({
		email: attributes.email,
		fullName: attributes.fullName,
		roleId: attributes.roleId,
		avatarUrl: attributes.avatarUrl,
		isActive: attributes.isActive
	})
});

export type Auth = typeof auth;
