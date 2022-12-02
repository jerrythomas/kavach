import { kavach } from '$lib/config'

/** @type {import('./$types').LayoutServerLoad} */
export async function load(event) {
	console.log('on server', event.locals, kavach.session)
	const session = kavach.session
	return session
}
