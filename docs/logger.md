# Logger

Logger (using Supabase) requires the following table for logging into database.

```sql
create table if not exists logs
(
  id                       uuid not null primary key default uuid_generate_v4()
, level                    varchar
, running_on               varchar
, logged_at                timestamp without time zone
, message                  varchar
, path                     varchar
, module                   varchar
, method                   varchar
, data                     jsonb
, error                    jsonb
, written_at               timestamp without time zone not null default now()
);

create index if not exists logs_idx1 on logs (logged_at);
create index if not exists logs_idx1 on logs (module);
```
