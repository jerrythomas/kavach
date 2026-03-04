export interface AppRoute {
	home: string
	login: string
	logout: string
	session: string
}

export interface RoleRoute {
	home?: string
	routes: Array<string>
}

export interface GuardianOptions {
	app?: AppRoute
	roles?: Record<string, RoleRoute>
	logger?: import('@kavach/logger').Logger
}

export interface Guardian {
	setSession: (session?: unknown) => void
	redirect: (path: string) => string
	page: AppRoute
	isAuthenticated: boolean
	authorizedRoutes: Array<string>
}

export interface AuthUser {
	id: string
	role: string
	email?: string
	name?: string
}

export interface AuthSession {
	user?: AuthUser
	access_token: string
	refresh_token: string
	expires_in?: number
}

export interface AuthOptions {
	scopes: Array<string>
	params: Array<string>
}

export interface AuthProvider {
	mode: 'otp' | 'oauth' | 'password'
	provider: string
	label?: string
	scopes: Array<string>
	params: Array<string>
}

export interface CookieOptions {
	path?: string
	httpOnly?: boolean
	secure?: boolean
	sameSite?: 'none' | 'strict' | 'lax'
	maxAge?: number
}

export interface OAuthCredentials {
	provider: string
	options?: AuthOptions
}

export interface OtpCredentials {
	provider: 'magic'
	email: string
	redirectTo?: string
}

export interface EmailAuthCredentials {
	email: string
	password: string
	redirectTo?: string
}

export interface PhoneAuthCredentials {
	phone: string
	password: string
	redirectTo?: string
}

export type PasswordCredentials = EmailAuthCredentials | PhoneAuthCredentials

export interface AuthCredentials {
	provider?: string
	email?: string
	password?: string
	phone?: string
	redirectTo?: string
	scopes?: Array<string>
	options?: object
}

export type Schema = string | undefined

export type AuthCallback = (event: string, session: unknown) => Promise<void>

export type ResultType = 'error' | 'success' | 'warning'

export interface AuthError {
	status?: number | string
	name?: string
	message?: string
}

export type AuthResponseType = 'info' | 'success' | 'error'

export interface AuthResponse {
	type: AuthResponseType
	message?: string
	error?: AuthError
	data?: object
	credentials?: AuthCredentials
}

export interface AuthResult {
	type: ResultType
	status?: number
	name?: string
	message?: string
	data?: unknown
}

export interface ActionResponse {
	data?: unknown
	error?: unknown
	count?: number
	status: number
}

export type Action = (entity: string, data?: unknown) => Promise<ActionResponse>

export interface ServerActions {
	get: Action
	put: Action
	post: Action
	delete: Action
	patch: Action
	call: Action
}

export type DataAdapter = (schema?: Schema) => ServerActions

export interface AuthAdapter {
	signIn: (credentials: Record<string, unknown>) => Promise<AuthResult>
	signUp: (credentials: Record<string, unknown>) => Promise<AuthResult>
	signOut: () => Promise<unknown>
	synchronize: (session: unknown) => Promise<AuthResult>
	onAuthChange: (callback: AuthCallback) => () => void
	parseUrlError?: (url: string | { hash?: string; search?: string } | undefined) => AuthResult | null
	capabilities?: string[]
}

export type GetAdapter = (config: object) => AuthAdapter

export interface KavachAgents {
	guardian: Guardian
	logger: unknown
	invalidateAll: () => void
}

export interface Credentials {
	provider?: string
	email?: string
	phone?: string
	password?: string
	token?: string
	options?: unknown
}

export interface Adapter {
	getUser: () => Promise<AuthUser>
	getSession: () => Promise<unknown>
	signIn: (credentials: Credentials, mode: 'password' | 'otp' | 'oauth') => Promise<void>
	signOut: () => Promise<void>
	verifyOtp: (credentials: Credentials) => Promise<unknown>
	resetPassword: () => Promise<unknown>
	onAuthChange: (fn: (user: AuthUser | null) => void) => void
}
