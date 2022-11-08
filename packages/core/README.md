# @kavach/core

Includes core components and type definitions used by the framework.

> Kavach - Protective Armour

## Logger

A minimalistic and extensible JSON logger. It offloads the actual log-writing task to writers.

The logger adds the following attributes to the logged data.

- logged_at: Timestamp of the log as ISO String
- running_on: Identifies where the logger was invoked from (server/browser)
- level: Logging level (error|warn|info|debug|trace)

## Logged Data

The logged data is expected to be provided as an object. The attributes of the object are merged with the base attributes before sending it to the writer.

Below are some examples assuming that the logger has been called on server side at 8 am on 2022-11-05

### String message input

```js
logger.info('foo')
```

This will be sent to the writer as

```jsonc
{
  "level": "info",
  "running_on": "server",
  "logged_at": "2022-11-05T08:00:00.000Z",
  "message": "foo"
}
```

### Object as input

```js
logger.info({ message: 'foo' })
```

This will be sent to the writer as

```jsonc
{
  "level": "info",
  "running_on": "server",
  "logged_at": "2022-11-05T08:00:00.000Z",
  "message": "foo"
}
```

### Object as input (including nested detail)

```js
logger.info({ message: 'foo', detail: { path: 'bar' } })
```

This will be sent to the writer as

```jsonc
{
  "level": "info",
  "running_on": "server",
  "logged_at": "2022-11-05T08:00:00.000Z",
  "message": "foo",
  "detail": { "path": "bar" }
}
```

Following LogWriters are included in this repo

- [x] [Supabase](../../adapters/supabase/README.md)

```bash
pnpm add @kavach/core @kavach/adapter-supabase
```

```js
import { getLogWriter } from '@kavach/adapter-supabase'
import { getLogger } from '@kavach/core'

const writer = getLogWriter(config, options)
const logger = getLogger(writer, options)
```
