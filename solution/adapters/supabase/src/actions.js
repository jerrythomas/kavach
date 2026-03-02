import { parseFilter } from '@kavach/query'

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
		const { columns = '*', filter = {} } = data ?? {}
		let query = schemaClient.from(entity).select(columns)

		for (const { column, op, value } of parseFilter(filter)) {
			query = query[op](column, value)
		}

		return await query
	}

	return {
		get,
		put: (entity, data) => schemaClient.from(entity).insert(data).select(),
		post: (entity, data) => schemaClient.from(entity).upsert(data).select(),
		patch: (entity, data) => schemaClient.from(entity).update(data).select(),
		delete: (entity, data) => schemaClient.from(entity).delete().match(data),
		call: (entity, data) => schemaClient.rpc(entity, data),
		connection: schemaClient
	}
}
