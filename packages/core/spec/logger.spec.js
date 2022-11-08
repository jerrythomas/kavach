import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { log, getLogger } from '../src/logger'
import { LOGGING_LEVELS } from '../src/constants'

describe('Logger', () => {
	const running_on = 'browser'
	const levels = Object.entries(LOGGING_LEVELS)
	const writer = {
		write: vi.fn()
	}
	let date = new Date()
	let logged_at = date.toISOString()

	beforeEach(() => {
		vi.useFakeTimers()
		vi.setSystemTime(date)
	})

	afterEach(() => {
		vi.restoreAllMocks()
		vi.useRealTimers()
	})

	it('should log entry without details', () => {
		const level = '?'
		log(writer, level)
		expect(writer.write).toHaveBeenCalledWith({
			level,
			logged_at,
			running_on
		})
		log(writer, level, {})
		expect(writer.write).toHaveBeenCalledWith({
			level,
			logged_at,
			running_on
		})
	})

	it('should convert detail to an object', () => {
		const level = 'error'
		log(writer, level, 'foo')
		expect(writer.write).toHaveBeenCalledWith({
			level,
			logged_at,
			running_on,
			message: 'foo'
		})
	})
	it('should extract detail attributes', () => {
		const level = 'info'
		log(writer, level, { message: 'foo' })
		expect(writer.write).toHaveBeenCalledWith({
			level,
			logged_at,
			running_on,
			message: 'foo'
		})
		log(writer, level, { path: '/', detail: 'foo' })
		expect(writer.write).toHaveBeenCalledWith({
			level,
			logged_at,
			running_on,
			path: '/',
			detail: { message: 'foo' }
		})
	})

	it('should convert "detail" attribute as object', () => {
		const level = 'warn'
		log(writer, level, { path: '/', detail: 'foo' })
		expect(writer.write).toHaveBeenCalledWith({
			level,
			logged_at,
			running_on,
			path: '/',
			detail: { message: 'foo' }
		})
	})

	it('should create a zero logger when a valid LogWriter is not provided', () => {
		let logger = getLogger()

		Object.keys(LOGGING_LEVELS).map((level) => {
			logger[level]({})
			expect(writer.write).not.toHaveBeenCalled()
		})
		logger = getLogger({})

		Object.keys(LOGGING_LEVELS).map((level) => {
			logger[level]({})
			expect(writer.write).not.toHaveBeenCalled()
		})
		logger = getLogger({ write: 'x' })

		Object.keys(LOGGING_LEVELS).map((level) => {
			logger[level]({})
			expect(writer.write).not.toHaveBeenCalled()
		})
	})

	it('should create a logger', () => {
		const data = { message: 'foo' }
		const logger = getLogger(writer)

		expect(Object.keys(logger)).toEqual(Object.keys(LOGGING_LEVELS))
		expect(logger.error(data)).toBeTruthy()
		expect(writer.write).toHaveBeenCalledWith({
			level: 'error',
			logged_at,
			running_on,
			message: 'foo'
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
			message: 'foo'
		})
		expect(logger.info(data)).toBeTruthy()
		expect(logger.warn(data)).toBeTruthy()
		expect(logger.debug(data)).toBeTruthy()
		expect(logger.trace(data)).toBeTruthy()
		expect(writer.write).toHaveBeenCalledOnce()
	})

	it.each(levels)('should create a logger at level ="%s"', (level, count) => {
		const data = { message: 'foo' }
		const logger = getLogger(writer, { level })

		Object.entries(LOGGING_LEVELS).map(([name, value]) => {
			expect(logger[name](data)).toBeTruthy()
			if (value <= level) {
				expect(writer.write).toHaveBeenCalledWith({
					level: name,
					logged_at,
					running_on,
					message: 'foo'
				})
			}
		})
		expect(writer.write).toHaveBeenCalledTimes(count)
	})
})
