# Authorization

Access to routes and resources is controlled through declarative rules. Users can only access pages and APIs based on their authentication state and assigned roles.

## Features

### Protected Routes

Routes are protected by default, requiring authentication.

```gherkin
Feature: Protected Routes

  Scenario: Authenticated user accesses protected route
    Given the user is authenticated
    When the user visits a protected route
    Then access is granted

  Scenario: Unauthenticated user accesses protected route
    Given the user is not authenticated
    When the user visits a protected route
    Then the user is redirected to login
```

### Public Routes

Certain routes are explicitly allowed without authentication.

```gherkin
Feature: Public Routes

  Scenario: User accesses public route
    Given a route is marked as public
    When any user visits that route
    Then access is granted without authentication
```

### Role-Based Access Control

Role-scoped access controls ensure only permitted users reach protected areas.

```gherkin
Feature: Role-Based Access Control

  Scenario: User with correct role accesses route
    Given the user has role "admin"
    And the route requires role "admin"
    When the user visits that route
    Then access is granted

  Scenario: User without required role accesses route
    Given the user has role "user"
    And the route requires role "admin"
    When the user visits that route
    Then access is denied
    And the user is redirected to their role's home page
```

### Per-Role Home Pages

Different roles can have different landing pages. Most roles may share the same home page.

```gherkin
  Scenario: User redirected to role-specific home
    Given the user has role "moderator"
    When the user is not authorized for the requested route
    Then the user is redirected to the moderator home page
```

### Unauthorized Access Handling

Unauthorized access handling provides consistent responses for end users.

```gherkin
Feature: Unauthorized Access

  Scenario: Unauthenticated user redirected to login
   Given the user is not authenticated
    When accessing a protected route
    Then the user is redirected to the login page
     And an alert is shown to the user

  Scenario: Authenticated user lacks permission
    Given the user is authenticated but lacks required role
    When accessing a protected route
    Then the user is redirected to their role home or unauthorized page

  Scenario: API endpoint returns status code
    Given an API endpoint is accessed without authorization
    Then the response returns the appropriate HTTP status (401 or 403)
```

### Dynamic Home URL Resolution

After login, users can be redirected to a personalized URL derived from their session (e.g. `/[userSlug]`) instead of a fixed static path. `routes.home` can be an async function — it receives the session and returns a string. Because the function has full access to the session, conditional logic (e.g. admins go to `/platform`, regular users go to `/[slug]`) is expressed inside the function itself.

```gherkin
Feature: Dynamic Home URL Resolution

  Scenario: Authenticated user visiting login page is redirected to dynamic home
    Given routes.home is async (session) => "/" + session.user.user_metadata.slug
    And the authenticated user has user_metadata.slug "bob-kim"
    When the user visits the login page while authenticated
    Then the user is redirected to "/bob-kim"

  Scenario: Static home is used when routes.home is a string
    Given routes.home is "/home"
    When an authenticated user visits the login page
    Then the user is redirected to "/home"

  Scenario: Resolver can return different paths based on role
    Given routes.home returns "/platform" for admins and "/" + slug for others
    When an admin user is redirected to home
    Then the user is redirected to "/platform"

  Scenario: Resolver receives the current session
    Given routes.home is an async function
    When the resolver is invoked
    Then it receives the full session object

  Scenario: Resolver error falls back to static home
    Given routes.home is a function that throws
    When the resolver is called during a redirect
    Then the static fallback "/" is used
```
