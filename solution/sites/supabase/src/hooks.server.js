import { sequence } from '@sveltejs/kit/hooks'
import { kavach } from '$lib/auth'

/** @type {import('@sveltejs/kit').Handle} */
export const handle = sequence(kavach.handle)
