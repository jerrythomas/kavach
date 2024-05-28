/** @type {import('./$types').LayoutServerLoad} */
export function load({ locals }) {
	return {
		// @ts-ignore
		// eslint-disable-next-line no-undef
		version: __APP_VERSION__,
		title: 'Supabase auth starter.',
		profile: null,
		...locals
	}
}
