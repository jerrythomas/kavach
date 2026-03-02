<script>
	import 'uno.css'
	import '../app.css'

	import Header from './Header.svelte'
	import { onMount, setContext } from 'svelte'
	import { page } from '$app/state'

	export let data

	onMount(async () => {
		const { loadAdapter } = await import('$lib/adapters')
		const { appConfig } = await import('$lib/config')
		const { createKavach } = await import('kavach')
		const { routes } = await import('$lib/routes')
		const { goto, invalidateAll, invalidate } = await import('$app/navigation')

		const { adapter, data: dataPlugin, logger } = await loadAdapter(data.adapter, appConfig)
		const kavach = createKavach(adapter, {
			data: dataPlugin,
			logger,
			...routes,
			goto,
			invalidate,
			invalidateAll
		})

		setContext('kavach', kavach)
		kavach.onAuthChange($page.url)
	})
</script>

<Header
	user={data.session?.user}
	title={data.title}
	adapter={data.adapter}
	adapters={data.adapters}
	devMode={data.devMode}
/>
<slot />
