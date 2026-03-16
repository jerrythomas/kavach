import type { RequestHandler } from '@sveltejs/kit'

const DOC_PAGES = [
	'/docs',
	'/docs/quick-start',
	'/docs/configuration',
	'/docs/authentication',
	'/docs/authorization',
	'/docs/session',
	'/docs/logger',
	'/docs/cli',
	'/docs/sentry',
	'/docs/adapters/supabase',
	'/docs/adapters/firebase',
	'/docs/adapters/auth0',
	'/docs/adapters/amplify',
	'/docs/adapters/convex',
	'/docs/components/auth-provider',
	'/docs/components/auth-page',
	'/docs/components/auth-button',
	'/docs/components/login-card',
	'/docs/plugins/vite'
]

const LLMS_FILES = [
	'/llms/llms.txt',
	'/llms/auth.txt',
	'/llms/sentry.txt',
	'/llms/ui.txt',
	'/llms/vite.txt',
	'/llms/logger.txt',
	'/llms/query.txt',
	'/llms/cookie.txt',
	'/llms/hashing.txt',
	'/llms/cli.txt',
	'/llms/adapter-supabase.txt',
	'/llms/adapter-firebase.txt',
	'/llms/adapter-auth0.txt',
	'/llms/adapter-amplify.txt',
	'/llms/adapter-convex.txt'
]

export const GET: RequestHandler = ({ url }) => {
	const base = url.origin

	const pages = [
		'/',
		...DOC_PAGES,
		'/demo',
		...LLMS_FILES
	]

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map((path) => `  <url>\n    <loc>${base}${path}</loc>\n  </url>`).join('\n')}
</urlset>`

	return new Response(xml, {
		headers: {
			'Content-Type': 'application/xml',
			'Cache-Control': 'max-age=3600'
		}
	})
}
