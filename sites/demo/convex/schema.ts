import { defineSchema } from 'convex/server'
import { authTables } from '@convex-dev/auth/server'

export default defineSchema({
  ...authTables
  // authTables includes users table with email field
})
