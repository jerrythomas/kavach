import { json } from '@sveltejs/kit'
import { getEntity } from '$lib/db'
import { kavach } from '$lib/auth'
import { omit } from 'ramda'

/**
 * @type {import('@sveltejs/kit').RequestHandler}
 */
const RESERVED = [':select', ':order', ':limit', ':offset', ':count']

export async function GET({ params, url }) {
	const { schema, entity } = getEntity(params.slug)
	const actions = kavach.server(schema)
	const body = Object.fromEntries(url.searchParams.entries())

	const { data, error, count, status } = await actions.get(entity, {
		columns: body[':select'],
		order: body[':order'],
		limit: body[':limit'] ? Number(body[':limit']) : undefined,
		offset: body[':offset'] ? Number(body[':offset']) : undefined,
		count: body[':count'],
		filter: omit(RESERVED, body)
	})

	if (error) return json({ error }, { status })
	return json(count !== undefined ? { data, count } : data)
}

/**
 * @type {import('@sveltejs/kit').RequestHandler}
 */
export async function POST({ params, request }) {
	const { schema, entity } = getEntity(params.slug)
	const actions = kavach.server(schema)
	const body = await request.json()
	const { data, error, status } = await actions.post(entity, body)

	if (error) return json({ error }, { status })
	return json(data)
}

/**
 * @type {import('@sveltejs/kit').RequestHandler}
 */
export async function PUT({ params, request }) {
	const { schema, entity } = getEntity(params.slug)
	const actions = kavach.server(schema)
	const body = await request.json()
	const { data, error, status } = await actions.put(entity, body)

	if (error) return json({ error }, { status })
	return json(data)
}

/**
 * @type {import('@sveltejs/kit').RequestHandler}
 */
export async function PATCH({ params, request }) {
	const { schema, entity } = getEntity(params.slug)
	const actions = kavach.server(schema)
	const body = await request.json()
	const { data, error, status } = await actions.patch(entity, body)

	if (error) return json({ error }, { status })
	return json(data)
}

/**
 * @type {import('@sveltejs/kit').RequestHandler}
 */
export async function DELETE({ params, request }) {
	const { schema, entity } = getEntity(params.slug)
	const actions = kavach.server(schema)
	const body = await request.json()
	const { data, error, status } = await actions.delete(entity, body)

	if (error) return json({ error }, { status })
	return json(data)
}
