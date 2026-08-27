import { describe, expect, it } from 'vitest'
import { execFileSync } from 'node:child_process'
import { readFileSync, readdirSync, statSync } from 'node:fs'
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

/** True when no file under `src` carries any of the given extensions. */
function srcHasNone(dir, extensions) {
	return !listFiles(join(dir, 'src')).some((file) => extensions.some((ext) => file.endsWith(ext)))
}

const packages = publishedPackages()

// Extensions are checked wherever they can actually be correct: a JS entry whose
// source tree holds no TypeScript. A package that re-exports a `.ts` file cannot
// name a working extension at all — `.ts` is unloadable by Node and the `.js`
// twin does not exist — so it is blocked on emitting JavaScript (issue #25) and
// enrols here automatically once it does.
const extensionChecked = packages.filter(
	(p) => p.entry.endsWith('.js') && srcHasNone(p.dir, ['.ts'])
)

// Loading additionally requires no `.svelte` in the tree. A component library is
// bundler-only by nature — Node cannot load `.svelte` at any extension — so this
// is a narrower set than the one above, not a gap in it.
const runtimeLoadable = extensionChecked.filter((p) => srcHasNone(p.dir, ['.svelte']))

describe('published packages resolve under native ESM', () => {
	it('finds packages to check', () => {
		expect(packages.length).toBeGreaterThan(0)
		expect(extensionChecked.length).toBeGreaterThan(0)
		expect(runtimeLoadable.length).toBeGreaterThan(0)
	})

	describe.each(extensionChecked)('$name', ({ dir }) => {
		it('has no extensionless relative imports in src', () => {
			expect(extensionlessSpecifiers(dir)).toEqual([])
		})
	})

	describe.each(runtimeLoadable)('$name', ({ dir, entry }) => {
		it('imports cleanly under plain Node ESM', () => {
			const target = join(dir, entry.replace(/^\.\//, ''))
			expect(() =>
				execFileSync(
					process.execPath,
					['--input-type=module', '-e', `await import(${JSON.stringify(target)})`],
					{ stdio: 'pipe' }
				)
			).not.toThrow()
		})
	})
})
