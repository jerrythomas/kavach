export const DO_NOTHING = async () => {}

export const RUNNING_ON = typeof window === 'undefined' ? 'server' : 'browser'
/** @type {import('./types').LogLevel} */
export const DEFAULT_LOG_LEVEL = 'error'

/** @type {Object<import('./types').LogLevel, number>} */
export const LOGGING_LEVELS = {
	error: 1,
	warn: 2,
	info: 3,
	debug: 4,
	trace: 5
}

export const ZERO_LOGGER = {
	info: DO_NOTHING,
	warn: DO_NOTHING,
	debug: DO_NOTHING,
	error: DO_NOTHING,
	trace: DO_NOTHING
}
