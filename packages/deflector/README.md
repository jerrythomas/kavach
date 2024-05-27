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
  rules: [{ path: '/public', public: true }, { path: '/private' }]
}
const deflector = createDeflector(config)

deflector.protect('/private') // returns {statusCode: 401, redirect: '/auth'}

deflector.setSession({ user: { role: 'authenticated' } })
deflector.protect('/private') // returns {statusCode: 200}
```

## Features

- [x] default configuration for app specific endpoints
  - home: '/'
  - login: '/auth'
  - logout: '/logout'
  - session: '/auth/session'
  - unauthorized: defaults to null
  - endpoints: ['/api', '/data']
- [x] All routes are protected by default
- [x] login route is accessible when user is logged out
- [x] session route is used for session management and is accessible always
- [x] Additional routes can be configured using rules
  - path
  - public
  - roles
- [x] Nest specific role access under more generic access. For example 'user' role access can be path under a generic '\*' role.

## Caveats

- it does not handle the actual redirection or session management.
- it only returns the status code and the redirect path.
- it only checks if the session is set.
