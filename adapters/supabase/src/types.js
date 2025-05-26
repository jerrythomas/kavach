/**
 * @typedef SupabaseConfig
 * @property {any}    [client]
 * @property {string} [url]
 * @property {string} [anonKey]
 */

/**
 * @typedef SupabaseLogWriterOptions
 * @property {string} [schema]
 * @property {string} table
 */

/**
 * @typedef {(config:SupabaseConfig) => import('kavach').AuthAdapter} GetSupabaseAdapter
 */

/**
 * @typedef CompositeURL
 * @property {string} hash
 * @property {string} path
 */

export default {}
