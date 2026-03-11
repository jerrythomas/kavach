import { md5 } from '@kavach/hashing'

export function toDataURL(buffer: Buffer, contentType = 'image/jpeg'): string {
	return `data:${contentType};base64,${buffer.toString('base64')}`
}

export interface MicrosoftPhotoResponse {
	ok: boolean
	status: number
	statusText: string
	photo: unknown
}

export async function getUserPhotoFromMicrosoft(
	email: string,
	token: string,
	fetchFunc: typeof fetch = globalThis.fetch
): Promise<MicrosoftPhotoResponse> {
	const url = `https://graph.microsoft.com/v1.0/users/${email}/photo/$value`

	const response = await fetchFunc(url, {
		method: 'get',
		headers: {
			Authorization: `Bearer ${token}`
		}
	})

	let photo: unknown = null
	if (response.ok) {
		photo = response.body
	}
	return {
		ok: response.ok,
		status: response.status,
		statusText: response.statusText,
		photo
	}
}

export function asBoolean(value: string | null | undefined): boolean {
	const normalized = (value || 'false').toLowerCase()
	return ['1', 'yes', 'true', ''].includes(normalized)
}

export function gravatar(email: string | null | undefined, size = 256, d = 'identicon', rating = 'G'): string {
	const hash = md5((email || '').trim().toLowerCase())
	return `//www.gravatar.com/avatar/${hash}?d=${d}&r=${rating}&s=${size}`
}

export interface DerivedName {
	full_name: string
	first: string
	last: string
}

export function deriveName(email: string | null | undefined): DerivedName {
	const parts = (email || '')
		.split('@')[0]
		.split('.')
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))

	return {
		full_name: parts.join(' '),
		first: parts[0],
		last: parts.slice(1).join(' ')
	}
}
