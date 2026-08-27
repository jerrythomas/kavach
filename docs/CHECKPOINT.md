# Checkpoint

**Slice:** v1.1.1 patch release + CI repair

## Done

- **v1.1.1 released.** `bun run bump --release patch --yes` → commit `8d28481`, tag
  `v1.1.1`, pushed. Publish workflow green; all 14 packages live on npm.
  Shipped `kavach@1.1.1` tarball verified to contain `dist/index.d.ts` (11 `.d.ts`).
- **Coverage workflow fixed** (`6c58b5a`) — green for the first time since 2026-08-03.
  Broken by `8b68e02`, which rewrote `qltysh/qlty-action/coverage@v2` as
  `qltysh/qlty-action@<sha>`; the repo has no root `action.yml`, so the job died at
  setup. That masked a second fault from the same commit: `cache: false` on
  setup-node, which throws (`cache` names a package manager) — now
  `package-manager-cache: false`.
- **`curl https://deepsource.io/cli | sh` removed** — replaced with the pinned
  v0.10.1 release tarball verified against its published SHA-256.
- **Node 20 deprecation cleared** — checkout v4→v7.0.1, setup-node v4→v7.0.0 across
  all workflows. Every remaining action was already node24, so the
  `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24` escape hatch is gone.
- **`main` fast-forwarded** to `6c58b5a`. `main == develop == origin` — history linear,
  no merge commit.

## Remaining

Nothing in this slice.

## Next command

New work starts on `develop`.

## Open questions

None.

## Known-broken

None. Suite 835 passed; eslint 0 errors (73 complexity/max-lines _warnings_, set to
`warn` by config, pre-dating this work); actionlint 0; semgrep 0 findings.
