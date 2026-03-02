import { json } from '@sveltejs/kit'
import { getEntity } from '$lib/db'
import { omit } from 'ramda'

const RESERVED = [':select', ':order', ':limit', ':offset', ':count']

function getActions(locals, schema) {
	const actions = locals.kavach.actions(schema)
	if (!actions) return null
	return actions
}

/** @type {import('@sveltejs/kit').RequestHandler} */
export async function GET({ params, url, locals }) {
	const { schema, entity } = getEntity(params.slug)
	const actions = getActions(locals, schema)
	if (!actions) return json({ error: 'Data operations not supported for this adapter' }, { status: 501 })

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

/** @type {import('@sveltejs/kit').RequestHandler} */
export async function POST({ params, request, locals }) {
	const { schema, entity } = getEntity(params.slug)
	const actions = getActions(locals, schema)
	if (!actions) return json({ error: 'Data operations not supported for this adapter' }, { status: 501 })

	const body = await request.json()
	const { data, error, status } = await actions.post(entity, body)

	if (error) return json({ error }, { status })
	return json(data)
}

/** @type {import('@sveltejs/kit').RequestHandler} */
export async function PUT({ params, request, locals }) {
	const { schema, entity } = getEntity(params.slug)
	const actions = getActions(locals, schema)
	if (!actions) return json({ error: 'Data operations not supported for this adapter' }, { status: 501 })

	const body = await request.json()
	const { data, error, status } = await actions.put(entity, body)

	if (error) return json({ error }, { status })
	return json(data)
}

/** @type {import('@sveltejs/kit').RequestHandler} */
export async function PATCH({ params, request, locals }) {
	const { schema, entity } = getEntity(params.slug)
	const actions = getActions(locals, schema)
	if (!actions) return json({ error: 'Data operations not supported for this adapter' }, { status: 501 })

	const body = await request.json()
	const { data, error, status } = await actions.patch(entity, body)

	if (error) return json({ error }, { status })
	return json(data)
}

/** @type {import('@sveltejs/kit').RequestHandler} */
export async function DELETE({ params, request, locals }) {
	const { schema, entity } = getEntity(params.slug)
	const actions = getActions(locals, schema)
	if (!actions) return json({ error: 'Data operations not supported for this adapter' }, { status: 501 })

	const body = await request.json()
	const { data, error, status } = await actions.delete(entity, body)

	if (error) return json({ error }, { status })
	return json(data)
}
