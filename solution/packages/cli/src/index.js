#!/usr/bin/env node
import { init } from './commands/init.js'

const [command, ...args] = process.argv.slice(2)

if (command === 'init') await init()
else console.log('Usage: kavach <init|add auth-page|add routes>')
