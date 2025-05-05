import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { log, getLogger, getLogLevel } from '../src/logger'
import { loggingLevels, runningOn } from '../src/constants'

describe('Logger', () => {
	const running_on = runningOn
	const levels = Object.keys(loggingLevels)
	const writer = {
		write: vi.fn()
	}
	const date = new Date()
	const logged_at = date.toISOString()

	beforeEach(() => {
		vi.useFakeTimers()
		vi.setSystemTime(date)
	})

	afterEach(() => {
		vi.restoreAllMocks()
		vi.useRealTimers()
	})

	describe('log', () => {
		it('should log entry without details', () => {
			const level = '?'
			log(writer, level)
			expect(writer.write).toHaveBeenCalledWith({
				level,
				logged_at,
				running_on,
				context: {},
				message: undefined,
				data: null,
				error: null
			})
			log(writer, level, {})
			expect(writer.write).toHaveBeenCalledWith({
				level,
				logged_at,
				running_on,
				context: {},
				message: undefined,
				data: null,
				error: null
			})
		})

		it('should convert detail to an object', () => {
			const level = 'error'
			log(writer, level, 'foo')
			expect(writer.write).toHaveBeenCalledWith({
				level,
				logged_at,
				running_on,
				context: {},
				message: 'foo',
				data: null,
				error: null
			})
		})

		it('should spread attributes of data', () => {
			const level = 'info'
			const content = { message: 'foo', data: { path: 'bar' } }
			log(writer, level, content)
			expect(writer.write).toHaveBeenCalledWith({
				level,
				logged_at,
				running_on,
				context: {},
				message: 'foo',
				data: { path: 'bar' },
				error: null
			})
		})

		it('should allow nested json objects', () => {
			const level = 'warn'
			const content = { message: '', data: { path: '/', data: { something: 'bar' } } }
			log(writer, level, content, { package: '' })
			expect(writer.write).toHaveBeenCalledWith({
				level,
				logged_at,
				running_on,
				context: { package: '' },
				message: content.message,
				data: { path: '/', data: { something: 'bar' } },
				error: null
			})
		})
	})
	describe('getLogger', () => {
		it('should create a zero logger when a valid LogWriter is not provided', () => {
			let logger = getLogger()

			Object.keys(loggingLevels).forEach((level) => {
				logger[level]({})
				expect(writer.write).not.toHaveBeenCalled()
			})
			logger = getLogger({})

			Object.keys(loggingLevels).forEach((level) => {
				logger[level]({})
				expect(writer.write).not.toHaveBeenCalled()
			})
			logger = getLogger({ write: 'x' })

			Object.keys(loggingLevels).forEach((level) => {
				logger[level]({})
				expect(writer.write).not.toHaveBeenCalled()
			})

			expect(logger.getContextLogger({ module: 'foo' })).toEqual(logger)
		})

		it('should create a logger', () => {
			const message = 'foo'
			const logger = getLogger(writer)

			expect(logger).toEqual({
				error: expect.any(Function),
				warn: expect.any(Function),
				info: expect.any(Function),
				debug: expect.any(Function),
				trace: expect.any(Function),
				getContextLogger: expect.any(Function)
			})
			expect(logger.error(message)).toBeTruthy()
			expect(writer.write).toHaveBeenCalledWith({
				level: 'error',
				logged_at,
				running_on,
				context: {},
				message,
				data: null,
				error: null
			})
			expect(logger.info(message)).toBeTruthy()
			expect(logger.warn(message)).toBeTruthy()
			expect(logger.debug(message)).toBeTruthy()
			expect(logger.trace(message)).toBeTruthy()
			expect(writer.write).toHaveBeenCalledOnce()
		})

		it('should create a logger when invalid level is passed', () => {
			const message = 'foo'
			const logger = getLogger(writer, { level: 'invalid' })

			expect(logger.error(message)).toBeTruthy()
			expect(writer.write).toHaveBeenCalledWith({
				level: 'error',
				logged_at,
				running_on,
				context: {},
				message,
				data: null,
				error: null
			})
			expect(logger.info(message)).toBeTruthy()
			expect(logger.warn(message)).toBeTruthy()
			expect(logger.debug(message)).toBeTruthy()
			expect(logger.trace(message)).toBeTruthy()
			expect(writer.write).toHaveBeenCalledOnce()
		})

		it.each(levels)('should create a logger at level ="%s"', (level) => {
			const message = 'foo'
			const logger = getLogger(writer, { level })
			const logLevel = loggingLevels[level]

			Object.entries(loggingLevels).forEach(([name, value]) => {
				writer.write.mockClear()
				expect(logger[name](message)).toBeTruthy()
				if (value <= logLevel) {
					expect(writer.write).toHaveBeenCalledWith({
						level: name,
						logged_at,
						running_on,
						message: 'foo',
						context: {},
						data: null,
						error: null
					})
					expect(writer.write).toHaveBeenCalledOnce()
				} else {
					expect(writer.write).not.toHaveBeenCalled()
				}
			})
		})

		it('should create a logger with context', () => {
			const logger = getLogger(writer, { context: { package: 'foo' } })
			const contextLogger = logger.getContextLogger({ module: 'bar' })

			contextLogger.error('foo')
			expect(writer.write).toHaveBeenCalledWith({
				level: 'error',
				logged_at,
				running_on,
				context: { package: 'foo', module: 'bar' },
				message: 'foo',
				data: null,
				error: null
			})
			logger.error('foo')
			expect(writer.write).toHaveBeenCalledWith({
				level: 'error',
				logged_at,
				running_on,
				context: { package: 'foo' },
				message: 'foo',
				data: null,
				error: null
			})
		})
	})
	describe('getLogLevel', () => {
		it('should return default level', () => {
			expect(getLogLevel()).toBe('error')
			expect(getLogLevel('')).toBe('error')
			expect(getLogLevel('23')).toBe('error')
		})
		it('should return level', () => {
			expect(getLogLevel('error')).toBe('error')
			expect(getLogLevel('warn')).toBe('warn')
			expect(getLogLevel('info')).toBe('info')
			expect(getLogLevel('debug')).toBe('debug')
		})
	})
})
