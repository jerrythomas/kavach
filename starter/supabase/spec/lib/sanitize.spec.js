import { describe, expect, it } from 'vitest'
import {
	replaceNewlinesInQuotes,
	revertNewlinesInJSON,
	sanitizedJson
} from '../../src/lib/sanitize'

describe('sanitize', () => {
	global.fetch = vi.fn()
	describe('replaceNewlinesInQuotes', () => {
		it('should replace newlines in quotes', () => {
			const input = '"Hello","World\n 1\n 2\n 3"'
			const expected = '"Hello","World<br/> 1<br/> 2<br/> 3"'
			const actual = replaceNewlinesInQuotes(input)

			expect(actual).toEqual(expected)
		})
		it('should handle escaped quotes', () => {
			const input = '"Hello","World\\" 1\n 2\n 3"'
			const expected = '"Hello","World\\" 1<br/> 2<br/> 3"'
			const actual = replaceNewlinesInQuotes(input)

			expect(actual).toEqual(expected)
		})
	})

	describe('revertNewlinesInJSON', () => {
		it('should revert newlines in JSON', () => {
			const input = { foo: 'bar<br/>', baz: 'goo' }
			const expected = { foo: 'bar\n', baz: 'goo' }
			const actual = revertNewlinesInJSON(input)

			expect(actual).toEqual(expected)
		})
	})

	describe('sanitizedJson', () => {
		it('should sanitize JSON', () => {
			const input =
				'{"content":"Greetings, Jerry Thomas, it is. A journey of self-discovery shall we begin, hmm? Strong, is it, your preference to listen and understand before making decisions, would you say?"}'
			const expected = {
				content:
					'Greetings, Jerry Thomas, it is. A journey of self-discovery shall we begin, hmm? Strong, is it, your preference to listen and understand before making decisions, would you say?'
			}
			const actual = sanitizedJson(input)

			expect(actual).toEqual(expected)
		})
		it('should handle escaped quotes in JSON', () => {
			const input = '{"foo":"bar", \n"baz":"goo"}'
			const expected = { foo: 'bar', baz: 'goo' }
			const actual = sanitizedJson(input)

			expect(actual).toEqual(expected)
		})
		it('should handle nested escaped quotes in JSON', () => {
			const input = '{"foo":"bar", \n"baz":"goo\\""}'
			const expected = { foo: 'bar', baz: 'goo"' }
			const actual = sanitizedJson(input)

			expect(actual).toEqual(expected)
		})
	})
})
