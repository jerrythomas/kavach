enum RUN_CONTEXT {
	SERVER = 'server',
	BROWSER = 'browser',
}
export const APP_AUTH_CONTEXT = 'app:context:auth'
export const RUNNING_ON: RUN_CONTEXT = typeof window === 'undefined' ? RUN_CONTEXT.SERVER : RUN_CONTEXT.BROWSER

export const HTTP_STATUS_MESSAGES = {
	401: 'Unauthorized',
	403: 'Forbidden',
	404: 'Not Found'
} as const

export const DEFAULT_COOKIE_OPTIONS = {
	path: '/',
	httpOnly: true,
	secure: true,
	sameSite: 'strict' as const,
	maxAge: 24 * 60 * 60
}

export interface CookieOptions {
	path?: string
	httpOnly?: boolean
	secure?: boolean
	sameSite?: 'none' | 'strict' | 'lax'
	maxAge?: number
}

export const AUTH_PROVIDERS = [
	'google',
	'azure',
	'email',
	'phone',
	'apple',
	'linkedin',
	'microsoft',
	'yahoo',
	'github',
	'magic',
	'twitter',
	'facebook'
] as const

export type AuthProviderName = (typeof AUTH_PROVIDERS)[number]

export const DEFAULT_AUTH_ICONS = [...AUTH_PROVIDERS, 'password'].map((i) => `i-auth-${i}`)
