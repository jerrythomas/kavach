import { spawnSync } from 'child_process'
import type { FullConfig } from '@playwright/test'

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

  // Step 1: Create test users via convex-auth HTTP sign-up endpoint
  const users = [
    { email: 'test@test.com', password: 'password123' },
    { email: 'admin@test.com', password: 'password123' }
  ]

  for (const { email, password } of users) {
    // convex-auth exposes sign-up via its HTTP router — path may vary by version
    // Inspect available routes: curl http://127.0.0.1:3210/api/auth
    const res = await fetch(`${CONVEX_URL}/api/auth/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider: 'password',
        params: { email, password, flow: 'signUp' }
      })
    })
    // sign-up may return 200 (created) or 400 (already exists) — both acceptable
    if (!res.ok && res.status !== 400) {
      const body = await res.text()
      console.warn(`Convex sign-up HTTP call failed for ${email} (status ${res.status}): ${body}`)
    }
  }

  // Step 2: Run the seed mutation to confirm users exist in the DB
  // This also serves as a health check that the local backend is responding
  const result = spawnSync('npx', ['convex', 'run', 'users:seed'], {
    cwd: process.cwd(),
    stdio: 'pipe',
    env: { ...process.env, CONVEX_URL }
  })
  if (result.status !== 0) {
    throw new Error(`Convex seed mutation failed: ${result.stderr?.toString()}`)
  }
}
