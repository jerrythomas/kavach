# Checkpoint

**Slice:** v1.1.3 released — first genuinely installable release

## Done

- **v1.1.3 published**, all 14 packages. Verified against the **registry**, not
  just the working tree: `npm install kavach@1.1.3` succeeds, every package
  imports under plain Node ESM, internal deps resolve to 1.1.3.
- **v1.1.2 is broken and immutable on npm.** Two long-standing defects, both
  found by installing the published tarball:
  - `packages/auth` carried `"kit-monorepo": "sveltejs/kit"` — the whole
    SvelteKit monorepo, imported nowhere. npm died on its `catalog:` protocol,
    so `kavach` was uninstallable by npm from 1.0.1 through 1.1.2.
  - `bun pm pack` rewrites `workspace:*` from the version recorded in bun.lock,
    which a plain `bun install` never refreshes. Frozen at 1.0.1, so every
    release from 1.0.2 shipped internal deps pinned to 1.0.1.
- **Guards:** `publish.yml` now rejects a tarball with a git/url dependency, an
  unrewritten `workspace:` range, or an internal dep mismatching the release
  version. Verified it blocks the real published 1.1.2 manifest on all six.
- **`bumpp execute` runs without a shell** — `rm -f a && b` ran as
  `rm -f a '&&' 'b'`, which deleted bun.lock during the 1.1.3 bump instead of
  regenerating it. Now `scripts/refresh-lockfile.sh`, one command, which
  asserts its result rather than exiting 0 on a no-op. Lockfile restored.
- `main == develop == origin` at `ad34440`, linear. CI green.

## Remaining

Optional, not done: `npm deprecate` 1.0.1–1.1.2 pointing at 1.1.3. Outward
facing, so left for a decision.

Tech-debt tickets open: #26 cli (38), #27 auth (17), #28 vite (9), #29
convex/query/sentry (9) — clearing all four unblocks promoting `complexity` and
`max-lines-per-function` from `warn` to `error`. #22 (ambient .d.ts) overlaps #28.

## Next command

`bun run test:ci` — new work starts on `develop`.

## Open questions

Whether to deprecate the broken published versions.

## Known-broken

Nothing in the repo. 866 tests with dist built, 860 on a clean checkout;
eslint 0 errors / 73 warnings (baseline); actionlint and semgrep clean.

Process note: verify the packed artifact BEFORE tagging. Both 1.1.2 defects
were catchable by `npm install`ing a local `bun pm pack` output; running that
check only after publishing is what let a broken release reach npm.

Pre-existing, untriaged: 51 semgrep path-traversal / child-process findings in
`packages/cli` and `packages/vite`. `spec/fixtures/Test Book.epub` is untracked
and unrelated — deliberately left alone.
