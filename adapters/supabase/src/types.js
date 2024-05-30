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
 * @typedef {(config:SupabaseConfig) => import('@kavach/core').AuthAdapter} GetSupabaseAdapter
 */

/**
 * @typedef AuthError
 * @property {string} message
 * @property {string} name
 * @property {string} status
 */
export default {}
