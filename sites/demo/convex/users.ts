import { mutation, query } from './_generated/server'
import { v } from 'convex/values'

/**
 * Seed test users for e2e tests.
 * Idempotent — safe to run multiple times.
 */
export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    const emails = ['test@test.com', 'admin@test.com']
    const results = []
    for (const email of emails) {
      const existing = await ctx.db
        .query('users')
        .filter((q) => q.eq(q.field('email'), email))
        .first()
      results.push({ email, id: existing?._id ?? null })
    }
    return results
  }
})

export const getByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    return ctx.db
      .query('users')
      .filter((q) => q.eq(q.field('email'), email))
      .first()
  }
})
