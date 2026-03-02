import { json } from '@sveltejs/kit'
import { getEntity } from '$lib/db'
import { kavach } from '$lib/auth'

/**
 * @type {import('@sveltejs/kit').RequestHandler}
 */
export async function POST({ params, request }) {
	const { schema, entity } = getEntity(params.slug)
	const actions = kavach.server(schema)
	const body = await request.json()
	const { data, error, status } = await actions.call(entity, body)

	if (error) return json({ error }, { status })
	return json(data)
}
