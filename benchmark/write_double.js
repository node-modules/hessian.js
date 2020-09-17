'use strict';

const Benchmark = require('benchmark');
const benchmarks = require('beautify-benchmark');
const assert = require('assert');
const float32Test = require('../lib/utils').float32Test;

function writeFloat(val) {
  const buf = Buffer.allocUnsafe(4);
  buf.writeFloatBE(val, 0);
}

function writeDouble(val) {
  const buf = Buffer.allocUnsafe(8);
  buf.writeDoubleBE(val, 0);
}

function writeDoubleWithCheck(val) {
  if (float32Test(val)) {
    const buf = Buffer.allocUnsafe(4);
    buf.writeFloatBE(val, 0);
  } else {
    const buf = Buffer.allocUnsafe(8);
    buf.writeDoubleBE(val, 0);
  } 
}

const suite = new Benchmark.Suite();
suite
  .add('writeFloat', function() {
    writeFloat(19400447);
  })
  .add('writeDouble', function() {
    writeDouble(19400447);
  })
  .add('io.writeDoubleWithCheck not pass', function() {
    writeDoubleWithCheck(19400447);
  })
  .add('io.writeDoubleWithCheck pass', function() {
    writeDoubleWithCheck(19400448);
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
// node version: v14.4.0, date: Thu Sep 17 2020 16:57:13 GMT+0800 (中国标准时间)
// Starting...
// 4 tests completed.

// writeFloat                       x 13,350,278 ops/sec ±4.39% (80 runs sampled)
// writeDouble                      x 14,679,712 ops/sec ±2.88% (77 runs sampled)
// io.writeDoubleWithCheck not pass x 11,606,534 ops/sec ±3.54% (81 runs sampled)
// io.writeDoubleWithCheck pass     x 10,535,146 ops/sec ±2.61% (86 runs sampled)
