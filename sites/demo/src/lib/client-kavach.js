/**
 * Browser-only kavach bootstrap shared by the root and (app) layouts.
 *
 * Each layout that signs users in (or syncs session changes to the server)
 * needs a kavach instance. It must be created lazily (dynamic import) so the
 * heavy provider SDK only loads in the browser, then assigned onto a live
 * `$state` placeholder object that was set as context synchronously — so any
 * child component calling `getContext('kavach')` at setup sees the instance
 * once it resolves.
 *
 * @typedef {ReturnType<typeof import('kavach').createKavach>} KavachInstance
 *
 * @returns {Promise<{ kavach: KavachInstance, instance: KavachInstance }>}
 */
export async function mountKavach() {
	const { createKavach } = await import('kavach')
	const { adapter, logger } = await import('$kavach/auth')
	const { invalidateAll } = await import('$app/navigation')
	const instance = createKavach(adapter, { logger, invalidateAll })
	const kavach = /** @type {KavachInstance} */ ({})
	Object.assign(kavach, instance)
	return { kavach, instance }
}
