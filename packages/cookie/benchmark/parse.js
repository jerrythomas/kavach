/**
 * Module dependencies.
 */

import pkg from 'benchmark'
import { add, log } from 'beautify-benchmark'
import * as cookie from '../src/index.js'

const { Suite } = pkg
/**
 * Globals for benchmark.js
 */

global.cookie = cookie

export const suite = new Suite()

suite.add({
	name: 'simple',
	minSamples: 100,
	fn: 'let val = cookie.parse("foo=bar")'
})

suite.add({
	name: 'decode',
	minSamples: 100,
	fn: 'let val = cookie.parse("foo=hello%20there!")'
})

suite.add({
	name: 'unquote',
	minSamples: 100,
	fn: 'let val = cookie.parse("foo=\\"foo bar\\"")'
})

suite.add({
	name: 'duplicates',
	minSamples: 100,
	fn:
		'let val = cookie.parse(' +
		JSON.stringify(gencookies(2) + '; ' + gencookies(2)) +
		')'
})

suite.add({
	name: '10 cookies',
	minSamples: 100,
	fn: 'let val = cookie.parse(' + JSON.stringify(gencookies(10)) + ')'
})

suite.add({
	name: '100 cookies',
	minSamples: 100,
	fn: 'let val = cookie.parse(' + JSON.stringify(gencookies(100)) + ')'
})

suite.on('start', function onCycle() {
	process.stdout.write('  cookie.parse - generic\n\n')
})

suite.on('cycle', function onCycle(event) {
	add(event.target)
})

suite.on('complete', function onComplete() {
	log()
})

// suite.run({ async: false })

function gencookies(num) {
	let str = ''

	for (let i = 0; i < num; i++) {
		str += '; foo' + i + '=bar'
	}

	return str.slice(2)
}
