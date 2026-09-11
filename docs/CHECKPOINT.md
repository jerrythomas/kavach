# Checkpoint

**Slice:** Site-URL canonicalization, dependency upgrade, sensei manifest (#31, #32)

## Done

Four commits on `develop`, each independently green (verified by checking out
and running the suite at each, not just at HEAD):

- `a17e551` **deps upgraded.** TypeScript pinned to **^6.0.3, not 7.x** —
  typescript-eslint refuses to load against TS 7 (upstream issue #10940) and
  takes `bun run lint` down. TS 6 forced explicit `rootDir` in 4 build configs.
  vitest 5 changed project inheritance: `packaging` was collecting 78 files
  instead of 1 until `extends: false`. Two long-broken coverage globs fixed —
  reported coverage 50.46% → 79.1%.
- `a76f876` **prettier applied repo-wide** (~100 files). Pre-existing drift,
  confirmed against prettier 3.8.1 — not upgrade fallout. `.prettierignore`
  patterns were resolving relative to `config/`, so most matched nothing.
- `a8fa732` **all site URLs → kavach.sensei-hq.com.** Removed `kavach.vercel.app`
  (an unrelated third-party app), `*.demo.kavach.dev`, `jerrythomas.name`.
  Added the `homepage` field, absent from all 14 published packages.
- `ed347a9` **sensei.library.json** gained `documents`, `ref` (tag, not branch),
  `packages`, `ecosystem`, per sensei-hq/sensei `docs/spec/library-manifest.md`.

GitHub repo `homepage` metadata also set to `https://kavach.sensei-hq.com`
(was `kavach.vercel.app`, no scheme) — that is #31's actual ask.

## Remaining

**Not pushed.** `develop` is 4 ahead of `origin/develop`. #32 closes on merge to
`main`; #31 needs closing by hand (its fix is repo metadata, not a commit).

Untouched tech debt: #26 cli (38) · #27 auth (17) · #28 vite (9) · #29 (9) —
clearing all four promotes `complexity`/`max-lines-per-function` to `error`.
#22 overlaps #28; sequence together.

## Next command

`git push origin develop`

## Open questions

Whether to revisit TypeScript 7 — blocked on typescript-eslint, not on us.

## Known-broken

Nothing. 872 tests, lint 0 errors / 73 warnings (baseline), prettier clean,
14 packages build. Sensei daemon was down this session, so no `update_phase` /
`log_event` was recorded — this file is the only record.

Pre-existing, untriaged: 51 semgrep findings in `packages/cli` and
`packages/vite`. `spec/fixtures/` is untracked and unrelated — left alone.
