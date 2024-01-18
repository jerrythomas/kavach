import { json } from '@sveltejs/kit'
import { createClient } from '@supabase/supabase-js'
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public'
import { getActions, getEntity } from '$lib/db'

// Create a single supabase client for interacting with your database
const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY)
const actions = getActions(supabase)

/**
 * @type {import('@sveltejs/kit').RequestHandler}
 */
export async function GET({ params, url }) {
	const { entity } = getEntity(params.slug)
	const body = Object.fromEntries(url.searchParams.entries())
	const { data, error, status } = await actions.get(entity, body)

	if (error) return json({ error }, { status })
	return json(data)
}

/**
 * @type {import('@sveltejs/kit').RequestHandler}
 */
export async function POST({ params, request }) {
	const { entity } = getEntity(params.slug)
	const body = await request.json()
	const { data, error, status } = await actions.post(entity, body)

	if (error) return json({ error }, { status })
	return json(data)
}

/**
 * @type {import('@sveltejs/kit').RequestHandler}
 */
export async function PUT({ params, request }) {
	const { entity } = getEntity(params.slug)
	const body = await request.json()
	const { data, error, status } = await actions.put(entity, body)

	if (error) return json({ error }, { status })
	return json(data)
}

/**
 * @type {import('@sveltejs/kit').RequestHandler}
 */
export async function DELETE({ params, request }) {
	const { entity } = getEntity(params.slug)
	const body = await request.json() //getRequestBody(request)
	const { data, error, status } = await actions.delete(entity, body)

	if (error) return json({ error }, { status })
	return json(data)
}
