import { describe, it, expect } from 'vitest'
import { readFileSync, existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { listSkills, parseFrontmatter } from '../src/skills.js'
import { listAgents } from '../src/agents.js'

// Vitest runs from the repo root (bun run test:ci); the jsdom environment makes
// import.meta.url unusable for path resolution, so resolve the manifest against
// cwd rather than the module URL.
const REPO_ROOT = process.cwd()
const manifest = JSON.parse(readFileSync(join(REPO_ROOT, 'sensei.library.json'), 'utf-8'))
const rootPkg = JSON.parse(readFileSync(join(REPO_ROOT, 'package.json'), 'utf-8'))

const rootPath = (p) => join(REPO_ROOT, p)

/** Every publishable workspace package name, read from the manifests on disk. */
function publishedPackages() {
	return ['packages', 'adapters']
		.flatMap((group) =>
			readdirSync(rootPath(group)).map((dir) => join(rootPath(group), dir, 'package.json'))
		)
		.filter((file) => existsSync(file))
		.map((file) => JSON.parse(readFileSync(file, 'utf-8')))
		.filter((pkg) => !pkg.private)
		.map((pkg) => pkg.name)
		.sort()
}

describe('sensei.library.json — top level', () => {
	it('declares library, version range, repo, ref and site', () => {
		expect(manifest.library).toBe('kavach')
		expect(manifest.version).toMatch(/^[<>=~^]/)
		expect(manifest.repo).toMatch(/^https:\/\/github\.com\//)
		expect(manifest.ref).toBeTruthy()
		expect(manifest.site).toMatch(/^https:\/\//)
	})

	it('keys its identity on an ecosystem, since a library is (ecosystem, name)', () => {
		expect(manifest.ecosystem).toBe('npm')
	})

	// `version` is a RANGE (which releases the capabilities apply to). `documents`
	// is the CONCRETE release the published skills/agents/llms corpus describes.
	// Without the second, a consumer cannot answer "are these docs for the version
	// I depend on?" and has to serve possibly-wrong docs or none at all.
	it('names the concrete release its published artifacts describe', () => {
		expect(manifest.documents).toMatch(/^\d+\.\d+\.\d+/)
		expect(manifest.documents).not.toMatch(/^[<>=~^]/)
	})

	// A stale `documents` is worse than an absent one: it answers the version
	// question confidently and wrongly. Pinning it to the repo's own version means
	// a release that forgets to sync the manifest fails here instead of shipping.
	it('documents the version this repo is actually at', () => {
		expect(manifest.documents).toBe(rootPkg.version)
	})

	// A branch is a moving target: docs fetched from `main` are not reproducible
	// and cannot be matched to a release. A tag can.
	it('pins source fetches to a tag rather than a moving branch', () => {
		expect(manifest.ref).toBe(`v${manifest.documents}`)
		expect(manifest.branch).toBeUndefined()
	})
})

describe('sensei.library.json — packages', () => {
	// Grouping must be declared, never inferred: a dependency on `@kavach/vite`
	// cannot reach kavach's skills and docs unless the library says it owns that
	// name. A prefix rule is not a substitute — `@types/node` belongs to no
	// "types" library.
	it('declares exactly the publishable workspace packages', () => {
		expect([...manifest.packages].sort()).toEqual(publishedPackages())
	})

	it('includes the root package and the scoped ones', () => {
		expect(manifest.packages).toContain('kavach')
		expect(manifest.packages).toContain('@kavach/vite')
		expect(manifest.packages).toContain('@kavach/adapter-supabase')
	})

	it('documents the install commands', () => {
		expect(manifest.install.skills).toContain('kavach skills add')
		expect(manifest.install.agents).toContain('kavach agents add')
	})
})

describe('sensei.library.json — skills', () => {
	it('lists exactly the bundled skill catalog', () => {
		const declared = manifest.skills.map((s) => s.name).sort()
		const bundled = listSkills()
			.map((s) => s.name)
			.sort()
		expect(declared).toEqual(bundled)
	})

	it('every skill has a focus, an existing git-relative path, and a site-relative url', () => {
		for (const s of manifest.skills) {
			expect(s.focus, `${s.name} focus`).toBeTruthy()
			expect(s.path, `${s.name} path`).toBe(`packages/cli/skills/${s.name}/SKILL.md`)
			expect(existsSync(rootPath(s.path)), `${s.path} exists`).toBe(true)
			expect(s.url).toBe(`/skills/${s.name}/SKILL.md`)
		}
	})
})

describe('sensei.library.json — agents', () => {
	it('lists exactly the bundled agent catalog', () => {
		const declared = manifest.agents.map((a) => a.name).sort()
		const bundled = listAgents()
			.map((a) => a.name)
			.sort()
		expect(declared).toEqual(bundled)
	})

	it('every agent path exists, matches its frontmatter name, and has a site-relative url', () => {
		for (const a of manifest.agents) {
			expect(a.focus, `${a.name} focus`).toBeTruthy()
			expect(a.path, `${a.name} path`).toBe(`packages/cli/agents/${a.name}.md`)
			expect(existsSync(rootPath(a.path)), `${a.path} exists`).toBe(true)
			const { name } = parseFrontmatter(readFileSync(rootPath(a.path), 'utf-8'))
			expect(name, `${a.path} frontmatter name`).toBe(a.name)
			expect(a.url).toBe(`/agents/${a.name}.md`)
		}
	})
})

describe('sensei.library.json — llms', () => {
	it('points at the tracked corpus and an existing index', () => {
		expect(manifest.llms.path).toBe('docs/llms')
		expect(existsSync(rootPath(manifest.llms.path))).toBe(true)
		expect(manifest.llms.url).toBe('/llms')
		expect(manifest.llms.index).toBe('/llms/llms.txt')
		// index resolves under the tracked corpus
		expect(existsSync(rootPath(join(manifest.llms.path, 'llms.txt')))).toBe(true)
	})
})
