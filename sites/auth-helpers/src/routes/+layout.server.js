// import type { LayoutServerLoad } from './$types';
import { logger } from '$lib/logger'
import { kavach } from '$lib/auth'

/** @type {import('./$types').LayoutServerLoad} */
export const load = async (event) => {
	const session = await kavach.getServerSession(event)
	await logger.debug({
		module: 'layout.server.js',
		method: 'load',
		url_path: event.url.pathname,
		data: {}
	})
	return {
		session
	}
}
