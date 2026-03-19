export interface NavItem {
  label: string
  value: string
  icon?: string
  children?: NavItem[]
}

export const DOCS_NAV: NavItem[] = [
  { label: 'Why Kavach', value: '/docs/why-kavach', icon: 'i-app-shield' },
  { label: 'Quick Start', value: '/docs/quick-start', icon: 'i-app-login' },
  { label: 'CLI', value: '/docs/cli', icon: 'i-app-code-visible' },
  { label: 'Core Concepts', value: '/docs/core-concepts', icon: 'i-app-list' },
  {
    label: 'Adapters', value: '/docs/adapters',
    children: [
      { label: 'Supabase', value: '/docs/adapters/supabase', icon: 'i-auth-supabase' },
      { label: 'Firebase', value: '/docs/adapters/firebase', icon: 'i-auth-firebase' },
      { label: 'Auth0', value: '/docs/adapters/auth0', icon: 'i-auth-auth0' },
      { label: 'Amplify', value: '/docs/adapters/amplify', icon: 'i-auth-amplify' },
      { label: 'Convex', value: '/docs/adapters/convex', icon: 'i-auth-convex' }
    ]
  },
  {
    label: 'Reference', value: '/docs/reference',
    children: [
      { label: 'Configuration', value: '/docs/configuration', icon: 'i-app-list' },
      { label: 'Vite Plugin', value: '/docs/plugins/vite', icon: 'i-app-code-visible' },
      { label: 'Sentry', value: '/docs/sentry', icon: 'i-app-shield' },
      { label: 'Logger', value: '/docs/logger', icon: 'i-app-list' }
    ]
  }
]

export const DOCS_SECTIONS = [
  { label: 'Getting Started', icon: 'i-app-login', href: '/docs/quick-start', desc: 'Install, scaffold, and go live in minutes' },
  { label: 'Adapters', icon: 'i-auth-supabase', href: '/docs/adapters', desc: 'Supabase, Firebase, Convex, Auth0, Amplify' },
  { label: 'Configuration', icon: 'i-app-list', href: '/docs/configuration', desc: 'Routes, roles, sessions, and redirects' },
  { label: 'UI Components', icon: 'i-app-code-visible', href: '/docs/components', desc: 'AuthPage, LoginCard, AuthButton, and more' },
  { label: 'Sentry', icon: 'i-app-shield', href: '/docs/sentry', desc: 'Declarative route protection rules' },
  { label: 'CLI', icon: 'i-app-code-hidden', href: '/docs/cli', desc: 'Doctor, init, and scaffold commands' }
]

export const POPULAR_DOCS = [
  { label: 'Quick Start', href: '/docs/quick-start' },
  { label: 'Supabase Adapter', href: '/docs/adapters/supabase' },
  { label: 'Route Protection', href: '/docs/sentry' },
  { label: 'CLI Reference', href: '/docs/cli' },
  { label: 'Core Concepts', href: '/docs/core-concepts' }
]
