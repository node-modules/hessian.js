'use strict';

var Benchmark = require('benchmark');
var benchmarks = require('beautify-benchmark');
var path = require('path');
var fs = require('fs');
var assert = require('assert');
var hessian = require('../');


var buf = fs.readFileSync(path.join(__dirname, 'buf.txt'));
var cache = new Map();

assert.deepEqual(hessian.decode(buf, '2.0', { classCache: cache }), hessian.decode(buf, '2.0'));
assert.deepEqual(hessian.decode(buf, '2.0', { classCache: cache }), hessian.decode(buf, '2.0'));
var suite = new Benchmark.Suite();

suite

.add('with cache', function() {
  hessian.decode(buf, '2.0', { classCache: cache });
})
.add('without cache', function() {
  hessian.decode(buf, '2.0');
})

.on('cycle', function(event) {
  benchmarks.add(event.target);
})
.on('start', function(event) {
  console.log('\n  Cache Benchmark\n  node version: %s, date: %s\n  Starting...',
    process.version, Date());
})
.on('complete', function done() {
  benchmarks.log();
})
.run({ 'async': false });

// Cache Benchmark
// node version: v8.9.0, date: Thu Nov 16 2017 13:30:47 GMT+0800 (CST)
// Starting...
// 2 tests completed.
//
// with cache    x 19,947 ops/sec ±3.81% (80 runs sampled)
// without cache x  8,360 ops/sec ±1.38% (87 runs sampled)
