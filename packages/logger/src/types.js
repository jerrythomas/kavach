/** @typedef {'info'|'debug'|'trace'|'error'|'warn'} LogLevel */

/**
 * @typedef Logger
 * @property {(message:Object) => Promise<void>} info
 * @property {(message:Object) => Promise<void>} warn
 * @property {(message:Object) => Promise<void>} error
 * @property {(message:Object) => Promise<void>} debug
 * @property {(message:Object) => Promise<void>} trace
 */

/**
 * @typedef LogWriter
 * @property {(message:Object) => Promise<void>} write
 */

/**
 * @typedef LoggerOptions
 * @property {LogLevel} [level]
 */

/**
 * @typedef LogData
 * @property {string} level
 * @property {string} running_on
 * @property {string} logged_at
 * @property {string} [module]
 * @property {string} [method]
 * @property {string} [message]
 * @property {Object} [data]
 */

export default {}
