import { describe, expect, it } from 'vitest'
import { md5 } from '../src/md5'

describe('hashing', () => {
	const md5Values = [
		['A', '7fc56270e7a70fa81a5935b72eacbe29'],
		['ABC', '902fbdd2b1df0c4f70b4a5d23525e932'],
		[
			'An MD5 hash is created by taking a string of an any length and encoding it into a 128-bit fingerprint. Encoding the same string using the MD5 algorithm will always result in the same 128-bit hash output.',
			'01c55844b6ec5fda011691148b5d40d5'
		],
		['hello', '5d41402abc4b2a76b9719d911017c592']
	]

	it.each(md5Values)(
		'should generate the md5 hash input provided',
		(input, expectedHash) => {
			expect(md5(input)).toEqual(expectedHash)
		}
	)
})
