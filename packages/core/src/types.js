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
 * @property {string}	provider
 * @property {string} [label]
 * @property {Array<string>} scopes
 * @property {Array<string>} params
 */

/**
 * @typedef CookieOptions
 * @property {string} [path]
 * @property {boolean} [httpOnly]
 * @property {boolean} [secure]
 * @property {'none'|'stric'|'lax'} [sameSite]
 * @property {number} [maxAge]
 */

/**
 * @typedef OAuthCredentials
 * @property {string} provider
 * @property {AuthOptions} [options]
 */

/**
 * @typedef OtpCredentials
 * @property {'magic'} provider
 * @property {string} email
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
 */
/**
 * @typedef {(event: string, session: any) => Promise<void>} AuthCallback
 */

/**
 * @typedef AuthResult
 * @property {boolean} isError
 * @property {number} [status]
 * @property {string} [name]
 * @property {string} [message]
 * @property {*} [data]
 */
/**
 * @typedef AuthAdapter
 * @property {(credentials: AuthCredentials) => Promise<AuthResult>}	signIn
 * @property {(credentials: EmailAuthCredentials| PhoneAuthCredentials) => Promise<AuthResult>}	signUp
 * @property {() => Promise<*>} signOut
 * @property {(session: AuthSession) => Promise<AuthResult>}	synchronize
 * @property {(callback: AuthCallback) => void} onAuthChange
// property {(credentials: OtpCredentials) => Promise<void>}	verifyOtp
// property {() => Promise<void>}	resetPassword
// property {(credentials: EmailAuthCredentials| PhoneAuthCredentials) => Promise<void>} updatePassword
 * @property {*} client
 * @property {(url: Object) => AuthResult} parseUrlError
}


/**
 * @typedef {(config:Object) => AuthAdapter} GetAdapter
 */

export default {}
