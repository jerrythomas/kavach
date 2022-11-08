import {
	DEFAULT_LOG_LEVEL,
	ZERO_LOGGER,
	LOGGING_LEVELS,
	DO_NOTHING,
	RUNNING_ON
} from './constants'

export function asObject(value, key) {
	return value ? (typeof value === 'object' ? value : { [key]: value }) : {}
}

/**
 * @param {import('./types').LogWriter} writer
 * @param {String} level
 * @param {Object} detail
 */
export async function log(writer, level, detail) {
	const currentDate = new Date()
	const logged_at = currentDate.toISOString()

	let data = asObject(detail, 'message')
	if ('detail' in data) {
		data.detail = asObject(data.detail, 'message')
	}

	await writer.write({
		level,
		running_on: RUNNING_ON,
		logged_at,
		...data
	})
}

/**
 * Get a logger object using a writer an dlog level
 *
 * @param {*} writer  Any writer object with a write method
 * @param {import('./types').LoggerOptions} options
 * @returns {import('./types').Logger}
 */
export function getLogger(writer, options = {}) {
	const level = options?.level ?? DEFAULT_LOG_LEVEL

	if (!writer || typeof writer.write !== 'function') {
		return ZERO_LOGGER
	}

	const levelValue =
		level in LOGGING_LEVELS
			? LOGGING_LEVELS[level]
			: LOGGING_LEVELS[DEFAULT_LOG_LEVEL]

	const logger = Object.entries(LOGGING_LEVELS)
		.map(([logLevel, value]) => ({
			[logLevel]:
				value <= levelValue
					? async (/** @type {Object} */ message) =>
							await log(writer, logLevel, message)
					: DO_NOTHING
		}))
		.reduce((acc, orig) => ({ ...acc, ...orig }), {})

	// @ts-ignore
	return logger
}
