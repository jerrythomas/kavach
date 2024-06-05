import {
	defaultLogLevel,
	zeroLogger,
	loggingLevels,
	pass,
	runningOn
} from './constants'

/**
 * Converts a value into an object using provided key
 *
 * @param {*} value
 * @param {string} key
 * @returns {object}
 */
export function asObject(value, key = 'message') {
	return value ? (typeof value === 'object' ? value : { [key]: value }) : {}
}

/**
 * Generic logger function
 *
 * - adds log level, runtime environment and logging timestamp to the log data
 * - offloads writng to a LogWriter instance
 *
 * @param {import('./types').LogWriter}     writer
 * @param {String}                          level
 * @param {Object}                          data
 * @param {import('./types').LoggerContext} context
 * @returns {Promise<void>}
 */
export async function log(writer, level, data, context = {}) {
	const currentDate = new Date()

	await writer.write({
		level,
		running_on: runningOn,
		logged_at: currentDate.toISOString(),
		context,
		...asObject(data)
	})
}

/**
 * Get a logger object using a writer and log level
 *
 * - Log level defaults to 'error'
 * - Logger instance defaults to a zero logger when an invalid writer is provided
 *
 * @param {*} writer  Any writer object with a write method
 * @param {import('./types').LoggerOptions} options
 * @returns {import('./types').Logger}
 */
export function getLogger(writer, options = {}) {
	const level = getLogLevel(options?.level)
	const context = options?.context || {}

	if (!writer || typeof writer.write !== 'function') return zeroLogger

	return getContextLogger(writer, level, context)
}

/**
 * Get a logger for a context. Context includes attributes like package, module, method
 *
 * @param {import('./types').LogWriter}     writer
 * @param {import('./types').LoggerContext} context
 * @returns {import('./types').Logger}
 */
export function getContextLogger(writer, level, context) {
	const levelValue = loggingLevels[level]
	const logger = Object.entries(loggingLevels)
		.map(([logLevel, value]) => ({
			[logLevel]:
				value <= levelValue
					? (/** @type {Object} */ message) =>
							log(writer, logLevel, message, context)
					: pass
		}))
		.reduce((acc, orig) => ({ ...acc, ...orig }), {})

	logger.getContextLogger = (newContext) =>
		getContextLogger(writer, level, { ...context, ...newContext })

	return logger
}

/**
 * Creates a log level from a string
 *
 * @param {string} level
 * @returns {import('./types').LogLevel}
 */
export function getLogLevel(level) {
	return level in loggingLevels ? level : defaultLogLevel
}
