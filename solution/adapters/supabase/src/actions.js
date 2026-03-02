import { parseFilter, parseQueryParams } from '@kavach/query'

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

		return await query
	}

	async function patch(entity, input) {
		const { data, filter = {} } = input ?? {}
		let query = schemaClient.from(entity).update(data)

		for (const { column, op, value } of parseFilter(filter)) {
			query = query[op](column, value)
		}

		return await query.select()
	}

	async function del(entity, input) {
		const { filter = {} } = input ?? {}
		let query = schemaClient.from(entity).delete()

		for (const { column, op, value } of parseFilter(filter)) {
			query = query[op](column, value)
		}

		return await query
	}

	return {
		get,
		put: (entity, data) => schemaClient.from(entity).insert(data).select(),
		post: (entity, data) => schemaClient.from(entity).upsert(data).select(),
		patch,
		delete: del,
		call: (entity, data) => schemaClient.rpc(entity, data),
		connection: schemaClient
	}
}
