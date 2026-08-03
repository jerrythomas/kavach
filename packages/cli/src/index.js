#!/usr/bin/env node
import { init } from './commands/init.js'
import { add } from './commands/add.js'
import { doctor } from './commands/doctor.js'

const [command, ...args] = process.argv.slice(2)

/**
 * Parse a `<sub> [names...] [--flags]` argument list into a normalized options object.
 * @param {string[]} rest
 * @returns {{ sub: string | undefined, _: string[], all: boolean, force: boolean, remote: boolean }}
 */
function parseSub(rest) {
	const [sub, ...tail] = rest
	return {
		sub,
		_: tail.filter((a) => !a.startsWith('--')),
		all: tail.includes('--all'),
		force: tail.includes('--force'),
		remote: tail.includes('--remote')
	}
}

if (command === 'init') await init()
else if (command === 'add') await add(args[0])
else if (command === 'doctor') await doctor(args.includes('--fix'))
else if (command === 'skills') {
	const { sub, ...opts } = parseSub(args)
	const { skillsCommand } = await import('./skills.js')
	await skillsCommand(sub ?? 'list', opts)
} else if (command === 'agents') {
	const { sub, ...opts } = parseSub(args)
	const { agentsCommand } = await import('./agents.js')
	await agentsCommand(sub ?? 'list', opts)
} else
	console.log(
		'Usage: kavach <init | add auth-page|routes | doctor [--fix] | skills list|add [--all] [--force] | agents list|add [--all] [--force] [--remote]>'
	)
