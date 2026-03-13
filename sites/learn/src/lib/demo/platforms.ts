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
    // url intentionally omitted — Supabase runs as the embedded in-site demo, not a standalone deployment
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
    url: 'https://firebase.demo.kavach.dev',
    modes: ['password', 'magic', 'social'],
    capabilities: ['Email + password', 'Magic link (OTP)', 'Google OAuth', 'Firestore security rules', 'Structured logging'],
    adapterPackage: '@kavach/adapter-firebase'
  },
  {
    id: 'auth0',
    name: 'Auth0',
    description: 'Auth-as-a-service with universal login',
    icon: 'i-app-shield',
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
    icon: 'i-app-shield',
    iconFallback: 'bg-yellow-600',
    live: false,
    modes: ['password', 'social'],
    capabilities: ['Cognito user pools', 'Social identity providers', 'AWS IAM integration'],
    adapterPackage: '@kavach/adapter-amplify'
  },
  {
    id: 'convex',
    name: 'Convex',
    description: 'Reactive database with built-in auth',
    icon: 'i-app-shield',
    iconFallback: 'bg-purple-600',
    live: true,
    url: 'https://convex.demo.kavach.dev',
    modes: ['social'],
    capabilities: ['Google OAuth', 'Reactive data queries', 'Server-side auth functions', 'Structured logging'],
    adapterPackage: '@kavach/adapter-convex'
  }
]

export function getPlatform(id: string): Platform | undefined {
  return PLATFORMS.find((p) => p.id === id)
}
