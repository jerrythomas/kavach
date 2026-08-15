# Kavach — Agent Instructions

This file is the entry point for any AI agent working on this repo.

## MANDATORY: Load Workflow First

Before doing any work:

1. **Sensei — resume + constitution** (machine-readable, fastest to orient):
   - `sensei_get_workflow_state` — is there an active phase / task / checkpoint to resume?
   - `sensei_get_layered_context` — blended project memory (project + stack + global)
   - `sensei_get_rules` — governance constitution (see Sensei section below)
2. **Read `docs/plans/README.md`** — check for an active plan to resume.

There is no separate `agents/` directory — memory, journaling, checkpoints, and
sessions all live in sensei (see below). If a capability you need is missing from
the MCP, raise an upstream issue at `github.com/sensei-hq/sensei`.

---

## Project Overview

Kavach is an authentication framework for SvelteKit: adapter packages
(`adapters/`) plug into auth providers (Supabase, Firebase, Convex, Auth0,
Amplify), a core runtime (`packages/auth`) exposes `createKavach` /
`kavach.handle` + route protection, and a Vite plugin
(`packages/vite`) generates the `$kavach/*` virtual modules and ambient types.
Sites: `sites/demo` (real multi-adapter demo app), `sites/learn` (marketing +
docs), `sites/showcase` (shared demo component kit + config + e2e).

## Repository Structure

```
kavach/
  AGENTS.md                      <-- You are here
  packages/                      <-- Published libs (auth, vite plugin, ui, cli, sentry, logger)
  adapters/                      <-- Per-provider adapters (supabase, firebase, convex, auth0, amplify)
  sites/
    demo/                        <-- Real multi-adapter demo app (KAVACH_ADAPTER env selects)
    learn/                       <-- Marketing + docs site
    showcase/                    <-- Shared demo kit: components + demo-config + state + e2e
  config/                        <-- Shared vitest / eslint / prettier / tsconfig
  docs/
    features/                    <-- Feature specs (what & why, gherkin)
    design/                      <-- Design docs (how & why, patterns)
    plans/                       <-- Active plan (README.md) + archived plans
    llms/                        <-- Generated docs for llms.txt (sites/learn prebuild)
```

## Sensei MCP — constitution, checkpoints, session resume

This repo uses the **sensei MCP** server as its governance + memory layer (agent
tools are named `sensei_*`). Sensei owns these; use it, don't duplicate it.

### Constitution (governance rules)

- `sensei_get_rules` — the rules that govern this repo, resolved across scopes
  (organization / project / technology) and ranked by enforcement. Rules flagged
  **`mandatory` are non-negotiable** and cannot be overridden by more-specific
  scopes; `required` must be satisfied; `recommended` / `advisory` are guidance.
  Global rules live at `~/.sensei/rules.md`.
- `sensei_run_checkers` — run checker-backed rules (this repo's lint/test) for an
  enforceable pass/fail verdict.
- `sensei_promote_memory` / `sensei_accept_playbook_rule` — governance review
  flows; leave proposals to the user unless asked.

### Session resume

- At session start: `sensei_get_workflow_state` (active phase/task/plan), then
  `sensei_get_layered_context` to reorient on project memory.
- Mid-session: call `sensei_get_workflow_state` again if you feel lost.
- `sensei_create_session` when starting a task; `sensei_update_session` when it
  ends. `sensei_use_project` pins the project if ever ambiguous.

### Checkpoints + journaling

- At **every phase transition or interrupt**, record where you stopped with
  `sensei_update_phase` (`phase`, `task`, `checkpoint`) so the next session
  resumes exactly here.
- `sensei_log_event` (`phase_transition`, `checkpoint`, `review_finding`,
  `command_invoked`) records milestones — this is the project journal.
- Memory: `sensei_save_memory` (only on explicit `/save`) and
  `sensei_propose_memory` (on heuristic fires — triage, not active).

---

## Working with this Repo

### Commands (run from the repo root)

```bash
bun run test:ci                     # Root vitest — MUST use this (config/vitest.config.js);
                                    # plain `bun vitest run` misses config + scans .worktrees/**
bunx eslint .                       # 0 errors expected (69 warnings tolerated)
bun run build:all                   # Build packages + sites
bun run check                       # In sites/demo and sites/learn (svelte-check; demo regenerates kavach.d.ts)
bun run test:unit                   # In sites/showcase
bun run test:e2e:supabase|firebase|convex   # In sites/showcase (Playwright)
bun install                         # Refresh lockfile after dep changes
```

### Lint Rules

- Warnings are pre-existing and acceptable.
- **Errors must be zero** — every task ends with a green gate.

### Git branching

- All work happens on **`develop`** — never commit directly to `main`.
- **`main` is kept LINEAR** — it must always be a fast-forward prefix of
  `develop`. Never create a release merge commit (`git merge --no-ff`); branch
  protection rejects them. After a release: fast-forward `main` to the release
  commit, push, switch back to `develop`.

---

## Pipeline: Feature → Plan → Implement

For non-trivial work:

### 1. FEATURE

Write/refine the feature spec in `docs/features/<NN>-<name>.md` (gherkin
scenarios). Add it to `docs/features/README.md` with its status. New module →
requirements + design docs first.

### 2. PLAN

Create the implementation plan in `docs/plans/README.md` (one active plan) and a
design doc under `docs/design/`. Define goal, tasks, approach, feature reference.
**Present the plan to the user for agreement. No code until agreed.**

### 3. IMPLEMENT

Execute the agreed plan, working through tasks in order. Before marking done,
run the completion checklist:

1. Code complete, tests pass (`bun run test:ci`, per-site checks, lint 0 errors)
2. Requirements/design docs still accurate? Update if not.
3. Archive plan to `docs/plans/<datetime>-<feature>.md`
4. Record the milestone in sensei (`sensei_log_event` + `sensei_update_phase`)
5. Mark feature done in `docs/features/README.md`

### Handling interrupts

Record the stop point with `sensei_update_phase` (`phase`, `task`,
`checkpoint`) so any later session resumes exactly here. Next pickup is
`docs/plans/README.md` (or the feature backlog).

---

## Key Files Quick Reference

| Path                                           | Purpose                                                      |
| ---------------------------------------------- | ------------------------------------------------------------ |
| `docs/plans/README.md`                         | Current active plan                                          |
| `docs/features/`                               | Feature specs (flat, `<NN>-<name>.md`) + dashboard           |
| `docs/design/`                                 | Design docs — how and why, patterns                          |
| `packages/auth/src/kavach.js`                  | Core runtime (`createKavach`, `handle`, route protection)    |
| `packages/vite/src/generate.js`                | `$kavach/*` virtual module + ambient d.ts generation         |
| `packages/ui/src/`                             | `@kavach/ui` components (AuthProvider, AuthCard, LoginCard…) |
| `sites/showcase/src/lib/config/demo-config.js` | Shared demo config (ADAPTERS, RULES, ROUTES, COPY)           |
| `sites/demo/kavach.config.js`                  | Demo's per-adapter kavach config                             |
| `config/vitest.config.js`                      | Canonical root test config (run via `bun run test:ci`)       |
