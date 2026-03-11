import { redirect } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = ({ locals, params }) => {
	const role = locals.session?.user?.role
	if (!role || role !== 'admin') {
		redirect(303, `/demo/${params.platform}`)
	}
	return {
		session: locals.session
	}
}
