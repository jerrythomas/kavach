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

## Caveats

- it does not handle the actual redirection or session management.
- it only returns the status code and the redirect path.
- it only checks if the session is set.
- it does not handle nested routes with different access configurations. for example /shared is open to all and /shared/user is open only to 'user'
