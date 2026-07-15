# @kavach/vite

Vite plugin for the Kavach authentication framework.

## Installation

```bash
npm install @kavach/vite
# or
bun add @kavach/vite
```

## Usage

Add the plugin to your `vite.config.js`:

```js
import { sveltekit } from '@sveltejs/kit/vite'
import { kavach } from '@kavach/vite'

export default {
  plugins: [kavach(), sveltekit()]
}
```

## What it does

The Kavach Vite plugin provides virtual modules that are generated from your `kavach.config.js`:

- `$kavach/auth` - Authentication client instance
- `$kavach/config` - Parsed configuration
- `$kavach/routes` - Route protection rules
- `$kavach/providers` - Authentication providers

These modules are automatically generated at build time based on your configuration.

## TypeScript declarations

The plugin also generates an ambient declaration file so `svelte-check`/`tsc`
resolve the virtual modules (`$kavach/auth`, `$kavach/config`, `$kavach/routes`,
`$kavach/providers`) with no hand-written shim.

- **Default location:** `src/kavach.d.ts`. SvelteKit's generated `tsconfig`
  already includes `src/**/*.ts`, so no `tsconfig` change is needed.
- **Option `dts`:** point it elsewhere (`kavach({ dts: 'types/kavach.d.ts' })`)
  or turn generation off (`kavach({ dts: false })`).

The file is (re)written on `vite dev` and `vite build`, and only when its
content changes. **`svelte-kit sync` and `svelte-check` do not run Vite plugins**,
so they do not generate it on their own — run the dev server or a build once and
the file appears (and stays, since it is gitignored). For a cold CI type-check
with no prior build, run `vite build` before `svelte-check`.

### Migrating from a hand-written shim

If you previously kept a hand-written `src/kavach.d.ts` (or similar) to type
these modules:

1. Upgrade `@kavach/vite`.
2. Delete the hand-written file.
3. Add `src/kavach.d.ts` to `.gitignore`.
4. Run `vite dev` or `vite build` once — the file regenerates.

## Configuration

The plugin looks for `kavach.config.js` in your project root. You can specify a custom path:

```js
kavach({ configPath: './config/kavach.config.js' })
```

## API

### `kavach(options?)`

Creates a Vite plugin instance.

**Options:**

- `configPath` (string, optional) - Path to kavach config file. Defaults to `kavach.config.js` in project root.
- `dts` (string | false, optional) - Path for the generated TypeScript declaration file, relative to project root. Defaults to `src/kavach.d.ts`. Set to `false` to disable declaration generation.

### `parseConfig(config)`

Parses and validates a Kavach configuration object.

### `templates`

Template strings for generated files (auth pages, data routes, etc).

## License

MIT © [Jerry Thomas](https://jerrythomas.name)
