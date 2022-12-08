import { kavach } from '$lib/auth'

/** @type {import('./$types').RequestHandler} */
export async function POST(event) {
	console.log('endpoint- signout')
	await kavach.signOut(event)
	return new Response('')
}
