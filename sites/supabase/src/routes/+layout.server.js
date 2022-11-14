// src/routes/+layout.server.ts
// import type { LayoutServerLoad } from './$types'
// import { getServerSession } from '@supabase/auth-helpers-sveltekit'
// import { redirect } from '@sveltejs/kit'
import { kavach, logger } from '$lib/session'
/** @type {import('./$types').LayoutServerLoad} */
export async function load(event) {
	await logger.debug({
		url_path: event.url.pathname,
		module: './layout.js',
		method: 'load',
		message: 'auth changed',
		data: { locals: event.locals }
	})

	return {
		session: kavach.getSession(event)
	}
}
