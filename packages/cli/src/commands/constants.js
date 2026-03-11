import { getAdapterList } from '../adapters.js'

export const PROVIDER_DEFAULTS = {
	google: { name: 'google', label: 'Continue with Google' },
	github: { name: 'github', label: 'Continue with GitHub' },
	azure: { name: 'azure', label: 'Continue with Azure', scopes: ['email', 'profile'] },
	magic: { mode: 'otp', name: 'magic', label: 'Email for Magic Link' },
	password: { mode: 'password', name: 'email', label: 'Sign in using' }
}

export const ADAPTER_ENV_DEFAULTS = {
	supabase: { url: 'PUBLIC_SUPABASE_URL', anonKey: 'PUBLIC_SUPABASE_ANON_KEY' },
	firebase: { apiKey: 'PUBLIC_FIREBASE_API_KEY', projectId: 'PUBLIC_FIREBASE_PROJECT_ID' },
	auth0: { domain: 'PUBLIC_AUTH0_DOMAIN', clientId: 'PUBLIC_AUTH0_CLIENT_ID' },
	amplify: { region: 'PUBLIC_AMPLIFY_REGION', amplifyAppId: 'PUBLIC_AMPLIFY_APP_ID' }
}

export const DEPENDENCIES = ['kavach', '@kavach/ui', '@kavach/query', '@kavach/logger']

export const ADAPTER_DEPS = {
	supabase: ['@kavach/adapter-supabase', '@supabase/supabase-js'],
	firebase: ['@kavach/adapter-firebase', 'firebase'],
	auth0: ['@kavach/adapter-auth0', '@auth0/auth0-spa-js'],
	amplify: ['@kavach/adapter-amplify', 'aws-amplify'],
	convex: ['@kavach/adapter-convex', 'convex']
}

export function getAdapterOptions() {
	return getAdapterList()
}
