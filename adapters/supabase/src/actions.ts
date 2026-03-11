import { parseFilter, parseQueryParams } from '@kavach/query'
import type { ActionResponse } from 'kavach'

function normalizeResponse(result: { 
	data?: unknown; 
	error?: Error | null; 
	status?: number; 
	count?: number 
}): ActionResponse {
	return {
		data: result.data ?? null,
		error: result.error ?? null,
		status: result.status ?? (result.error ? 500 : 200),
		count: result.count
	}
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getActions(client: any, schema?: string) {
	const schemaClient = schema ? client.schema(schema) : client

	async function get(entity: string, data?: Record<string, string>): Promise<ActionResponse> {
		const { columns, filters, orders, limit, offset, count } = parseQueryParams(data)

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		let query: any = schemaClient.from(entity).select(columns, count ? { count } : undefined)

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

	async function patch(entity: string, input?: { data?: Record<string, unknown>; filter?: Record<string, string> }): Promise<ActionResponse> {
		const { data, filter = {} } = input ?? {}
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		let query: any = schemaClient.from(entity).update(data)

		for (const { column, op, value } of parseFilter(filter)) {
			query = query[op](column, value)
		}

		return normalizeResponse(await query.select())
	}

	async function del(entity: string, input?: { filter?: Record<string, string> }): Promise<ActionResponse> {
		const { filter = {} } = input ?? {}
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		let query: any = schemaClient.from(entity).delete()

		for (const { column, op, value } of parseFilter(filter)) {
			query = query[op](column, value)
		}

		return normalizeResponse(await query)
	}

	return {
		get,
		put: async (entity: string, data: Record<string, unknown>) => normalizeResponse(await schemaClient.from(entity).insert(data).select()),
		post: async (entity: string, data: Record<string, unknown>) => normalizeResponse(await schemaClient.from(entity).upsert(data).select()),
		patch,
		delete: del,
		call: async (entity: string, data: Record<string, unknown>) => normalizeResponse(await schemaClient.rpc(entity, data)),
		connection: schemaClient
	}
}
