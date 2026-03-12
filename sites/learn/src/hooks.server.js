import { kavach } from '$kavach/auth'

export const handle = async ({ event, resolve }) => {
	const result = await kavach.handle({ event, resolve })
	console.log(
		`[hook] ${event.url.pathname} → status=${result?.status} location=${result?.headers?.get('location')}`
	)
	return result
}
