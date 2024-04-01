export const pass = async () => {
	/* Used as a placeholder */
}

export const runningOn = typeof window === 'undefined' ? 'server' : 'browser'
/** @type {import('./types').LogLevel} */
export const defaultLogLevel = 'error'

/** @type {Object<import('./types').LogLevel, number>} */
export const loggingLevels = {
	error: 1,
	warn: 2,
	info: 3,
	debug: 4,
	trace: 5
}

export const zeroLogger = {
	info: pass,
	warn: pass,
	debug: pass,
	error: pass,
	trace: pass
}
