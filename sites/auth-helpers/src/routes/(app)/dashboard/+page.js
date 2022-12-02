import { redirect } from '@sveltejs/kit'
import { logger } from '$lib/logger'
import { kavach } from '$lib/auth'

/** @type {import (./$types).PageLoad} */
export const load = async (event) => {
	const { session, supabaseClient } = await kavach.getSupabase(event)

	await logger.debug({
		module: 'dashboard/page.js',
		method: 'load',
		url_path: event.url.pathname,
		data: { session }
	})
	if (!session) {
		throw redirect(303, '/')
	}
	const { data: testTable } = await supabaseClient.from('test').select('*')
	return {
		testTable,
		user: session.user
	}
}
