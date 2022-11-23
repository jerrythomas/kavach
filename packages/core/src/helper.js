/**
 * Checks if the url contains non empty 'access_token' in the url hash
 *
 * @param {String} url
 * @returns {boolean}
 */
export function hasAuthParams(url) {
	const params = urlHashToParams(url)
	return 'access_token' in params && params.access_token.length > 0
}

/**
 * Extracts key value pairs from the url hash.
 *
 * @param {String} url
 * @returns {Object} key value pair of all parameters in the hash
 */
export function urlHashToParams(url) {
	const [, hash] = url.split('#')
	if (hash && hash.length) {
		return hash
			.split('&')
			.map((kv) => kv.split('='))
			.reduce((acc, kv) => ({ ...acc, [kv[0]]: kv[1] }), {})
	}
	return {}
}
