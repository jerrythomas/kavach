// The landing guard (#55). A magic-link or OAuth landing carries the new
// session in the URL fragment (`#access_token=…`). A fragment never reaches
// the server, so the first render uses the session cookie the browser still
// holds — another account's, after a switch. `handle` puts a tiny script in
// every page's <head> that marks <html> pending before first paint when the
// fragment carries a session; kavach's browser instance reveals the page once
// its sync and the reload as the new session have finished.

/** `data-kavach-pending` on <html> while a landing's session is not yet the server's. */
export const PENDING_ATTR = 'data-kavach-pending'

/** A fragment carrying a new session. The head script repeats this source verbatim. */
export const LANDING_FRAGMENT = /(^#|&)access_token=/

/** Longest the page stays hidden when no sync completes: the server then still
 *  holds the old session, so revealing it shows nothing stale. */
export const REVEAL_AFTER_MS = 10_000

/** @param {string} hash */
export function isLanding(hash) {
	return LANDING_FRAGMENT.test(hash)
}

/** The <head> markup: mark pending before first paint, and hide the body meanwhile. */
export function landingHead() {
	return (
		`<script>if(${LANDING_FRAGMENT.toString()}.test(location.hash))document.documentElement.setAttribute('${PENDING_ATTR}','')</script>` +
		`<style>html[${PENDING_ATTR}] body{visibility:hidden}html[${PENDING_ATTR}]::after{content:'Signing you in…';position:fixed;inset:0;display:grid;place-items:center;visibility:visible}</style>`
	)
}

/**
 * SvelteKit's `transformPageChunk`: put the guard just before the first `</head>`.
 *
 * @param {{ html: string, done: boolean }} chunk
 */
export function injectLandingGuard({ html }) {
	const at = html.indexOf('</head>')
	return at === -1 ? html : html.slice(0, at) + landingHead() + html.slice(at)
}

const timer = (fn, ms) => {
	const t = globalThis.setTimeout(fn, ms)
	return () => globalThis.clearTimeout(t)
}

/**
 * Wrap `invalidateAll` so the first completed reload reveals a pending page; reveal
 * anyway after `REVEAL_AFTER_MS`. Later reloads pass straight through.
 *
 * @param {{ hasAttribute(name: string): boolean, removeAttribute(name: string): void }} root
 * @param {() => unknown} invalidate
 * @param {(fn: () => void, ms: number) => () => void} [schedule]
 */
export function revealAfterSync(root, invalidate, schedule = timer) {
	let cancel = null
	const reveal = () => {
		cancel?.()
		cancel = null
		root.removeAttribute(PENDING_ATTR)
	}
	if (root.hasAttribute(PENDING_ATTR)) cancel = schedule(reveal, REVEAL_AFTER_MS)
	return async () => {
		await invalidate()
		if (root.hasAttribute(PENDING_ATTR)) reveal()
	}
}
