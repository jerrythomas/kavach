/** @type {import('./$types').LayoutServerLoad} */
export function load({ locals }) {
	return {
		// @ts-ignore
		version: __APP_VERSION__,
		title: 'Kavach Demo',
		adapter: locals.adapter,
		adapters: locals.adapters,
		devMode: locals.devMode,
		...locals
	}
}
