import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mkdtempSync, rmSync, existsSync as fsExists } from 'node:fs'
import { tmpdir } from 'node:os'
import { join as pjoin } from 'node:path'
import {
	parseFrontmatter,
	listSkills,
	installSkills,
	runSkillsAdd,
	runSkillsList,
	skillsCommand
} from '../src/skills.js'

describe('parseFrontmatter', () => {
	it('extracts name and description from a frontmatter block', () => {
		const md = '---\nname: foo\ndescription: Bar baz qux\n---\n# Foo\n'
		expect(parseFrontmatter(md)).toEqual({ name: 'foo', description: 'Bar baz qux' })
	})

	it('returns empty strings when frontmatter is missing', () => {
		expect(parseFrontmatter('# no frontmatter here')).toEqual({ name: '', description: '' })
	})
})

describe('listSkills (bundled catalog)', () => {
	it('includes the kavach skills, each with a non-empty description', () => {
		const names = listSkills().map((s) => s.name)
		expect(names).toContain('kavach-setup')
		expect(names).toContain('kavach-providers')
		expect(names).toContain('kavach-authorization')
		expect(names).toContain('kavach-data-access')
		for (const s of listSkills()) {
			expect(s.name).toBeTruthy()
			expect(s.description.length).toBeGreaterThan(0)
		}
	})

	it('is sorted by name', () => {
		const names = listSkills().map((s) => s.name)
		expect(names).toEqual([...names].sort())
	})
})

describe('installSkills', () => {
	let cwd
	beforeEach(() => {
		cwd = mkdtempSync(pjoin(tmpdir(), 'kavach-skills-'))
	})
	afterEach(() => {
		rmSync(cwd, { recursive: true, force: true })
	})

	it('copies a skill into .claude/skills/<name>/', () => {
		const res = installSkills(['kavach-setup'], { cwd })
		expect(res).toEqual([{ name: 'kavach-setup', status: 'added' }])
		expect(fsExists(pjoin(cwd, '.claude/skills/kavach-setup/SKILL.md'))).toBe(true)
	})

	it('skips an existing skill unless force is set', () => {
		installSkills(['kavach-setup'], { cwd })
		expect(installSkills(['kavach-setup'], { cwd })[0].status).toBe('skipped')
		expect(installSkills(['kavach-setup'], { cwd, force: true })[0].status).toBe('added')
	})

	it('reports unknown skills and writes nothing for them', () => {
		const res = installSkills(['does-not-exist'], { cwd })
		expect(res).toEqual([{ name: 'does-not-exist', status: 'unknown' }])
		expect(fsExists(pjoin(cwd, '.claude/skills/does-not-exist'))).toBe(false)
	})

	it('every catalog skill is installable by its listed name (frontmatter name === dir)', () => {
		for (const s of listSkills()) {
			expect(installSkills([s.name], { cwd, force: true })).toEqual([
				{ name: s.name, status: 'added' }
			])
		}
	})
})

describe('runSkillsAdd', () => {
	let cwd
	beforeEach(() => {
		vi.spyOn(console, 'info').mockImplementation(() => {})
		vi.spyOn(console, 'error').mockImplementation(() => {})
		cwd = mkdtempSync(pjoin(tmpdir(), 'kavach-skills-'))
	})
	afterEach(() => {
		vi.restoreAllMocks()
		rmSync(cwd, { recursive: true, force: true })
	})

	it('installs explicitly-named skills without prompting', async () => {
		const promptImpl = vi.fn()
		await runSkillsAdd(['kavach-providers'], { cwd, promptImpl })
		expect(promptImpl).not.toHaveBeenCalled()
		expect(fsExists(pjoin(cwd, '.claude/skills/kavach-providers/SKILL.md'))).toBe(true)
	})

	it('--all installs the entire catalog', async () => {
		await runSkillsAdd([], { cwd, all: true })
		expect(fsExists(pjoin(cwd, '.claude/skills/kavach-setup/SKILL.md'))).toBe(true)
		expect(fsExists(pjoin(cwd, '.claude/skills/kavach-providers/SKILL.md'))).toBe(true)
	})

	it('prints "skipped" for already-installed skills', async () => {
		await runSkillsAdd(['kavach-providers'], { cwd })
		vi.clearAllMocks()
		vi.spyOn(console, 'info').mockImplementation(() => {})
		await runSkillsAdd(['kavach-providers'], { cwd })
		expect(console.info).toHaveBeenCalledWith(expect.stringContaining('skipped'))
	})

	it('prints error and sets exitCode for unknown skills', async () => {
		process.exitCode = undefined
		await runSkillsAdd(['does-not-exist'], { cwd })
		expect(console.error).toHaveBeenCalledWith(expect.stringContaining('unknown skill'))
		expect(process.exitCode).toBe(1)
		process.exitCode = undefined
	})

	it('prints "No skills selected" when the prompt returns an empty selection', async () => {
		await runSkillsAdd([], { cwd, promptImpl: () => [] })
		expect(console.info).toHaveBeenCalledWith(expect.stringContaining('No skills selected'))
	})

	it('installs from interactive prompt selection', async () => {
		await runSkillsAdd([], { cwd, promptImpl: () => ['kavach-providers'] })
		expect(fsExists(pjoin(cwd, '.claude/skills/kavach-providers/SKILL.md'))).toBe(true)
	})
})

describe('runSkillsList', () => {
	let cwd
	beforeEach(() => {
		vi.spyOn(console, 'info').mockImplementation(() => {})
		cwd = mkdtempSync(pjoin(tmpdir(), 'kavach-skills-'))
	})
	afterEach(() => {
		vi.restoreAllMocks()
		rmSync(cwd, { recursive: true, force: true })
	})

	it('prints each available skill with a description', async () => {
		await runSkillsList({ cwd })
		const calls = console.info.mock.calls.map((c) => c[0])
		expect(calls.some((s) => s.includes('kavach-setup'))).toBe(true)
	})

	it('marks installed skills with a checkmark', async () => {
		await runSkillsAdd(['kavach-providers'], { cwd })
		vi.clearAllMocks()
		vi.spyOn(console, 'info').mockImplementation(() => {})
		await runSkillsList({ cwd })
		const calls = console.info.mock.calls.map((c) => c[0])
		expect(calls.some((s) => s.startsWith('✓ '))).toBe(true)
	})

	it('prints "No skills available" when skillsDir is empty', async () => {
		await runSkillsList({ skillsDir: cwd, cwd })
		expect(console.info).toHaveBeenCalledWith('No skills available.')
	})
})

describe('skillsCommand entry', () => {
	let cwd
	beforeEach(() => {
		vi.spyOn(console, 'info').mockImplementation(() => {})
		vi.spyOn(console, 'error').mockImplementation(() => {})
		cwd = mkdtempSync(pjoin(tmpdir(), 'kavach-skills-'))
	})
	afterEach(() => {
		vi.restoreAllMocks()
		rmSync(cwd, { recursive: true, force: true })
	})

	it('routes "list" to runSkillsList', async () => {
		const cwdSpy = vi.spyOn(process, 'cwd').mockReturnValue(cwd)
		await skillsCommand('list', {})
		cwdSpy.mockRestore()
		expect(console.info).toHaveBeenCalled()
	})

	it('routes "add" with --all to runSkillsAdd', async () => {
		const cwdSpy = vi.spyOn(process, 'cwd').mockReturnValue(cwd)
		await skillsCommand('add', { _: [], all: true })
		cwdSpy.mockRestore()
		expect(fsExists(pjoin(cwd, '.claude/skills/kavach-setup/SKILL.md'))).toBe(true)
	})

	it('routes "add" with named skills to runSkillsAdd', async () => {
		const cwdSpy = vi.spyOn(process, 'cwd').mockReturnValue(cwd)
		await skillsCommand('add', { _: ['kavach-providers'] })
		cwdSpy.mockRestore()
		expect(fsExists(pjoin(cwd, '.claude/skills/kavach-providers/SKILL.md'))).toBe(true)
	})
})
