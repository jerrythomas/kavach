import { omit } from 'ramda'
import { BaseAdapter } from 'kavach'
import type { AuthAdapter, AuthCallback, AuthResult } from 'kavach'

type AuthResult = { type: string; data?: unknown; error?: { message?: string; code?: string }; credentials?: Record<string, unknown>; message?: string }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function transformResult(result: any, credentials: Record<string, unknown> = {}): AuthResult {
	const creds = omit(['password'], credentials ?? {})

	// Error case: return error shape without attaching credentials to the error object
	if (result?.error) {
		const code = result.error.code || result.error.name || undefined
		const message = result.error.message || 'An error occurred'
		return {
			type: 'error',
			error: { message, code },
			message
		}
	}

	// Magic / OTP flows are informational and include the stripped credentials
	if (creds.provider === 'magic') {
		const message = `Magic link has been sent to "${creds.email}".`
		return { type: 'info', data: result?.data ?? null, credentials: creds, message }
	}

	// Standard success: include data and stripped credentials
	return { type: 'success', data: result?.data ?? null, credentials: creds }
}

export function getAuthMode(credentials: Record<string, unknown>): 'magic' | 'password' | 'oauth' {
	const { password, provider } = credentials
	if (provider === 'magic') return 'magic'
	if (password) return 'password'
	return 'oauth'
}

export function parseUrlError(url: string | { search?: string } | undefined) {
	try {
		const search = typeof url === 'string' ? url : url?.search ?? ''
		const params = new URLSearchParams(search)
		const errorCode = params.get('error')
		const errorMessage = params.get('error_description')

		if (errorCode) {
			// Tests expect a plain { code, message } shape from parseUrlError
			return {
				code: errorCode,
				message: errorMessage || errorCode
			}
		}
	} catch {
		// invalid URL, return null
	}
	return null
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
/**
 * Class-based Auth0 adapter
 *
 * Wraps the given Auth0 client instance in a class that implements the shared
 * AuthAdapter interface. This provides a named concrete type, easier extension,
 * and clearer instance state management while preserving existing helper logic.
 */
export class Auth0AuthAdapter extends BaseAdapter implements AuthAdapter {
	constructor(client: any, options?: any) {
		super(client, options)
	}

	public async signIn(credentials: Record<string, unknown>): Promise<AuthResult> {
		const { email, provider } = credentials
		const mode = getAuthMode(credentials)

		try {
			const signInActions: Record<string, () => Promise<any>> = {
				password: async () => {
					await this.client.loginWithRedirect({
						authorizationParams: {
							connection: 'Username-Password-Authentication',
							login_hint: email
						}
					})
					return null
				},
				oauth: async () => {
					await this.client.loginWithRedirect({
						authorizationParams: {
							connection: provider as string
						}
					})
					return null
				},
				magic: async () => {
					await this.client.loginWithRedirect({
						authorizationParams: {
							connection: 'email',
							login_hint: email
						}
					})
					return null
				}
			}

			const data = await signInActions[mode]()
			// Use module-level transformResult to ensure canonical public shape
			return transformResult({ data }, credentials)
		} catch (error) {
			return transformResult({ error }, credentials)
		}
	}

	public async signUp(credentials: Record<string, unknown>): Promise<AuthResult> {
		try {
			await this.client.loginWithRedirect({
				authorizationParams: {
					screen_hint: 'signup'
				}
			})
			// Use module-level transformResult for consistent public response
			return transformResult({ data: null }, credentials)
		} catch (error) {
			return transformResult({ error }, credentials)
		}
	}

	public async signOut(): Promise<unknown> {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const origin = (globalThis as any).window?.location?.origin ?? ''
		await this.client.logout({
			logoutParams: {
				returnTo: origin
			}
		})
		return undefined
	}

	public async synchronize(): Promise<{ data: unknown; error: null } | { data: null; error: { message: string } }> {
		try {
			await this.client.getTokenSilently()
			const user = await this.client.getUser()
			// Tests expect the shape: { data: { user }, error: null }
			return { data: { user }, error: null }
		} catch (error) {
			// Tests expect the shape: { data: null, error: { message } }
			return { data: null, error: { message: (error as Error).message || 'An error occurred' } }
		}
	}

	public onAuthChange(_callback: AuthCallback): () => void {
		// Auth0 SDK doesn't expose a subscription API in the same way; provide a no-op
		return () => {}
	}

	public parseUrlError(url: string | { search?: string } | undefined) {
		// Return the raw module-level parseUrlError result for compatibility with callers/tests.
		return parseUrlError(url)
	}
}

/**
 * Backwards-compatible factory function that returns a new instance of the class-based adapter.
 */
export function getAdapter(client: any): Auth0AuthAdapter {
	return new Auth0AuthAdapter(client)
}
