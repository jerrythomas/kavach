# @kavach/adapter-supabase

Adapter for using supabase with kavach

## Usage

```bash
pnpm add kavach @kavach/adapter-supabase
```

## Configuration

Create the table below before using this adapter

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
