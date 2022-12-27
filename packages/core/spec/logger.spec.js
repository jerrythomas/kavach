import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { log, getLogger } from '../src/logger'
import { loggingLevels } from '../src/constants'

describe('Logger', () => {
	const running_on = 'browser'
	const levels = Object.keys(loggingLevels)
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
	it('should spread attributes of data', () => {
		const level = 'info'
		log(writer, level, { message: 'foo', path: 'bar' })
		expect(writer.write).toHaveBeenCalledWith({
			level,
			logged_at,
			running_on,
			message: 'foo',
			path: 'bar'
		})
	})

	it('should allow nested json objects', () => {
		const level = 'warn'
		log(writer, level, { path: '/', data: { something: 'bar' } })
		expect(writer.write).toHaveBeenCalledWith({
			level,
			logged_at,
			running_on,
			path: '/',
			data: { something: 'bar' }
		})
	})

	it('should create a zero logger when a valid LogWriter is not provided', () => {
		let logger = getLogger()

		Object.keys(loggingLevels).map((level) => {
			logger[level]({})
			expect(writer.write).not.toHaveBeenCalled()
		})
		logger = getLogger({})

		Object.keys(loggingLevels).map((level) => {
			logger[level]({})
			expect(writer.write).not.toHaveBeenCalled()
		})
		logger = getLogger({ write: 'x' })

		Object.keys(loggingLevels).map((level) => {
			logger[level]({})
			expect(writer.write).not.toHaveBeenCalled()
		})
	})

	it('should create a logger', () => {
		const data = { message: 'foo' }
		const logger = getLogger(writer)

		expect(Object.keys(logger)).toEqual(Object.keys(loggingLevels))
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

	it.each(levels)('should create a logger at level ="%s"', (level) => {
		const data = { message: 'foo' }
		const logger = getLogger(writer, { level })

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
		// expect(writer.write).toHaveBeenCalledTimes(count)
	})
})
