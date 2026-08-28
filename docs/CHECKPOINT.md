# Checkpoint

**Slice:** Release work complete — v1.1.3 shipped, broken 1.x line deprecated

## Done

- **v1.1.3 published and verified installable.** Checked against the registry,
  not the working tree: `npm install kavach@1.1.3` succeeds, every package
  imports under plain Node ESM, internal deps resolve to 1.1.3.
- **Broken 1.x deprecated**, scope derived per package by inspecting each
  published version's manifest and source:
  - `kavach`, adapters ×5, `ui`, `sentry`, `cli` → 1.0.0–1.1.2
  - `@kavach/logger` → 1.0.0–1.1.1 (1.1.2 is clean)
  - **Excluded as never-defective:** `cookie`, `hashing`, `query`, `vite`
  - Verified live: 0 mismatches vs intended scope; deprecated versions warn,
    1.1.3 installs warning-free and still imports.
- **Publish workflow now gates three things**: declared types present,
  native-ESM import, and dependency sanity (no git/url dep, no unrewritten
  `workspace:`, siblings match the release version).
- `main == develop == origin` at `10bb281`, linear. CI green.

## Remaining

Nothing on the release. Open tickets, untouched:
#26 cli (38) · #27 auth (17) · #28 vite (9) · #29 convex/query/sentry (9) —
clearing all four unblocks promoting `complexity` and `max-lines-per-function`
from `warn` to `error`. #22 (ambient .d.ts) overlaps #28; sequence together.

## Next command

`bun run test:ci` — new work starts on `develop`.

## Open questions

None.

## Known-broken

Nothing in the repo. 866 tests with dist built, 860 on a clean checkout;
eslint 0 errors / 73 warnings (baseline); actionlint and semgrep clean.

Process note: verify the packed artifact BEFORE tagging — both 1.1.2 defects
were catchable by `npm install`ing a local `bun pm pack` output.

Pre-existing, untriaged: 51 semgrep path-traversal / child-process findings in
`packages/cli` and `packages/vite`. `spec/fixtures/Test Book.epub` is untracked
and unrelated — left alone.
