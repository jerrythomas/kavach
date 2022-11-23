import { kavach } from '$lib/config'

/** @type {import('./$types').LayoutServerLoad} */
export async function load(event) {
	console.log('event.locals on server', event.locals)
	const session = kavach.session
	return session
}
