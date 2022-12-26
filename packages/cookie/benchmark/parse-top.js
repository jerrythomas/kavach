/**
 * Module dependencies.
 */

import pkg from 'benchmark'
import { add, log } from 'beautify-benchmark'
import { topSites } from './top-sites.js'
import * as cookie from '../src/index.js'

const { Suite } = pkg
/**
 * Globals for benchmark.js
 */

global.cookie = cookie

export const suite = new Suite()

Object.keys(topSites).forEach(function (domain) {
	suite.add({
		name: 'parse ' + domain,
		minSamples: 100,
		fn: 'let val = cookie.parse(' + JSON.stringify(topSites[domain]) + ')'
	})
})

suite.on('start', function onCycle(event) {
	process.stdout.write('  cookie.parse - top sites\n\n')
})

suite.on('cycle', function onCycle(event) {
	add(event.target)
})

suite.on('complete', function onComplete() {
	log()
})
