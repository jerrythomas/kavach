# @kavach/adapter-supabase

Adapter for using supabase with kavach

## Usage

```bash
pnpm add kavach @kavach/adapter-supabase
```

## Configuration

Create the table below before using this adapter

```sql
create table if not exists logs (
  id                       uuid primary key default uuid_generate_v4()
, level                    varchar
, running_on               varchar
, logged_at                timestamp with time zone
, message                  text
, data                     jsonb
);
```
