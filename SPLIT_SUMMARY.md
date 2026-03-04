# Package Split: @kavach/cli → @kavach/cli + @kavach/vite

## Summary

Successfully split `solution/packages/cli` into two separate packages:
- `@kavach/cli` - CLI for scaffolding Kavach into SvelteKit projects
- `@kavach/vite` - Vite plugin for Kavach authentication framework

## Changes Made

### New Package: @kavach/vite

Created `solution/packages/vite/` with:

**Source Files:**
- `src/index.js` - Main Vite plugin (formerly `vite.js`)
- `src/config.js` - Configuration parsing and validation
- `src/generate.js` - Virtual module generation
- `src/templates.js` - Template file loading
- `src/templates/` - Template files (auth pages, data routes, etc.)

**Test Files:**
- `spec/vite.spec.js` - Vite plugin tests
- `spec/config.spec.js` - Config parsing tests
- `spec/generate.spec.js` - Module generation tests

**Exports:**
- `kavach(options)` - Vite plugin factory function
- `parseConfig(config)` - Config parser
- `templates` - Template strings

**Dependencies:**
- `magicast` - AST manipulation
- Peer dependency: `vite >= 5.0.0`

### Updated Package: @kavach/cli

**Removed Files:**
- `src/vite.js`
- `src/config.js`
- `src/generate.js`
- `src/templates.js`
- `src/templates/` directory
- `spec/vite.spec.js`
- `spec/config.spec.js`
- `spec/generate.spec.js`

**Updated Files:**
- `package.json` - Added `@kavach/vite` as workspace dependency
- `src/commands/init.js` - Import `parseConfig` from `@kavach/vite`
- `src/commands/add.js` - Import `parseConfig` from `@kavach/vite`
- `src/generators.js` - Import `templates` from `@kavach/vite`
- `src/patchers.js` - Updated import path from `@kavach/cli/vite` to `@kavach/vite`
- `spec/patchers.spec.js` - Updated test expectations for new import path

**Remaining Files:**
- CLI command implementations (`init`, `add`)
- Prompt configuration
- File system utilities
- Code patchers (vite.config.js, hooks, layout, env)
- Generators (config file, auth page, data route)

## Import Changes

### Before
```js
import { kavach } from '@kavach/cli/vite'
```

### After
```js
import { kavach } from '@kavach/vite'
```

## Test Results

All tests pass for both packages:
- `@kavach/cli`: 25 tests passing
- `@kavach/vite`: 23 tests passing
- **Total: 48 tests passing, 0 failures**

## Benefits

1. **Separation of Concerns**: Vite plugin logic is now isolated from CLI scaffolding
2. **Reusability**: `@kavach/vite` can be used independently without CLI
3. **Cleaner Dependencies**: CLI no longer has `vite` as peer dependency
4. **Better Modularity**: Each package has a single, focused responsibility
5. **Easier Maintenance**: Changes to Vite plugin don't affect CLI and vice versa

## Usage

### For End Users (via CLI)
```bash
bunx @kavach/cli init
# Automatically installs and configures @kavach/vite
```

### For Direct Vite Plugin Usage
```bash
bun add @kavach/vite
```

```js
// vite.config.js
import { kavach } from '@kavach/vite'
import { sveltekit } from '@sveltejs/kit/vite'

export default {
  plugins: [kavach(), sveltekit()]
}
```

## Migration Notes

Existing projects using `@kavach/cli/vite` will need to:
1. Install `@kavach/vite` as a dependency
2. Update import in `vite.config.js` from `@kavach/cli/vite` to `@kavach/vite`

The CLI's `init` command automatically handles this for new projects.
