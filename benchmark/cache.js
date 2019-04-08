'use strict';

const Benchmark = require('benchmark');
const benchmarks = require('beautify-benchmark');
const path = require('path');
const fs = require('fs');
const assert = require('assert');
const hessian = require('../');


const buf = fs.readFileSync(path.join(__dirname, 'buf.txt'));
const cache = new Map();

assert.deepEqual(hessian.decode(buf, '2.0', { classCache: cache }), hessian.decode(buf, '2.0'));
assert.deepEqual(hessian.decode(buf, '2.0', { classCache: cache }), hessian.decode(buf, '2.0'));
const suite = new Benchmark.Suite();

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
  .run({ async: false });

// Cache Benchmark
// node version: v8.9.0, date: Thu Nov 16 2017 13:26:18 GMT+0800 (CST)
// Starting...
// 2 tests completed.
//
// with cache    x 21,724 ops/sec ±2.01% (82 runs sampled)
// without cache x  8,523 ops/sec ±1.17% (89 runs sampled)
