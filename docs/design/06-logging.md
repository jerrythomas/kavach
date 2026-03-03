# 06 — Logging Design

## Overview

The logger package (`@kavach/logger`) provides structured, context-scoped logging with pluggable writers. It separates log creation from log output — the logger builds structured data, the writer decides where it goes.

## Internal Modules

| Module | Purpose |
|--------|---------|
| `logger.js` | Logger factory, context scoping, level filtering, log dispatch |
| `constants.js` | Log level definitions, numeric hierarchy, zeroLogger |
| `types.js` | JSDoc type definitions |

## Architecture

### Logger Creation

```
getLogger(writer, options)
  ├─ Validate writer (must have .write function)
  │   └─ Invalid → return zeroLogger (no-op)
  ├─ Resolve log level (default: 'error')
  └─ getContextLogger(writer, level, context)
      ├─ For each level ≤ current level: create log function
      ├─ For each level > current level: assign pass (no-op)
      └─ Add getContextLogger(newContext) for child scoping
```

### Level Filtering

Levels are compared numerically at creation time — no runtime checks on each log call:

```
error (1) ← most restrictive
warn  (2)
info  (3)
debug (4)
trace (5) ← most verbose
```

When a logger is created at level `info`:
- `error()`, `warn()`, `info()` → real log functions
- `debug()`, `trace()` → `pass` (async no-op)

This means filtering has zero cost at call time — filtered methods literally do nothing.

### Context Scoping

Loggers carry context that flows into every log entry:

```
const logger = getLogger(writer, { level: 'info' })

const authLogger = logger.getContextLogger({
  package: '@kavach/auth',
  module: 'kavach'
})

const methodLogger = authLogger.getContextLogger({
  method: 'handleSignIn'
})

// methodLogger carries: { package: '@kavach/auth', module: 'kavach', method: 'handleSignIn' }
```

`getContextLogger()` creates a new logger instance — the parent is never mutated. Context fields are merged (child overrides parent).

### Log Dispatch

```
logger.info(message, data?, error?)
  ├─ Normalize content:
  │   ├─ String → { message }
  │   └─ Object → { message, data, error } (pass through)
  ├─ Add metadata:
  │   ├─ level: 'info'
  │   ├─ running_on: 'server' | 'browser' (auto-detected)
  │   ├─ logged_at: ISO 8601 timestamp
  │   └─ context: { package, module, method, ... }
  └─ writer.write(logData) → Promise<void>
```

### Writer Abstraction

Writers implement a single method:

```
{ write(logData: LogData): Promise<void> }
```

LogData shape:
```
{
  level: string,
  running_on: 'server' | 'browser',
  logged_at: ISO 8601,
  context: { package?, module?, method?, ... },
  message: string,
  data?: object,
  error?: object
}
```

The package ships no built-in writers. Consumers provide their own — console, file, HTTP, database. The Supabase adapter provides a `getLogWriter()` that writes to a Supabase table.

### Zero Logger

A no-op logger returned when no writer is configured or the writer is invalid:

```
zeroLogger = {
  info: pass,   warn: pass,   error: pass,
  debug: pass,  trace: pass,
  getContextLogger: () => zeroLogger
}
```

All kavach packages default to `zeroLogger` when no logger is provided — logging adds zero overhead unless explicitly configured.

## Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| No built-in writers | Keeps the package tiny; consumers pick their output target |
| Level filtering at creation, not call time | Zero-cost no-ops for filtered levels; no conditionals on hot paths |
| Context inheritance via new instances | Immutable loggers; safe to pass between modules without mutation risk |
| Async write interface | Non-blocking; writing to databases or HTTP doesn't stall the request |
| Auto environment detection | `running_on` field lets log consumers distinguish client vs server entries |
| Default to error level | Conservative default; only critical issues logged unless explicitly widened |
| zeroLogger as default | Packages work without logging configured; no null checks needed anywhere |
