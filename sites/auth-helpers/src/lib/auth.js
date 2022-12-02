import { supabaseClient } from './db'
import { logger } from './logger'
import { createKavach } from './kavach'
import { invalidate } from '$app/navigation'
import { redirect } from '@sveltejs/kit'

export const kavach = createKavach(supabaseClient, {
	logger,
	invalidate,
	redirect
})
