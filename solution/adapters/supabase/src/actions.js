import { parseFilter, parseQueryParams } from '@kavach/query'

/**
 * Normalizes a Supabase query result into a consistent ActionResponse shape.
 *
 * @param {object} result - Raw Supabase query result
 * @returns {import('kavach').ActionResponse}
 */
function normalizeResponse(result) {
	return {
		data: result.data ?? null,
		error: result.error ?? null,
		status: result.status ?? (result.error ? 500 : 200),
		count: result.count
	}
}

/**
 * Creates a wrapper object for various actions on an entity
 *
 * @param {import('@supabase/supabase-js').SupabaseClient} client
 * @returns {import('kavach').ServerAction}
 */
export function getActions(client, schema) {
	const schemaClient = schema ? client.schema(schema) : client

	/**
	 * @param {string} entity
	 * @param {any}    data
	 * @returns {Promise<import('kavach').ActionResponse>}
	 */
	async function get(entity, data) {
		const { columns, filters, orders, limit, offset, count } = parseQueryParams(data)

		let query = schemaClient.from(entity).select(columns, count ? { count } : undefined)

		for (const { column, op, value } of filters) {
			query = query[op](column, value)
		}
		for (const { column, ascending } of orders) {
			query = query.order(column, { ascending })
		}
		if (limit !== undefined) query = query.limit(limit)
		if (offset !== undefined) query = query.range(offset, offset + (limit ?? 1000) - 1)

		return normalizeResponse(await query)
	}

	async function patch(entity, input) {
		const { data, filter = {} } = input ?? {}
		let query = schemaClient.from(entity).update(data)

		for (const { column, op, value } of parseFilter(filter)) {
			query = query[op](column, value)
		}

		return normalizeResponse(await query.select())
	}

	async function del(entity, input) {
		const { filter = {} } = input ?? {}
		let query = schemaClient.from(entity).delete()

		for (const { column, op, value } of parseFilter(filter)) {
			query = query[op](column, value)
		}

		return normalizeResponse(await query)
	}

	return {
		get,
		put: async (entity, data) => normalizeResponse(await schemaClient.from(entity).insert(data).select()),
		post: async (entity, data) => normalizeResponse(await schemaClient.from(entity).upsert(data).select()),
		patch,
		delete: del,
		call: async (entity, data) => normalizeResponse(await schemaClient.rpc(entity, data)),
		connection: schemaClient
	}
}
