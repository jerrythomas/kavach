# Platform-Aware Configuration

Configure authentication based on the selected platform's capabilities.

## Features

### Platform Selection

Select from available auth platforms: Supabase, Firebase, Auth0, Amplify, Convex.

```gherkin
Feature: Platform Selection

  Scenario: User selects Supabase
    Given the CLI is initializing
    When the user selects "Supabase"
    Then display supported features: OAuth, Password, Magic Link, Data, RPC, Logging

  Scenario: User selects Firebase
    Given the CLI is initializing
    When the user selects "Firebase"
    Then display supported features: OAuth, Password, Magic Link
    And display unsupported features: Data endpoints, RPC, Logging
```

| Scenario | Status |
|----------|--------|
| User selects Supabase | - TO DO - |
| User selects Firebase | - TO DO - |

### Capability-Aware Prompts

CLI prompts adapt based on platform capabilities.

```gherkin
Feature: Capability-Aware Configuration

  Scenario: Platform supports data operations
    Given the selected platform supports data
    When configuring kavach
    Then prompt for data route path
    And generate data endpoint files

  Scenario: Platform does NOT support data operations
    Given the selected platform is Firebase
    When configuring kavach
    Then disable data route option
    And explain that data operations are not supported

  Scenario: Platform supports RPC
    Given the selected platform supports RPC (e.g., Supabase)
    When configuring kavach
    Then prompt for RPC route path
    And generate RPC endpoint files

  Scenario: Platform does NOT support RPC
    Given the selected platform is Auth0
    When configuring kavach
    Then disable RPC route option
    And explain that RPC is not supported

  Scenario: Platform supports logging
    Given the selected platform supports logging (e.g., Supabase)
    When configuring kavach
    Then prompt for log table name
    And provide DDL instructions to create the table

  Scenario: Platform does NOT support logging
    Given the selected platform is Amplify
    When configuring kavach
    Then disable logging option
    And explain that logging is not supported
    And suggest alternative (e.g., use platform's native analytics)
```

| Scenario | Status |
|----------|--------|
| Platform supports data operations | - TO DO - |
| Platform does NOT support data operations | - TO DO - |
| Platform supports RPC | - TO DO - |
| Platform does NOT support RPC | - TO DO - |
| Platform supports logging | - TO DO - |
| Platform does NOT support logging | - TO DO - |

### DDL Generation

Generate database schema instructions for platforms that require tables.

```gherkin
Feature: DDL Generation

  Scenario: User configures logging for Supabase
    Given the user selected Supabase
    And the user enabled logging
    And the user specified table name "audit_logs"
    When initialization completes
    Then display SQL to create the audit_logs table
    And explain how to run the SQL in Supabase dashboard

  Scenario: User specifies custom table name
    Given the user selected Supabase
    And the user enabled logging
    And the user specified table name "my_custom_logs"
    When DDL is generated
    Then use "my_custom_logs" in the table creation SQL

  Scenario: User does NOT configure logging
    Given the user selected Supabase
    And the user did NOT enable logging
    When initialization completes
    Then do not display any DDL instructions
```

| Scenario | Status |
|----------|--------|
| User configures logging for Supabase | - TO DO - |
| User specifies custom table name | - TO DO - |
| User does NOT configure logging | - TO DO - |

### Provider Filtering

Filter available auth providers based on platform support.

```gherkin
Feature: Provider Filtering

  Scenario: Platform supports magic link
    Given the selected platform supports magic link
    When displaying provider options
    Then include "Magic Link" as available option

  Scenario: Platform does NOT support magic link
    Given the selected platform is Amplify
    When displaying provider options
    Then disable "Magic Link" option
    And show tooltip: "Not supported by Amplify"

  Scenario: Platform supports passkey
    Given the selected platform supports passkey
    When displaying provider options
    Then include "Passkey" as available option

  Scenario: Platform does NOT support passkey
    Given the selected platform is Auth0
    When displaying provider options
    Then disable "Passkey" option
    And show tooltip: "Not supported by Auth0"
```

| Scenario | Status |
|----------|--------|
| Platform supports magic link | - TO DO - |
| Platform does NOT support magic link | - TO DO - |
| Platform supports passkey | - TO DO - |
| Platform does NOT support passkey | - TO DO - |

### Configuration Validation

Warn users about incompatible configurations.

```gherkin
Feature: Configuration Validation

  Scenario: User manually edits config to unsupported feature
    Given the user configured Firebase adapter
    When the user adds "dataRoute" to kavach.config.js
    And the CLI validates the config
    Then display warning: "Data route configured but not supported by Firebase"

  Scenario: Adapter supports all configured features
    Given the user configured Supabase adapter
    And the user configured data, RPC, and logging
    When the CLI validates the config
    Then display success: "All configured features are supported by Supabase"
```

| Scenario | Status |
|----------|--------|
| User manually edits config to unsupported feature | - TO DO - |
| Adapter supports all configured features | - TO DO - |

## Platform Capability Reference

| Capability | Supabase | Firebase | Auth0 | Amplify | Convex |
|------------|:--------:|:--------:|:-----:|:-------:|:------:|
| **data** (CRUD) | ✅ | ❌ | ❌ | ❌ | ❌ |
| **rpc** (Procedures) | ✅ | ❌ | ❌ | ❌ | ❌ |
| **logging** (Audit) | ✅ | ❌ | ❌ | ❌ | ❌ |
| **magic** (Passwordless) | ✅ | ✅ | ✅ | ❌ | ❌ |
| **oauth** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **password** | ✅ | ✅ | ✅ | ✅ | ❌ |
| **passkey** (WebAuthn) | ✅ | ✅ | ❌ | ❌ | ❌ |

### Notes by Platform

- **Supabase**: Wraps supabase sdk to provide data endpoints for CRUD, and rpc endpoints for stored procedures, writes to configurable `logs` table (DDL required)
- **Firebase**: Uses Firebase Auth directly, no custom data layer, use Firebase Analytics for logging
- **Auth0**: Uses Auth0 management API, no custom data layer
- **Amplify**: Uses Amplify Auth, no custom data layer
- **Convex**: data handled directly via Convex functions (no separate endpoint)
