import { readFileSync, writeFileSync, existsSync, mkdirSync, renameSync } from 'fs'
import { dirname } from 'path'

export function readFile(path) {
	try {
		return readFileSync(path, 'utf-8')
	} catch {
		return ''
	}
}

export function writeFile(path, content) {
	mkdirSync(dirname(path), { recursive: true })
	writeFileSync(path, content, 'utf-8')
}

export function fileExists(path) {
	return existsSync(path)
}

export function renameFile(from, to) {
	renameSync(from, to)
}

export function detectPackageManager(cwd) {
	if (existsSync(`${cwd}/bun.lock`) || existsSync(`${cwd}/bun.lockb`)) return 'bun'
	if (existsSync(`${cwd}/pnpm-lock.yaml`)) return 'pnpm'
	if (existsSync(`${cwd}/yarn.lock`)) return 'yarn'
	return 'npm'
}
