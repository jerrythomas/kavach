# Tasks: [Feature Name]

<!--
  Phased task breakdown generated from the plan.

  Task markers:
    [P]    — parallelizable (can run concurrently with other [P] tasks in same phase)
    [US-N] — maps to user story N from the spec
    [x]    — completed

  Phase structure:
    Phase 1      — Setup & foundational (blocking prerequisites)
    Phase 2+     — One phase per user story, ordered by priority
    Final Phase  — Polish & cross-cutting concerns
-->

## Consistency Check

<!--
  Run before implementation. All must pass:
  - [ ] Every requirement (FR-NNN) maps to at least one task
  - [ ] Every task maps to a requirement or user story
  - [ ] No [NEEDS CLARIFICATION] markers remain unresolved in spec
  - [ ] Plan aligns with all project principles in memory.md
  - [ ] All dependencies listed in the plan are available
-->

## Phase 1: Setup & Foundational

<!-- Blocking prerequisites — must complete before story phases. -->

- [ ] [T-001] [US-*] ...
- [ ] [T-002] [P] [US-*] ...

## Phase 2: [User Story Title] (P1)

- [ ] [T-003] [US-1] ... — `path/to/file`
- [ ] [T-004] [P] [US-1] ... — `path/to/file`

## Phase 3: [User Story Title] (P2)

- [ ] [T-005] [US-2] ... — `path/to/file`

<!-- Add more phases as needed, one per user story. -->

## Final Phase: Polish & Cross-Cutting

- [ ] [T-NNN] Run full test suite and lint
- [ ] [T-NNN] Update documentation
- [ ] [T-NNN] Final commit

## Interrupts

<!--
  Hot-inserted items during implementation.
  Items with higher priority than current phase work get inserted here.
  Lower priority items go to docs/backlog.md.
-->

## Checkpoint Notes

<!--
  Between-phase triage decisions.
  After each phase completes, review:
  - Backlog items: any to promote?
  - Priority changes: reorder remaining phases?
  - Scope changes: update spec and flag affected tasks?
-->
