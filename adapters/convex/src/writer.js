export function getLogWriter(client, api, options = {}) {
	const entity = options.entity ?? 'logs'
	return {
		async write(data) {
			try {
				await client.mutation(api[entity].create, data)
			} catch {
				// swallow — log failures must not crash the app
			}
		}
	}
}
