export const APP_AUTH_CONTEXT = 'app:context:auth'
export const RUNNING_ON = typeof window === 'undefined' ? 'server' : 'browser'
export const HTTP_STATUS_MESSAGE = {
	401: 'Unauthorized',
	403: 'Forbidden',
	404: 'Not Found'
}
export const DEFAULT_COOKIE_OPTIONS = {
	path: '/',
	httpOnly: true,
	secure: true,
	sameSite: 'strict',
	maxAge: 24 * 60 * 60
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
]

export const DEFAULT_AUTH_ICONS = [...AUTH_PROVIDERS, 'password'].map((i) => `i-auth-${i}`)
