# @kavach/logger

Loggers are essential for debugging and monitoring applications. They provide a way to capture information about the application's behavior and state. This information can be used to identify and fix issues, monitor performance, and track usage. The `@kavach/logger` package provides a minimalistic and extensible JSON logger that can be used in both server-side and client-side applications.

The logger is designed to be simple to use and easy to extend. It provides a set of base attributes that are added to the logged data before sending it to the writer. The logger offloads the actual log-writing task to writers, which can be customized to send the logs to different destinations.

## Usage

The following example demonstrates how to use the logger in a server or browser application:

```js
import { getLogger } from '@kavach/logger'

const writer = {
  write: (log) => {
    console.log(JSON.stringify(log))
  }
}

const logger = getLogger(writer)

logger.info('Hello, world!')
```

The `getLogger` function creates a new logger instance with the specified writer. The writer is an object with a `write` method that accepts a log object and writes it to the desired destination. In this example, the writer simply logs the log object to the console.

## Log Levels

The logger instance provides methods for logging messages at different levels: `error`, `warn`, `info`, `debug`, and `trace`. Each method accepts a message (string or an object) with additional data to be logged.

When the logger is initialized, you can configure the log level to control which messages are logged. By default, only `error` messages are logged. You can set the log level using the `options` attribute in getLogger method.

```js
const logger = getLogger(writer, { level: 'info' })
```

## Context

Logger also provides a `getContextLogger` method to create a new logger instance with shared context information. This is useful when you want to log messages with common attributes, such as the module or method name. This method returns a new logger instance with the shared context information merged with the base attributes. The new logger instance can be used to log messages with the shared context information.

The `context` attribute is used to store the context of the log. This is useful when you want to store some information that is common to all logs. For example, you might want to store some additional information say the package, module or method that the log was generated from. Since this can be nested, the getContextLogger method is provided to create a logger with the context already set.

Since this is an object it can contain any additional shared context information like request_id, user_id, etc.

You can also provide the root context information to the logger using the `context` attribute in the options.

```js
const rootlogger = getLogger(writer, { context: { module: 'foo' } })

rootlogger.info('modules scope')

function bar() {
  const logger = rootLogger.getContextLogger({ method: 'bar' })
  logger.info('function scope')
}

rootlogger.info('modules scope again')
```

## Log Object

| Attribute  | Description                                                   |
|------------|---------------------------------------------------------------|
| logged_at  | Timestamp of the log as ISO String                            |
| running_on | Identifies where the logger was invoked from (server/browser) |
| level      | Logging level (error|warn|info|debug|trace)                   |
| context    | Shared context information                                    |
| message    | The message to be logged                                      |
| data       | Additional data to be logged                                  |
| error      | Error information to be logged                                |

The log object is created by merging the base attributes with the logged data before sending it to the writer. The base attributes are `logged_at`, `running_on`, `level` and `context`. The logged data is expected to be provided as an object with the `message`, `data`, and `error` attributes. You can add additional attributes to the log object as needed as long as your writer can handle them.

Below are some examples assuming that the logger has been called on the server side at 8 am on 2022-11-05. The logger does not do any validation on the data structure it receives. It is up to the developer to ensure that the LogWriter will be able to handle the data appropriately.

The examples below assume that logger methods are called on the server hence the `running_on` attribute is set to `server`.

### String message input

```js
const logger = getLogger(writer, { level: 'info' })
logger.info('foo')
```

The data will be sent to writer as

```jsonc
{
  "level": "info",
  "running_on": "server",
  "logged_at": "2022-11-05T08:00:00.000Z",
  "context": {},
  "message": "foo"
}
```

### Object as input

```js
logger.info({ message: 'foo' })
```

This will be sent to the writer as

```json
{
  "level": "info",
  "running_on": "server",
  "logged_at": "2022-11-05T08:00:00.000Z",
  "message": "foo"
}
```

### Object as input (including nested detail)

```js
logger.info({ message: 'foo', data: { path: 'bar' } })
```

This will be sent to the writer as

```json
{
  "level": "info",
  "running_on": "server",
  "logged_at": "2022-11-05T08:00:00.000Z",
  "message": "foo",
  "data": { "path": "bar" }
}
```

## Table structure

Depending on how you intend to send data to the `logger`, create the appropriate data store.

For example, with the "supabase" writer you would need a table having the structure below:

```sql
create table if not exists public.logs(
  id                       uuid default uuid_generate_v4()
, level                    varchar
, running_on               varchar
, logged_at                timestamp with time zone
, message                  varchar
, context                  jsonb
, data                     jsonb
, error                    jsonb
, written_at               timestamp with time zone default now()
)
```

If you expect your data to contain additional attributes at same level as message, columns should be included to capture those attributes as well.
