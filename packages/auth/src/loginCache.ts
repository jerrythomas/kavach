const STORAGE_KEY = 'kavach:logins'
const MAX_ENTRIES = 5

export interface CachedLogin {
	email: string
	name?: string
	avatar?: string
	provider?: string
	mode?: string
	hasPassword?: boolean
	lastLogin?: number
}

function hasStorage(): boolean {
	return typeof localStorage !== 'undefined'
}

function read(): CachedLogin[] {
	try {
		const raw = localStorage.getItem(STORAGE_KEY)
		if (!raw) return []
		const parsed = JSON.parse(raw)
		return Array.isArray(parsed) ? (parsed as CachedLogin[]) : []
	} catch {
		return []
	}
}

function write(entries: CachedLogin[]): void {
	localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
}

export function get(): CachedLogin[] {
	if (!hasStorage()) return []
	return read().sort((a, b) => (b.lastLogin ?? 0) - (a.lastLogin ?? 0))
}

export function set(entry: CachedLogin): void {
	if (!hasStorage()) return
	if (!entry || !entry.email) return

	let entries = read()

	const emailLower = entry.email.toLowerCase()
	entries = entries.filter((e) => e.email.toLowerCase() !== emailLower)

	entries.push(entry)

	entries.sort((a, b) => (b.lastLogin ?? 0) - (a.lastLogin ?? 0))

	if (entries.length > MAX_ENTRIES) {
		entries = entries.slice(0, MAX_ENTRIES)
	}

	write(entries)
}

export function remove(email: string): void {
	if (!hasStorage()) return
	if (!email) return

	const emailLower = email.toLowerCase()
	const entries = read().filter((e) => e.email.toLowerCase() !== emailLower)
	write(entries)
}

export function clear(): void {
	if (!hasStorage()) return
	localStorage.removeItem(STORAGE_KEY)
}
