import { parseQueryParams } from '@kavach/query'

/**
 * @param {unknown} data
 * @param {unknown} [error]
 * @returns {{ data: unknown, error: unknown, status: number }}
 */
function normalizeResponse(data, error = null) {
	return {
		data: data ?? null,
		error: error ?? null,
		status: error ? 500 : 200
	}
}

/**
 * Resolve a dot-path like 'users.list' into a Convex function reference
 * from the api object (e.g., api.users.list).
 *
 * @param {object} api
 * @param {string} path - dot-separated path
 * @returns {unknown}
 */
function resolvePath(api, path) {
	return path.split('.').reduce((obj, key) => obj?.[key], api)
}

/**
 * Create data/RPC actions for a Convex backend.
 *
 * Convex is function-based; all data access goes through named functions.
 * This adapter uses a convention:
 *   get('entity', params) → client.query(api.entity.list, parsedParams)
 *   put('entity', data)   → client.mutation(api.entity.create, data)
 *   post('entity', data)  → client.mutation(api.entity.upsert, data)
 *   patch('entity', input)  → client.mutation(api.entity.update, input)
 *   delete('entity', input) → client.mutation(api.entity.remove, input)
 *   call('path', data)    → client.action(api.<path>, data)
 *
 * Your Convex backend must define the corresponding functions.
 * See the README for the expected function signatures.
 *
 * @param {object} client - ConvexReactClient or ConvexHttpClient
 * @param {object} api    - Convex generated API reference (from 'convex/_generated/api')
 * @returns {{ get, put, post, patch, delete, call, connection }}
 */
export function getActions(client, api) {
	if (!client) throw new Error('getActions requires a Convex client')
	if (!api) throw new Error('getActions requires a Convex api reference')

	async function invoke(clientMethod, path, args) {
		const ref = resolvePath(api, path)
		if (!ref)
			throw new Error(`No Convex function found at api.${path} — define it in your Convex backend`)
		try {
			return normalizeResponse(await client[clientMethod](ref, args))
		} catch (error) {
			return normalizeResponse(null, { message: error.message })
		}
	}

	async function get(entity, data) {
		const ref = resolvePath(api, `${entity}.list`)
		if (!ref)
			throw new Error(
				`No Convex query found at api.${entity}.list — define it in your Convex backend`
			)
		const { filters, orders, limit, offset } = parseQueryParams(data)
		try {
			return normalizeResponse(await client.query(ref, { filters, orders, limit, offset }))
		} catch (error) {
			return normalizeResponse(null, { message: error.message })
		}
	}

	return {
		get,
		put: (entity, data) => invoke('mutation', `${entity}.create`, data),
		post: (entity, data) => invoke('mutation', `${entity}.upsert`, data),
		patch: (entity, input = {}) => invoke('mutation', `${entity}.update`, input),
		delete: (entity, input = {}) => invoke('mutation', `${entity}.remove`, input),
		call: (path, data) => invoke('action', path, data),
		connection: client
	}
}
