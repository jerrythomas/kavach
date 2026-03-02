# @rokkit/deflector

A simple and lightweight route deflector.

## Installation

```bash
npm install @rokkit/deflector
```

## Usage

```js
import { createDeflector } from '@rokkit/deflector'

const config = {
  rules: [
    { path: '/public', public: true },
    { path: '/private' },
    { path: '/admin', roles: 'admin' }
  ]
}

const deflector = createDeflector(config)

deflector.protect('/public') // returns {statusCode: 200}
deflector.protect('/private') // returns {statusCode: 401, redirect: '/auth'}

deflector.setSession({ user: { role: 'authenticated' } })
deflector.protect('/public') // returns {statusCode: 200}
deflector.protect('/private') // returns {statusCode: 200}

deflector.setSession({ user: { role: 'admin' } })
deflector.protect('/public') // returns {statusCode: 200}
deflector.protect('/private') // returns {status: 200}
deflector.protect('/admin') // returns {status: 200}
```

## Features

### Default Configuration

Out-of-the-box support for common routes:

- home: '/'
- login: '/auth'
- logout: '/logout'
- session: '/auth/session'
- unauthorized: defaults to null
- endpoints: ['/api', '/data']

### Configuration driven Role-Based Access

- All routes are protected by default.
- Define custom routes and rules.
- Define rules for different paths and roles.
- Nest specific role access under more generic access. For example, 'user' role access can be nested under a generic `'*'`.
- Logs and excludes rules with errors.
- Identifies and logs redundant rules.

## Examples

### Configuring Rules

```js
const options = {
  rules: [
    { path: '/blog', public: true },
    { path: '/user', roles: ['authenticated'] },
    { path: '/other', roles: 'other' }
  ]
}
const deflector = createDeflector(options)
```

### Customizing App routes

```js
const config = {
  app: {
    home: '/home',
    login: '/login',
    logout: '/logout'
  },
  rules: [
    { path: '/auth' },
    { path: '/home/about' },
    { path: '/public', public: true }
  ]
}

const deflector = createDeflector(options)
```

## Caveats

- It does not handle actual redirection or session management.
- It only returns the status code and the redirect path for page routes.
- It only checks if the session includes a user role which is used for access control.

This is used internally under the hood by [@kavach/svelte](../svelte)
