# Project Name — Agent Instructions

This file is the entry point for any AI agent working on this repo.

## MANDATORY: Load Workflow First

Before doing any work, read these files in order:
1. **`agents/workflow.md`** — methodology, phase pipeline, interrupt handling
2. **`agents/memory.md`** — shared project knowledge, principles, and tooling
3. **`agents/journal.md`** (last ~50 lines) — recent progress
4. **`agents/plan.md`** — check for active feature to resume
5. **`agents/design-patterns.md`** — established patterns, project conventions, references

These files govern how you work. Do not skip them.

---

## Project Overview

<!-- Replace with a 2-3 sentence description of what this project does. -->

**Project Name** is ...

## Repository Structure

```
project-root/
  CLAUDE.md                      <-- You are here
  agents/                        <-- Agent instructions, session tracking, patterns
    workflow.md                  <-- Methodology and phase pipeline (READ FIRST)
    memory.md                   <-- Project knowledge, principles, tooling
    journal.md                  <-- Chronological progress log
    plan.md                     <-- Pointer to active feature
    open-questions.md           <-- Q&A tracking for design discussions
    design-patterns.md          <-- Patterns (general + project) and references
    sessions/                   <-- Archived completed features
    templates/                  <-- Guided templates for specs, plans, tasks
      spec-template.md          <-- Feature specification template
      plan-template.md          <-- Implementation plan template
      tasks-template.md         <-- Phased task breakdown template
  docs/
    backlog.md                  <-- Living priority queue with triage
    features/                   <-- Per-feature directories (spec, plan, tasks)
    design/                     <-- Module design documents (numbered: 01-xxx.md)
    examples/                   <-- Usage examples
    plans/                      <-- Design decision documents
    requirements/               <-- Feature requirements (numbered: 01-xxx.md)
  solution/                     <-- All source code lives here
```

## Key Design Principles

<!-- Replace with 3-5 principles that guide this project's architecture. -->
<!-- These should also be added to agents/memory.md under Project Principles. -->

- **Principle 1** — ...
- **Principle 2** — ...
- **Principle 3** — ...

## Working with this Repo

### Commands (run from `solution/`)

<!-- Replace with actual commands for your project. -->

```bash
# Tests
npm run test                      # Run all tests

# Lint
npm run lint                      # 0 errors expected
```

**Important:** Always run commands from the `solution/` directory.

## Conventions

### Phase pipeline for features
For non-trivial work, follow the phase pipeline: SPECIFY → CLARIFY → PLAN → TASK → IMPLEMENT.
See `agents/workflow.md` for the full process.

### Two-tier communication
Keep conversation light with summaries. Full details live in feature files (`docs/features/NNN-name/`).
Refer users to the document for details rather than dumping full content in chat.

### Creating a new feature
1. Create `docs/features/NNN-feature-name/` directory
2. Follow the phase pipeline in `agents/workflow.md`
3. Use templates from `agents/templates/` for spec, plan, and tasks

### When completing work
1. Run tests and lint — both must pass
2. Update the feature's tasks.md — mark steps complete
3. Update `agents/journal.md` — log what was done with commit hashes
4. Update feature status in `docs/features/README.md`
5. On feature completion: archive to `agents/sessions/YYYY-MM-DD-<name>.md`

### Handling interrupts
- Hot items (P1): insert into current phase
- Lower priority: add to `docs/backlog.md`
- Between phases: triage the backlog
- See `agents/workflow.md` Interrupt Handling section

### Lint Rules
- Warnings are pre-existing and acceptable
- **Errors must be zero**

## Key Files Quick Reference

| File | Purpose |
|------|---------|
| `agents/workflow.md` | Methodology, phase pipeline, interrupt handling |
| `agents/memory.md` | Project knowledge, principles, tooling |
| `agents/plan.md` | Pointer to active feature |
| `agents/journal.md` | Chronological progress log |
| `docs/backlog.md` | Living priority queue with triage |
| `agents/design-patterns.md` | Patterns (general + project) and references |
| `agents/templates/` | Spec, plan, tasks templates |
| `docs/features/` | Per-feature specs, plans, tasks |
