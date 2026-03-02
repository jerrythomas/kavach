/**
 * Resolve which adapter to use.
 * Precedence: URL param > cookie > env var > 'supabase'
 *
 * @param {object} options
 * @param {URL}    options.url
 * @param {object} options.cookies - SvelteKit cookies object
 * @param {object} options.env     - public env vars
 * @param {boolean} [options.devMode=true] - whether dev-mode switching is enabled
 * @returns {string} adapter name
 */
export function resolveAdapterName({ url, cookies, env, devMode = true }) {
	if (devMode) {
		const fromUrl = url.searchParams.get('adapter')
		if (fromUrl) return fromUrl

		const fromCookie = cookies.get('kavach-adapter')
		if (fromCookie) return fromCookie
	}

	return env.PUBLIC_AUTH_ADAPTER || 'supabase'
}
