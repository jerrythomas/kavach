// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
interface Slide {
	title: string
	image: string
	description: string
	points: string[]
}

declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		interface PageData {
			slides: Slide[]
		}
		// interface PageState {}
		// interface Platform {}
	}
}

export {}
