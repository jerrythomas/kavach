import { logger } from '$lib/logger'
import { kavach } from '$lib/auth'

/** @type {import('./$types').LayoutLoad} */
export const load = async (event) => {
	const { session } = await kavach.getSupabase(event)
	await logger.debug({
		module: 'layout.js',
		method: 'load',
		url_path: event.url.pathname,
		data: { session }
	})
	return { session }
}
