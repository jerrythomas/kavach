// Auto-detects language from Accept-Language header, ?lang= param, or lang cookie
export { GET, POST, PUT, PATCH, DELETE } from 'kavach'

// Configure in kavach.config.js:
//
// Option 1: Multiple languages (auto-detected)
// export default {
//   adapter: 'supabase',
//   messages: {
//     en: {
//       notAuthenticated: 'Not authenticated',
//       notSupported: 'Data operations not supported'
//     },
//     fr: {
//       notAuthenticated: 'Non authentifié',
//       notSupported: 'Opérations non prises en charge'
//     },
//     es: {
//       notAuthenticated: 'No autenticado',
//       notSupported: 'Operaciones no soportadas'
//     }
//   }
// }
//
// Option 2: Custom language detection function
// export default {
//   adapter: 'supabase',
//   messages: (event) => {
//     const lang = event.locals.user?.language || 'en'
//     return translations[lang]
//   }
// }
//
// Language detection order:
// 1. Query param: ?lang=fr
// 2. Cookie: lang=fr
// 3. Accept-Language header
// 4. First available language or 'en'

