import { logger } from '$lib'

/** @type {import('./$types').LayoutServerLoad} */
export async function load(event) {
	await logger.info({
		module: '/layout.server.js',
		method: 'load',
		url_path: event.url.pathname
		// hash: event.url.hash
	})
	return {}
}
