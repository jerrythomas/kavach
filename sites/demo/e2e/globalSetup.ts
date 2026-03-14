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
  // Implemented in Chunk 3
}
