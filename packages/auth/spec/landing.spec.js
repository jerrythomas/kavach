import { describe, expect, it, vi } from 'vitest'
import {
	LANDING_FRAGMENT,
	PENDING_ATTR,
	REVEAL_AFTER_MS,
	injectLandingGuard,
	isLanding,
	landingHead,
	revealAfterSync
} from '../src/landing'

// #55. A magic-link or OAuth landing carries the new session in the URL
// fragment, which the server never sees: the first render uses whatever session
// cookie the browser still holds — another account's. The page stays hidden
// from first paint until kavach's sync and reload as the new session finish.

describe('isLanding', () => {
	it('is true when the fragment carries an access token', () => {
		expect(isLanding('#access_token=eyJ.a.b&expires_in=3600&type=magiclink')).toBe(true)
		expect(isLanding('#expires_in=3600&access_token=eyJ')).toBe(true)
	})

	it('is false otherwise, a failed landing included (nothing to wait for)', () => {
		for (const h of [
			'',
			'#',
			'#section',
			'#error=access_denied&error_description=x',
			'#xaccess_token=1'
		]) {
			expect(isLanding(h)).toBe(false)
		}
	})
})

describe('the head guard', () => {
	it('runs the same fragment test before the body and marks <html> pending', () => {
		const head = landingHead()
		expect(head).toContain(LANDING_FRAGMENT.source)
		expect(head).toContain(`document.documentElement.setAttribute('${PENDING_ATTR}'`)
		expect(head).toContain(`html[${PENDING_ATTR}] body`)
	})

	it('goes into the first chunk that closes <head>, once', () => {
		const html = '<html><head><title>x</title></head><body></body></html>'
		const out = injectLandingGuard({ html, done: true })
		expect(out.indexOf(PENDING_ATTR)).toBeLessThan(out.indexOf('</head>'))
		expect(out.split(landingHead()).length - 1).toBe(1)
		expect(injectLandingGuard({ html: '<div>no head here</div>', done: false })).toBe(
			'<div>no head here</div>'
		)
	})
})

function root(pending = true) {
	const attrs = new Set(pending ? [PENDING_ATTR] : [])
	return { hasAttribute: (n) => attrs.has(n), removeAttribute: (n) => void attrs.delete(n) }
}

describe('revealAfterSync', () => {
	it('reveals only after the reload as the new session has finished', async () => {
		const r = root()
		let release
		const invalidate = vi.fn(() => new Promise((res) => (release = res)))
		const done = revealAfterSync(r, invalidate, () => () => {})()
		expect(r.hasAttribute(PENDING_ATTR)).toBe(true)
		release()
		await done
		expect(r.hasAttribute(PENDING_ATTR)).toBe(false)
	})

	it('reveals after a bounded wait when no sync completes', () => {
		const r = root()
		let fire
		let waited = 0
		revealAfterSync(
			r,
			async () => {},
			(fn, ms) => {
				fire = fn
				waited = ms
				return () => {}
			}
		)
		expect(waited).toBe(REVEAL_AFTER_MS)
		fire()
		expect(r.hasAttribute(PENDING_ATTR)).toBe(false)
	})

	it('waits for nothing when the page is not pending', () => {
		const schedule = vi.fn(() => () => {})
		revealAfterSync(root(false), async () => {}, schedule)
		expect(schedule).not.toHaveBeenCalled()
	})
})
