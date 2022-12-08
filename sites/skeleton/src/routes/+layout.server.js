// import { pick } from 'ramda'

/** @type {import('./$types').LayoutServerLoad} */
export const load = async (event) => {
	return { ...event.locals }
}
