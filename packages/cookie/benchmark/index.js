import { suite as parseSuite } from './parse.js'
import { suite as parseTopSuite } from './parse-top.js'

for (let dep in process.versions) {
	console.log('  %s@%s', dep, process.versions[dep])
}

parseSuite.run({ async: false })
parseTopSuite.run({ async: false })
