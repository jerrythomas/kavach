// src/routes/+layout.ts
// import type { LayoutLoad } from './$types';
// import { getSupabase } from '@supabase/auth-helpers-sveltekit'
import { kavach } from '$lib/config'
import { redirect } from '@sveltejs/kit'

/** @type {import('./$types').LayoutLoad} */
export async function load(event) {
	const params = Object.fromEntries(event.url.searchParams.entries())
	const session = kavach.session
	console.log('client side session', session)
	const pathname = kavach.deflectedPath(event.url)

	if (pathname != event.url.pathname) {
		throw redirect(307, pathname)
	}

	return { session, params }
}
