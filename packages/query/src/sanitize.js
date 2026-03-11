/**
 * Strip internal details from an error, returning only safe fields.
 * Use this before sending errors to clients.
 *
 * @param {object} error - Raw error from adapter
 * @returns {{ message: string, code: string|undefined, status: number|undefined }}
 */
export function sanitizeError(error) {
	if (!error) return { message: 'Unknown error' }
	return {
		message: error.message || 'An error occurred',
		code: error.code,
		status: error.status
	}
}
