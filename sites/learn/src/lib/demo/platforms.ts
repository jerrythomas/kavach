import { ADAPTERS, isLive } from 'showcase-kavach'

export interface Platform {
  id: string
  name: string
  description: string
  icon: string // UnoCSS class, e.g. 'i-auth-supabase'
  iconFallback: string // colour class for icon background
  live: boolean
  url?: string // external demo URL for live platforms
  modes: string[] // auth mode ids this platform supports
  capabilities: string[] // what the platform adapter provides
  adapterPackage: string
}

/** Features Kavach provides regardless of adapter — shown once on the landing page */
export const KAVACH_FEATURES = [
  'Role-based route protection',
  'Server-side session cookie',
  'Cached login history'
]

// Learn-only presentation + pedagogy fields, keyed by adapter id. Everything
// else (label, live, url, capabilities, adapter package) derives from the
// shared kit config (sites/showcase) — single source of truth.
const PLATFORM_DETAILS: Record<
  string,
  Pick<Platform, 'description' | 'icon' | 'iconFallback' | 'modes'>
> = {
  supabase: {
    description: 'Postgres-powered auth with row-level security',
    icon: 'i-auth-supabase',
    iconFallback: 'bg-emerald-500',
    modes: ['password', 'magic', 'cached', 'social']
  },
  firebase: {
    description: 'Google cloud auth with Firestore security rules',
    icon: 'i-auth-firebase',
    iconFallback: 'bg-orange-500',
    modes: ['password', 'magic', 'social']
  },
  convex: {
    description: 'Reactive database with built-in auth',
    icon: 'i-auth-convex',
    iconFallback: 'bg-purple-600',
    modes: ['social']
  },
  auth0: {
    description: 'Auth-as-a-service with universal login',
    icon: 'i-auth-auth0',
    iconFallback: 'bg-orange-700',
    modes: ['password', 'social']
  },
  amplify: {
    description: 'AWS Cognito with Amplify SDK',
    icon: 'i-auth-amplify',
    iconFallback: 'bg-yellow-600',
    modes: ['password', 'social']
  }
}

const FALLBACK_DETAILS = {
  description: '',
  icon: 'i-app-shield',
  iconFallback: 'bg-surface-z2',
  modes: []
} satisfies Pick<Platform, 'description' | 'icon' | 'iconFallback' | 'modes'>

export const PLATFORMS: Platform[] = Object.entries(ADAPTERS).map(([id, adapter]) => {
  const detail = PLATFORM_DETAILS[id] ?? FALLBACK_DETAILS
  return {
    id,
    name: adapter.label,
    description: detail.description,
    icon: detail.icon,
    iconFallback: detail.iconFallback,
    live: isLive(id),
    url: adapter.demoUrl ?? undefined,
    modes: detail.modes,
    capabilities: adapter.capabilities,
    adapterPackage: adapter.pkg
  }
})

/** Returns all platforms with URLs injected from runtime env data.
 * env-backed urls are only set for live platforms (supabase, firebase, convex).
 * Auth0 and Amplify remain url-less (live: false). */
export function getPlatformsWithUrls(demoUrls: Record<string, string>): Platform[] {
  return PLATFORMS.map((p) => ({
    ...p,
    url: demoUrls[p.id] !== undefined ? demoUrls[p.id] : p.url
  }))
}

export function getPlatform(id: string): Platform | undefined {
  return PLATFORMS.find((p) => p.id === id)
}

/** Returns a single platform with its URL injected from runtime env data. */
export function getPlatformWithUrl(
  id: string,
  demoUrls: Record<string, string>
): Platform | undefined {
  const p = getPlatform(id)
  if (!p) return undefined
  return { ...p, url: demoUrls[id] ?? p.url }
}
