/**
@typedef {import('@kavach/core').AuthResponse} AuthResponse
@typedef {import('@kavach/core').AuthAdapter} AuthAdapter
@typedef {import('@kavach/core').AuthCredentials} AuthCredentials
@typedef {import('@kavach/core').Deflector} Deflector
@typedef {import('@kavach/logger').Logger} Logger
*/

/**
@typedef KavachAgents
@property {Deflector} deflector
@property {Logger}    logger
@property {function}  invalidateAll
*/

/**
 * @typedef {Object} Provider
 * @property {'otp' | 'oauth' | 'password'} mode - Authentication mode
 * @property {string} name                       - Name of the provider
 * @property {string} [label]    - Display label for the provider
 * @property {string[]} [scopes] - OAuth scopes
 * @property {string[]} [params] - Additional parameters
 */

/**
 * @typedef {Object} AuthUser
 * @property {string} id - User identifier
 * @property {string} role - User role
 * @property {string} name - User name
 * @property {string} [email] - User email
 */

/**
 * @typedef {Object} Credentials
 * @property {string} [provider] - Authentication provider
 * @property {string} [email] - User email
 * @property {string} [phone] - User phone number
 * @property {string} [password] - User password
 * @property {string} [token] - Authentication token
 * @property {any} [options] - Additional options
 */

/**
 * @typedef {Object} AuthOptions
 * @property {string|string[]} scopes - Authentication scopes
 * @property {any[]} params - Additional parameters
 */

/**
 * @typedef {Object} Adapter
 * @property {function(): Promise<AuthUser>} getUser - Get current user
 * @property {function(): Promise<any>} getSession - Get current session
 * @property {function(Credentials, 'password'|'otp'|'oauth'): Promise<void>} signIn - Sign in user
 * @property {function(): Promise<void>} signOut - Sign out user
 * @property {function(Credentials): Promise<any>} verifyOtp - Verify OTP
 * @property {function(): Promise<any>} resetPassword - Reset password
 * @property {function(Function): void} onAuthChange - Auth change callback
 */

/**
 * @typedef {function(any): Adapter} GetAdapter
 */
export default {}
