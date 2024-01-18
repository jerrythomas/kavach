/** @type {import('./$types').LayoutServerLoad} */
export async function load({ locals }) {
	return {
		// eslint-disable-next-line no-undef
		// @ts-ignore
		version: __APP_VERSION__,
		title: 'Supabase auth starter.',
		profile: null,
		...locals
	}
}
