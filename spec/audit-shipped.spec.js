import { describe, it, expect } from 'vitest'
import { shippedClosure, shippedVulnerabilities } from '../scripts/audit-shipped.mjs'

// The gate fails a release on what kavach SHIPS — the runtime dependency
// closure of the published workspaces (packages/*, adapters/*) — not on dev
// tooling (the root's devDependencies, the demo/learn sites), which no
// consumer installs.
const lock = {
	workspaces: {
		'': { name: 'kavach-workspace', devDependencies: { jsdom: '^30.0.0' } },
		'packages/auth': {
			name: 'kavach',
			dependencies: { cookie: '^1.0.0', '@kavach/logger': 'workspace:*' }
		},
		'packages/logger': { name: '@kavach/logger', dependencies: { chalk: '^5.0.0' } },
		'adapters/firebase': {
			name: '@kavach/adapter-firebase',
			dependencies: { firebase: '^12.0.0' },
			peerDependencies: { svelte: '^5.0.0' }
		},
		'sites/demo': { name: 'demo-kavach', dependencies: { wrangler: '^4.0.0' } }
	},
	packages: {
		kavach: ['kavach@workspace:packages/auth'],
		'@kavach/logger': ['@kavach/logger@workspace:packages/logger'],
		cookie: ['cookie@1.0.2', '', {}],
		chalk: ['chalk@5.3.0', '', {}],
		firebase: [
			'firebase@12.19.0',
			'',
			{ dependencies: { '@grpc/grpc-js': '~1.9.0', undici: '^6.0.0' } }
		],
		'@grpc/grpc-js': ['@grpc/grpc-js@1.14.5', '', {}],
		// firebase's own undici is nested; the top-level one is jsdom's.
		'firebase/undici': ['undici@6.29.1', '', {}],
		undici: ['undici@8.12.2', '', {}],
		jsdom: ['jsdom@30.1.3', '', { dependencies: { undici: '^8.0.0' } }],
		wrangler: ['wrangler@4.152.0', '', { dependencies: { miniflare: '5.0.0' } }],
		miniflare: ['miniflare@5.0.0', '', { dependencies: { undici: '7.29.1' } }],
		'miniflare/undici': ['undici@7.29.1', '', {}],
		svelte: ['svelte@5.0.0', '', {}]
	}
}

describe('the shipped dependency closure', () => {
	it('follows published workspaces transitively, nested installs included', () => {
		const shipped = shippedClosure(lock)
		expect([...shipped.keys()].sort()).toEqual([
			'@grpc/grpc-js',
			'chalk',
			'cookie',
			'firebase',
			'undici'
		])
		expect([...shipped.get('undici')]).toEqual(['6.29.1'])
	})

	it('leaves out dev tooling, the sites, and peers the consumer supplies', () => {
		const shipped = shippedClosure(lock)
		for (const name of ['jsdom', 'wrangler', 'miniflare', 'svelte'])
			expect(shipped.has(name)).toBe(false)
	})
})

describe('the release gate', () => {
	// A stand-in for Bun.semver.satisfies over the exact versions used here.
	const satisfies = (version, range) =>
		({
			'7.29.1|>=7.18.0 <7.30.1': true,
			'6.29.1|>=7.18.0 <7.30.1': false,
			'1.14.5|<1.13.6': false
		})[`${version}|${range}`] ?? false

	it('fails on a high advisory in a shipped version, not on one only dev tooling installs', () => {
		const audit = {
			undici: [
				{ severity: 'high', vulnerable_versions: '>=7.18.0 <7.30.1', url: 'u1', title: 't1' }
			],
			'@grpc/grpc-js': [
				{ severity: 'high', vulnerable_versions: '<1.13.6', url: 'u2', title: 't2' }
			]
		}
		expect(shippedVulnerabilities(audit, shippedClosure(lock), satisfies)).toEqual([])
	})

	it('reports a shipped package whose version is in a high or critical range', () => {
		const shipped = new Map([['undici', new Set(['7.29.1'])]])
		const audit = {
			undici: [
				{ severity: 'high', vulnerable_versions: '>=7.18.0 <7.30.1', url: 'u1', title: 't1' },
				{ severity: 'moderate', vulnerable_versions: '>=7.18.0 <7.30.1', url: 'u3', title: 't3' }
			]
		}
		expect(shippedVulnerabilities(audit, shipped, satisfies)).toEqual([
			{ name: 'undici', version: '7.29.1', severity: 'high', title: 't1', url: 'u1' }
		])
	})
})
