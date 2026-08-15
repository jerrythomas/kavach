import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { emitDts } from 'svelte2tsx'

const require = createRequire(import.meta.url)
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

await emitDts({
	declarationDir: path.join(root, 'dist'),
	libRoot: path.join(root, 'src'),
	tsconfig: path.join(root, 'tsconfig.build.json'),
	svelteShimsPath: require.resolve('svelte2tsx/svelte-shims-v4.d.ts')
})
