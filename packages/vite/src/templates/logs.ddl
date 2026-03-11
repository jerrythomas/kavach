create schema if not exists audit;
create table if not exists audit.logs
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

grant usage on schema audit to anon, service_role;

grant select, insert on audit.logs to anon;
grant select, insert on audit.logs to service_role;

revoke delete, update on audit.logs from anon;
revoke delete, update on audit.logs from service_role;
revoke delete, update on audit.logs from public;
