import { getTableAndSchema } from './utils'

/**
 * Creates a wrapper object for various actions on an entity
 *
 * @param {import('@supabase/supabase-js').SupabaseClient} client
 * @returns {import('@kavach/core').ServerAction}
 */
export function getActions(client) {
	function getBaseQuery(entity) {
		const { schema, table } = getTableAndSchema(entity)
		const query = schema ? client.schema(schema).from(table) : client.from(table)
		return query
	}

	/**
	 * @param {string} entity
	 * @param {any}    data
	 * @returns {Promise<import('@kavach/core').ActionResponse>}
	 */
	async function get(entity, data) {
		const { columns = '*', filter = {} } = data ?? {}
		const query = getBaseQuery(entity)
		const result = await query.select(columns).match(filter)
		return result
	}

	return {
		get,
		put: (entity, data) => getBaseQuery(entity).insert(data).select(),
		post: (entity, data) => getBaseQuery(entity).upsert(data).select(),
		patch: (entity, data) => getBaseQuery(entity).update(data).select(),
		delete: (entity, data) => getBaseQuery(entity).delete().match(data),
		call: (entity, data) => client.rpc(entity, data),
		connection: client
	}
}
