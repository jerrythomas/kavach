# Project Journal

Chronological log of confirmations, progress, milestones, and decisions.
Design details live in `docs/design/` — modular docs per module.

---

## YYYY-MM-DD

### Project Initialized

- Created repository structure
- Set up agent workflow files
- Ready for first design phase

---

## 2026-03-11

### Fused demo into learn site + deprecated demo/skeleton

**What was done:**

- Removed `sites/demo` and `sites/skeleton` entirely — `sites/learn` is now the single site for docs + demo
- Added kavach client-side context setup in root `+layout.svelte` (proxy pattern with `$state` + `onMount` dynamic import of `$kavach/auth`). Now `AuthProvider` and logout page can access `kavach.signIn/signOut`.
- Fixed auth page (`(public)/auth/+page.svelte`): added `onsuccess` callback → `goto('/demo/supabase')` after successful sign-in; replaced Azure with Google + magic link providers.
- Fixed logout page (`(app)/demo/[platform]/logout/+page.svelte`): calls `kavach.signOut()` then redirects to `/auth`.
- Fixed demo layout server: uses `locals.session?.user` (not `locals.user` which kavach doesn't set).
- Added server-side admin protection: new `+page.server.ts` for admin page redirects non-admin users to `/demo/[platform]`.
- Improved admin page: shows real session info (email, role, user ID).
- Updated data page: real fetch from `/data/[entity]` API with table display.
- Added data API server route (`(server)/data/[...slug]/+server.ts`): returns demo data with role-based filtering (admin-only records hidden from non-admins).
- Updated `kavach.config.js`: corrected route paths to match vite plugin convention.
- Updated homepage "Try Demo" button and nav "Demo" link: both now point to `/demo/supabase`.
- Updated all e2e tests to match new navigation structure and behaviors; rewrote docs tests to use direct URL navigation.
- **45/45 e2e tests pass.**

---

## 2026-03-12

### Story 012 — Per-route fallback config (guardian)

- `findMatchingRoute` in `utils.js` updated to handle `{path, fallback?}` objects alongside plain strings.
- `configureRoleRoutes` stores `{path, fallback}` objects in `restricted` when a fallback is configured.
- `protectRoute` extracts per-route fallback and passes to `getRedirectResponse`.
- `getRedirectResponse` accepts optional `fallback`: numeric → status-only response, string → redirect to that URL.
- 4 new unit tests added covering string fallback (wrong role), string fallback (unauthenticated), numeric fallback as status code, global default when no fallback.
- **561/561 unit tests pass.**

### Story 013 — Demo site enhancements

- **Platform cards**: replaced `<select>` in demo layout nav with a row of platform cards (name + "mock" badge for non-live adapters). Active platform highlighted.
- **Space facts**: replaced posts/users data with astronomy facts. General tier visible to all authenticated users; classified tier (tongue-in-cheek mission briefings) visible to admin only. Server exposes GET/POST/DELETE on `/data/facts`.
- **Role-based write controls**: data page shows "Add Fact" form and "Delete" buttons for admin users only. Non-admin write attempt returns 403 displayed inline.
- **Route protection visualiser**: dashboard replaced with protection card grid — each route shows badge (🔓 Public / 🔑 Authenticated / 👑 Admin only), allowed/denied status for the current user, and an access log feed populated as user navigates.
- **Cached login cards**: auth page reads `getCachedLogins()` via Svelte context on mount and shows recent-account cards above the login form; clicking a card pre-fills the email.
- Updated all e2e tests to match new page titles, nav labels, and removed `selectOption` in favour of clicking the platform card.
- **47/47 e2e tests pass.**
