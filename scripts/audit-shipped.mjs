// The release gate for dependency advisories: fail on a high or critical
// advisory in what kavach SHIPS, never on dev tooling.
//
// `bun audit` reports the whole lockfile — the root's devDependencies, the
// demo/learn sites' wrangler and firebase-tools — and has no production scope;
// installing with `--production` does not narrow it, because it reads bun.lock.
// So this computes the runtime dependency closure of the published workspaces
// (packages/*, adapters/*) from bun.lock, and gates only the advisories whose
// vulnerable range contains a version in that closure. Peer dependencies are
// left out: the consumer supplies them, at a version this lockfile never sees.
//
//   bun scripts/audit-shipped.mjs     (run under bun: it uses Bun.semver)
//
// The full `bun audit` report is still printed by CI beside this gate.

/* global Bun */

const PUBLISHED = /^(packages|adapters)\//
const GATED = new Set(['high', 'critical'])

/** bun.lock is JSON with trailing commas. */
export function parseLock(text) {
	return JSON.parse(text.replace(/,(\s*[}\]])/g, '$1'))
}

/** The version a `packages` entry records: `name@1.2.3` → `1.2.3`. */
function versionOf(entry) {
	const spec = entry[0]
	return spec.slice(spec.lastIndexOf('@') + 1)
}

/** A `packages` key as the package names it nests: `@a/b/c` → `['@a/b', 'c']`. */
function nesting(key) {
	const names = []
	const parts = key.split('/')
	for (let i = 0; i < parts.length; i++) {
		names.push(parts[i].startsWith('@') ? `${parts[i]}/${parts[++i]}` : parts[i])
	}
	return names
}

/** The `packages` key a dependency of `parentKey` resolves to: the nearest
 *  nested install (`parent/dep`, then each enclosing parent), else the hoisted
 *  top-level one. */
function resolveKey(packages, parentKey, name) {
	const scope = parentKey ? nesting(parentKey) : []
	for (let depth = scope.length; depth > 0; depth--) {
		const nested = `${scope.slice(0, depth).join('/')}/${name}`
		if (nested in packages) return nested
	}
	return name in packages ? name : undefined
}

/** The runtime closure of the published workspaces: package name → versions. */
export function shippedClosure(lock) {
	const { workspaces, packages } = lock
	const byName = new Map(Object.entries(workspaces).map(([path, ws]) => [ws.name, path]))
	const shipped = new Map()
	const seen = new Set()
	const queue = []

	const runtimeDeps = (spec) => ({ ...(spec?.dependencies ?? {}), ...(spec?.optionalDependencies ?? {}) })
	const enqueueWorkspace = (path) => {
		if (seen.has(`ws:${path}`)) return
		seen.add(`ws:${path}`)
		for (const [name, range] of Object.entries(runtimeDeps(workspaces[path]))) {
			if (String(range).startsWith('workspace:')) {
				const target = byName.get(name)
				if (target) enqueueWorkspace(target)
			} else queue.push(['', name])
		}
	}
	for (const path of Object.keys(workspaces)) if (PUBLISHED.test(path)) enqueueWorkspace(path)

	while (queue.length) {
		const [parentKey, name] = queue.shift()
		const key = resolveKey(packages, parentKey, name)
		if (!key || seen.has(key)) continue
		seen.add(key)
		const entry = packages[key]
		if (String(entry[0]).includes('@workspace:')) {
			const target = byName.get(name)
			if (target) enqueueWorkspace(target)
			continue
		}
		if (!shipped.has(name)) shipped.set(name, new Set())
		shipped.get(name).add(versionOf(entry))
		for (const dep of Object.keys(runtimeDeps(entry[2]))) queue.push([key, dep])
	}
	return shipped
}

/** High/critical advisories whose range holds a shipped version. */
export function shippedVulnerabilities(audit, shipped, satisfies) {
	const found = []
	for (const [name, advisories] of Object.entries(audit)) {
		for (const version of shipped.get(name) ?? []) {
			for (const a of advisories) {
				if (GATED.has(a.severity) && satisfies(version, a.vulnerable_versions)) {
					found.push({ name, version, severity: a.severity, title: a.title, url: a.url })
				}
			}
		}
	}
	return found
}

/** Gate this repository: exit 0 clean, 1 on a shipped advisory, 2 on no report. */
async function main() {
	const lock = parseLock(await Bun.file('bun.lock').text())
	const run = Bun.spawnSync(['bun', 'audit', '--json'], { stdout: 'pipe', stderr: 'pipe' })
	const raw = run.stdout.toString().trim()
	if (!raw.startsWith('{')) {
		console.error(`bun audit --json produced no report:\n${run.stderr.toString()}`)
		return 2
	}
	const shipped = shippedClosure(lock)
	const found = shippedVulnerabilities(JSON.parse(raw), shipped, (v, r) => Bun.semver.satisfies(v, r))
	console.log(`Shipped closure: ${shipped.size} packages from the published workspaces.`)
	if (found.length === 0) {
		console.log('No high or critical advisory in what kavach ships.')
		return 0
	}
	for (const f of found) console.log(`${f.severity}: ${f.name}@${f.version} — ${f.title} (${f.url})`)
	return 1
}

if (import.meta.main) process.exitCode = await main()
