import { json } from '@sveltejs/kit'
import { getEntity } from '$lib/db'
import { kavach } from '$lib/auth'
import { omit } from 'ramda'

/**
 * @type {import('@sveltejs/kit').RequestHandler}
 */
export async function GET({ params, url }) {
	const { schema, entity } = getEntity(params.slug)
	const actions = kavach.server(schema)
	const body = Object.fromEntries(url.searchParams.entries())
	const { data, error, status } = await actions.get(entity, {
		columns: body[':select'],
		filter: omit([':select'], body)
	})

	if (error) return json({ error }, { status })
	return json(data)
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
export async function DELETE({ params, request }) {
	const { schema, entity } = getEntity(params.slug)
	const actions = kavach.server(schema)
	const body = await request.json() //getRequestBody(request)
	const { data, error, status } = await actions.delete(entity, body)

	if (error) return json({ error }, { status })
	return json(data)
}
