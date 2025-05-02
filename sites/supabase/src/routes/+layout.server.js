/** @type {import('./$types').LayoutServerLoad} */
export function load({ locals }) {
	return {
		// @ts-ignore

		version: __APP_VERSION__,
		title: 'Supabase auth starter.',
		profile: null,
		...locals
	}
}
