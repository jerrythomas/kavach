/**
 * @typedef AppRoute
 * @property {string} home
 * @property {string} login
 * @property {string} logout
 * @property {string} session
 * @property {Array<string>} endpoints
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
 * @property {(session?: any) => void}  setSession
 * @property {(path: string) => string} redirect
 * @property {AppRoute}                 page
 * @property {boolean}                  isAuthenticated,
	 @property {Array<string>}	          authorizedRoutes
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
 * @property {string}   access_token
 * @property {string}   refresh_token
 * @property {number}   [expires_in]
 */

/**
 *  @typedef RoutingRule
 *  @property {string}                 path
 *  @property {boolean}                [public]=false
 *  @property {string | Array<string>} [roles]='*'
 *  @property {number}                 [depth]
 *  @property {Array<string>}          [errors]
 *  @property {boolean}                [redundant]
 *  @property {Array<string>}          [warnings]
 */

/**
 * @typedef {Array<RoutingRule>} RoutingRules
 */

/**
 * @typedef {Object<string, RoutingRules>} RoutingRulesByRole
 */

/**
 * @typedef RoleDefault
 * @property {string} home
 * @property {string} unauthorized
 */

/**
 * @typedef RoutingConfig
 * @property {AppRoute}                   app
 * @property {RoutingRules}               public
 * @property {RoutingRulesByRole}         protected
 */

/**
 * @typedef RuleValidationIssue
 * @property {string}            path
 * @property {'error'|'warning'} type
 * @property {string}            message
 */

/**
 * @typedef {Array<RoutingRuleError>} RoutingRuleErrors
 */

/**
 * @typedef RouteMatchOutcome
 * @property {boolean}         accessible - true if the route is accessible
 * @property {200|302|401|403} status - 200, 302, 401, 403
 * @property {RoutingRule} [rule] - The matched rule if accessible
 */

/**
 * @typedef AllowedRoutes
 * @property {RoutingRules} rules
 * @property {AppRoute}     app
 * @property {string}       role
 */
export default {}
