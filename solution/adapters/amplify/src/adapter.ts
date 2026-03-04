import {
	signIn,
	signUp,
	signOut,
	fetchAuthSession,
	signInWithRedirect,
	getCurrentUser
} from 'aws-amplify/auth'
import { Hub } from 'aws-amplify/utils'
import { BaseAdapter } from 'kavach'
import type { AuthAdapter, AuthCallback, AuthResult } from 'kavach'

function omit(keys: string[], obj: Record<string, unknown>): Record<string, unknown> {
	const result = { ...obj }
	for (const key of keys) {
		delete result[key]
	}
	return result
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function transformResult(result: any, credentials: Record<string, unknown>): AuthResult {
	const creds = omit(['password'], credentials)

	if (result?.error) {
		const code = result.error.code || result.error.name || undefined
		const message = result.error.message || 'An error occurred'
		// Normalize to AuthResult shape
		return {
			type: 'error',
			error: { message, code },
			message
		}
	}

	if (creds.provider === 'magic') {
		const message = `Magic link has been sent to "${creds.email}".`
		// Magic-link responses are informational and include credentials
		return { type: 'info', message, data: result?.data ?? null, credentials: creds }
	}

	// Standard success response includes credentials
	return { type: 'success', data: result?.data ?? null, credentials: creds }
}

export function getAuthMode(credentials: Record<string, unknown>): 'magic' | 'password' | 'oauth' {
	const { password, provider } = credentials
	if (provider === 'magic') return 'magic'
	if (password) return 'password'
	return 'oauth'
}

export function parseUrlError(url: string | { search?: string } | undefined): AuthResult | null {
	try {
		const search = typeof url === 'string' ? url : url?.search ?? ''
		const params = new URLSearchParams(search)
		const errorCode = params.get('error')
		const errorMessage = params.get('error_description')

		if (errorCode) {
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

/**
 * Class-based Amplify adapter
 *
 * Encapsulates the amplify client interactions in a named class that implements
 * the shared AuthAdapter interface. This replaces the previous factory-style
 * `getAdapter()` that returned a plain object, enabling easier extension and
 * clearer instance state management.
 */
export class AmplifyAuthAdapter extends BaseAdapter implements AuthAdapter {
	/**
	 * No explicit client instance is required for aws-amplify's auth helpers used
	 * here, but keeping this constructor allows extension in future.
	 */
	constructor(options?: any) {
		super(undefined, options)
	}

	private async handleSignIn(credentials: Record<string, unknown>): Promise<AuthResult> {
		const { email, password, provider } = credentials
		const mode = getAuthMode(credentials)

		try {
			const signInActions = {
				password: async () => {
					const result = await signIn({ username: email as string, password: password as string })
					return result
				},
				oauth: async () => {
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					await signInWithRedirect({ provider: provider as any })
					return null
				},
				magic: async () => {
					await signIn({ username: email as string, options: { authFlowType: 'USER_AUTH' } })
					return null
				}
			}

			const data = await signInActions[mode]()
			return transformResult({ data }, credentials)
		} catch (error) {
			return transformResult({ error }, credentials)
		}
	}

	private async handleSignUp(credentials: Record<string, unknown>): Promise<AuthResult> {
		const { email, password } = credentials
		try {
			const result = await signUp({ username: email as string, password: password as string })
			return transformResult({ data: result }, credentials)
		} catch (error) {
			return transformResult({ error }, credentials)
		}
	}

	private async handleSignOut(): Promise<void> {
		await signOut()
	}

	public async signIn(credentials: Record<string, unknown>): Promise<AuthResult> {
		return this.handleSignIn(credentials)
	}

	public async signUp(credentials: Record<string, unknown>): Promise<AuthResult> {
		return this.handleSignUp(credentials)
	}

	public async signOut(): Promise<unknown> {
		await this.handleSignOut()
		return undefined
	}

	public async synchronize(): Promise<{ data: unknown; error: null } | { data: null; error: { message: string } }> {
		try {
			const session = await fetchAuthSession()
			const user = await getCurrentUser()
			// Tests and consumers expect { data: { session, user }, error: null }
			return { data: { session, user }, error: null } as unknown as AuthResult
		} catch (error) {
			// Return the { data: null, error: { message } } shape to match consumers/tests
			return { data: null, error: { message: (error as Error).message || 'An error occurred' } } as unknown as AuthResult
		}
	}

	public onAuthChange(callback: AuthCallback): () => void {
		// Use BaseAdapter subscription helper to normalize Hub.listen into AuthCallback contract.
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		return this.handleSubscription((cb) =>
			Hub.listen('auth', ({ payload }: any) => {
				const event = payload.event === 'signedIn' ? 'SIGNED_IN' : 'SIGNED_OUT'
				void cb(event, payload.data)
			})
		, callback)
	}

	public parseUrlError(url: string | { search?: string } | undefined) {
		return parseUrlError(url)
	}

	// optional capabilities property left undefined by default
	public capabilities?: string[]
}

/**
 * Backwards-compatible factory function.
 * Returns an instance of the class-based adapter so existing call-sites that
 * use `getAdapter()` don't need to change.
 */
export function getAdapter(): AmplifyAuthAdapter {
	return new AmplifyAuthAdapter()
}
