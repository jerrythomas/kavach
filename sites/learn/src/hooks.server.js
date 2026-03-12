import { kavach } from '$kavach/auth'

export const handle = async ({ event, resolve }) => {
	return kavach.handle({ event, resolve })
}
