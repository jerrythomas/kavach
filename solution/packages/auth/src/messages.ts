export { HTTP_STATUS_MESSAGES } from './constants'

export const MESSAGES = {
	NOT_AUTHENTICATED: 'Not authenticated',
	NOT_AUTHORIZED: 'Not authorized',
	FORBIDDEN: 'Forbidden',
	DATA_NOT_SUPPORTED: 'Data operations not supported',
	RPC_NOT_SUPPORTED: 'RPC operations not supported',
	INVALID_CREDENTIALS: 'Invalid credentials',
	SERVER_ERROR: 'Server error. Try again later',
	MAGIC_LINK_SENT: (email: string) => `Magic link has been sent to "${email}".`,
	SYNC_FAILED: 'Failed to synchronize session',
	UNKNOWN_ERROR: 'Unknown error',
	ERROR_OCCURRED: 'An error occurred',
	UNSUPPORTED_PROVIDER: (provider: string) => `Unsupported provider: ${provider}`,
	PASSKEY_NOT_SUPPORTED: 'Passkey authentication is not yet supported by this adapter',
	NOT_FOUND: 'Not found'
} as const

export type MessageCode = keyof typeof MESSAGES
