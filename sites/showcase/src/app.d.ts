declare module '$app/stores' {
	import type { Page } from '@sveltejs/kit'
	import type { Readable } from 'svelte/store'
	export const page: Readable<Page>
	export const navigating: Readable<Page | null>
	export const updated: Readable<boolean>
}
