import { md5 } from '@kavach/hashing'

/**
 * Convert a buffer into a base 64 encoded string dataURL
 *
 * @param {Buffer} buffer
 * @param {string} contentType
 * @returns {string}
 */
export function toDataURL(buffer, contentType = 'image/jpeg') {
	return `data:${contentType};base64,${buffer.toString('base64')}`
}

/**
 * Given an email and Auth token for Microsoft Graph API, fetch the photo for the email
 *
 * @param {String} email
 * @param {String} token
 * @returns {Promise<any>} containing status and the photo in a Buffer
 */
export async function getUserPhotoFromMicrosoft(email, token) {
	const url = `https://graph.microsoft.com/v1.0/users/${email}/photo/$value`

	const response = await fetch(url, {
		method: 'get',
		headers: {
			Authorization: 'Bearer ' + token
		}
	})

	let photo = null
	if (response.ok) {
		photo = response.body // read stream
	}
	return {
		ok: response.ok,
		status: response.status,
		statusText: response.statusText,
		photo
	}
}

/**
 * Parse a string as a boolean value.
 *
 * - Nulls are considered as false.
 * - 1, 'yes' & 'true' are considered as true
 *
 * @param {String} value
 * @returns {Boolean}
 */
export function asBoolean(value) {
	return ['1', 'yes', 'true', ''].includes((value || 'false').toLowerCase())
}

/**
 * Get the gravatar URL for an email
 *
 * @param {String} email
 * @param {Number} size
 * @param {String} d
 * @param {String} rating
 * @returns {String}
 */
export function gravatar(email, size = 256, d = 'identicon', rating = 'G') {
	const hash = md5((email || '').trim().toLowerCase())
	return `//www.gravatar.com/avatar/${hash}?d=${d}&r=${rating}&s=${size}`
}

/**
 *
 * @param {string} email
 * @returns
 */
export function deriveName(email) {
	let parts = (email || '')
		.split('@')[0]
		.split('.')
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))

	return {
		full_name: parts.join(' '),
		first: parts[0],
		last: parts.slice(1).join(' ')
	}
}
