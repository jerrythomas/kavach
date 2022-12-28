/**
 * @typedef AppRoute
 * @property {string} home
 * @property {string} login
 * @property {string} logout
 * @property {string} session
 */

/**
 * @typedef RoleRoute
 * @property {string} [home]
 * @property {Array<string>} routes
 */

/**
 * @typedef DeflectorOptions
 * @property {AppRoute} [app]
 * @property {Object<string, RoleRoute>} [roles]
 * @property {import('@kavach/logger').Logger} [logger]
 */

/**
 * @typedef Deflector
 * @property {(session?: any) => void} setSession
 * @property {(path: string) => string} redirect
 * @property {AppRoute} page
 * @property {boolean} isAuthenticated,
	 @property {Array<string>}	authorizedRoutes
 */

/**
 * @typedef AuthUser
 * @property {string} id
 * @property {string} role
 * @property {string} [email]
 * @property {string} [name]
 */

/**
 * @typedef AuthSession
 * @property {AuthUser} [user]
 * @property {string} access_token
 * @property {string} refresh_token
 * @property {number} [expires_in]
 */
