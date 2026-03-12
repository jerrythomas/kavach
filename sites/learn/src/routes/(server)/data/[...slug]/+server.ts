import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

interface Fact {
	id: number
	tier: 'general' | 'classified'
	category: string
	fact: string
}

const SEED_FACTS: Fact[] = [
	{
		id: 1,
		tier: 'general',
		category: 'Solar System',
		fact: 'A day on Venus is longer than a year on Venus — it rotates so slowly that the Sun rises only twice per orbit.'
	},
	{
		id: 2,
		tier: 'general',
		category: 'Stars',
		fact: 'Neutron stars can spin 600 times per second and are only ~20 km in diameter — yet outweigh the Sun.'
	},
	{
		id: 3,
		tier: 'general',
		category: 'Scale',
		fact: "Light takes 8 minutes to travel from the Sun to Earth, and over 4 years to reach the next star system."
	},
	{
		id: 4,
		tier: 'general',
		category: 'Black Holes',
		fact: 'The supermassive black hole at the centre of M87 has a mass of 6.5 billion Suns. Its shadow was imaged in 2019.'
	},
	{
		id: 5,
		tier: 'general',
		category: 'Galaxies',
		fact: 'The Milky Way is estimated to contain 100–400 billion stars, yet it is just one of at least two trillion galaxies.'
	},
	{
		id: 6,
		tier: 'classified',
		category: 'MISSION ALPHA',
		fact: '🔴 CLASSIFIED: A sequence of prime numbers carved in ascending order was detected on asteroid 2029-XK7 in the Kuiper Belt. Origin: unknown. Investigation ongoing.'
	},
	{
		id: 7,
		tier: 'classified',
		category: 'MISSION SIGMA',
		fact: '🔴 CLASSIFIED: Voyager 1 began transmitting an unrecognised binary pattern in 2031. Engineers are calling it "the reply". Decryption is 34% complete.'
	},
	{
		id: 8,
		tier: 'classified',
		category: 'MISSION OMEGA',
		fact: '🔴 CLASSIFIED: An anomalous radio silence spanning sector 7G has persisted for 18 months. All probes sent to investigate have gone dark at the boundary.'
	}
]

// In-memory store for admin-created facts (demo only — resets on server restart)
let customFacts: Fact[] = []
let nextId = 100

export const GET: RequestHandler = ({ params, locals }) => {
	if (!locals.session) return json({ error: 'Not authenticated' }, { status: 401 })

	const entity = params.slug
	const role = locals.session?.user?.role ?? null

	if (entity === 'facts') {
		const all = [...SEED_FACTS, ...customFacts]
		const visible = role === 'admin' ? all : all.filter((f) => f.tier === 'general')
		return json(visible)
	}

	if (entity === 'admin-stats') {
		// admin-only — Kavach routing rule blocks non-admin before reaching here
		const all = [...SEED_FACTS, ...customFacts]
		return json({
			totalFacts: all.length,
			generalFacts: all.filter((f) => f.tier === 'general').length,
			classifiedFacts: all.filter((f) => f.tier === 'classified').length,
			customFacts: customFacts.length,
			role
		})
	}

	return json({ error: 'Not found' }, { status: 404 })
}

export const POST: RequestHandler = async ({ params, locals, request }) => {
	if (!locals.session) return json({ error: 'Not authenticated' }, { status: 401 })
	if (locals.session?.user?.role !== 'admin')
		return json({ error: 'Forbidden — admin only' }, { status: 403 })

	const body = await request.json()
	const { fact, category = 'Custom', tier = 'general' } = body ?? {}
	if (!fact?.trim()) return json({ error: 'fact text is required' }, { status: 400 })

	const newFact: Fact = { id: nextId++, tier, category, fact: fact.trim() }
	customFacts.push(newFact)
	return json(newFact, { status: 201 })
}

export const DELETE: RequestHandler = ({ params, locals, url }) => {
	if (!locals.session) return json({ error: 'Not authenticated' }, { status: 401 })
	if (locals.session?.user?.role !== 'admin')
		return json({ error: 'Forbidden — admin only' }, { status: 403 })

	const id = Number(url.searchParams.get('id'))
	const before = customFacts.length
	customFacts = customFacts.filter((f) => f.id !== id)

	if (customFacts.length === before) {
		return json({ error: 'Not found or built-in facts cannot be deleted' }, { status: 404 })
	}

	return json({ ok: true })
}
