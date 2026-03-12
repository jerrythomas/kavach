export interface Capability {
  label: string
  kavachHandles: boolean // true = Kavach handles it, false = adapter handles it
}

export interface AuthMode {
  id: string
  label: string
  description: string
  howItWorks: string[] // bullet points for explainer
  capabilities: Capability[]
}

export const AUTH_MODES: AuthMode[] = [
  {
    id: 'password',
    label: 'Password',
    description: 'Classic email + password authentication',
    howItWorks: [
      'User submits credentials to the adapter (Supabase, Firebase, etc.)',
      'Adapter verifies and returns an access + refresh token pair',
      'Kavach sets a server-side session cookie (HttpOnly, Secure)',
      'Sentry checks the cookie on every request and resolves the user role',
      'On token expiry, Kavach refreshes automatically using the refresh token'
    ],
    capabilities: [
      { label: 'Server-side session cookie', kavachHandles: true },
      { label: 'Role resolution from session', kavachHandles: true },
      { label: 'Automatic token refresh', kavachHandles: true },
      { label: 'Cached login history', kavachHandles: true },
      { label: 'Credential validation', kavachHandles: false },
      { label: 'Password hashing', kavachHandles: false }
    ]
  },
  {
    id: 'magic',
    label: 'Magic Link',
    description: 'Passwordless sign-in via one-time email link',
    howItWorks: [
      'User enters their email address',
      'Adapter sends a one-time link to the email',
      'User clicks the link — adapter validates the OTP token',
      'Kavach receives the session and sets a server-side cookie',
      'Sentry checks the cookie on every subsequent request'
    ],
    capabilities: [
      { label: 'Server-side session cookie', kavachHandles: true },
      { label: 'Role resolution from session', kavachHandles: true },
      { label: 'Automatic token refresh', kavachHandles: true },
      { label: 'OTP generation + email delivery', kavachHandles: false },
      { label: 'Link expiry enforcement', kavachHandles: false }
    ]
  },
  {
    id: 'cached',
    label: 'Cached',
    description: 'Remembers previous sign-ins for one-click return',
    howItWorks: [
      'After any successful sign-in, Kavach stores login metadata in localStorage',
      'On return visits, the cached logins panel shows previous accounts',
      'Clicking a cached account pre-fills the form (email + provider)',
      'Re-authentication still goes through the full adapter flow',
      'Users can remove individual cached logins or clear all'
    ],
    capabilities: [
      { label: 'Login cache storage (localStorage)', kavachHandles: true },
      { label: 'Cache management (clear, remove)', kavachHandles: true },
      { label: 'Avatar + name from user metadata', kavachHandles: true },
      { label: 'No credential storage (security-safe)', kavachHandles: true }
    ]
  },
  {
    id: 'social',
    label: 'Social',
    description: 'OAuth sign-in via third-party providers',
    howItWorks: [
      'User clicks a provider button (Google, GitHub, etc.)',
      'Adapter redirects to the provider OAuth flow',
      'Provider redirects back with an auth code',
      'Adapter exchanges the code for tokens',
      'Kavach sets the server-side session cookie from the token response'
    ],
    capabilities: [
      { label: 'Server-side session cookie', kavachHandles: true },
      { label: 'Role resolution from session', kavachHandles: true },
      { label: 'OAuth redirect handling', kavachHandles: false },
      { label: 'Provider credentials management', kavachHandles: false }
    ]
  }
]

export const ALL_MODES_TAB = { id: 'all', label: 'All', description: 'All supported modes' }

export function getMode(id: string): AuthMode | undefined {
  return AUTH_MODES.find((m) => m.id === id)
}
