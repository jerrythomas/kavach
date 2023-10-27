/** @type {import('./$types').LayoutServerLoad} */
export async function load({ locals }) {
	return {
		...locals,
		// eslint-disable-next-line no-undef
		version: __APP_VERSION__
	}
}
