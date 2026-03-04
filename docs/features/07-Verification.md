# Verification

Verification features ensure the Learn site, documentation, and demos stay reliable across authentication platforms. Automated checks validate UX flows, role-based permissions, and integration health before publishing.

## Features

### Cross-Platform Smoke Tests

Automated suites confirm each supported platform works end-to-end.

```gherkin
Feature: Cross-Platform Smoke Tests

  Scenario: Supabase adapter passes smoke tests
    Given the smoke test runner targets the Supabase adapter
    When authentication, role switching, and API demos execute
    Then all checks complete without regressions
    And screenshots and logs are stored with the run summary

  Scenario: Firebase adapter passes smoke tests
    Given the smoke test runner targets the Firebase adapter
    When authentication, role switching, and API demos execute
    Then all checks complete without regressions
    And screenshots and logs are stored with the run summary
```

### Role Permission Matrix

Tests verify content visibility for every demo role.

```gherkin
Feature: Role Permission Matrix

  Scenario: Admin role sees privileged content
    Given the role-permission matrix test runs for the admin role
    When the protected pages are evaluated
    Then admin-only widgets are visible
    And audit entries record each access check

  Scenario: Viewer role is restricted
    Given the role-permission matrix test runs for the viewer role
    When the protected pages are evaluated
    Then admin-only widgets remain hidden
    And friendly guidance explains the restriction
```

### Performance Regression Guardrails

Performance budgets prevent slowdowns from shipping.

```gherkin
Feature: Performance Regression Guardrails

  Scenario: Lighthouse scores stay above target
    Given the Lighthouse regression suite runs for desktop and mobile
    When the report is generated
    Then performance, accessibility, best-practices, and SEO scores are at least 90
    And the delta from the last publish is recorded

  Scenario: Benchmark deviation triggers alert
    Given a benchmark dip exceeds the configured threshold
    When the regression suite finishes
    Then a verification alert is sent to the team channel
    And the publish pipeline is blocked until acknowledged
```

### Security Flow Validation

Security-focused tests confirm edge cases remain sealed.

```gherkin
Feature: Security Flow Validation

  Scenario: Token expiry flow is honored
    Given verification harness forces token expiry for an authenticated session
    When the next API call is issued
    Then the client refreshes the session or prompts re-authentication
    And audit logs record the refresh event

  Scenario: Invalid role is rejected
    Given verification harness injects an invalid role claim
    When the user navigates to a restricted page
    Then the response is a 403 with guidance to contact an administrator
    And no privileged data is leaked
```

### Documentation Integrity Checks

Ensures all documentation assets remain accessible and consistent.

```gherkin
Feature: Documentation Integrity Checks

  Scenario: llms manifest validates
    Given the verification suite spiders the documentation hub
    When it parses the llms.txt manifest
    Then every reference resolves with HTTP 200
    And missing entries are surfaced in the verification report

  Scenario: Search index remains fresh
    Given a new documentation build finishes
    When the verification suite inspects the search index
    Then it includes the latest markdown updates
    And stale entries return a soft warning with resolution steps
```

### Telemetry Assertions

Ensures observability signals continue to stream for demos.

```gherkin
Feature: Telemetry Assertions

  Scenario: API telemetry streams to audit logs
    Given demo API endpoints are hit during verification
    When audit logs are queried
    Then corresponding entries exist with proper metadata
    And insert attempts by anon and service roles succeed

  Scenario: Frontend events reach analytics sink
    Given frontend instrumentation emits demo events
    When the verification suite polls the analytics sink
    Then the events appear within the acceptable delay window
    And event schema matches the expected contract
```

### Publish Readiness Report

Summarizes verification outcomes for publishing stakeholders.

```gherkin
Feature: Publish Readiness Report

  Scenario: Verification report generated after test run
    Given all verification suites complete
    When the reporting step executes
    Then a consolidated report highlights pass/fail status, budgets, and remediation items
    And the publish checklist references this report before release
```
