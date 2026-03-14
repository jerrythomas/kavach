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
  // Implemented in Chunk 2
}

async function setupConvex() {
  // Implemented in Chunk 3
}
