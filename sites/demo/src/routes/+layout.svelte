<script>
	import 'uno.css'
	import '../app.css'

	import Header from './Header.svelte'
	import { onMount, setContext } from 'svelte'
	import { page } from '$app/stores'

	let { data, children } = $props()

	let kavach = $state(null)
	let logger = $state(null)

	// setContext must be called synchronously during component init
	setContext('kavach', {
		get signIn() { return kavach?.signIn },
		get signUp() { return kavach?.signUp },
		get signOut() { return kavach?.signOut },
		get onAuthChange() { return kavach?.onAuthChange },
		get handle() { return kavach?.handle },
		get actions() { return kavach?.actions },
		get getCachedLogins() { return kavach?.getCachedLogins },
		get removeCachedLogin() { return kavach?.removeCachedLogin },
		get clearCachedLogins() { return kavach?.clearCachedLogins }
	})
	setContext('logger', {
		get getContextLogger() { return logger?.getContextLogger },
		get info() { return logger?.info },
		get error() { return logger?.error },
		get debug() { return logger?.debug },
		get warn() { return logger?.warn }
	})

	onMount(async () => {
		const { loadAdapter } = await import('$lib/adapters')
		const { appConfig } = await import('$lib/config')
		const { createKavach } = await import('kavach')
		const { routes } = await import('$lib/routes')
		const { goto, invalidateAll, invalidate } = await import('$app/navigation')

		const { adapter, data: dataPlugin, logger: adapterLogger } = await loadAdapter(data.adapter, appConfig)
		const instance = createKavach(adapter, {
			data: dataPlugin,
			logger: adapterLogger,
			...routes,
			goto,
			invalidate,
			invalidateAll
		})

		logger = adapterLogger
		kavach = instance
		instance.onAuthChange($page.url)
	})
</script>

<Header
	user={data.session?.user}
	title={data.title}
	adapter={data.adapter}
	adapters={data.adapters}
	devMode={data.devMode}
/>
{@render children()}
