export interface Platform {
  id: string
  name: string
  description: string
  icon: string // UnoCSS class, e.g. 'i-auth:supabase'
  iconFallback: string // colour class for icon background
  live: boolean
  modes: string[] // auth mode ids this platform supports
  features: string[] // what the demo covers (for the landing card bullets)
  adapterPackage: string
}

export const PLATFORMS: Platform[] = [
  {
    id: 'supabase',
    name: 'Supabase',
    description: 'Postgres-powered auth with row-level security',
    icon: 'i-auth:supabase',
    iconFallback: 'bg-emerald-500',
    live: true,
    modes: ['password', 'magic', 'cached', 'social'],
    features: [
      'Email + password sign-in',
      'Magic link (OTP)',
      'Role-based route protection',
      'PostgREST row-level security',
      'Cached login history'
    ],
    adapterPackage: '@kavach/adapter-supabase'
  },
  {
    id: 'firebase',
    name: 'Firebase',
    description: 'Google cloud auth with Firestore security rules',
    icon: 'i-auth:firebase',
    iconFallback: 'bg-orange-500',
    live: false,
    modes: ['password', 'social'],
    features: [
      'Email + password sign-in',
      'Google OAuth',
      'Role-based route protection',
      'Firestore security rules'
    ],
    adapterPackage: '@kavach/adapter-firebase'
  },
  {
    id: 'auth0',
    name: 'Auth0',
    description: 'Auth-as-a-service with universal login',
    icon: 'i-app:shield',
    iconFallback: 'bg-orange-700',
    live: false,
    modes: ['password', 'social'],
    features: [
      'Universal login page',
      'Social providers',
      'Role-based route protection',
      'Token-based sessions'
    ],
    adapterPackage: '@kavach/adapter-auth0'
  },
  {
    id: 'amplify',
    name: 'Amplify',
    description: 'AWS Cognito with Amplify SDK',
    icon: 'i-app:shield',
    iconFallback: 'bg-yellow-600',
    live: false,
    modes: ['password', 'social'],
    features: [
      'Cognito user pools',
      'Social identity providers',
      'Role-based route protection',
      'AWS IAM integration'
    ],
    adapterPackage: '@kavach/adapter-amplify'
  },
  {
    id: 'convex',
    name: 'Convex',
    description: 'Reactive database with built-in auth',
    icon: 'i-app:shield',
    iconFallback: 'bg-purple-600',
    live: false,
    modes: ['password'],
    features: [
      'Email + password sign-in',
      'Role-based route protection',
      'Reactive data queries',
      'Server-side auth functions'
    ],
    adapterPackage: '@kavach/adapter-convex'
  }
]

export function getPlatform(id: string): Platform | undefined {
  return PLATFORMS.find((p) => p.id === id)
}
