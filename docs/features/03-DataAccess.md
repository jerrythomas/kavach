# Data Access

Data operations are performed through a unified API that supports filtering, sorting, pagination, and file management across different platforms.

## Features

### Unified Request Handling

The handle function orchestrates session sync, route protection, and data/rpc endpoint handling based on configuration.

```gherkin
Feature: Unified Request Handling

  Scenario: Request flows through handle
    Given a request arrives at the server
    When the handle function processes it
    Then session is synchronized
    And route protection is applied

  Scenario: Data route handled when configured
    Given data route is configured as '/api/data'
    When a request to /api/data/users arrives
    And the user is authenticated
    Then CRUD operations are performed
    And JSON response is returned

  Scenario: Data route passthrough when not configured
    Given data route is NOT configured
    When a request to /api/data/users arrives
    Then the request passes through to resolve(event)

  Scenario: RPC route handled when configured
    Given RPC route is configured as '/api/rpc'
    When a request to /api/rpc/procedure arrives
    And the user is authenticated
    Then the procedure is invoked
    And response is returned

  Scenario: RPC route passthrough when not configured
    Given RPC route is NOT configured
    When a request to /api/rpc/procedure arrives
    Then the request passes through to resolve(event)

  Scenario: Request passes through without authentication
    Given the user is not authenticated
    When accessing a protected route
    Then the user is redirected to login
```

### Filter Data

Query data using operators like equals, greater than, less than, etc.

```gherkin
Feature: Data Filtering

  Scenario: Filter data with equals operator
    Given the user is authenticated
    When requesting data with filter "status eq 'active'"
    Then only records where status equals "active" are returned

  Scenario: Filter data with comparison operators
    Given the user is authenticated
    When requesting data with filter "age gte 18"
    Then only records where age is greater than or equal to 18 are returned

  Scenario: Filter data with in operator
    Given the user is authenticated
    When requesting data with filter "category in (a, b, c)"
    Then only records where category is in the list are returned
```

### Sort Results

Order data by specified fields.

```gherkin
Feature: Data Sorting

  Scenario: Sort data ascending
    Given the user is authenticated
    When requesting data sorted by "name asc"
    Then results are returned in alphabetical order

  Scenario: Sort data descending
    Given the user is authenticated
    When requesting data sorted by "created_at desc"
    Then results are returned in reverse chronological order
```

### Paginate Results

Retrieve data in chunks.

```gherkin
Feature: Data Pagination

  Scenario: Paginate data with limit and offset
    Given the user is authenticated
    When requesting data with limit 10 and offset 20
    Then returns 10 records starting from position 20
```

### Error Sanitization

Errors are sanitized before returning to clients.

```gherkin
Feature: Error Handling

  Scenario: Error response is sanitized
    Given a data operation fails
    Then sensitive information is removed
    And a safe error message is returned
```

### File Upload

Users can upload files to storage.

```gherkin
Feature: File Upload

  Scenario: User uploads a file
    Given the user is authenticated
    When uploading a file to storage
    Then the file is stored
    And returns the file reference
```

### File Download

Users can retrieve files from storage.

```gherkin
Feature: File Download

  Scenario: User downloads a file
    Given the user is authenticated
    And the file exists in storage
    When requesting to download the file
    Then the file content is returned
```

### File Delete

Users can remove files from storage.

```gherkin
Feature: File Delete

  Scenario: User deletes a file
    Given the user is authenticated
    And the file exists in storage
    When requesting to delete the file
    Then the file is removed from storage
```

### Call RPC

Invoke backend stored procedures or queue operations.

```gherkin
Feature: Call RPC

  Scenario: Invoke stored procedure with arguments
    Given the user is authenticated
    And a stored procedure "enqueue_job" exists
    When calling the procedure with payload '{"job":"process-report"}'
    Then the backend enqueues the requested job
    And returns a confirmation response

  Scenario: Receive data from RPC
    Given the user is authenticated
    And a stored procedure "get-monthly-summary" exists
    When calling the procedure with the required parameters
    Then the aggregated results from the procedure are returned
```
