/**
 * BaseAdapter
 *
 * Abstract base class for Kavach auth adapters.
 *
 * Responsibilities:
 * - Provide a constructor that accepts a provider SDK `client` and optional `options`.
 * - Expose protected helpers to normalize provider SDK outputs to `AuthResult`.
 * - Provide a helper to adapt provider subscription APIs into the `AuthCallback` contract.
 * - Define abstract methods for provider-specific behavior so subclasses must implement them.
 *
 * Note: This file depends on the public types exported by the `kavach` package.
 */

import type { AuthAdapter, AuthResult, AuthCallback } from '../types.ts'

/**
 * A lightweight, opinionated base class implementing shared adapter helpers.
 *
 * Subclasses should extend this and implement the abstract methods:
 * - signIn
 * - signUp
 * - signOut
 * - synchronize
 *
 * Subclasses may override `transformResult` when they need provider-specific normalization.
 */
export abstract class BaseAdapter implements AuthAdapter {
	protected client: any
	protected options: any

	constructor(client?: any, options?: any) {
		this.client = client
		this.options = options ?? {}
	}

	/**
	 * Normalize a provider SDK response into the canonical `AuthResult`.
	 *
	 * Expected input shape:
	 *  - success: { data: ... }
	 *  - error: { error: { message?, code?, name?, status? }, data? }
	 *
	 * This default implementation tries to be permissive and map common shapes;
	 * concrete adapters may override to provide richer mapping.
	 */
	protected transformResult(
		raw: { data?: unknown; error?: any } | unknown,
		_creds?: Record<string, unknown>
	): AuthResult {
		// If the provider returned a wrapper object with `.error` and `.data`.
		// Otherwise assume it's already the raw success object.
		const maybe = raw as { data?: unknown; error?: any } | null

		if (maybe && maybe.error) {
			const err = maybe.error
			// Try to extract common error fields
			const status = (err && (err.status ?? err.statusCode)) ?? undefined
			const name = (err && (err.name ?? err.code)) ?? undefined
			const message =
				(err && (err.message ?? err.error_description ?? err.description)) ??
				String(err ?? 'Unknown error')

			return {
				type: 'error',
				status: typeof status === 'number' ? status : undefined,
				name: typeof name === 'string' ? name : undefined,
				message,
				data: maybe.data ?? null
			}
		}

		// If the provider returned an error directly
		if (maybe == null && raw == null) {
			return { type: 'success', data: null }
		}

		// If raw looks like an error object
		// @ts-ignore - defensive check
		if ((raw as any)?.message && (raw as any)?.code) {
			const r = raw as any
			return {
				type: 'error',
				name: r.code ?? r.name,
				message: r.message ?? String(r),
				data: r.data ?? null
			}
		}

		// Default success mapping
		// If `raw` is already `{ data: ... }`, use it. Otherwise return raw as data.
		if (maybe && 'data' in maybe) {
			return { type: 'success', data: maybe.data ?? null }
		}
		return { type: 'success', data: raw as unknown }
	}

	/**
	 * Adapt a provider subscription API into the `AuthCallback` shape.
	 *
	 * subscribeFn: a function that accepts a callback and returns either:
	 *  - an unsubscribe function, or
	 *  - an object with an `unsubscribe()` method, or
	 *  - a subscription handle (unknown) — will try to call `.unsubscribe()` if present.
	 *
	 * Returns a function that unsubscribes the subscription.
	 */
	protected handleSubscription(
		subscribeFn: (cb: (event: string, session: unknown) => void) => any,
		callback: AuthCallback
	): () => void {
		if (typeof subscribeFn !== 'function') return () => {}

		const sub = subscribeFn(async (event: string, session: unknown) => {
			// Ensure consumer callback is awaited but do not block the subscription API.
			try {
				await callback(event, session)
			} catch {
				// swallow errors from consumer callback to avoid breaking provider subscription internals
			}
		})

		// If subscribeFn returned an unsubscribe function directly
		if (typeof sub === 'function') return sub

		// If it returned an object with unsubscribe()
		if (sub && typeof sub.unsubscribe === 'function') {
			return () => {
				try {
					sub.unsubscribe()
				} catch {
					/* ignore unsubscribe errors */
				}
			}
		}

		// Some SDKs (e.g. Supabase) return a shape like:
		//   { data: { subscription } }
		// where the actual unsubscribe function is on subscription.unsubscribe()
		if (sub && sub.data && sub.data.subscription && typeof sub.data.subscription.unsubscribe === 'function') {
			return () => {
				try {
					sub.data.subscription.unsubscribe()
				} catch {
					/* ignore unsubscribe errors */
				}
			}
		}

		// No usable unsubscribe handle provided
		return () => {}
	}

	/**
	 * Default implementations of the AuthAdapter contract are abstract and must be implemented
	 * by concrete adapters.
	 */

	abstract signIn(credentials: Record<string, unknown>): Promise<AuthResult>

	abstract signUp(credentials: Record<string, unknown>): Promise<AuthResult>

	abstract signOut(): Promise<unknown>

	abstract synchronize(session: unknown): Promise<AuthResult>

	/**
	 * Default onAuthChange is a no-op. Adapters which support subscriptions should override
	 * to return an unsubscribe function that will be called to cleanup the subscription.
	 */
	onAuthChange(_fn: AuthCallback): () => void {
		return () => {}
	}

	/**
	 * Optional parseUrlError hook. Concrete adapters may implement this if they need to
	 * extract error info from redirect URLs (OAuth flows).
	 */
	parseUrlError?(url: string | { hash?: string; search?: string } | undefined): AuthResult | null

	/**
	 * Optional capabilities list provided by adapters (e.g. ['passkey']).
	 */
	capabilities?: string[]
}

export default BaseAdapter
