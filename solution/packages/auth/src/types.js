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
 * @typedef GuardianOptions
 * @property {AppRoute} [app]
 * @property {Object<string, RoleRoute>} [roles]
 * @property {import('@kavach/logger').Logger} [logger]
 */

/**
 * @typedef Guardian
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

/**
 * @typedef AuthOptions
 * @property {Array<string>} scopes
 * @property {Array<string>} params
 */

/**
 * @typedef AuthProvider
 * @property {'otp' | 'oauth' | 'password'} mode
 * @property {string}	       provider
 * @property {string}        [label]
 * @property {Array<string>} scopes
 * @property {Array<string>} params
 */

/**
 * @typedef CookieOptions
 * @property {string}  [path]
 * @property {boolean} [httpOnly]
 * @property {boolean} [secure]
 * @property {'none'|'strict'|'lax'} [sameSite]
 * @property {number}  [maxAge]
 */

/**
 * @typedef OAuthCredentials
 * @property {string} provider
 * @property {AuthOptions} [options]
 */

/**
 * @typedef OtpCredentials
 * @property {'magic'} provider
 * @property {string}  email
 * @property {string}  [redirectTo]
 */

/**
 * @typedef EmailAuthCredentials
 * @property {string} email
 * @property {string} password
 * @property {string} [redirectTo]
 */

/**
 * @typedef PhoneAuthCredentials
 * @property {string} phone
 * @property {string} password
 * @property {string} [redirectTo]
 */

/**
 * @typedef AuthCredentials
 * @property {string} provider
 * @property {string} [email]
 * @property {string} [password]
 * @property {string} [phone]
 * @property {string} [redirectTo]
 * @property {Array<string>} [scopes]
 * @property {Object} [options]
 */

/**
 * @typedef {EmailAuthCredentials| PhoneAuthCredentials} PasswordCredentials
 */
/**
 * @typedef {string|undefined} Schema
 */
/**
 * @typedef {(event: string, session: any) => Promise<void>} AuthCallback
 */

/** @typedef {'error'|'success'|'warning'} ResultType */

/**
 * @typedef AuthError
 * @property {number|string} [status]  - HTTP status code
 * @property {string}        [name]    - Error name
 * @property {string}        [message] - Error message
 */

/**
 * @typedef {'info'|'success'|'error'} AuthResponseType
 */

/**
  * @typedef AuthResponse
  * @property {AuthResponseType} type
  * @property {string}           [message]
  * @property {AuthError}        [error]
  * @property {object}           [data]
  * @property {AuthCredentials}  [credentials]

*/
/**
 * @typedef AuthResult
 * @property {ResultType} type
 * @property {number}     [status]
 * @property {string}     [name]
 * @property {string}     [message]
 * @property {*}          [data]
 */

/**
 * @typedef ActionResponse
 * @property {any}    [data]
 * @property {any}    [error]
 * @property {number} [count]
 * @property {number} status
 */

/**
 * @typedef Action
 * @type {function(string, any): Promise<ActionResponse>}
 */

/**
 * @typedef ServerActions
 * @property {Action} get
 * @property {Action} put
 * @property {Action} post
 * @property {Action} delete
 * @property {Action} patch
 * @property {Action} call
 */

/**
 * @typedef {function(Schema=): ServerActions} DataAdapter
 */

/**
 * @typedef AuthAdapter
 * @property {(credentials: AuthCredentials) => Promise<AuthResult>}     signIn
 * @property {(credentials: PasswordCredentials) => Promise<AuthResult>} signUp
 * @property {() => Promise<*>}                                          signOut
 * @property {(session: AuthSession) => Promise<AuthResult>}	           synchronize
 * @property {(callback: AuthCallback) => void}                          onAuthChange
 * @property {(credentials: OtpCredentials) => Promise<void>}	           [verifyOtp]
 * @property {() => Promise<void>}	                                     [resetPassword]
 * @property {(credentials: PasswordCredentials) => Promise<void>}       [updatePassword]
 * @property {(url: Object) => AuthResult}                               [parseUrlError]
 * @property {string[]}                                                  [capabilities]
 */

/**
 * @typedef {(config:Object) => AuthAdapter} GetAdapter
 */

/**
@typedef KavachAgents
@property {Guardian} guardian
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
