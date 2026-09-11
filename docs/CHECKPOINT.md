# Checkpoint

**Slice:** v1.2.0 released — URL canonicalization, dep upgrade, sensei manifest

## Done

**v1.2.0 published and verified from the registry**, not the working tree. All
14 packages live with signed provenance; `npm install` of the shipped tarballs
succeeds, all 9 importable entries load under plain Node ESM, `dist/index.d.ts`
ships, and internal `@kavach/*` deps resolve to `1.2.0` (the 1.0.2–1.1.2 defect
class stays fixed). Publish and Coverage both green.

`main == develop == v1.2.0` at `2555e73`, linear.

Shipped in this release:

- **Deps upgraded.** TypeScript held at **^6.0.3, not 7.x** — typescript-eslint
  cannot load against TS 7 (upstream #10940). vitest 4→5 needed
  `extends: false` on the `packaging` project, which was collecting 78 spec
  files instead of 1. Two broken coverage globs fixed: 50.46% → 79.1%.
- **Prettier applied repo-wide** (~100 files of pre-existing drift, confirmed
  against prettier 3.8.1). `.prettierignore` patterns were resolving relative
  to `config/` and mostly matching nothing.
- **All site URLs → kavach.sensei-hq.com**; `homepage` added to all 14
  published packages. GitHub repo metadata fixed too (#31).
- **sensei.library.json** gained `documents`, `ref`, `packages`, `ecosystem`,
  kept in sync by `scripts/sync-library-manifest.mjs` via the bumpp hook —
  its first real run produced `documents: 1.2.0` / `ref: v1.2.0` correctly.

Post-release hardening (on `develop`, ahead of `main`):

- Repo security was entirely off. Secret scanning, push protection, Dependabot
  alerts and Dependabot security updates now **enabled**. Two toggles
  (`non_provider_patterns`, `validity_checks`) accept the API call but stay
  disabled — they need a paid Secret Protection licence.
- `.github/dependabot.yml` (npm + github-actions, grouped, 7-day cooldown) and
  `.github/workflows/security.yml` (audit gated at high, dependency-review on
  PRs, zizmor). First run green; zizmor uploaded SARIF with **0 alerts**.
- `bun audit`: 7 vulns, 0 high/critical. Five are transitive via
  `firebase-tools`, a devDep of the private demo site — never shipped. The two
  reaching published packages (`cookie` via kit, `uuid` via aws-amplify) are
  pinned upstream; Dependabot will PR when fixes land.
- Filed jerrythomas/booksmith#1: its `spec/epub.spec.js` writes to a
  cwd-relative path, which is how `Test Book.epub` escaped into kavach. That
  repo also has 72 advisories (1 critical, `adm-zip` high on its own zip
  attack surface), two lockfiles, and unpinned EOL actions.

## Remaining

Issues #31 and #32 are closed. Nothing outstanding on the release.

Untouched tech debt: #26 cli (38) · #27 auth (17) · #28 vite (9) · #29 (9) —
clearing all four promotes `complexity`/`max-lines-per-function` to `error`.
#22 overlaps #28; sequence together.

## Next command

`bun run test:ci` — new work starts on `develop`.

## Open questions

TypeScript 7 is blocked on typescript-eslint, not on us. Revisit when #10940 closes.

## Known-broken

Nothing. 872 tests, lint 0 errors / 73 warnings (baseline), prettier clean.

Release process note: bumpp's `all: true` is `git add -A` and stages UNTRACKED
files — v1.2.0 swept a stray `spec/fixtures` epub into the release commit. No
consumer impact (repo-root `spec/` cannot reach any tarball). Now gitignored;
verify a clean tree before releasing.

Pre-existing, untriaged: 51 semgrep findings in `packages/cli` / `packages/vite`.
