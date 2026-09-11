#!/usr/bin/env node
// Sync the version-dependent fields of sensei.library.json with the repo.
//
// `documents` names the CONCRETE release the published skills/agents/llms
// corpus describes, and `ref` pins source fetches to that release's tag. Both
// change on every release, and a stale value is worse than an absent one: it
// answers "are these docs for the version I depend on?" confidently and
// wrongly. `packages` changes rarely, but inferring it is not allowed — the
// library is the only party that knows which published names belong to it.
//
// Invoked from scripts/release-prep.sh (bumpp `execute`) after the version
// bump. packages/cli/spec/manifest.spec.js asserts the result, so a release
// that skips this fails the suite instead of shipping a lie.
//
// Run standalone with `bun run sync:manifest`.
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const manifestPath = join(root, 'sensei.library.json')

const { version } = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))

/** Every publishable workspace package name: the library first, then scoped. */
function publishedPackages() {
  const names = ['packages', 'adapters']
    .flatMap((group) =>
      readdirSync(join(root, group)).map((dir) => join(root, group, dir, 'package.json'))
    )
    .filter((file) => existsSync(file))
    .map((file) => JSON.parse(readFileSync(file, 'utf8')))
    .filter((pkg) => !pkg.private && pkg.name)
    .map((pkg) => pkg.name)

  const unscoped = names.filter((n) => !n.startsWith('@')).sort()
  const scoped = names.filter((n) => n.startsWith('@')).sort()
  return [...unscoped, ...scoped]
}

const next = {
  ...manifest,
  documents: version,
  ref: `v${version}`,
  packages: publishedPackages()
}

// A branch is a moving target and cannot be version-matched; `ref` replaces it.
delete next.branch

const before = readFileSync(manifestPath, 'utf8')
const after = JSON.stringify(next, null, 2) + '\n'

if (before === after) {
  console.log(`✓ sensei.library.json already at ${version} (${next.packages.length} packages)`)
} else {
  writeFileSync(manifestPath, after)
  console.log(`✓ sensei.library.json synced to ${version} (${next.packages.length} packages)`)
}
