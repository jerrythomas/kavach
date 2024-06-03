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
 * @property {number} status
 */

/**
 * @typedef Action
 * @type {function(string, any): Promise<ActionResponse>}
 */

/**
 * @typedef ServerAction
 * @property {Action} get
 * @property {Action} put
 * @property {Action} post
 * @property {Action} delete
 * @property {Action} patch
 * @property {Action} [call]
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
 * @property {(schema: Schema ) => any}                                  [client]
 * @property {(url: Object) => AuthResult}                               [parseUrlError]
 * @property {(schema: Schema) => ServerAction}                          [server]
 */

/**
 * @typedef {(config:Object) => AuthAdapter} GetAdapter
 */

export default {}
