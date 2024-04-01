/**
 * @typedef ProviderConfig
 * @property {'otp'|'oauth'|'password'} mode - mode of auth
 * @property {string} name - the name of the provider
 * @property {string} label - label to be used in the input or button
 * @property {Array<string>} scopes - array of scopes for access
 * @property {Array<string|Object>} params - array of parameters for access
 */

/**
 * Converts an array of names into array of providers
 *
 * @param {Array<string>} names
 * @returns {Array<ProviderConfig>}
 */
export function getProviderConfigFromNames(names) {
	const providers = names.map((name) => ({
		mode: getModeForProvider(name),
		name: name.toLowerCase(),
		label: name === 'Magic' ? 'email for Magic Link' : `Sign in with ${name}`,
		scopes: [],
		params: getParamsForProvider(name)
	}))
	return providers
}

/**
 * Identifies mode based on the input
 *
 * @param  {string} name
 * @returns {'otp'|'oauth'|'password'}
 */
export function getModeForProvider(name) {
	if (name.toLowerCase() === 'magic') return 'otp'
	if (name.toLowerCase() === 'email') return 'password'
	if (name.toLowerCase() === 'phone') return 'password'
	return 'oauth'
}

/**
 *
 * @param {string} name
 * @returns {Array<string|Object>}
 */
export function getParamsForProvider(name) {
	const params =
		name === 'Microsoft'
			? [{ prompt: 'consent', domain_hint: 'organizations' }]
			: []

	return params
}

/**
 * Extracts the user info from the supabase user object
 *
 * @param {*} data
 * @returns
 */
export function getUserInfo(data) {
	const { id, role, email } = data
	const { avatar_url, full_name, app_metadata } = data.user_metadata ?? {}
	return {
		id,
		role,
		email,
		avatar_url,
		full_name,
		app_metadata
	}
}
