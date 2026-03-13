import { redirect } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = ({ locals }) => {
	const role = locals.session?.user?.role
	if (!role || role !== 'admin') {
		redirect(303, '/dashboard')
	}
	return { session: locals.session }
}
