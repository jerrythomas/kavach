import { logger } from '$lib'

/** @type {import('./$types').PageLoad} */
export async function load({ url }) {
	await logger.info({
		module: '/page.js',
		method: 'load',
		url_path: url.pathname
	})
	return { what: 'page' }
}
