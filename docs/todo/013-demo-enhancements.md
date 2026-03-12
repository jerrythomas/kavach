# 013 — Demo Site Enhancements

## Summary

Make the demo on the learn site more engaging, visually informative, and genuinely useful as a showcase of kavach's features. Currently the demo is functional but flat — it shows that auth works but doesn't make the _why_ or _how_ tangible to a visitor.

---

## Motivation

The demo is the first hands-on contact most developers have with kavach. It should tell a story: "Here's what kavach protects, here's who can do what, and here's what happens when you try to break the rules." Right now it doesn't do that.

---

## Enhancement Areas

### 1. Cached Login Cards on the Auth Page

The `getCachedLogins` function already exists on the kavach context. Surface it on the auth page as a row of "recent account" cards (avatar, name, provider badge) above the login form — similar to Google's account picker. Clicking a card pre-fills the email.

**Why it matters:** Demonstrates the cached login feature that many users don't know exists.

---

### 2. Route Protection Visualiser

Replace the plain nav links with a protection-aware card grid. Each card shows:

- Section name and a short description
- A badge: 🔓 Public · 🔑 Authenticated · 👑 Admin only
- Current access status (allowed / denied) highlighted in real time

Add a side panel or toast feed — an "access log" — that records each navigation attempt, the user's role, and the outcome (allowed / redirected). This makes the guardian's decision-making visible without reading code.

**Why it matters:** Shows route protection as a concrete, observable thing rather than an invisible redirect.

---

### 3. Role-Based Data Interactions

Extend the Data Operations page with write controls:

- A list of **posts** (title, body, author) fetched from Supabase via the `/data` endpoint.
- Admin users see Create / Edit / Delete buttons; regular users see read-only cards.
- Attempting a write as a non-admin returns a visible error from the server (403 from the data endpoint), displayed inline.
- Seed data: a handful of posts with different authors, some marked admin-only visible.

This is the most concrete demonstration of RBAC — the user sees the rule enforced in real time, not just on page navigation.

**Data model:** `posts(id, title, body, author_email, admin_only bool)`. Admin-only posts are filtered server-side for non-admin roles.

---

### 4. Fun Content — Space Facts

Use the data endpoint to serve **space facts** with role-gated tiers:

- All authenticated users: general astronomy facts.
- Admin users: classified mission briefings (tongue-in-cheek secret facts).

This gives the data page a memorable theme and makes the role difference immediately obvious ("you unlocked the classified facts!") without needing to explain RBAC verbally. Facts can be seeded locally; a small static JSON is fine.

---

### 5. Platform Cards Instead of Select

Replace the platform `<select>` with a row of platform cards, each showing:

- Platform logo
- Name and a one-line description
- A "connected" or "mock" status badge

Clicking a card navigates to `/demo/{platform}`. The active platform card is highlighted.

**Why it matters:** The select is invisible — most visitors won't notice they can switch platforms. Cards make the multi-adapter capability immediately obvious.

---

## Acceptance Criteria

- [ ] Auth page shows cached login cards when previous logins exist
- [ ] Dashboard shows protection cards with badges and an access log feed
- [ ] Data page has space facts with role-gated tiers (general vs classified)
- [ ] Admin users see write controls; non-admin users see read-only view
- [ ] Write attempt by non-admin returns and displays a 403 error inline
- [ ] Platform select replaced with platform card row
- [ ] All existing e2e tests still pass after changes
- [ ] New e2e tests cover: cached login card display, access log entry creation, admin write success, non-admin write rejection

---

## Priority

**MVP / Medium** — dramatically improves first impressions and showcases features that are otherwise invisible.
