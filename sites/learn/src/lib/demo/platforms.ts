export interface Platform {
  id: string
  name: string
  description: string
  icon: string // UnoCSS class, e.g. 'i-auth-supabase'
  iconFallback: string // colour class for icon background
  live: boolean
  modes: string[] // auth mode ids this platform supports
  kavachFeatures: string[] // features Kavach provides on top of this adapter
  adapterFeatures: string[] // features the adapter itself provides
  adapterPackage: string
}

export const PLATFORMS: Platform[] = [
  {
    id: 'supabase',
    name: 'Supabase',
    description: 'Postgres-powered auth with row-level security',
    icon: 'i-auth-supabase',
    iconFallback: 'bg-emerald-500',
    live: true,
    modes: ['password', 'magic', 'cached', 'social'],
    kavachFeatures: ['Role-based route protection', 'Cached login history', 'Server-side session'],
    adapterFeatures: ['Email + password', 'Magic link (OTP)', 'Social OAuth', 'PostgREST RLS'],
    adapterPackage: '@kavach/adapter-supabase'
  },
  {
    id: 'firebase',
    name: 'Firebase',
    description: 'Google cloud auth with Firestore security rules',
    icon: 'i-auth-firebase',
    iconFallback: 'bg-orange-500',
    live: false,
    modes: ['password', 'social'],
    kavachFeatures: ['Role-based route protection', 'Cached login history', 'Server-side session'],
    adapterFeatures: ['Email + password', 'Google OAuth', 'Firestore security rules'],
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
    kavachFeatures: ['Role-based route protection', 'Cached login history', 'Server-side session'],
    adapterFeatures: ['Universal login page', 'Social providers', 'Token-based sessions'],
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
    kavachFeatures: ['Role-based route protection', 'Cached login history', 'Server-side session'],
    adapterFeatures: ['Cognito user pools', 'Social identity providers', 'AWS IAM integration'],
    adapterPackage: '@kavach/adapter-amplify'
  },
  {
    id: 'convex',
    name: 'Convex',
    description: 'Reactive database with built-in auth',
    icon: 'i-app-shield',
    iconFallback: 'bg-purple-600',
    live: false,
    modes: ['password'],
    kavachFeatures: ['Role-based route protection', 'Cached login history', 'Server-side session'],
    adapterFeatures: ['Email + password', 'Reactive data queries', 'Server-side auth functions'],
    adapterPackage: '@kavach/adapter-convex'
  }
]

export function getPlatform(id: string): Platform | undefined {
  return PLATFORMS.find((p) => p.id === id)
}
