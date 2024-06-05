import { slides } from './slides.json'

/** @type {import('./$types').PageServerLoad} */
export function load() {
	return {
		items: ['Fruits', 'Vegetables', 'Nuts', 'Spices'],
		slides
	}
}
