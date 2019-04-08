'use strict';

const assert = require('assert');
const Benchmark = require('benchmark');
const benchmarks = require('beautify-benchmark');
const suite = new Benchmark.Suite();
const hessian = require('../');

const buf = new Buffer('T6djb20uYWxpcGF5LnRlc3QuVGVzdE9iaqEBYgh0ZXN0T2JqMgRuYW1lBWZpZWxkCHRlc3RFbnVtCXRlc3RFbnVtMgJicwVsaXN0MQVsaXN0MgVsaXN0MwVsaXN0NAVsaXN0NQRtYXAxBG1hcDIEbWFwMwRtYXA0BG1hcDVvkFRPrGNvbS5hbGlwYXkudGVzdC5zdWIuVGVzdE9iajKSBG5hbWUKZmluYWxGaWVsZG+RA3h4eAN4eHgIdGVzdG5hbWUFeHh4eHhPqGNvbS5hbGlwYXkudGVzdC5UZXN0RW51bZEEbmFtZW+SAUJWdAAZW2NvbS5hbGlwYXkudGVzdC5UZXN0RW51bW4Cb5IBQm+SAUN6JAIAAQdWdAAOamF2YS51dGlsLkxpc3RuAm+SAUFvkgFCenaRks/hz+B2kZJvkQNhYWEDeHh4b5EDYmJiA3h4eHaRkgN4eHgDeXl5dpGSJAIAAQckAgABBk3/4W+SAUJ6TdQIO8/gek16TQN4eHgDeXl5ek0EMjAxNyQCAAEGeg==', 'base64');
const options = {
  classCache: new Map(),
};
const classCache = new Map();
classCache.enableCompile = true;
const options_1 = {
  classCache,
};

const r1 = hessian.decode(buf, '2.0');
const r2 = hessian.decode(buf, '2.0', options);
const r3 = hessian.decode(buf, '2.0', options_1);

assert.deepEqual(r1, r2);
assert.deepEqual(r1, r3);

suite
  .add('hessian.decode without classCache', function() {
    hessian.decode(buf, '2.0');
  })
  .add('hessian.decode with classCache', function() {
    hessian.decode(buf, '2.0', options);
  })
  .add('hessian.decode with classCache + compile', function() {
    hessian.decode(buf, '2.0', options_1);
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
// node version: v8.9.4, date: Thu Feb 01 2018 21:17:48 GMT+0800 (CST)
// Starting...
// 3 tests completed.

// hessian.decode without classCache        x 34,876 ops/sec ±1.81% (84 runs sampled)
// hessian.decode with classCache           x 59,757 ops/sec ±1.35% (85 runs sampled)
// hessian.decode with classCache + compile x 66,592 ops/sec ±1.29% (84 runs sampled)
