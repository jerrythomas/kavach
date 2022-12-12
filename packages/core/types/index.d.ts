export interface LogWriter {
	write(message: Object): Promise<void>
}

export interface Logger {
	info(message: Object): Promise<void>
	warn(message: Object): Promise<void>
	debug(message: Object): Promise<void>
	error(message: Object): Promise<void>
	trace(message: Object): Promise<void>
}

export interface LogData {
	level: string
	running_on: string
	logged_at: string // ISO 8601 formatted timestamp
	detail?: object
}

export interface AuthProvider {
	mode: 'otp' | 'oauth' | 'password'
	provider: string
	label?: string
	scopes?: string[]
	params?: string[]
}

export interface AuthUser {
	id: string
	role: string
	name: string
	email?: string
}

export interface OAuthOptions {
	scopes: string[]
}

export interface OAuthCredentials {
	provider: string
	options: OAuthOptions
}

export interface OtpCredentials {
	provider: 'magic'
	email: string
}

export interface EmailAuthCredentials {
	email: string
	password: string
}

export interface PhoneAuthCredentials {
	email: string
	password: string
}

export interface Credentials {
	provider?: string
	email?: string
	phone?: string
	password?: string
	token?: string
	options?: any
}

export interface AuthOptions {
	scopes: string | Array<string>
	params: Array<any>
}
export interface AuthSession {
	access_token: string
	refresh_token: string
	user: any
}

export interface Adapter {
	signIn(
		credentials:
			| OAuthCredentials
			| OtpCredentials
			| EmailAuthCredentials
			| PhoneAuthCredentials
	): Promise<void>
	signUp(
		credentials: EmailAuthCredentials | PhoneAuthCredentials
	): Promise<void>
	signOut(): Promise<void>
	synchronize(session: AuthSession): Promise<void>
	// verifyOtp(credentials: Credentials): Promise<any>
	// resetPassword(): Promise<any>
	// updatePassword(credentials: Credentials): Promise<any>
	// updateProfile(credentials: Credentials, details: any): Promise<any>
	onAuthChange(callback: Function): void
	client: any
}

export interface GetAdapter {
	(config: any): Adapter
}
