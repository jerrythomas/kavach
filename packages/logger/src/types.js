/** @typedef {'info'|'debug'|'trace'|'error'|'warn'} LogLevel */

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
 * @typedef Logger
 * @property {(message:Object) => Promise<void>} info
 * @property {(message:Object) => Promise<void>} warn
 * @property {(message:Object) => Promise<void>} error
 * @property {(message:Object) => Promise<void>} debug
 * @property {(message:Object) => Promise<void>} trace
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
