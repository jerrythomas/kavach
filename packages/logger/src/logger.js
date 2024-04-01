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
 * @param {import('./types').LogWriter} writer
 * @param {String} level
 * @param {Object} data
 */
export async function log(writer, level, data) {
	const currentDate = new Date()

	await writer.write({
		level,
		running_on: runningOn,
		logged_at: currentDate.toISOString(),
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
	const level = options?.level ?? defaultLogLevel

	/* replace with check for instance of LogWriter */
	if (!writer || typeof writer.write !== 'function') {
		return zeroLogger
	}

	const levelValue =
		level in loggingLevels
			? loggingLevels[level]
			: loggingLevels[defaultLogLevel]

	const logger = Object.entries(loggingLevels)
		.map(([logLevel, value]) => ({
			[logLevel]:
				value <= levelValue
					? async (/** @type {Object} */ message) =>
							log(writer, logLevel, message)
					: pass
		}))
		.reduce((acc, orig) => ({ ...acc, ...orig }), {})

	// @ts-ignore
	return logger
}
