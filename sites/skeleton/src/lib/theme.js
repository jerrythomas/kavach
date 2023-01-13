import { writable } from 'svelte/store'

/**
 * @typedef Theme
 * @property {string} name
 * @property {boolean} darkMode
 */

/**
 * @typedef
 */
/**
 * @typedef UserPreferences
 * @property {string} style
 * @property {'light'|'dark'} mode
 * @property {Palette} primary
 * @property {Palette} primary
 */
export const theme = writable('light')

/**
 * Sets theme level classes based on the theme store
 *
 * @param {HTMLElement} node
 */
export function dataTheme(node) {
	let previous = 'none'

	theme.subscribe((data) => {
		node.classList.remove(previous)
		node.classList.add(data)
		previous = data
	})
}

// export function switchTheme(node) {
// 	let previous = {name: '', mode: 'light'}

// 	preferences.subscribe((prefs) => {

// 	})
// }
