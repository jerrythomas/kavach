// import { logger } from '$lib'

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
	// await logger.info({
	// 	module: 'hooks.server.js',
	// 	method: 'handle',
	// 	url_path: event.url.pathname
	// })
	const response = await resolve(event)
	return response
}

/** @type {import('@sveltejs/kit').HandleServerError} */
// export async function handleError({ error, event }) {
// 	await logger.error({
// 		module: 'hooks.server.js',
// 		method: 'handle',
// 		url_path: event.url.pathname,
// 		url_hash: event.url.hash,
// 		error
// 	})

// 	return {
// 		message: 'Whoops!'
// 		// code: error.code ?? 'UNKNOWN'
// 	}
// }
