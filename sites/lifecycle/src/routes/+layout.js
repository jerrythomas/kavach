import { logger } from '$lib'
/** @type {import('./$types').LayoutLoad} */
export async function load({ url }) {
	await logger.info({
		module: '/layout.js',
		method: 'load',
		url_path: url.pathname
	})
	return { what: 'layout', path: url.pathname }
}
