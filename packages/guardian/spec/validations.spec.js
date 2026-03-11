import { describe, it, expect } from 'vitest'
import {
	validateNonEmptyParts,
	validatePathStartsWithSlash,
	validatePath,
	validateRoutingRule,
	validateRedundantRules
} from '../src/validations'
import { clone } from 'ramda'
import { fillMissingProps } from '../src/utils'

describe('validations', () => {
	describe('validatePath', () => {
		it('should return error if path is missing', () => {
			const input = {}
			expect(validatePath(input)).toEqual({
				...input,
				errors: ['Path must be a non-empty string']
			})
		})
		it('should return an error if the path is not a string', () => {
			const input = { path: 123 }
			expect(validatePath(input)).toEqual({
				...input,
				errors: ['Path must be a non-empty string']
			})
		})
		it('should return an error if the path is an empty string', () => {
			const input = { path: '' }
			expect(validatePath(input)).toEqual({
				...input,
				errors: ['Path must be a non-empty string']
			})
		})
		it('should not change input when there is no error', () => {
			const input = { path: '/' }
			expect(validatePath(input)).toEqual(input)
		})
	})

	describe('validateNonEmptyParts', () => {
		it('should return an error if the path has empty parts', () => {
			const input = { path: '/api//data' }
			expect(validateNonEmptyParts(input)).toEqual({
				...input,
				errors: ['Path sections must not be empty']
			})
		})
		it('should not change input when there is no error', () => {
			const input = { path: '/api/data' }
			expect(validateNonEmptyParts(input)).toEqual(input)
		})
	})

	describe('validatePathStartsWithSlash', () => {
		it('should return an error if the path does not start with a slash', () => {
			const input = { path: 'api/data' }
			expect(validatePathStartsWithSlash(input)).toEqual({
				...input,
				errors: ['Path must start with /']
			})
		})
		it('should not change input when there is no error', () => {
			const input = { path: '/api/data' }
			expect(validatePathStartsWithSlash(input)).toEqual(input)
		})
	})

	describe('validateRedundantRules', () => {
		it('should identify redundant rules', () => {
			const input = [
				{ path: '/api/data' },
				{ path: '/api' },
				{ path: '/' }
			].map(fillMissingProps)
			expect(validateRedundantRules(clone(input))).toEqual([
				{
					...input[0],
					redundant: true,
					warnings: ['Redundant rule: /api includes /api/data']
				},
				input[1],
				input[2]
			])
		})

		it('should identify redundant rules with same public value', () => {
			const input = [
				{ path: '/api/data', public: true },
				{ path: '/api', public: true },
				{ path: '/' }
			].map(fillMissingProps)
			expect(validateRedundantRules(clone(input))).toEqual([
				{
					...input[0],
					redundant: true,
					warnings: ['Redundant rule: /api includes /api/data']
				},
				input[1],
				input[2]
			])
		})

		it('should identify redundant rules with same role', () => {
			const input = [
				{ path: '/api/data', roles: 'admin' },
				{ path: '/api', roles: 'admin' },
				{ path: '/' }
			].map(fillMissingProps)
			expect(validateRedundantRules(clone(input))).toEqual([
				{
					...input[0],
					redundant: true,
					warnings: ['Redundant rule: /api includes /api/data']
				},
				input[1],
				input[2]
			])
		})

		it('should not mark rule as redundant when public prop is different', () => {
			const input = [
				{ path: '/api/data', public: true },
				{ path: '/api', public: false },
				{ path: '/' }
			].map(fillMissingProps)
			expect(validateRedundantRules(clone(input))).toEqual(input)
		})

		it('should not mark rule as redundant when roles are differnet', () => {
			const input = [
				{ path: '/api/data', roles: 'admin' },
				{ path: '/api', roles: ['user', 'admin'] },
				{ path: '/' }
			].map(fillMissingProps)
			expect(validateRedundantRules(clone(input))).toEqual(input)
		})

		it('should not mark rule as redundant when paths are different', () => {
			const input = [{ path: '/' }, { path: '/api' }, { path: '/data' }].map(
				fillMissingProps
			)
			expect(validateRedundantRules(clone(input))).toEqual(input)
		})
	})

	describe('validateRoutingRule', () => {
		it('should identify multiple issues', () => {
			const input = [
				{},
				{ path: 123 },
				{ path: '#/' },
				{ path: '#//x' },
				{ path: '/' }
			]
			expect(validateRoutingRule(clone(input[0]))).toEqual({
				errors: ['Path must be a non-empty string']
			})
			expect(validateRoutingRule(clone(input[1]))).toEqual({
				path: 123,
				errors: ['Path must be a non-empty string']
			})
			expect(validateRoutingRule(clone(input[2]))).toEqual({
				path: '#/',
				errors: ['Path sections must not be empty', 'Path must start with /']
			})
			expect(validateRoutingRule(clone(input[3]))).toEqual({
				path: '#//x',
				errors: ['Path sections must not be empty', 'Path must start with /']
			})
			expect(validateRoutingRule(clone(input[4]))).toEqual({ path: '/' })
		})
	})
})
