import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

const DEMO_DATA: Record<string, unknown[]> = {
	posts: [
		{ id: 1, title: 'Getting Started with Kavach', author: 'admin@example.com', visibility: 'public' },
		{ id: 2, title: 'RBAC with Supabase', author: 'editor@example.com', visibility: 'public' },
		{ id: 3, title: 'Admin-Only Config Notes', author: 'admin@example.com', visibility: 'admin' }
	],
	users: [
		{ id: 1, email: 'admin@example.com', role: 'admin' },
		{ id: 2, email: 'editor@example.com', role: 'editor' },
		{ id: 3, email: 'viewer@example.com', role: 'viewer' }
	]
}

export const GET: RequestHandler = ({ params, locals }) => {
	if (!locals.session) return json({ error: 'Not authenticated' }, { status: 401 })

	const entity = params.slug
	const role = locals.session?.user?.role ?? 'viewer'

	let rows = DEMO_DATA[entity] ?? []

	if (entity === 'posts' && role !== 'admin') {
		rows = (rows as { visibility: string }[]).filter((r) => r.visibility !== 'admin')
	}

	return json(rows)
}
