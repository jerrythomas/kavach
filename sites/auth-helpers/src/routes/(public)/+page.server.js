import { invalid } from '@sveltejs/kit'
import { logger } from '$lib/logger'
import { kavach } from '$lib/auth'

/** @type {import('./$types').Actions} */
export const actions = {
	async default(event) {
		const { request, url } = event
		const { session, supabaseClient } = await kavach.getSupabase(event)

		const formData = await request.formData()
		const email = formData.get('email')

		const { error } = await supabaseClient.auth.signInWithOtp({
			email,
			options: {
				emailRedirectTo: `${url.origin}/logging-in`
			}
		})

		await logger.debug({
			module: 'page.server.js',
			method: 'actions',
			url_path: event.url.pathname,
			data: { session }
		})

		if (error) {
			return invalid(400, {
				error: error.message,
				values: { email }
			})
		}

		return {
			success: true,
			message:
				'Please check your email for a magic link to log into the website.'
		}
	}
}
