# Design Patterns & References

Established patterns, project conventions, and external references.
Check this file before implementing new features to ensure consistency.

---

## How to Use This File

1. **Before implementing**: Check if an existing pattern applies
2. **After implementing**: If you created a new reusable pattern, document it here
3. **Format**: Each pattern includes context (when to use), the pattern itself, and an example

---

## General Patterns

Reusable patterns that apply across projects — error handling, logging, API design, testing approaches.

*No general patterns established yet.*

<!--
Example:

### Error Handling

**Context:** When a function can fail in expected ways.

**Pattern:**
- Return error types, don't throw exceptions
- Include context in error messages (what failed + why + what to do)
- Log at the boundary, not deep in the call stack

**Example:**

```
// code example
```

**Used in:** file1.ts, file2.ts
-->

---

## Project Patterns

Patterns specific to this project's architecture — component structure, state management, data flow.

*No project patterns established yet.*

<!--
Example:

### Component Structure

**Context:** When creating a new UI component.

**Pattern:**
- One component per file
- Props interface defined at top of file
- Default exports only

**Example:**

```
// code example
```

**Used in:** src/components/
-->

---

## References

External documentation, API specs, standards, and style guides being followed.

*No references yet.*

<!--
Example:

| Reference | URL | Notes |
|-----------|-----|-------|
| React Docs | https://react.dev | Component patterns |
| API Spec | docs/design/api.md | Internal API contract |
| Style Guide | ... | Coding conventions |
-->
