# Checkpoint

**Slice:** bug fixes — native-ESM packaging, vitest config, auth role precedence

## Done

- **v1.1.1 released** (`8d28481`), all 14 packages on npm, types verified in the
  shipped tarball. CI repaired (`6c58b5a`) — Coverage green again after failing
  since 2026-08-03.
- **#30 closed** — `hot: false` is not a vite-plugin-svelte 7 root option; removed
  from both vitest projects. Warning lines per test run: 34 → 0.
- **#21 closed** — the fix already shipped in v1.1.1 (verified in the published
  tarball). What was missing was the guard: no test covered the
  `app_metadata.role ?? data.role` precedence branch. Added 3 tests; proved real
  by reverting `provider.ts` to the pre-fix body and watching them fail.
- **#25 half fixed** — `logger` and `sentry` now import under plain Node ESM.
  New `packaging` vitest project guards it and derives its own scope, so blocked
  packages enrol automatically. Defect 1 (missing `dist` types) confirmed already
  fixed by 37ae890.
- `main == develop == origin` at `e13e5f4`, linear.

## Remaining

**#25 needs a decision, not a fix.** Six packages (`kavach`, adapters
`supabase`/`firebase`/`auth0`/`amplify`, and `convex` via a `types.ts`
re-export) enter through TypeScript, which Node cannot load at any extension.
Making them resolvable means flipping `emitDeclarationOnly` off, emitting JS to
`dist/`, and repointing `exports['.'].import` at `dist/` — changing what those
six ship. Left deliberately for a call.

Tech-debt tickets open and untouched: #26 cli (38), #27 auth (17), #28 vite (9),
#29 convex/query/sentry (9). Clearing all four unblocks promoting `complexity`
and `max-lines-per-function` from `warn` to `error`.

## Next command

`bun run test:ci` — new work starts on `develop`.

## Open questions

Whether to convert the six TS-entry packages to emit JS (#25 remaining scope).

## Known-broken

None. 851 tests pass (was 835); eslint 0 errors, 73 warnings (baseline unchanged);
semgrep clean on changed files. Pre-existing: 51 semgrep path-traversal /
child-process audit findings in `packages/cli` and `packages/vite`, untriaged.
`spec/fixtures/Test Book.epub` is untracked and unrelated — left alone.
