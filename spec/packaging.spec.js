import { describe, expect, it } from 'vitest'
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { join, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const PUBLISHED_GROUPS = ['packages', 'adapters']
const CARRIES_EXTENSION = /\.(js|json|svelte|css)$/
const RELATIVE_SPECIFIER = /\bfrom\s+'(\.\.?\/[^']*)'/g

/** Every file under `dir`, recursively. */
function listFiles(dir) {
	return readdirSync(dir).flatMap((item) => {
		const full = join(dir, item)
		return statSync(full).isDirectory() ? listFiles(full) : [full]
	})
}

/** The package manifest at `dir`, or null when there isn't a readable one. */
function readManifest(dir) {
	try {
		return JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8'))
	} catch {
		return null
	}
}

/** The runtime entry a consumer resolves, or undefined when none is declared. */
function runtimeEntry(manifest) {
	const entry = manifest.exports?.['.']
	return entry?.import ?? entry?.svelte
}

function describePackage(group, name) {
	const dir = join(root, group, name)
	const manifest = statSync(dir).isDirectory() ? readManifest(dir) : null
	if (!manifest || manifest.private) return []
	const entry = runtimeEntry(manifest)
	return entry ? [{ name: manifest.name, dir, entry }] : []
}

/** Workspace packages that publish to npm, paired with their runtime entry. */
function publishedPackages() {
	return PUBLISHED_GROUPS.flatMap((group) =>
		readdirSync(join(root, group)).flatMap((name) => describePackage(group, name))
	)
}

/** Absolute path of the file a Node consumer resolves for this package. */
function entryPath({ dir, entry }) {
	return join(dir, entry.replace(/^\.\//, ''))
}

/** Relative import specifiers in `src` that carry no file extension. */
function extensionlessSpecifiers(dir) {
	return listFiles(join(dir, 'src'))
		.filter((file) => /\.(js|ts)$/.test(file))
		.flatMap((file) =>
			[...readFileSync(file, 'utf8').matchAll(RELATIVE_SPECIFIER)]
				.map((match) => match[1])
				.filter((specifier) => !CARRIES_EXTENSION.test(specifier))
				.map((specifier) => `${file.replace(`${root}/`, '')}: ${specifier}`)
		)
}

/**
 * Import `file` in a plain Node ESM process. Returns null on success, or the
 * failure text — never throws, so the caller can classify the outcome.
 */
function importUnderNode(file) {
	try {
		execFileSync(
			process.execPath,
			['--input-type=module', '-e', `await import(${JSON.stringify(file)})`],
			{ stdio: 'pipe' }
		)
		return null
	} catch (error) {
		return `${error.stderr ?? ''}${error.message ?? ''}`
	}
}

/**
 * True when the only thing stopping Node is a Svelte component. Such a package
 * is bundler-only by nature and cannot be fixed by any extension change.
 *
 * Deliberately derived from the actual failure rather than from the presence of
 * `.svelte` files: `@kavach/vite` ships `.svelte` scaffolding templates it never
 * imports, and a presence check would wrongly exempt a Node-loadable plugin.
 */
function blockedOnlyBySvelteComponent(failure) {
	return failure.includes('ERR_UNKNOWN_FILE_EXTENSION') && failure.includes('.svelte')
}

const packages = publishedPackages()

// Every published package is held to extension-correct relative specifiers.
// This is a source invariant, so it costs nothing and always runs.
const extensionChecked = packages

// Loading is checked wherever the declared entry exists on disk. For packages
// that emit to `dist/` that means after a build, so a cold checkout covers the
// source-entry packages only. The publish workflow runs this same check against
// every package once built, which is where the shipped artifact is really gated.
const runtimeLoadable = packages.filter((p) => existsSync(entryPath(p)))
const awaitingBuild = packages.filter((p) => !existsSync(entryPath(p)))

describe('published packages resolve under native ESM', () => {
	it('finds packages to check', () => {
		expect(packages.length).toBeGreaterThan(0)
		expect(extensionChecked.length).toBeGreaterThan(0)
	})

	it('load-checks every package whose entry is source, so a cold run covers something', () => {
		// Only a dist entry may be deferred to a build. If a package entering
		// through `src/` ever went unchecked, this run would be reporting a pass
		// over nothing.
		expect(awaitingBuild.filter((p) => p.entry.includes('/src/'))).toEqual([])
		expect(runtimeLoadable.length).toBeGreaterThan(0)
	})

	describe.each(extensionChecked)('$name', ({ dir }) => {
		it('has no extensionless relative imports in src', () => {
			expect(extensionlessSpecifiers(dir)).toEqual([])
		})
	})

	describe.each(runtimeLoadable)('$name', (pkg) => {
		it('imports cleanly under plain Node ESM', () => {
			const failure = importUnderNode(entryPath(pkg))
			if (failure && blockedOnlyBySvelteComponent(failure)) return
			expect(failure).toBeNull()
		})
	})
})
