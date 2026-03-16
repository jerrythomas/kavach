import type { RequestHandler } from '@sveltejs/kit'

const PAGES = ['/', '/auth', '/dashboard', '/admin', '/data', '/logout']

export const GET: RequestHandler = ({ url }) => {
	const base = url.origin

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${PAGES.map((path) => `  <url>\n    <loc>${base}${path}</loc>\n  </url>`).join('\n')}
</urlset>`

	return new Response(xml, {
		headers: {
			'Content-Type': 'application/xml',
			'Cache-Control': 'max-age=3600'
		}
	})
}
