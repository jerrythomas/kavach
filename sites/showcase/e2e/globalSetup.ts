import { spawnSync } from 'child_process'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'
import type { FullConfig } from '@playwright/test'

const setupDir = dirname(fileURLToPath(import.meta.url))
const demoDir = resolve(setupDir, '../../demo')

export default async function globalSetup(_config: FullConfig) {
	const adapter = process.env.KAVACH_ADAPTER ?? 'supabase'

	switch (adapter) {
		case 'supabase':
			// Supabase users are seeded via supabase/seed.sql at startup — nothing to do
			break
		case 'firebase':
			await setupFirebase()
			break
		case 'convex':
			await setupConvex()
			break
	}
}

async function setupFirebase() {
	const EMULATOR_URL = 'http://127.0.0.1:9099'
	const PROJECT_ID = 'demo-kavach'

	const users = [
		{ email: 'test@test.com', password: 'password123' },
		{ email: 'admin@test.com', password: 'password123' }
	]

	for (const { email, password } of users) {
		// Try to create the user — ignore "already exists" errors
		const res = await fetch(
			`${EMULATOR_URL}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=${PROJECT_ID}`,
			{
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, password, returnSecureToken: false })
			}
		)
		const data = await res.json()
		if (data.error && data.error.message !== 'EMAIL_EXISTS') {
			throw new Error(`Firebase seed failed for ${email}: ${JSON.stringify(data.error)}`)
		}
	}
}

async function setupConvex() {
	const CONVEX_URL = 'http://127.0.0.1:3210'

	// This demo's convex-auth config only exposes signIn/signOut — users are seeded
	// through the users:seed mutation, which doubles as a backend health check.
	const result = spawnSync('npx', ['convex', 'run', 'users:seed'], {
		cwd: demoDir,
		stdio: 'pipe',
		env: { ...process.env, CONVEX_URL }
	})
	if (result.status !== 0) {
		throw new Error(`Convex seed mutation failed: ${result.stderr?.toString()}`)
	}
}
