export default {
	files: [
		'package.json',
		'packages/*/package.json',
		'adapters/*/package.json',
		'sites/*/package.json'
	],
	recursive: true,

	// Regenerate the lockfile AFTER the version bump, and include it in the
	// release commit.
	//
	// `bun pm pack` rewrites each `workspace:*` dependency using the version
	// recorded for that workspace in bun.lock — not the version in the package's
	// own package.json. A plain `bun install` does not refresh those recorded
	// versions once they exist, so they froze at 1.0.1 and every release from
	// 1.0.2 through 1.1.2 shipped internal `@kavach/*` deps pinned to 1.0.1.
	// Consumers of `kavach@1.1.2` therefore resolved `@kavach/sentry@1.0.1`.
	//
	// Deleting the lockfile forces bun to record the just-bumped versions, and
	// `all` stages it alongside the bumped manifests so the tag CI packs from
	// carries a correct lockfile.
	execute: 'rm -f bun.lock && bun install',
	all: true
}
