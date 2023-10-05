export const defaultCookieOptions = {
	path: '/',
	httpOnly: true,
	secure: true,
	sameSite: 'strict',
	maxAge: 24 * 60 * 60
}
export const providers = [
	'google',
	'azure',
	'email',
	'phone',
	'apple',
	'linkedin',
	'microsoft',
	'yahoo',
	'github',
	'magic',
	'twitter',
	'facebook'
]

export const defaultAuthIcons = [...providers, 'password'].map(
	(i) => `i-auth-${i}`
)
