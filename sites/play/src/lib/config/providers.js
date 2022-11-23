import { getProviderConfigFromNames } from '@kavach/core'
const names = [
	'Magic'
	// 'Microsoft',
	// 'Google',
	// 'Facebook',
	// 'Twitter',
	// 'GitHub',
	// 'LinkedIn',
	// 'Apple',
	// 'Mail',
	// 'Phone'
]

export const providers = getProviderConfigFromNames(names)
