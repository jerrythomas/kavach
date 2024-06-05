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
				context: {}
			})
			log(writer, level, {})
			expect(writer.write).toHaveBeenCalledWith({
				level,
				logged_at,
				running_on,
				context: {}
			})
		})

		it('should convert detail to an object', () => {
			const level = 'error'
			log(writer, level, 'foo')
			expect(writer.write).toHaveBeenCalledWith({
				level,
				logged_at,
				running_on,
				message: 'foo',
				context: {}
			})
		})

		it('should spread attributes of data', () => {
			const level = 'info'
			log(writer, level, { message: 'foo', path: 'bar' })
			expect(writer.write).toHaveBeenCalledWith({
				level,
				logged_at,
				running_on,
				message: 'foo',
				path: 'bar',
				context: {}
			})
		})

		it('should allow nested json objects', () => {
			const level = 'warn'
			log(
				writer,
				level,
				{ path: '/', data: { something: 'bar' } },
				{ package: '' }
			)
			expect(writer.write).toHaveBeenCalledWith({
				level,
				logged_at,
				running_on,
				path: '/',
				data: { something: 'bar' },
				context: { package: '' }
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
			const data = { message: 'foo' }
			const logger = getLogger(writer)

			expect(logger).toEqual({
				error: expect.any(Function),
				warn: expect.any(Function),
				info: expect.any(Function),
				debug: expect.any(Function),
				trace: expect.any(Function),
				getContextLogger: expect.any(Function)
			})
			expect(logger.error(data)).toBeTruthy()
			expect(writer.write).toHaveBeenCalledWith({
				level: 'error',
				logged_at,
				running_on,
				message: 'foo',
				context: {}
			})
			expect(logger.info(data)).toBeTruthy()
			expect(logger.warn(data)).toBeTruthy()
			expect(logger.debug(data)).toBeTruthy()
			expect(logger.trace(data)).toBeTruthy()
			expect(writer.write).toHaveBeenCalledOnce()
		})

		it('should create a logger when invalid level is passed', () => {
			const data = { message: 'foo' }
			const logger = getLogger(writer, { level: 'invalid' })

			expect(logger.error(data)).toBeTruthy()
			expect(writer.write).toHaveBeenCalledWith({
				level: 'error',
				logged_at,
				running_on,
				context: {},
				message: 'foo'
			})
			expect(logger.info(data)).toBeTruthy()
			expect(logger.warn(data)).toBeTruthy()
			expect(logger.debug(data)).toBeTruthy()
			expect(logger.trace(data)).toBeTruthy()
			expect(writer.write).toHaveBeenCalledOnce()
		})

		it.each(levels)('should create a logger at level ="%s"', (level) => {
			const data = { message: 'foo' }
			const logger = getLogger(writer, { level })

			describe(level, () => {
				it.each(Object.entries(loggingLevels))(
					'should only log at level ="%s"',
					(name, value) => {
						expect(logger[name](data)).toBeTruthy()
						if (value <= level) {
							expect(writer.write).toHaveBeenCalledWith({
								level: name,
								logged_at,
								running_on,
								message: 'foo'
							})
							expect(writer.write).toHaveBeenCalledOnce()
						} else {
							expect(writer.write).not.toHaveBeenCalled()
						}
					}
				)
			})
		})

		it('should create a logger with context', () => {
			const data = { message: 'foo' }
			const logger = getLogger(writer, { context: { package: 'foo' } })
			const contextLogger = logger.getContextLogger({ module: 'bar' })

			contextLogger.error(data)
			expect(writer.write).toHaveBeenCalledWith({
				level: 'error',
				logged_at,
				running_on,
				message: 'foo',
				context: { package: 'foo', module: 'bar' }
			})
			logger.error(data)
			expect(writer.write).toHaveBeenCalledWith({
				level: 'error',
				logged_at,
				running_on,
				message: 'foo',
				context: { package: 'foo' }
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
