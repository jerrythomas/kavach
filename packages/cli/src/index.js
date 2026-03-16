#!/usr/bin/env node
import { init } from './commands/init.js'
import { add } from './commands/add.js'
import { doctor } from './commands/doctor.js'

const [command, ...args] = process.argv.slice(2)

if (command === 'init') await init()
else if (command === 'add') await add(args[0])
else if (command === 'doctor') await doctor(args.includes('--fix'))
else console.log('Usage: kavach <init|add auth-page|add routes|doctor [--fix]>')
