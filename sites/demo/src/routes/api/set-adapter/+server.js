import { json } from '@sveltejs/kit'
import { registry } from '$lib/adapters'

export async function POST({ request, cookies }) {
	const { adapter } = await request.json()
	const valid = Object.keys(registry)

	if (!adapter || !valid.includes(adapter)) {
		return json({ error: 'Invalid adapter' }, { status: 400 })
	}

	cookies.set('kavach-adapter', adapter, {
		path: '/',
		httpOnly: true,
		secure: !request.url.includes('localhost') && !request.url.includes('127.0.0.1'),
		sameSite: 'lax',
		maxAge: 60 * 60 * 24 * 30
	})

	return json({ ok: true })
}
