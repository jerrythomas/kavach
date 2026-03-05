# Agent Workflow

Rules and methodology for AI agents working on this repository.
CLAUDE.md loads this file at session start — follow it.

---

## Core Principles

1. **Understand "why" before "how"** — confirm reasoning before coding. If direction seems wrong, say so.
2. **Ask, don't assume** — if instructions are vague, ask one question at a time.
3. **Design before implementation** — for non-trivial work, agree on approach before writing code.
4. **Document as you go** — decisions decay if not captured immediately.
5. **One piece at a time** — small reviewable increments. Commit after each coherent unit.

---

## Task Classification

### Design Work (full pipeline)
- New features, new patterns, architectural changes
- Anything that could be done multiple ways
- **Process:** Feature → Plan → Implement (see below)

### Tactical Work (lightweight)
- Bug fixes, small changes, clear scope
- **Process:** Confirm reasoning → implement → update docs if needed

### When in Doubt
Ask. The cost of a question is low.

---

## Pipeline: Feature → Plan → Implement

### 1. FEATURE

Write or refine module level features in `docs/features/NN-<module>.md`. Flat directory — no subdirectories per module. Each module will have one or more features section. Each feature should include a gherkins code block with scenarios.

- If the feature touches a **new module**: a new module file first.
- If the feature touches an **existing module**: check that features and design docs are still current.
- Clarifications happen inline — questions and answers are captured in the design file.
- Add the feature and scenarios to `docs/features/README.md` with the status. 

### 2. PLAN

Create an implementation plan in `docs/plans/README.md`. Create or update a design file under `docs/design`. This can be similar modules as the features or based on implementation modules. Where relevant add mermaid flow and interaction diagrams.

- Define: goal, tasks, approach, and reference to the feature.
- **Present the plan to the user for agreement.** No code until agreed.
- One active plan at a time.

### 3. IMPLEMENT

Execute the agreed plan.

- Work through tasks in order.
- Before marking a feature done, run the **completion checklist**:
  1. Code complete, tests pass
  2. Requirements doc still accurate? Update if not.
  3. Design doc still accurate? Update if not.
  4. Archive plan to `docs/plans/<datetime>-<feature>.md`
  5. Update `agents/journal.md`
  6. Mark feature done in `docs/features/README.md`

---

## Interrupts

Everything goes to `docs/design/README.md`. No inline insertion into current work. Pick it up next. If it is a big enough feature, add to features. 

---

## Session Lifecycle

### Session Start
1. Read `agents/workflow.md` — this file
2. Read `agents/memory.md` — project knowledge
3. Read `agents/journal.md` (last ~50 lines) — recent progress
4. Check `docs/plans/README.md` — active plan to resume?

### During Session
- Track progress in the active plan
- Capture decisions in `agents/memory.md` immediately
- Update `docs/design/*.md` when designs change

### Before Commit
1. Run tests — all must pass
2. Run lint — 0 errors
3. Update `agents/journal.md`

---

## Crash Recovery

1. Check `docs/plans/README.md` — find active plan
2. Check referenced feature — find current state
3. Read `agents/journal.md` — last recorded progress
4. Resume from where work stopped

---

## File Reference

| File | Purpose | When to update |
|------|---------|---------------|
| `agents/workflow.md` | This file — methodology | When workflow evolves |
| `agents/memory.md` | Project knowledge, principles | When decisions are made |
| `agents/journal.md` | Progress log | Every session |
| `docs/requirements/` | Module requirements (what/why) | When module scope changes |
| `docs/design/` | Module design (how/why) | When design changes |
| `docs/features/` | Feature specs (flat, NNN-name.md) | During feature work |
| `docs/features/README.md` | Prioritized feature dashboard | When features are added/completed |
| `docs/plans/README.md` | Active plan | When starting/finishing features |
