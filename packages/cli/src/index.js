#!/usr/bin/env node
import { init } from './commands/init.js'
import { add } from './commands/add.js'

const [command, ...args] = process.argv.slice(2)

if (command === 'init') await init()
else if (command === 'add') await add(args[0])
else console.log('Usage: kavach <init|add auth-page|add routes>')
