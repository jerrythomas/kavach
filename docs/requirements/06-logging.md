# 06 — Logging

## What

The logger package (`@kavach/logger`) provides structured, context-aware logging that works on both browser and server. It:

- **Structured output** — every log entry includes level, timestamp, running environment (browser/server), context, message, data, and error
- **Context scoping** — create child loggers with package/module/method context that flows through to every log call
- **Pluggable writers** — inject any `LogWriter` (console, database, remote service) via the factory
- **Level filtering** — filter by log level: trace, debug, info, warn, error
- **Zero logger** — no-op logger when no writer is provided (no runtime cost)

## Why

Debugging auth flows across client and server is hard. Logs from the browser, SvelteKit hooks, and adapter calls need to be correlated. The logger provides:

1. **Consistent format** — same log shape everywhere, whether running in the browser or on the server
2. **Traceability** — context (package, module, method) identifies exactly where a log came from
3. **Flexibility** — swap writers without changing log call sites; write to console in dev, to a database in production
4. **No overhead** — `zeroLogger` ensures logging calls in production with no writer configured have zero cost

## Scope

### In scope
- `getLogger(writer, options)` factory
- `getLogLevel(level)` — validate/normalize level strings
- `zeroLogger` — no-op logger instance
- `logger.getContextLogger(context)` — create scoped child logger
- Log methods: `info()`, `warn()`, `error()`, `debug()`, `trace()`
- Each log call accepts: `(message, data?, error?)`
- `LogWriter` interface: `{ write(logData) → Promise<void> }`

### Out of scope
- Log storage/persistence (writer responsibility)
- Log aggregation/search (external tooling)
- Log rotation

## Log Data Shape

| Field | Type | Description |
|-------|------|-------------|
| level | string | trace, debug, info, warn, error |
| running_on | string | 'browser' or 'server' |
| logged_at | ISO 8601 | Timestamp |
| context | object | { package?, module?, method? } |
| message | string | Human-readable message |
| data | object | Arbitrary structured data |
| error | object | Error details |

## Dependencies

None — standalone package.
