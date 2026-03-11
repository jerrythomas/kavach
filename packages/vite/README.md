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

### `parseConfig(config)`

Parses and validates a Kavach configuration object.

### `templates`

Template strings for generated files (auth pages, data routes, etc).

## License

MIT © [Jerry Thomas](https://jerrythomas.name)
