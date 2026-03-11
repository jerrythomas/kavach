import { json } from '@sveltejs/kit'
import { getEntity } from '$lib/db'
import { sanitizeError } from '@kavach/query'

/** @type {import('@sveltejs/kit').RequestHandler} */
export async function POST({ params, request, locals }) {
	if (!locals.kavach) return json({ error: { message: 'Not authenticated' } }, { status: 401 })

	const { schema, entity } = getEntity(params.slug)
	const actions = locals.kavach.actions(schema)
	if (!actions) return json({ error: { message: 'RPC not supported for this adapter' } }, { status: 501 })

	const body = await request.json()
	const { data, error, status } = await actions.call(entity, body)

	if (error) return json({ error: sanitizeError(error) }, { status })
	return json(data)
}
