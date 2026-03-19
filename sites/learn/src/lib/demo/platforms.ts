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

export const PLATFORMS: Platform[] = [
  {
    id: 'supabase',
    name: 'Supabase',
    description: 'Postgres-powered auth with row-level security',
    icon: 'i-auth-supabase',
    iconFallback: 'bg-emerald-500',
    live: true,
    modes: ['password', 'magic', 'cached', 'social'],
    capabilities: ['Email + password', 'Magic link (OTP)', 'Social OAuth', 'PostgREST RLS'],
    adapterPackage: '@kavach/adapter-supabase'
  },
  {
    id: 'firebase',
    name: 'Firebase',
    description: 'Google cloud auth with Firestore security rules',
    icon: 'i-auth-firebase',
    iconFallback: 'bg-orange-500',
    live: true,
    modes: ['password', 'magic', 'social'],
    capabilities: [
      'Email + password',
      'Magic link (OTP)',
      'Google OAuth',
      'Firestore security rules',
      'Structured logging'
    ],
    adapterPackage: '@kavach/adapter-firebase'
  },
  {
    id: 'convex',
    name: 'Convex',
    description: 'Reactive database with built-in auth',
    icon: 'i-auth-convex',
    iconFallback: 'bg-purple-600',
    live: true,
    modes: ['social'],
    capabilities: [
      'Google OAuth',
      'Reactive data queries',
      'Server-side auth functions',
      'Structured logging'
    ],
    adapterPackage: '@kavach/adapter-convex'
  },
  {
    id: 'auth0',
    name: 'Auth0',
    description: 'Auth-as-a-service with universal login',
    icon: 'i-auth-auth0',
    iconFallback: 'bg-orange-700',
    live: false,
    modes: ['password', 'social'],
    capabilities: ['Universal login page', 'Social providers', 'Token-based sessions'],
    adapterPackage: '@kavach/adapter-auth0'
  },
  {
    id: 'amplify',
    name: 'Amplify',
    description: 'AWS Cognito with Amplify SDK',
    icon: 'i-auth-amplify',
    iconFallback: 'bg-yellow-600',
    live: false,
    modes: ['password', 'social'],
    capabilities: ['Cognito user pools', 'Social identity providers', 'AWS IAM integration'],
    adapterPackage: '@kavach/adapter-amplify'
  }
]

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
