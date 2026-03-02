const STORAGE_KEY = 'kavach:logins'
const MAX_ENTRIES = 5

/**
 * Check if localStorage is available (browser environment).
 * @returns {boolean}
 */
function hasStorage() {
	return typeof localStorage !== 'undefined'
}

/**
 * Read all cached login entries from localStorage.
 * @returns {Array} raw entries (unsorted) or empty array
 */
function read() {
	try {
		const raw = localStorage.getItem(STORAGE_KEY)
		if (!raw) return []
		const parsed = JSON.parse(raw)
		return Array.isArray(parsed) ? parsed : []
	} catch {
		return []
	}
}

/**
 * Write entries to localStorage.
 * @param {Array} entries
 */
function write(entries) {
	localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
}

/**
 * Get all cached login entries sorted by lastLogin descending (most recent first).
 * Returns an empty array when localStorage is not available.
 * @returns {Array}
 */
export function get() {
	if (!hasStorage()) return []
	return read().sort((a, b) => b.lastLogin - a.lastLogin)
}

/**
 * Upsert a login entry by email. If an entry with the same email exists it is
 * replaced; otherwise the entry is added. The cache is capped at MAX_ENTRIES —
 * the oldest entry (by lastLogin) is evicted when the limit is exceeded.
 *
 * @param {{ email: string, name?: string, avatar?: string, provider?: string, mode?: string, hasPasskey?: boolean, lastLogin?: number }} entry
 */
export function set(entry) {
	if (!hasStorage()) return
	if (!entry || !entry.email) return

	let entries = read()

	// Remove existing entry with the same email (case-insensitive)
	const emailLower = entry.email.toLowerCase()
	entries = entries.filter((e) => e.email.toLowerCase() !== emailLower)

	entries.push(entry)

	// Sort by lastLogin descending so we keep the most recent
	entries.sort((a, b) => b.lastLogin - a.lastLogin)

	// Evict oldest if over the limit
	if (entries.length > MAX_ENTRIES) {
		entries = entries.slice(0, MAX_ENTRIES)
	}

	write(entries)
}

/**
 * Remove a single cached login entry by email.
 * @param {string} email
 */
export function remove(email) {
	if (!hasStorage()) return
	if (!email) return

	const emailLower = email.toLowerCase()
	const entries = read().filter((e) => e.email.toLowerCase() !== emailLower)
	write(entries)
}

/**
 * Clear all cached login entries.
 */
export function clear() {
	if (!hasStorage()) return
	localStorage.removeItem(STORAGE_KEY)
}
