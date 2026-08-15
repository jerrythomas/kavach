import { resolve } from 'node:path'
import { generateDeclarations } from '../src/generate.js'
import { writeDeclarationFile } from '../src/index.js'

const out = resolve(process.cwd(), process.argv[2] ?? 'src/kavach.d.ts')
writeDeclarationFile(out, generateDeclarations())
