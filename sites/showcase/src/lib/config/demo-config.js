// Single source of truth for every Kavach demo site.
// Consumers import these and layer adapter-specific env on top.

/** @typedef {{ label: string, pkg: string, demoUrl: string | null, live?: boolean, capabilities: string[] }} AdapterConfig */

/** @type {Record<string, AdapterConfig>} */
export const ADAPTERS = {
	supabase: {
		label: 'Supabase',
		pkg: '@kavach/adapter-supabase',
		demoUrl: 'https://supabase.kavach.sensei-hq.com',
		capabilities: ['Email + password', 'Magic link (OTP)', 'Social OAuth', 'PostgREST RLS']
	},
	firebase: {
		label: 'Firebase',
		pkg: '@kavach/adapter-firebase',
		demoUrl: 'https://firebase.kavach.sensei-hq.com',
		capabilities: ['Email + password', 'Magic link (OTP)', 'Google OAuth', 'Structured logging']
	},
	convex: {
		label: 'Convex',
		pkg: '@kavach/adapter-convex',
		demoUrl: 'https://convex.kavach.sensei-hq.com',
		capabilities: ['Google OAuth', 'Reactive data queries', 'Server-side auth functions']
	},
	auth0: {
		label: 'Auth0',
		pkg: '@kavach/adapter-auth0',
		demoUrl: null,
		live: false,
		capabilities: ['Universal login page', 'Social providers', 'Token-based sessions']
	},
	amplify: {
		label: 'Amplify',
		pkg: '@kavach/adapter-amplify',
		demoUrl: null,
		live: false,
		capabilities: ['Cognito user pools', 'Social providers', 'Hosted UI']
	}
}

export const ROUTES = {
	auth: '/auth',
	data: '/data',
	logout: '/logout',
	home: '/dashboard'
}

export const RULES = [
	{ path: '/', public: true },
	{ path: '/auth', public: true },
	{ path: '/dashboard', roles: '*' },
	{ path: '/admin', roles: ['admin'] },
	{ path: '/data', roles: '*' },
	{ path: '/data/facts', roles: '*' },
	{ path: '/data/admin-stats', roles: ['admin'] }
]

// Rules expressed the way the RoleCard / SentryConfigPanel render them
export const ROUTE_ACCESS = [
	{ path: '/dashboard', roles: '*', allowed: true },
	{ path: '/data', roles: '*', allowed: true },
	{ path: '/admin', roles: ['admin'], allowed: false }
]

export const ADAPTER_ENV = {
	supabase: {
		url: 'PUBLIC_SUPABASE_URL',
		anonKey: 'PUBLIC_SUPABASE_ANON_KEY'
	},
	firebase: {
		apiKey: 'PUBLIC_FIREBASE_API_KEY',
		projectId: 'PUBLIC_FIREBASE_PROJECT_ID',
		appId: 'PUBLIC_FIREBASE_APP_ID',
		authEmulatorHost: 'PUBLIC_FIREBASE_AUTH_EMULATOR_HOST'
	},
	convex: {
		url: 'PUBLIC_CONVEX_URL'
	}
}

/** @typedef {{ name: string, mode?: 'otp' | 'password' | 'oauth', label: string }} ProviderConfig */

// Providers per adapter (what the AuthCard renders)
/** @type {Record<string, Array<ProviderConfig>>} */
export const ADAPTER_PROVIDERS = {
	supabase: [
		{ name: 'google', label: 'Continue with Google' },
		{ mode: 'otp', name: 'magic', label: 'Email Magic Link' }
	],
	firebase: [
		{ name: 'google', label: 'Continue with Google' },
		{ mode: 'otp', name: 'magic', label: 'Email Magic Link' }
	],
	convex: [{ name: 'google', label: 'Continue with Google' }]
}

export const COPY = {
	signIn: {
		title: 'Sign in',
		subtitle: '{adapter} · Kavach Demo',
		testCredentials: 'Test credentials: test@test.com / password123',
		back: '← Back'
	},
	demo: {
		appName: 'DemoApp',
		sidebar: {
			dashboard: 'Dashboard',
			data: 'Space Facts',
			admin: 'Admin Panel',
			signOut: 'Sign Out'
		},
		otherAdapters: 'Other demos',
		comingSoon: 'Coming soon',
		roleCard: {
			title: 'Your Role',
			unauthenticated: 'unauthenticated',
			authenticated: 'authenticated'
		},
		data: {
			title: 'Space Facts',
			subtitle: 'Role-gated data — general facts for all users, classified for admins.',
			load: 'Load Facts',
			loading: 'Loading…',
			adminBadge: '👑 Admin — you can see classified facts',
			userBadge: '🔑 Authenticated — general facts only',
			classified: 'CLASSIFIED',
			ruleLabel: 'Kavach rule',
			ruleNote:
				'The API filters classified facts server-side based on role — no client-side filtering.'
		},
		hacker: {
			modeLabel: 'Hacker Mode',
			adminOnly: 'Admin only',
			unlocked: 'Hacker Mode: navigation enabled'
		}
	}
}

/** @param {string} adapterId */
export function isLive(adapterId) {
	const adapter = ADAPTERS[adapterId]
	return Boolean(adapter?.live ?? Boolean(adapter?.demoUrl))
}
