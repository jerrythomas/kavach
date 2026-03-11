import { describe, it, expect, beforeEach } from 'vitest'
import {
	getAdapterCapabilities,
	getAdapterList,
	getSupportedProviders,
	isFeatureSupported,
	ADAPTER_REGISTRY
} from '../src/adapters.js'
import { generateDDLInstructions, formatDDLOutput, getUnsupportedFeaturesMessage } from '../src/ddl.js'
import { validateConfig, formatValidationOutput } from '../src/validation.js'

describe('Adapter Registry', () => {
	it('should have all adapters registered', () => {
		expect(ADAPTER_REGISTRY.supabase).toBeDefined()
		expect(ADAPTER_REGISTRY.firebase).toBeDefined()
		expect(ADAPTER_REGISTRY.auth0).toBeDefined()
		expect(ADAPTER_REGISTRY.amplify).toBeDefined()
		expect(ADAPTER_REGISTRY.convex).toBeDefined()
	})

	it('should return correct capabilities for Supabase', () => {
		const caps = getAdapterCapabilities('supabase')
		expect(caps.name).toBe('supabase')
		expect(caps.displayName).toBe('Supabase')
		expect(caps.supports.data).toBe(true)
		expect(caps.supports.rpc).toBe(true)
		expect(caps.supports.logging).toBe(true)
	})

	it('should return correct capabilities for Firebase', () => {
		const caps = getAdapterCapabilities('firebase')
		expect(caps.name).toBe('firebase')
		expect(caps.supports.data).toBe(false)
		expect(caps.supports.rpc).toBe(false)
		expect(caps.supports.logging).toBe(false)
		expect(caps.supports.magic).toBe(true)
	})

	it('should return null for unknown adapter', () => {
		expect(getAdapterCapabilities('unknown')).toBeNull()
	})
})

describe('getAdapterList', () => {
	it('should return list of adapters with labels and hints', () => {
		const list = getAdapterList()
		expect(list.length).toBe(5)
		expect(list[0]).toHaveProperty('value')
		expect(list[0]).toHaveProperty('label')
		expect(list[0]).toHaveProperty('hint')
	})

	it('should include Supabase with all features', () => {
		const list = getAdapterList()
		const supabase = list.find((a) => a.value === 'supabase')
		expect(supabase.hint).toContain('OAuth')
		expect(supabase.hint).toContain('Data')
	})

	it('should indicate unsupported features in hint', () => {
		const list = getAdapterList()
		const firebase = list.find((a) => a.value === 'firebase')
		expect(firebase.hint).toContain('No:')
		expect(firebase.hint).toContain('Data')
	})
})

describe('getSupportedProviders', () => {
	it('should return all providers for Supabase', () => {
		const caps = getAdapterCapabilities('supabase')
		const providers = getSupportedProviders(caps)
		expect(providers.length).toBe(5) // 3 oauth + magic + password
	})

	it('should filter providers for Firebase', () => {
		const caps = getAdapterCapabilities('firebase')
		const providers = getSupportedProviders(caps)
		// 3 oauth + magic + password = 5
		expect(providers.length).toBe(5)
	})

	it('should filter providers for Amplify', () => {
		const caps = getAdapterCapabilities('amplify')
		const providers = getSupportedProviders(caps)
		// Only OAuth + password, no magic
		const hasMagic = providers.some((p) => p.name === 'magic')
		expect(hasMagic).toBe(false)
	})

	it('should filter providers for Convex', () => {
		const caps = getAdapterCapabilities('convex')
		const providers = getSupportedProviders(caps)
		// Only OAuth + password, no magic
		const hasMagic = providers.some((p) => p.name === 'magic')
		expect(hasMagic).toBe(false)
	})
})

describe('isFeatureSupported', () => {
	it('should return true for supported features', () => {
		const caps = getAdapterCapabilities('supabase')
		expect(isFeatureSupported(caps, 'data')).toBe(true)
		expect(isFeatureSupported(caps, 'rpc')).toBe(true)
		expect(isFeatureSupported(caps, 'logging')).toBe(true)
	})

	it('should return false for unsupported features', () => {
		const caps = getAdapterCapabilities('firebase')
		expect(isFeatureSupported(caps, 'data')).toBe(false)
		expect(isFeatureSupported(caps, 'rpc')).toBe(false)
		expect(isFeatureSupported(caps, 'logging')).toBe(false)
	})

	it('should return false for null capabilities', () => {
		expect(isFeatureSupported(null, 'data')).toBe(false)
	})
})

describe('DDL Generation', () => {
	it('should generate DDL for Supabase logging', () => {
		const caps = getAdapterCapabilities('supabase')
		const config = { logging: { enabled: true, table: 'audit_logs', level: 'info' } }
		const ddl = generateDDLInstructions(caps, config)

		expect(ddl).not.toBeNull()
		expect(ddl.sql).toContain('CREATE TABLE audit_logs')
		expect(ddl.sql).toContain('level TEXT NOT NULL')
	})

	it('should use custom table name in DDL', () => {
		const caps = getAdapterCapabilities('supabase')
		const config = { logging: { enabled: true, table: 'my_logs', level: 'info' } }
		const ddl = generateDDLInstructions(caps, config)

		expect(ddl.sql).toContain('CREATE TABLE my_logs')
	})

	it('should not generate DDL when logging disabled', () => {
		const caps = getAdapterCapabilities('supabase')
		const config = { logging: { enabled: false } }
		const ddl = generateDDLInstructions(caps, config)

		expect(ddl).toBeNull()
	})

	it('should not generate DDL for Firebase (no logging support)', () => {
		const caps = getAdapterCapabilities('firebase')
		const config = { logging: { enabled: true } }
		const ddl = generateDDLInstructions(caps, config)

		expect(ddl).toBeNull()
	})

	it('should format DDL output correctly', () => {
		const caps = getAdapterCapabilities('supabase')
		const config = { logging: { enabled: true, table: 'audit_logs', level: 'info' } }
		const ddl = generateDDLInstructions(caps, config)
		const output = formatDDLOutput(ddl)

		expect(output).toContain('DDL Required')
		expect(output).toContain('CREATE TABLE audit_logs')
		expect(output).toContain('Table: audit_logs')
	})
})

describe('Config Validation', () => {
	it('should warn when data route configured for unsupported adapter', () => {
		const caps = getAdapterCapabilities('firebase')
		const config = { adapter: 'firebase', dataRoute: '/data' }
		const validation = validateConfig(config, caps)

		expect(validation.warnings).toContain('Data route configured but not supported by Firebase')
	})

	it('should not warn when data route configured for supported adapter', () => {
		const caps = getAdapterCapabilities('supabase')
		const config = { adapter: 'supabase', dataRoute: '/data' }
		const validation = validateConfig(config, caps)

		expect(validation.warnings).toHaveLength(0)
	})

	it('should warn when RPC configured for unsupported adapter', () => {
		const caps = getAdapterCapabilities('auth0')
		const config = { adapter: 'auth0', rpcRoute: '/rpc' }
		const validation = validateConfig(config, caps)

		expect(validation.warnings).toContain('RPC route configured but not supported by Auth0')
	})

	it('should warn when logging configured for unsupported adapter', () => {
		const caps = getAdapterCapabilities('amplify')
		const config = { adapter: 'amplify', logging: { enabled: true } }
		const validation = validateConfig(config, caps)

		expect(validation.warnings).toContain('Logging configured but not supported by AWS Amplify')
	})

	it('should return error for unknown adapter', () => {
		const config = { adapter: 'unknown' }
		const validation = validateConfig(config, null)

		expect(validation.errors).toContain('Unknown adapter: unknown')
	})

	it('should show success when all features supported', () => {
		const caps = getAdapterCapabilities('supabase')
		const config = {
			adapter: 'supabase',
			dataRoute: '/data',
			rpcRoute: '/rpc',
			logging: { enabled: true }
		}
		const output = formatValidationOutput(validateConfig(config, caps))

		expect(output).toContain('[OK]')
	})
})

describe('Platform Capability Reference', () => {
	it('Supabase should support all features', () => {
		const caps = getAdapterCapabilities('supabase')
		expect(caps.supports.data).toBe(true)
		expect(caps.supports.rpc).toBe(true)
		expect(caps.supports.logging).toBe(true)
		expect(caps.supports.magic).toBe(true)
		expect(caps.supports.oauth).toBe(true)
		expect(caps.supports.password).toBe(true)
		expect(caps.supports.passkey).toBe(true)
	})

	it('Firebase should not support data/rpc/logging', () => {
		const caps = getAdapterCapabilities('firebase')
		expect(caps.supports.data).toBe(false)
		expect(caps.supports.rpc).toBe(false)
		expect(caps.supports.logging).toBe(false)
	})

	it('Auth0 should not support passkey', () => {
		const caps = getAdapterCapabilities('auth0')
		expect(caps.supports.passkey).toBe(false)
	})

	it('Amplify should not support magic', () => {
		const caps = getAdapterCapabilities('amplify')
		expect(caps.supports.magic).toBe(false)
	})

	it('Convex should support password (email/password auth)', () => {
		const caps = getAdapterCapabilities('convex')
		expect(caps.supports.password).toBe(true)
	})
})
