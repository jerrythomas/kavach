import { describe, it, expect } from 'vitest'
import * as showcase from '../index.js'

describe('showcase barrel', () => {
	it('exports every component, state, and config', () => {
		const keys = Object.keys(showcase).sort()
		expect(keys).toEqual(
			[
				'ADAPTERS',
				'ADAPTER_ENV',
				'ADAPTER_PROVIDERS',
				'AuthCard',
				'COPY',
				'DemoNavItem',
				'FloatingBadge',
				'HackerToggle',
				'ROUTE_ACCESS',
				'ROUTES',
				'RULES',
				'RoleCard',
				'SentryAnnotation',
				'SentryConfigPanel',
				'isLive',
				'hackerMode'
			].sort()
		)
	})
})
