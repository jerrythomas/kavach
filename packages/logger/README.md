# @kavach/logger

A minimalistic and extensible JSON logger. It offloads the actual log-writing task to writers.

The logger adds the following attributes to the logged data.

- logged_at: Timestamp of the log as ISO String
- running_on: Identifies where the logger was invoked from (server/browser)
- level: Logging level (error|warn|info|debug|trace)

## Logged Data

The logged data is expected to be provided as an object. The attributes of the object are merged with the base attributes before sending it to the writer.

Below are some examples assuming that the logger has been called on the server side at 8 am on 2022-11-05. The logger does not do any validation on the data structure it receives. It is up to the developer to ensure that the LogWriter will be able to handle the data appropriately.

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
, data                     jsonb
, written_at               timestamp with time zone default now()
)
```

if you expect your data to contain additional attributes at same level as message, columns should be included to capture those attributes as well.
