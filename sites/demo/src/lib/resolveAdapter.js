/**
 * Resolve which adapter to use.
 * Precedence: URL param > cookie > env var > 'supabase'
 *
 * @param {object} options
 * @param {URL}    options.url
 * @param {object} options.cookies - SvelteKit cookies object
 * @param {object} options.env     - public env vars
 * @param {boolean} [options.devMode=true] - whether dev-mode switching is enabled
 * @param {string[]} [options.available=[]] - list of known adapter names
 * @returns {string} adapter name
 */
export function resolveAdapterName({ url, cookies, env, devMode = true, available = [] }) {
	const fallback = env.PUBLIC_AUTH_ADAPTER || 'supabase'

	if (devMode) {
		const fromUrl = url.searchParams.get('adapter')
		if (fromUrl && available.includes(fromUrl)) return fromUrl

		const fromCookie = cookies.get('kavach-adapter')
		if (fromCookie && available.includes(fromCookie)) return fromCookie
	}

	return fallback
}
