export interface SupabaseConfig {
	client?: unknown
	url?: string
	anonKey?: string
}

export interface SupabaseLogWriterOptions {
	schema?: string
	table: string
}

export type GetSupabaseAdapter = (config: SupabaseConfig) => import('kavach').AuthAdapter

export interface CompositeURL {
	hash: string
	path: string
}
