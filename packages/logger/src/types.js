/** @typedef {'info'|'debug'|'trace'|'error'|'warn'|string} LogLevel */

/**
 * @typedef LoggerOptions
 * @property {LogLevel} [level]
 */

/**
 * @typedef LoggerContext
 * @property {string} [module]  - module name
 * @property {string} [method]  - method name
 * @property {string} [package] - package name
 */

/**
 * @typedef {function} LoggerFunction
 * @param {string} message - The log message
 * @param {Object} [data={}] - Optional data object to log
 * @param {Object} [error={}] - Optional error object to log
 * @returns {Promise<void>}
 */

/**
 * @typedef Logger
 * @property {LoggerFunction} info
 * @property {LoggerFunction} warn
 * @property {LoggerFunction} error
 * @property {LoggerFunction} debug
 * @property {LoggerFunction} trace
 * @property {(context:LoggerContext) => Logger} getContextLogger
 */

/**
 * @typedef LogWriter
 * @property {(message:Object) => Promise<void>} write
 */

/**
 * @typedef LogData
 * @property {string}        level
 * @property {string}        running_on
 * @property {string}        logged_at
 * @property {LoggerContext} context
 * @property {string}        [message]
 * @property {Object}        [data]
 * @property {Object}        [error]
 */

export default {}
