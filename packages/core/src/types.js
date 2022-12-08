/** @typedef {'info'|'debug'|'trace'|'error'|'warn'} LogLevel */

/**
 * @typedef Logger
 * @property {(message?) => Promise<void>} info
 * @property {(message?) => Promise<void>} warn
 * @property {(message?) => Promise<void>} error
 * @property {(message?) => Promise<void>} debug
 * @property {(message?) => Promise<void>} trace
 */

/**
 * @typedef LogWriter
 * @property {(message) => Promise<void>} write
 */

/**
 * @typedef LoggerOptions
 * @property {LogLevel} [level]
 */

/**
 * @typedef LogData
 * @property {string} level
 * @property {string} running_on
 * @property {number} sequence
 * @property {string} logged_at
 * @property {string} session
 * @property {string} [origin_ip_address]
 * @property {*} message
 */

/**
 * @method LogMethod
 * @param {LogData} message
 * @returns {Promise<void>}
 *
 */

/**
 * @typedef PageRoutes
 * @property {string} [home]
 * @property {string} [login]
 */

/**
 * @typedef EndpointRoutes
 * @property {string} [login]
 * @property {string} [logout]
 * @property {string} [session]
 */

/**
 * @typedef DeflectorOptions
 * @property {PageRoutes} [page]
 * @property {EndpointRoutes} [endpoint]
 */

/**
 * @typedef Deflector
 * @property {PageRoutes} page
 * @property {EndpointRoutes} endpoint
 * @method setSession
 * @method redirect
 */

/**
 * @typedef AuthUser
 * @property {string} email
 * @property {string} role
 * @property {string} id
 */

/**
 * @typedef AuthSession
 * @property {User} [user]
 */

/**
 * @typedef CookieOptions
 * @property {string} path
 * @property {boolean} httpOnly
 * @property {boolean} secure
 * @property {'none'|'stric'|'lax'} sameSite
 * @property {number} maxAge
 */
export default {}
