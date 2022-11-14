import { logger } from '$lib'
// hooks client only allows handleError

/** @type {import('@sveltejs/kit').HandleClientError} */
export async function handleError({ error, event }) {
	await logger.error({
		module: 'hooks.client.js',
		method: 'handleError',
		url_path: event.url.pathname,
		url_hash: event.url.hash,
		error
	})

	return {
		message: 'Whoops!'
		// code: error.code ?? 'UNKNOWN',
		// path: event.url.pathname,
		// hash: event.url.hash
	}
}
