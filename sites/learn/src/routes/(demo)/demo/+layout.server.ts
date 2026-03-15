import { env } from '$env/dynamic/public'

export function load() {
	return {
		demoUrls: {
			supabase: env.PUBLIC_DEMO_SUPABASE_URL ?? '',
			firebase: env.PUBLIC_DEMO_FIREBASE_URL ?? '',
			convex: env.PUBLIC_DEMO_CONVEX_URL ?? ''
		}
	}
}
