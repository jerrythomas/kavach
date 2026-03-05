export const capabilities = {
	name: 'convex',
	displayName: 'Convex',
	supports: {
		data: false, // Data managed directly via Convex functions
		rpc: false,
		logging: false,
		magic: false,
		oauth: true,
		password: true,
		passkey: false
	}
}
