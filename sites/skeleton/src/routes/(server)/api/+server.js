import { kavach } from '$lib/auth'
import { json } from '@sveltejs/kit'

/** @type {import('./$types').RequestHandler} */
export async function POST() {
	// event.locals['key'] = event.url.pathname;
	console.log('api +server.js')
	let session = kavach.client.getSession()
	if (session) {
		console.log('session in api', session.user.email)
	} else {
		console.log('no session in api')
	}
	return json({ session })
}
