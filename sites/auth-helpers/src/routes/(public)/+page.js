import { redirect } from '@sveltejs/kit'
import { logger } from '$lib/logger'
import { kavach } from '$lib/auth'

/** @type {import('./$types').PageLoad} */
export const load = async (event) => {
	const { session } = await kavach.getSupabase(event)
	await logger.debug({
		module: 'page.js',
		method: 'load',
		url_path: event.url.pathname,
		data: { session }
	})
	if (session) {
		throw redirect(303, '/dashboard')
	}
}
