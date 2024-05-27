export const APP_AUTH_CONTEXT = 'app:context:auth'
export const RUNNING_ON = typeof window === 'undefined' ? 'server' : 'browser'
export const HTTP_STATUS_MESSAGE = {
	401: 'Unauthorized',
	403: 'Forbidden',
	404: 'Not Found'
}
