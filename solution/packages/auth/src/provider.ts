export interface ProviderConfig {
	mode: 'otp' | 'oauth' | 'password'
	name: string
	label: string
	scopes: string[]
	params: Array<string | object>
}

export type AuthMode = 'otp' | 'oauth' | 'password'

export function getModeForProvider(name: string): AuthMode {
	if (name.toLowerCase() === 'magic') return 'otp'
	if (name.toLowerCase() === 'email') return 'password'
	if (name.toLowerCase() === 'phone') return 'password'
	return 'oauth'
}

export function getParamsForProvider(name: string): Array<string | object> {
	if (name === 'Microsoft') {
		return [{ prompt: 'consent', domain_hint: 'organizations' }]
	}
	return []
}

export function getProviderConfigFromNames(names: string[]): ProviderConfig[] {
	const providers = names.map((name) => ({
		mode: getModeForProvider(name),
		name: name.toLowerCase(),
		label: name.toLowerCase() === 'magic' ? 'email for Magic Link' : `Sign in with ${name}`,
		scopes: [] as string[],
		params: getParamsForProvider(name)
	}))
	return providers
}

export interface UserInfo {
	id: string
	role: string
	email?: string
	avatar_url?: string
	full_name?: string
	app_metadata?: Record<string, unknown>
}

export function getUserInfo(data: { id: string; role: string; email?: string; user_metadata?: { avatar_url?: string; full_name?: string; app_metadata?: Record<string, unknown> } }): UserInfo {
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
