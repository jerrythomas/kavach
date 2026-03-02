/**
 * @typedef Entity
 * @property {string} [schema]
 * @property {string} entity
 */

/**
 *
 * @param {*} slug
 * @returns {Entity}
 */
export function getEntity(slug) {
	if (slug.length === 1) return { entity: slug[0] }
	else return { schema: slug[0], entity: slug[1] }
}
