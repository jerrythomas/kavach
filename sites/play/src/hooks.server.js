import { sequence } from '@sveltejs/kit/hooks'
import { kavach } from '$lib/config'

/** @type {import('@sveltejs/kit').Handle} */
export const handle = sequence(...kavach.handlers)
// export async function handle({ event, resolve }) {
// 	console.log('handle', event.url.pathname)
// 	const response = await resolve(event)
// 	return response
// }
