import { kavach } from '$lib/auth'

/** @type {import (./$types).Actions} */
export const actions = {
	async default(event) {
		console.log('action- signout')
		await kavach.signOut(event)
	}
}
