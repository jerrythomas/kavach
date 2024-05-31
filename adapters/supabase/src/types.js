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
 * @typedef SupabaseConfig
 * @property {string}        url
 * @property {string}        anonKey
 * @property {Array<string>} [schemas]
 */
/**
 * @typedef {(config:SupabaseConfig) => import('@kavach/core').AuthAdapter} GetSupabaseAdapter
 */

/**
 * @typedef CompositeURL
 * @property {string} hash
 * @property {string} path
 */
export default {}
