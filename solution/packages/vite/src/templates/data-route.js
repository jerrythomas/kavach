import { json } from '@sveltejs/kit'
import { sanitizeError } from '@kavach/query'

function getActions(locals, slug) {
	const parts = slug.split('/')
	const schema = parts.length > 1 ? parts[0] : undefined
	const entity = parts.length > 1 ? parts.slice(1).join('/') : slug
	const actions = locals.kavach.actions(schema)
	if (!actions) return { entity, actions: null }
	return { entity, actions }
}

const RESERVED = [':select', ':order', ':limit', ':offset', ':count']

/** @type {import('@sveltejs/kit').RequestHandler} */
export async function GET({ params, url, locals }) {
	if (!locals.kavach) return json({ error: { message: 'Not authenticated' } }, { status: 401 })

	const { entity, actions } = getActions(locals, params.slug)
	if (!actions) return json({ error: { message: 'Data operations not supported' } }, { status: 501 })

	const body = Object.fromEntries(url.searchParams.entries())
	const filter = Object.fromEntries(
		Object.entries(body).filter(([k]) => !RESERVED.includes(k))
	)
	const { data, error, count, status } = await actions.get(entity, {
		columns: body[':select'],
		order: body[':order'],
		limit: body[':limit'] ? Number(body[':limit']) : undefined,
		offset: body[':offset'] ? Number(body[':offset']) : undefined,
		count: body[':count'],
		filter
	})

	if (error) return json({ error: sanitizeError(error) }, { status })
	return json(count !== undefined ? { data, count } : data)
}

/** @type {import('@sveltejs/kit').RequestHandler} */
export async function POST({ params, request, locals }) {
	if (!locals.kavach) return json({ error: { message: 'Not authenticated' } }, { status: 401 })

	const { entity, actions } = getActions(locals, params.slug)
	if (!actions) return json({ error: { message: 'Data operations not supported' } }, { status: 501 })

	const body = await request.json()
	const { data, error, status } = await actions.post(entity, body)

	if (error) return json({ error: sanitizeError(error) }, { status })
	return json(data)
}

/** @type {import('@sveltejs/kit').RequestHandler} */
export async function PUT({ params, request, locals }) {
	if (!locals.kavach) return json({ error: { message: 'Not authenticated' } }, { status: 401 })

	const { entity, actions } = getActions(locals, params.slug)
	if (!actions) return json({ error: { message: 'Data operations not supported' } }, { status: 501 })

	const body = await request.json()
	const { data, error, status } = await actions.put(entity, body)

	if (error) return json({ error: sanitizeError(error) }, { status })
	return json(data)
}

/** @type {import('@sveltejs/kit').RequestHandler} */
export async function PATCH({ params, request, locals }) {
	if (!locals.kavach) return json({ error: { message: 'Not authenticated' } }, { status: 401 })

	const { entity, actions } = getActions(locals, params.slug)
	if (!actions) return json({ error: { message: 'Data operations not supported' } }, { status: 501 })

	const body = await request.json()
	const { data, error, status } = await actions.patch(entity, body)

	if (error) return json({ error: sanitizeError(error) }, { status })
	return json(data)
}

/** @type {import('@sveltejs/kit').RequestHandler} */
export async function DELETE({ params, request, locals }) {
	if (!locals.kavach) return json({ error: { message: 'Not authenticated' } }, { status: 401 })

	const { entity, actions } = getActions(locals, params.slug)
	if (!actions) return json({ error: { message: 'Data operations not supported' } }, { status: 501 })

	const body = await request.json()
	const { data, error, status } = await actions.delete(entity, body)

	if (error) return json({ error: sanitizeError(error) }, { status })
	return json(data)
}
