# Agent Workflow

Rules and methodology for AI agents working on this repository.
CLAUDE.md loads this file at session start — follow it.

---

## Core Principles

1. **Understand "why" before "how"** — even for tactical tasks, confirm the reasoning before coding. If the direction seems wrong, say so and suggest an alternative.
2. **Ask, don't assume** — if instructions are vague, ask a clarifying question. One question at a time. Don't dump a wall of questions.
3. **Design before implementation** — for non-trivial work, agree on the approach with concrete examples (before/after) before writing code.
4. **Document as you go** — if it was discussed, write it down. Decisions decay if not captured immediately.
5. **One piece at a time** — break work into small, reviewable increments. Commit after each coherent unit.
6. **Two-tier communication** — detailed docs in files, light summaries in conversation. Keep discussion light; let the reader refer to the full document for details.

---

## Task Classification

Assess every task before starting:

### Design Work (full pipeline)
- New features, new patterns, architectural changes
- Anything that could be done multiple ways
- Anything where the "why" isn't obvious
- **Process**: Follow the Phase Pipeline below (SPECIFY → CLARIFY → PLAN → TASK → IMPLEMENT)

### Tactical Work (lightweight check)
- Bug fixes, field additions, clear-scope changes
- Code quality, documentation, coverage improvements
- **Process**: Confirm the reasoning makes sense → lightweight plan/task list → implement
- Can skip SPECIFY/CLARIFY/PLAN and go straight to a task list
- Even here: if you see a better alternative, speak up before coding

### When in Doubt
Ask. The cost of a question is low. The cost of implementing the wrong thing is high.

---

## Phase Pipeline

For design work, follow these phases in order:

### 1. SPECIFY

Write a feature spec using `agents/templates/spec-template.md`.

1. Create feature directory: `docs/features/NNN-feature-name/`
2. Copy spec template → `docs/features/NNN-feature-name/spec.md`
3. Fill in: overview, user stories (with Given/When/Then, priority tags), edge cases, requirements, entities, success criteria
4. Mark unclear items with `[NEEDS CLARIFICATION]` (max 3 allowed)
5. Present a **conversation summary** to the user for review (not the full spec)

**Conversation summary format:**
```
## Feature: [Name]

[2-3 sentence overview]

**Stories:**
- US-1: [Story title] (P1)
- US-2: [Story title] (P2)

**Edge cases:** [brief list]
**Requirements:** N functional, M need clarification

> Full spec: docs/features/NNN-name/spec.md
```

### 2. CLARIFY

Structured ambiguity resolution before planning.

1. Scan the spec for gaps, ambiguities, and underspecified areas
2. Prioritize up to 5 questions
3. Ask **one question at a time** — wait for the answer before asking the next
4. Fold answers back into the spec (update relevant sections + add to Clarifications)
5. Resolve all `[NEEDS CLARIFICATION]` markers
6. Use `agents/open-questions.md` for ongoing ad-hoc questions that arise outside this phase

### 3. PLAN

Write an implementation plan using `agents/templates/plan-template.md`.

1. Copy plan template → `docs/features/NNN-feature-name/plan.md`
2. Fill in: summary, technical approach, dependencies, structure changes, risks
3. **Principles alignment check**: verify plan against project principles in `agents/memory.md`
4. Reference patterns from `agents/design-patterns.md` where applicable
5. Present conversation summary to user

**Conversation summary format:**
```
## Plan: [Feature Name]

**Approach:** [2-3 sentence summary]
**Key decisions:** [bullet list]
**Principles check:** All pass / [flagged items]

> Full plan: docs/features/NNN-name/plan.md
```

### 4. TASK

Break the plan into phased tasks using `agents/templates/tasks-template.md`.

1. Copy tasks template → `docs/features/NNN-feature-name/tasks.md`
2. Organize into phases:
   - **Phase 1**: Setup & foundational (blocking prerequisites)
   - **Phase 2+**: One phase per user story, ordered by priority (P1 first)
   - **Final Phase**: Polish & cross-cutting
3. Mark parallel tasks with `[P]` and story mappings with `[US-N]`
4. **Run consistency check** (embedded in template) — all items must pass before proceeding
5. Present conversation summary to user

**Conversation summary format:**
```
## Tasks: [Feature Name]

N phases, M tasks total
- Phase 1 (Setup): X tasks
- Phase 2 (Story - P1): Y tasks
- Final (Polish): Z tasks

> Full tasks: docs/features/NNN-name/tasks.md
```

### 5. IMPLEMENT

Execute tasks phase by phase.

1. Work through tasks in phase order
2. Mark tasks `[x]` as completed in tasks.md
3. **Between phases**: run the triage checkpoint (see Interrupt Handling below)
4. Update `agents/journal.md` after each phase
5. On completion: update feature status in `docs/features/README.md`

---

## Interrupt Handling

Real-world development isn't linear. New bugs, scope changes, and priority shifts happen during implementation.

### Triage on Arrival

When a new item arrives during implementation:

- **Hot (higher priority than current phase)**: Insert into current phase's Interrupts section. Address before continuing current work.
- **Queued (lower priority)**: Add to `docs/backlog.md` with priority tag. Continue current work.

### Between-Phase Checkpoint

After completing each phase, before starting the next:

1. Review `docs/backlog.md` — any items to promote into upcoming phases?
2. Check for priority changes — should remaining phases be reordered?
3. Check for scope changes — update the spec and flag affected tasks for re-evaluation
4. Log triage decisions in the tasks.md Checkpoint Notes section

### Scope Changes to Existing Stories

When requirements change for an in-progress feature:

1. Update the spec (`docs/features/NNN/spec.md`) with the change
2. Flag affected tasks in tasks.md (add `[CHANGED]` marker)
3. Re-evaluate priority and phase ordering
4. Log the change in `agents/journal.md`

---

## Session Lifecycle

### Session Start
1. Read `agents/memory.md` — shared project knowledge and principles
2. Read `agents/journal.md` (last ~50 lines) — recent progress and open items
3. Read `agents/plan.md` — check for active plan pointer
4. Read `agents/design-patterns.md` — established patterns to follow
5. If resuming from crash/interruption: pick up from unchecked items in the active feature's tasks.md

### During Session
1. Track progress in the active feature's tasks.md — check off items as completed
2. Capture decisions in `agents/memory.md` immediately (if they're project-level knowledge)
3. Update relevant `docs/design/*.md` when a design is agreed upon
4. Use conversation summaries — don't dump full file contents

### Before Commit
1. Run tests — all must pass
2. Run lint — 0 errors
3. Update the active feature's tasks.md — mark completed steps
4. Update `agents/journal.md` — log what was done with commit hashes

### Session End / Feature Completion
1. When all tasks are done **and tests + lint pass**:
   - Update feature status in `docs/features/README.md`
   - Archive: move plan pointer from `agents/plan.md`
   - Log in `agents/sessions/YYYY-MM-DD-<feature-name>.md`
   - **Do NOT archive until verification passes**
2. Update `agents/journal.md` — final summary
3. Update `agents/memory.md` — if new persistent knowledge was established

---

## Question Protocol

For design discussions and unclear requirements:

### Setup
1. Formulate your questions — think through what you need to know
2. Write them to `agents/open-questions.md` as a checklist (for tracking)
3. Mark status: `[ ]` not asked, `[~]` awaiting answer, `[x]` answered

### Execution
1. **Ask one question at a time** — present it in conversation, wait for the answer
2. **Stay adaptive** — the next question may change based on the current answer
3. **Capture answers immediately** — update `open-questions.md` and relevant docs
4. An answer may make other questions irrelevant or spawn new ones — adjust the list

### Why This Matters
- Dumping multiple questions causes context-switching and tangents
- Answers to early questions often reshape later ones
- One-at-a-time keeps the conversation focused and productive

---

## Plan Pointer

`agents/plan.md` serves as a pointer to the active feature:

```markdown
# Active Plan

Feature: [Feature Name]
Directory: docs/features/NNN-feature-name/
Phase: IMPLEMENT (Phase 2 of 4)
```

When no work is active: `No active plan. Ready for next task.`

One active feature at a time. The detailed plan and tasks live in the feature directory.

---

## Backlog Management

`docs/backlog.md` is a living priority queue:

- Items are added when work is scoped out, deferred, or arrives as interrupts
- Each item has: priority (P1/P2/P3), source type, description
- **Between phases**: review and triage (promote, reprioritize, or discard)
- **Hot items**: P1 interrupts can be inserted into the current phase immediately
- See `docs/backlog.md` for the full format and triage rules

---

## Crash Recovery

If a session ends unexpectedly:
1. Read `agents/plan.md` — find active feature directory
2. Read the feature's tasks.md — find unchecked steps
3. Read `agents/journal.md` — last recorded state
4. Resume from where work stopped — don't restart from scratch
5. Note the interruption in the journal

---

## Consistency Check

Before starting the IMPLEMENT phase, verify:

1. Every requirement (FR-NNN) in the spec maps to at least one task
2. Every task maps back to a requirement or user story
3. No `[NEEDS CLARIFICATION]` markers remain unresolved
4. Plan aligns with all project principles in `agents/memory.md`
5. All dependencies listed in the plan are available

Results go in the feature's tasks.md under the Consistency Check section. Issues must be resolved before proceeding.

---

## File Reference

| File | Purpose | When to update |
|------|---------|---------------|
| `agents/workflow.md` | This file — methodology rules | When workflow evolves |
| `agents/memory.md` | Project knowledge, principles, tooling | When decisions are made |
| `agents/journal.md` | Chronological progress log | Every session |
| `agents/plan.md` | Pointer to active feature | When starting/finishing features |
| `agents/open-questions.md` | Ad-hoc Q&A tracking | During question phases |
| `agents/design-patterns.md` | Patterns, tooling, references | When patterns are proven |
| `docs/backlog.md` | Living priority queue | When items are deferred or triaged |
| `agents/sessions/` | Archived completed features | On feature completion |
| `agents/templates/` | Spec, plan, tasks templates | When templates evolve |
| `docs/features/` | Per-feature specs, plans, tasks | During feature work |
| `docs/design/*.md` | Module design documents | When designs are agreed |
