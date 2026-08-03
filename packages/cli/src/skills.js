import { readFileSync, readdirSync, existsSync, mkdirSync, cpSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

// The catalog ships inside the package: packages/cli/skills/ in dev/test,
// node_modules/@kavach/cli/skills/ once installed. One relative path, both worlds.
// Guard against non-file: URLs (e.g. jsdom sets import.meta.url to http://localhost/...).
const DEFAULT_SKILLS_DIR = (() => {
	try {
		return fileURLToPath(new URL('../skills/', import.meta.url))
	} catch {
		return resolve(process.cwd(), 'packages/cli/skills')
	}
})()

/**
 * Parse `name` and `description` from a SKILL.md YAML frontmatter block.
 * @param {string} md
 * @returns {{ name: string, description: string }}
 */
export function parseFrontmatter(md) {
	// Keys are fixed, so literal regexes are correct and linear-time. The
	// `?.[1]?.trim() ?? ''` chain returns '' for a missing block, a missing field,
	// or a bare `key:` with no value.
	const block = md.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? ''
	const name = block.match(/^name:\s*(.+)$/m)?.[1]?.trim() ?? ''
	const description = block.match(/^description:\s*(.+)$/m)?.[1]?.trim() ?? ''
	return { name, description }
}

/**
 * Read the bundled skill catalog (derived from each SKILL.md's frontmatter).
 * @param {{ skillsDir?: string }} [opts]
 * @returns {Array<{ name: string, description: string }>}
 */
export function listSkills({ skillsDir = DEFAULT_SKILLS_DIR } = {}) {
	if (!existsSync(skillsDir)) return []
	return readdirSync(skillsDir)
		.filter((entry) => existsSync(join(skillsDir, entry, 'SKILL.md')))
		.map((entry) => parseFrontmatter(readFileSync(join(skillsDir, entry, 'SKILL.md'), 'utf-8')))
		.filter((s) => s.name)
		.sort((a, b) => a.name.localeCompare(b.name))
}

/**
 * Copy named skills into <cwd>/.claude/skills/<name>/ (idempotent).
 * @param {string[]} names
 * @param {{ cwd?: string, force?: boolean, skillsDir?: string }} [opts]
 * @returns {Array<{ name: string, status: 'added' | 'skipped' | 'unknown' }>}
 */
export function installSkills(
	names,
	{ cwd = process.cwd(), force = false, skillsDir = DEFAULT_SKILLS_DIR } = {}
) {
	const targetRoot = resolve(cwd, '.claude', 'skills')
	return names.map((name) => {
		const src = join(skillsDir, name)
		if (!existsSync(join(src, 'SKILL.md'))) return { name, status: 'unknown' }
		const dest = join(targetRoot, name)
		if (existsSync(dest) && !force) return { name, status: 'skipped' }
		mkdirSync(targetRoot, { recursive: true })
		cpSync(src, dest, { recursive: true })
		return { name, status: 'added' }
	})
}

/**
 * Interactive multiselect over the catalog, backed by @clack/prompts.
 * Dynamically imported so tests can inject a `promptImpl` and skip clack entirely.
 * @param {Array<{ name: string, description: string }>} catalog
 * @param {string} message
 * @returns {Promise<string[]>}
 */
async function clackSelect(catalog, message) {
	const p = await import('@clack/prompts')
	const picked = await p.multiselect({
		message,
		options: catalog.map((s) => ({ value: s.name, label: s.name, hint: s.description })),
		required: false
	})
	if (p.isCancel(picked)) return []
	return picked ?? []
}

/**
 * Print the catalog, marking already-installed skills.
 * @param {{ skillsDir?: string, cwd?: string }} [opts]
 */
export function runSkillsList({ skillsDir, cwd = process.cwd() } = {}) {
	const catalog = listSkills({ skillsDir })
	if (catalog.length === 0) {
		console.info('No skills available.')
		return
	}
	const installedRoot = resolve(cwd, '.claude', 'skills')
	console.info('Available Kavach skills:\n')
	for (const s of catalog) {
		const mark = existsSync(join(installedRoot, s.name, 'SKILL.md')) ? '✓ ' : '  '
		console.info(`${mark}${s.name}`)
		console.info(`     ${s.description}`)
	}
	console.info('\nInstall with: kavach skills add <name> [...]   (or --all)')
}

/**
 * Resolve which skills to install, then copy and report.
 * @param {string[]} names
 * @param {{ all?: boolean, force?: boolean, skillsDir?: string, cwd?: string, promptImpl?: (catalog: Array<{name:string,description:string}>, message: string) => Promise<string[]> }} [opts]
 */
export async function runSkillsAdd(
	names,
	{ all = false, force = false, skillsDir, cwd = process.cwd(), promptImpl = clackSelect } = {}
) {
	const catalog = listSkills({ skillsDir })
	let selected = names
	if (all) {
		selected = catalog.map((s) => s.name)
	} else if (selected.length === 0) {
		selected = await promptImpl(catalog, 'Select skills to add')
	}
	if (selected.length === 0) {
		console.info('No skills selected.')
		return
	}
	const results = installSkills(selected, { cwd, force, skillsDir })
	for (const r of results) {
		if (r.status === 'added') console.info(`  added .claude/skills/${r.name}`)
		else if (r.status === 'skipped')
			console.info(`  skipped ${r.name} (exists — use --force to overwrite)`)
		else console.error(`  unknown skill: ${r.name}`)
	}
	if (results.some((r) => r.status === 'unknown')) {
		console.error(`\nValid skills: ${catalog.map((s) => s.name).join(', ')}`)
		process.exitCode = 1
	}
}

/**
 * CLI entry for `kavach skills` subcommands.
 * @param {'list' | 'add'} sub
 * @param {{ _?: string[], all?: boolean, force?: boolean }} [opts]
 */
export async function skillsCommand(sub, opts = {}) {
	if (sub === 'add') {
		await runSkillsAdd(opts._ ?? [], { all: opts.all, force: opts.force })
	} else {
		await runSkillsList()
	}
}
