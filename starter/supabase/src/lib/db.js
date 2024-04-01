/**
 * @typedef Entity
 * @property {string} schema
 * @property {string} entity
 */

/**
 * @typedef {import('@supabase/supabase-js').SupabaseClient} SupabaseClient
 */

/**
 * @typedef {function(string, any): Promise<{data: any, error: any, status: number}>} DatabaseAction
 */

/**
 * @typedef DatabaseActions
 * [key: string]: DatabaseAction
 * @property {DatabaseAction} get
 * @property {DatabaseAction} put
 * @property {DatabaseAction} post
 * @property {DatabaseAction} delete
 * @property {DatabaseAction} patch
 */

/**
 *
 * @param {*} slug
 * @returns {Entity}
 */
export function getEntity(slug) {
	return { schema: 'public', entity: slug }
	// if (slug.length === 1) return { schema: 'public', entity: slug[0] }
	// else return { schema: slug[0], entity: slug[1] }
}

/**
 *
 * @param {SupabaseClient} client
 * @returns {DatabaseActions}
 */
export function getActions(client) {
	/** @type {DatabaseAction} */
	async function get(entity, data) {
		const columns = data.select ? data.select : '*'
		delete data.select
		return client.from(entity).select(columns).match(data)
	}

	/** @type {DatabaseAction} */
	async function put(entity, data) {
		return client.from(entity).insert(data).select()
	}

	/** @type {DatabaseAction} */
	async function post(entity, data) {
		return client.from(entity).upsert(data).select()
	}

	/** @type {DatabaseAction} */
	async function patch(entity, data) {
		return client.from(entity).update(data).select()
	}

	/** @type {DatabaseAction} */
	async function del(entity, data) {
		return client.from(entity).delete().match(data)
	}

	return { get, put, post, patch, delete: del }
}

/**
 * @param {Request} request
 */
export async function getRequestBody(request) {
	let body = null
	try {
		body = await request.formData()
		body = Object.fromEntries(body.entries())
	} catch (err) {
		body = await request.json()
	}

	return body
}

/**
 * Inserts data into the database using the fetch API
 * @param {function(string, RequestInit): Promise<Response>} fetch
 * @param {string} entity
 * @param {any} data
 */
export async function insertData(fetch, entity, data) {
	const result = await fetch(`/data/${entity}`, {
		method: 'PUT',
		body: JSON.stringify(data),
		headers: {
			'Content-type': 'application/json; charset=UTF-8'
		}
	})

	if (result.status !== 200) {
		const content = await result.json()
		return { status: result.status, error: content.error.message }
	}
	const rows = await result.json()
	return Array.isArray(data) ? rows : rows[0]
}

/**
 * Updates data in the database using the fetch API
 * @param {function(string, RequestInit): Promise<Response>} fetch
 * @param {string} entity
 * @param {any} data
 */
export async function updateData(fetch, entity, data) {
	const result = await fetch(`/data/${entity}`, {
		method: 'POST',
		body: JSON.stringify(data),
		headers: {
			'Content-type': 'application/json; charset=UTF-8'
		}
	})
	if (result.status !== 200) {
		const content = await result.json()
		return { status: result.status, error: content.error.message }
	}
	const rows = await result.json()
	return Array.isArray(data) ? rows : rows[0]
}

/**
 * Selects data from the database using the fetch API
 * @param {function(string, RequestInit): Promise<Response>} fetch
 * @param {string} entity
 * @param {any} data
 * @param {string} columns
 */
export async function selectData(fetch, entity, data = {}, columns = '*') {
	let params = ''
	const filter = Object.entries(data)
		.map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
		.join('&')
	if (filter !== '') params = `?${filter}`
	if (columns !== '*') params = params === '' ? `?select=${columns}` : `${params}&select=${columns}`

	const result = await fetch(`/data/${entity}${params}`)
	if (result.status !== 200) {
		const content = await result.json()
		return { status: result.status, error: content.error }
	}

	return result.json()
}

/**
 *
 * @param {String} method
 * @param {String} url
 * @param {*} data
 * @param {*} options
 * @returns
 */
export async function send(method, url, data, options = { fetch }) {
	const result = await options.fetch(url, {
		method,
		body: JSON.stringify(data),
		headers: {
			'Content-type': 'application/json; charset=UTF-8'
		}
	})

	if (result.status !== 200) {
		const content = await result.json()
		return { status: result.status, ...content }
	}

	return result.json()
}

/**
 * Returns an object with the CRUD actions for the database
 *
 * @param {Object} options
 * @param {function(string, RequestInit): Promise<Response>} options.fetch
 * @returns {DatabaseActions}
 */
export function getAPIInterface(options = { fetch }) {
	const { fetch } = options
	return {
		get: (entity, data, columns) => selectData(fetch, entity, data, columns),
		put: (entity, data) => insertData(fetch, entity, data),
		post: (entity, data) => updateData(fetch, entity, data),
		patch: (entity, data) => updateData(fetch, entity, data),
		delete: (entity, data) => send('DELETE', `/data/${entity}`, data, options)
	}
}
