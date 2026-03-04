export const APP_AUTH_CONTEXT = 'app:context:auth'
export const RUNNING_ON: 'server' | 'browser' = typeof window === 'undefined' ? 'server' : 'browser'

export const HTTP_STATUS_MESSAGE: Record<number, string> = {
	401: 'Unauthorized',
	403: 'Forbidden',
	404: 'Not Found'
}

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
