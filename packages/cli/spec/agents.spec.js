import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mkdtempSync, rmSync, existsSync as fsExists, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join as pjoin } from 'node:path'
import {
	listAgents,
	installAgents,
	fetchAgents,
	runAgentsAdd,
	runAgentsList,
	agentsCommand
} from '../src/agents.js'

describe('listAgents (bundled catalog)', () => {
	it('includes both review agents, each with a non-empty description', () => {
		const names = listAgents().map((a) => a.name)
		expect(names).toContain('kavach-integration-reviewer')
		expect(names).toContain('kavach-authorization-reviewer')
		for (const a of listAgents()) {
			expect(a.name).toBeTruthy()
			expect(a.description.length).toBeGreaterThan(0)
		}
	})

	it('is sorted by name', () => {
		const names = listAgents().map((a) => a.name)
		expect(names).toEqual([...names].sort())
	})
})

describe('installAgents', () => {
	let cwd
	beforeEach(() => {
		cwd = mkdtempSync(pjoin(tmpdir(), 'kavach-agents-'))
	})
	afterEach(() => {
		rmSync(cwd, { recursive: true, force: true })
	})

	it('copies an agent into .claude/agents/<name>.md', () => {
		const res = installAgents(['kavach-integration-reviewer'], { cwd })
		expect(res).toEqual([{ name: 'kavach-integration-reviewer', status: 'added' }])
		expect(fsExists(pjoin(cwd, '.claude/agents/kavach-integration-reviewer.md'))).toBe(true)
	})

	it('skips an existing agent unless force is set', () => {
		installAgents(['kavach-integration-reviewer'], { cwd })
		expect(installAgents(['kavach-integration-reviewer'], { cwd })[0].status).toBe('skipped')
		expect(installAgents(['kavach-integration-reviewer'], { cwd, force: true })[0].status).toBe(
			'added'
		)
	})

	it('reports unknown agents and writes nothing for them', () => {
		const res = installAgents(['does-not-exist'], { cwd })
		expect(res).toEqual([{ name: 'does-not-exist', status: 'unknown' }])
		expect(fsExists(pjoin(cwd, '.claude/agents/does-not-exist.md'))).toBe(false)
	})

	it('every catalog agent is installable by its listed name (frontmatter name === filename)', () => {
		for (const a of listAgents()) {
			expect(installAgents([a.name], { cwd, force: true })).toEqual([
				{ name: a.name, status: 'added' }
			])
		}
	})
})

describe('fetchAgents (pull from site)', () => {
	let cwd
	beforeEach(() => {
		cwd = mkdtempSync(pjoin(tmpdir(), 'kavach-agents-'))
	})
	afterEach(() => {
		rmSync(cwd, { recursive: true, force: true })
	})

	it('downloads a named agent from the site and writes it locally', async () => {
		const fetchImpl = vi.fn(() => ({ ok: true, text: () => '# remote agent body' }))
		const res = await fetchAgents(['kavach-integration-reviewer'], { cwd, fetchImpl })
		expect(res).toEqual([{ name: 'kavach-integration-reviewer', status: 'added' }])
		expect(fetchImpl).toHaveBeenCalledWith(
			expect.stringMatching(/\/agents\/kavach-integration-reviewer\.md$/)
		)
		const dest = pjoin(cwd, '.claude/agents/kavach-integration-reviewer.md')
		expect(readFileSync(dest, 'utf-8')).toBe('# remote agent body')
	})

	it('reports unknown when the site responds not-ok', async () => {
		const fetchImpl = vi.fn(() => ({ ok: false }))
		const res = await fetchAgents(['nope'], { cwd, fetchImpl })
		expect(res).toEqual([{ name: 'nope', status: 'unknown' }])
		expect(fsExists(pjoin(cwd, '.claude/agents/nope.md'))).toBe(false)
	})

	it('skips an already-installed agent unless force is set', async () => {
		const fetchImpl = vi.fn(() => ({ ok: true, text: () => 'x' }))
		await fetchAgents(['kavach-integration-reviewer'], { cwd, fetchImpl })
		fetchImpl.mockClear()
		const res = await fetchAgents(['kavach-integration-reviewer'], { cwd, fetchImpl })
		expect(res[0].status).toBe('skipped')
		expect(fetchImpl).not.toHaveBeenCalled()
	})
})

describe('runAgentsAdd', () => {
	let cwd
	beforeEach(() => {
		vi.spyOn(console, 'info').mockImplementation(() => {})
		vi.spyOn(console, 'error').mockImplementation(() => {})
		cwd = mkdtempSync(pjoin(tmpdir(), 'kavach-agents-'))
	})
	afterEach(() => {
		vi.restoreAllMocks()
		rmSync(cwd, { recursive: true, force: true })
	})

	it('installs explicitly-named agents without prompting', async () => {
		const promptImpl = vi.fn()
		await runAgentsAdd(['kavach-integration-reviewer'], { cwd, promptImpl })
		expect(promptImpl).not.toHaveBeenCalled()
		expect(fsExists(pjoin(cwd, '.claude/agents/kavach-integration-reviewer.md'))).toBe(true)
	})

	it('--all installs the entire catalog', async () => {
		await runAgentsAdd([], { cwd, all: true })
		expect(fsExists(pjoin(cwd, '.claude/agents/kavach-integration-reviewer.md'))).toBe(true)
		expect(fsExists(pjoin(cwd, '.claude/agents/kavach-authorization-reviewer.md'))).toBe(true)
	})

	it('prints "skipped" for already-installed agents', async () => {
		await runAgentsAdd(['kavach-integration-reviewer'], { cwd })
		vi.clearAllMocks()
		vi.spyOn(console, 'info').mockImplementation(() => {})
		await runAgentsAdd(['kavach-integration-reviewer'], { cwd })
		expect(console.info).toHaveBeenCalledWith(expect.stringContaining('skipped'))
	})

	it('prints error and sets exitCode for unknown agents', async () => {
		process.exitCode = undefined
		await runAgentsAdd(['does-not-exist'], { cwd })
		expect(console.error).toHaveBeenCalledWith(expect.stringContaining('unknown agent'))
		expect(process.exitCode).toBe(1)
		process.exitCode = undefined
	})

	it('prints "No agents selected" when the prompt returns an empty selection', async () => {
		await runAgentsAdd([], { cwd, promptImpl: () => [] })
		expect(console.info).toHaveBeenCalledWith(expect.stringContaining('No agents selected'))
	})

	it('installs from interactive prompt selection', async () => {
		await runAgentsAdd([], { cwd, promptImpl: () => ['kavach-authorization-reviewer'] })
		expect(fsExists(pjoin(cwd, '.claude/agents/kavach-authorization-reviewer.md'))).toBe(true)
	})

	it('--remote pulls named agents from the site', async () => {
		const fetchImpl = vi.fn(() => ({ ok: true, text: () => '# remote' }))
		await runAgentsAdd(['kavach-integration-reviewer'], { cwd, remote: true, fetchImpl })
		expect(fetchImpl).toHaveBeenCalledWith(
			expect.stringMatching(/\/agents\/kavach-integration-reviewer\.md$/)
		)
		expect(fsExists(pjoin(cwd, '.claude/agents/kavach-integration-reviewer.md'))).toBe(true)
	})
})

describe('runAgentsList', () => {
	let cwd
	beforeEach(() => {
		vi.spyOn(console, 'info').mockImplementation(() => {})
		cwd = mkdtempSync(pjoin(tmpdir(), 'kavach-agents-'))
	})
	afterEach(() => {
		vi.restoreAllMocks()
		rmSync(cwd, { recursive: true, force: true })
	})

	it('prints each available agent with a description', async () => {
		await runAgentsList({ cwd })
		const calls = console.info.mock.calls.map((c) => c[0])
		expect(calls.some((s) => s.includes('kavach-integration-reviewer'))).toBe(true)
	})

	it('marks installed agents with a checkmark', async () => {
		await runAgentsAdd(['kavach-integration-reviewer'], { cwd })
		vi.clearAllMocks()
		vi.spyOn(console, 'info').mockImplementation(() => {})
		await runAgentsList({ cwd })
		const calls = console.info.mock.calls.map((c) => c[0])
		expect(calls.some((s) => s.startsWith('✓ '))).toBe(true)
	})

	it('prints "No agents available" when agentsDir is empty', async () => {
		await runAgentsList({ agentsDir: cwd, cwd })
		expect(console.info).toHaveBeenCalledWith('No agents available.')
	})
})

describe('agentsCommand entry', () => {
	let cwd
	beforeEach(() => {
		vi.spyOn(console, 'info').mockImplementation(() => {})
		vi.spyOn(console, 'error').mockImplementation(() => {})
		cwd = mkdtempSync(pjoin(tmpdir(), 'kavach-agents-'))
	})
	afterEach(() => {
		vi.restoreAllMocks()
		rmSync(cwd, { recursive: true, force: true })
	})

	it('routes "list" to runAgentsList', async () => {
		const cwdSpy = vi.spyOn(process, 'cwd').mockReturnValue(cwd)
		await agentsCommand('list', {})
		cwdSpy.mockRestore()
		expect(console.info).toHaveBeenCalled()
	})

	it('routes "add" with --all to runAgentsAdd', async () => {
		const cwdSpy = vi.spyOn(process, 'cwd').mockReturnValue(cwd)
		await agentsCommand('add', { _: [], all: true })
		cwdSpy.mockRestore()
		expect(fsExists(pjoin(cwd, '.claude/agents/kavach-integration-reviewer.md'))).toBe(true)
	})

	it('routes "add" with named agents to runAgentsAdd', async () => {
		const cwdSpy = vi.spyOn(process, 'cwd').mockReturnValue(cwd)
		await agentsCommand('add', { _: ['kavach-authorization-reviewer'] })
		cwdSpy.mockRestore()
		expect(fsExists(pjoin(cwd, '.claude/agents/kavach-authorization-reviewer.md'))).toBe(true)
	})
})
