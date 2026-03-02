import { createKavach } from 'kavach'
import { appConfig } from '$lib/config'
import { routes } from '$lib/routes'
import { resolveAdapterName } from '$lib/resolveAdapter'
import { loadAdapter, getAvailableAdapters, registry } from '$lib/adapters'

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
	const adapterName = resolveAdapterName({
		url: event.url,
		cookies: event.cookies,
		env: { PUBLIC_AUTH_ADAPTER: appConfig.defaultAdapter },
		devMode: appConfig.devMode,
		available: Object.keys(registry)
	})

	const { adapter, data, logger } = await loadAdapter(adapterName, appConfig)

	const kavach = createKavach(adapter, {
		data,
		logger,
		...routes
	})

	event.locals.kavach = kavach
	event.locals.adapter = adapterName
	event.locals.adapters = getAvailableAdapters(appConfig)
	event.locals.devMode = appConfig.devMode

	// Persist adapter choice in cookie (dev mode only)
	if (appConfig.devMode) {
		event.cookies.set('kavach-adapter', adapterName, {
			path: '/',
			httpOnly: true,
			secure: event.url.hostname !== 'localhost' && event.url.hostname !== '127.0.0.1',
			sameSite: 'lax',
			maxAge: 60 * 60 * 24 * 30
		})
	}

	return kavach.handle({ event, resolve })
}
