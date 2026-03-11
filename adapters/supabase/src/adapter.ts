import { AuthApiError } from '@supabase/supabase-js'
import { urlHashToParams, type AuthAdapter, type AuthCallback, type AuthResult, BaseAdapter } from 'kavach'
import { defaultOrigin } from './constants'
import { pick, omit } from 'ramda'

/**
 * Module-level transformResult kept for canonical mapping and reuse.
 * Concrete adapter also exposes an instance method that delegates to this function.
 */
export function transformResult(result: { data?: unknown; error?: { status?: number; name?: string; message?: string } }, creds: Record<string, unknown>): AuthResult {
	let message = ''
	const credentials = omit(['password'], creds)

	if (result?.error) {
		message =
			result.error instanceof AuthApiError && result.error.status === 400
				? 'Invalid credentials.'
				: 'Server error. Try again later.'
		return {
			type: 'error',
			error: { status: result.error.status, name: result.error.name, message: result.error.message },
			message
		}
	} else if (credentials.provider === 'magic') {
		message = `Magic link has been sent to "${credentials.email}".`
		return { type: 'info', data: result?.data, credentials, message }
	}
	return { type: 'success', data: result?.data, credentials }
}

export function parseUrlError(url: string | { hash?: string } | undefined) {
	const urlString = typeof url === 'string' ? url : url?.hash ?? ''
	const result = urlHashToParams(urlString)
	if (result && result.error) {
		// Normalize status as a string and make the error name human-friendly
		return {
			status: result.error_code ? String(result.error_code) : undefined,
			name: typeof result.error === 'string' ? (result.error as string).replace(/_/g, ' ').toLowerCase() : result.error,
			message: result.error_description
		}
	}
	return null
}

/**
 * SupabaseAuthAdapter - class-based adapter implementing AuthAdapter.
 * Extends BaseAdapter to reuse standard helpers.
 */
export class SupabaseAuthAdapter extends BaseAdapter implements AuthAdapter {
	constructor(client: any, options?: any) {
		// @ts-ignore - BaseAdapter constructor accepts (client, options)
		super(client, options)
	}

	// Delegate to module-level transform for canonical behavior
	protected transformResult(result: { data?: unknown; error?: { status?: number; name?: string; message?: string } }, creds: Record<string, unknown> = {}): AuthResult {
		return transformResult(result, creds)
	}

	private getAuthMode(credentials: Record<string, unknown>): 'magic' | 'password' | 'oauth' {
		const { password, provider } = credentials
		if (provider === 'magic') return 'magic'
		if (password) return 'password'
		return 'oauth'
	}

	public async signIn(credentials: Record<string, unknown>): Promise<AuthResult> {
		const client = this.client
		const { email, phone, password, provider, scopes = [] } = credentials
		const redirectTo = (credentials.redirectTo as string) ?? defaultOrigin
		let creds: Record<string, unknown> | null = null
		const signInActions = {
			magic: async () => {
				creds = { email, options: { emailRedirectTo: redirectTo } }
				const result = await client.auth.signInWithOtp(creds)
				return result
			},
			password: async () => {
				creds = email ? { email, password } : { phone, password }
				const result = await client.auth.signInWithPassword(creds)
				return result
			},
			oauth: async () => {
				creds = { provider, options: { scopes: (scopes as string[]).join(' '), redirectTo } }
				const result = await client.auth.signInWithOAuth(creds)
				return result
			}
		}
		const mode = this.getAuthMode(credentials)
		const result = await signInActions[mode]()

		return this.transformResult(result, { ...(creds ?? {}), provider })
	}

	public async signUp(credentials: Record<string, unknown>): Promise<AuthResult> {
		const client = this.client
		const result = await client.auth.signUp(pick(['email', 'password'], credentials) as Record<string, unknown>)
		return this.transformResult(result, credentials)
	}

	public async signOut(): Promise<unknown> {
		return this.client.auth.signOut()
	}

	public async synchronize(session: unknown): Promise<AuthResult> {
		try {
			const result = await this.client.auth.setSession(session)
			return this.transformResult(result, {})
		} catch (error) {
			return { type: 'error', message: (error as Error).message || 'Failed to synchronize session' }
		}
	}

	public onAuthChange(callback: AuthCallback): () => void {
		// Use BaseAdapter helper to adapt the provider subscription API
		return this.handleSubscription((cb) => {
			// supabase client returns { data: { subscription } } from onAuthStateChange
			return this.client.auth.onAuthStateChange((event: string, session: unknown) => cb(event, session))
		}, callback)
	}

	public parseUrlError(url: string | { hash?: string } | undefined): AuthResult | null {
		return parseUrlError(url)
	}

	public capabilities?: string[]
}

/**
 * Factory exported for consumers: returns an instance of SupabaseAuthAdapter.
 * Consumers should prefer instantiating the class directly if they need to extend it.
 */
export function getAdapter(client: any): SupabaseAuthAdapter {
	return new SupabaseAuthAdapter(client)
}
