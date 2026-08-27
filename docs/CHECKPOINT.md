# Checkpoint

**Slice:** #25 defect 2 complete — every package resolves under plain Node ESM

## Done

- **#25 closed.** All 14 published packages now import by package name through
  their exports map under plain Node. The six that entered through TypeScript
  (`kavach`, supabase/firebase/auth0/amplify adapters, convex via a `types.ts`
  re-export) now emit JS: `emitDeclarationOnly: false`, and
  `exports['.'].import`/`default` → `./dist/index.js`.
- `exports['.'].svelte` still points at `src`, so bundlers compile from source —
  SvelteKit dev loop unchanged, verified by building `sites/demo` with no dist.
- **Guards:** `spec/packaging.spec.js` covers all 14 packages (static +
  real Node load); `publish.yml` refuses to publish a package that will not
  import under Node; `build:all` is dependency-ordered via
  `scripts/build-all.sh` and now includes adapters.
- **#30, #21** closed earlier in the session.
- `main == develop == origin` at `c4eeca8`, linear. CI green.

## Remaining

Nothing on #25.

Tech-debt tickets open and untouched: #26 cli (38), #27 auth (17), #28 vite (9),
#29 convex/query/sentry (9). Clearing all four unblocks promoting `complexity`
and `max-lines-per-function` from `warn` to `error`. #22 (ambient .d.ts for
vite virtual modules) also open — overlaps #28, sequence them together.

## Next command

`bun run test:ci` — new work starts on `develop`. The ESM fixes are committed
but **not released**; they ship on the next bump.

## Open questions

None.

## Known-broken

None. 866 tests with dist built, 860 on a clean checkout (the six dist-entry
packages defer their load check until built, by design). eslint 0 errors,
73 warnings (baseline unchanged); actionlint and semgrep clean.

Pre-existing, untriaged: 51 semgrep path-traversal / child-process audit
findings in `packages/cli` and `packages/vite`. `spec/fixtures/Test Book.epub`
is untracked and unrelated — deliberately left alone.
