# Observability

Structured logging helps debug issues across client and server. Logs include context for tracing operations and can be sent to different outputs.

## Features

### Structured Logging

Logs include consistent fields for debugging.

```gherkin
Feature: Structured Logging

  Scenario: Application logs an event
    Given the application calls the logger
    Then the log includes level, timestamp, message
    And includes context information
```

### Context-Scoped Logging

Logs carry identity through call chains.

```gherkin
Feature: Context Scoping

  Scenario: Logger carries context
    Given a logger is created with context
    When logging an event
    Then the context is included in the log
    And child loggers inherit the context
```

### Pluggable Writers

Logs can be sent to different outputs.

```gherkin
Feature: Pluggable Writers

  Scenario: Logs written to console
    Given console writer is configured
    When logging an event
    Then the event is written to console

  Scenario: Logs written to HTTP endpoint
    Given HTTP writer is configured
    When logging an event
    Then the event is sent to the configured endpoint

  Scenario: Logs written to database
    Given database writer is configured
    When logging an event
    Then the event is stored in the database
```

### Level Filtering

Logs can be filtered by severity.

```gherkin
Feature: Level Filtering

  Scenario: Filter logs by level
    Given logging level is set to "warn"
    When logging debug or info messages
    Then those messages are not output
    And warn and error messages are output
```

### Zero-Cost Filtering

No performance impact when logging is disabled.

```gherkin
  Scenario: No logger configured
    Given no logger writer is configured
    When logging calls are made
    Then there is no runtime cost
    And no null checks are needed in calling code
```
