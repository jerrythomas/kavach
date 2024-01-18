import { expect, it, describe } from 'vitest'
import { createChat } from '../../src/lib/adventure'
import { get } from 'svelte/store'

describe('adventure', () => {
	describe('createChat', () => {
		it('should be a chatter store', () => {
			const chatter = createChat()
			expect(chatter).toBeInstanceOf(Object)
			expect(Object.keys(chatter)).toEqual([
				'messages',
				'lastMessage',
				'init',
				'addMessage',
				'reset'
			])
			expect(chatter.init).toBeInstanceOf(Function)
			expect(chatter.addMessage).toBeInstanceOf(Function)
			expect(chatter.reset).toBeInstanceOf(Function)
		})

		it('should initialize with an array of messages', () => {
			const chatter = createChat()
			const messages = [
				{ content: 'foo', role: 'user' },
				{ content: 'bar', role: 'assistant' }
			]
			chatter.init(messages)
			expect(get(chatter.messages)).toEqual(messages)
			expect(get(chatter.lastMessage)).toEqual(messages[1])
		})

		it('should add a message', () => {
			const chatter = createChat()
			const message = { content: 'foo', role: 'user' }
			chatter.addMessage(message.content, message.role)
			expect(get(chatter.messages)).toEqual([{ ...message, data: null }])
			expect(get(chatter.lastMessage)).toEqual({ ...message, data: null })
		})
	})

	it('should configure the journey, with theme and guide', () => {})
})
