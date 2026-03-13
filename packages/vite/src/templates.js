import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

export const templates = {
	authPageCached: readFileSync(join(__dirname, 'templates/auth-page-cached.svelte'), 'utf-8'),
	authPage: readFileSync(join(__dirname, 'templates/auth-page.svelte'), 'utf-8'),
	dataRoute: readFileSync(join(__dirname, 'templates/data-route.js'), 'utf-8'),
	rpcRoute: readFileSync(join(__dirname, 'templates/rpc-route.js'), 'utf-8'),
	authSupabase: readFileSync(join(__dirname, 'templates/auth-supabase.js'), 'utf-8'),
	authFirebase: readFileSync(join(__dirname, 'templates/auth-firebase.js'), 'utf-8'),
	authConvex: readFileSync(join(__dirname, 'templates/auth-convex.js'), 'utf-8')
}
