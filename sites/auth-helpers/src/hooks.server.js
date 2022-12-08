// import '$lib/db'
// import { logger } from '$lib/logger'
import { kavach } from '$lib/auth'
import { sequence } from '@sveltejs/kit/hooks'

/** @type {import('@sveltejs/kit').Handle} */
// export const handle = sequence(...kavach.handlers)
export async function handle({ event, resolve }) {
	// 	const session = await kavach.getServerSession(event)
	if (event.url.pathname.startsWith('/auth/signout')) {
		console.log('hooks- signout')
		await kavach.signOut(event)
		// return new Response('')
		console.log('hooks- signedout')
		return Response.redirect(event.url.origin + '/', 303)
	}
	const response = await resolve(event)
	return response
}

// maybe handlefetch can be used to update the cookies?

// /** @type {import('@sveltejs/kit').HandleFetch} */
// export async function handleFetch({ request, fetch }) {
//   if (request.url.startsWith('https://api.yourapp.com/')) {
//     // clone the original request, but change the URL
//     request = new Request(
//       request.url.replace('https://api.yourapp.com/', 'http://localhost:9999/'),
//       request
//     );
//   }
//   if (request.url.startsWith('https://api.my-domain.com/')) {
//     request.headers.set('cookie', event.request.headers.get('cookie'));
//   }
//   return fetch(request);
// }
