import { describe, it, expect } from 'vitest'
import { add } from '../src/commands/add.js'
import { InitCommand, init } from '../src/commands/init.js'

describe('commands', () => {
	describe('add', () => {
		it('should be exported as async function', () => {
			expect(typeof add).toBe('function')
		})
	})

	describe('InitCommand', () => {
		it('should be a class', () => {
			expect(InitCommand).toBeInstanceOf(Function)
		})

		it('should accept custom cwd in constructor', () => {
			const cmd = new InitCommand('/custom/path')
			expect(cmd).toBeInstanceOf(InitCommand)
		})

		it('should have run method', () => {
			const cmd = new InitCommand()
			expect(typeof cmd.run).toBe('function')
		})
	})

	describe('init', () => {
		it('should be exported as function', () => {
			expect(typeof init).toBe('function')
		})
	})
})
