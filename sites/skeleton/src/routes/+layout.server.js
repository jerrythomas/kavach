/** @type {import('./$types').LayoutServerLoad} */
export function load({ locals }) {
	return {
		...locals,
		version: __APP_VERSION__
	}
}
