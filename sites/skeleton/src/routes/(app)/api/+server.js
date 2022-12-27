import { kavach } from '$lib/auth'

/** @type {import('./$types').RequestHandler} */
export async function POST() {
	// event.locals['key'] = event.url.pathname;
	let session = kavach.client.getSession()
	if (session) {
		console.log('session in api', session.user.email)
	} else {
		console.log('no session in api')
	}
	return { session }
}
