# @kavach/adapter-supabase

Kavach adapter for [Supabase](https://supabase.com).

## Installation

```bash
bun add kavach @kavach/adapter-supabase
```

## Usage

```js
import { getAdapter } from '@kavach/adapter-supabase'
import { createClient } from '@supabase/supabase-js'

const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
const adapter = getAdapter(client)
```

## Auth modes

| Mode       | Mechanism                                 |
| ---------- | ----------------------------------------- |
| OAuth      | `signInWithOAuth` (redirects to provider) |
| Magic link | `signInWithOtp` (email OTP)               |
| Password   | `signInWithPassword` (email + password)   |

## Logging table (optional)

If you enable logging in `kavach.config.js`, create this table in Supabase:

```sql
create table if not exists public.logs (
  id          uuid default uuid_generate_v4(),
  level       varchar,
  running_on  varchar,
  logged_at   timestamp with time zone,
  message     varchar,
  context     jsonb,
  data        jsonb,
  error       jsonb,
  written_at  timestamp with time zone default now()
);
```
