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
  // node version: v8.5.0, date: Mon Oct 30 2017 12:22:20 GMT+0800 (CST)
  // Starting...
  // 2 tests completed.
  //
  // with cache    x 16,065 ops/sec ±1.46% (83 runs sampled)
  // without cache x  5,845 ops/sec ±1.69% (86 runs sampled)
