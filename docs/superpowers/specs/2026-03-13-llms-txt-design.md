# llms.txt Docs — Design

## Overview

Add per-package `llms.txt` documentation files sourced from `docs/llms/`, served via the learn site at `/llms/`, and accessible directly in the git repository.

## Problem

The existing `static/llms.txt` is a single hand-crafted file too small to cover usage patterns and the different adapters. It lacks CLI coverage and per-package depth.

## Goals

- One `.txt` file per package with comprehensive coverage: purpose, install, API, usage patterns, code examples
- Accessible two ways: directly in the git repo (`docs/llms/`) and via the live website (`/llms/`)
- Standard llmstxt.org format so AI tools can discover and traverse the docs
- Simple prebuild copy — no custom scripts or tooling

## Source Structure

```
docs/llms/
  llms.txt              # short index (entry point), references ./auth.txt etc.
  auth.txt
  sentry.txt
  ui.txt
  vite.txt
  logger.txt
  query.txt
  cookie.txt
  hashing.txt
  cli.txt
  adapter-supabase.txt
  adapter-firebase.txt
  adapter-auth0.txt
  adapter-amplify.txt
  adapter-convex.txt
```

### `llms.txt` index format

Follows [llmstxt.org](https://llmstxt.org) spec:

```
# Kavach

> A drop-in authentication framework for SvelteKit with unified API across
> multiple platforms, declarative route protection, and pre-built UI components.

## Packages
- [Auth](./auth.txt)
- [Sentry](./sentry.txt)
- [UI](./ui.txt)
- [Vite Plugin](./vite.txt)
- [Logger](./logger.txt)
- [Query](./query.txt)
- [Cookie](./cookie.txt)
- [Hashing](./hashing.txt)
- [CLI](./cli.txt)

## Adapters
- [Supabase](./adapter-supabase.txt)
- [Firebase](./adapter-firebase.txt)
- [Auth0](./adapter-auth0.txt)
- [AWS Amplify](./adapter-amplify.txt)
- [Convex](./adapter-convex.txt)
```

### Per-package file contents

Each file covers:

- Purpose and when to use
- Installation
- Full API surface
- Common usage patterns with code examples
- Integration with other Kavach packages where relevant

## Prebuild Step

In `sites/learn/package.json`:

```json
"prebuild": "cp -r ../../docs/llms static/"
```

This copies `docs/llms/` to `sites/learn/static/llms/` before every build, making the files available at `/llms/*` on the website.

## Website Delivery

| URL                          | Content                        |
| ---------------------------- | ------------------------------ |
| `/llms/llms.txt`             | Index entry point for AI tools |
| `/llms/auth.txt`             | Auth package docs              |
| `/llms/sentry.txt`           | Sentry package docs            |
| `/llms/ui.txt`               | UI components docs             |
| `/llms/vite.txt`             | Vite plugin docs               |
| `/llms/logger.txt`           | Logger package docs            |
| `/llms/query.txt`            | Query package docs             |
| `/llms/cookie.txt`           | Cookie package docs            |
| `/llms/hashing.txt`          | Hashing package docs           |
| `/llms/cli.txt`              | CLI usage docs                 |
| `/llms/adapter-supabase.txt` | Supabase adapter docs          |
| `/llms/adapter-firebase.txt` | Firebase adapter docs          |
| `/llms/adapter-auth0.txt`    | Auth0 adapter docs             |
| `/llms/adapter-amplify.txt`  | AWS Amplify adapter docs       |
| `/llms/adapter-convex.txt`   | Convex adapter docs            |

## Site Navigation Change

In `sites/learn/src/routes/(public)/+layout.svelte`:

- **Remove** the existing plain text link: `<a href="/llms.txt">llms.txt</a>`
- **Replace** with a noticeable icon button (`href="/llms/llms.txt"`)
- **Remove** `sites/learn/static/llms.txt`

## Out of Scope

- Generating `llms.txt` content automatically from code — files are hand-authored
- Search indexing or full-text assembly (`llms-full.txt`)
- Verification that content matches actual package APIs (future story)
