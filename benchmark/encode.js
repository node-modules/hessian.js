/**!
 * hessian.js - benchmark/encode.js
 *
 * Copyright(c) fengmk2 and other contributors.
 * MIT Licensed
 *
 * Authors:
 *   fengmk2 <fengmk2@gmail.com> (http://fengmk2.github.com)
 */

'use strict';

/**
 * Module dependencies.
 */

var ByteBuffer = require('byte');
var Benchmark = require('benchmark');
var benchmarks = require('beautify-benchmark');
var java = require('js-to-java');
var hessian = require('../');

var suite = new Benchmark.Suite();

var simpleObject = {
  $class: 'com.hessiantest.org.MockRequest',
  $: {
    id: 123,
    name: 'getData',
    args: [1, "name", "xxx1231231231231xxx123"]
  }
};

var complexObject = {
  $class: 'com.hessiantest.org.MockRequest',
  $: {
    id: 123,
    name: 'getData',
    args: [1, "name", "xxx1231231231231xxx123"],
    conn: {
      $class: 'com.hessiantest.org.MockRequestConnection',
      $: {
        ctx: java.long(1024)
      }
    }
  }
};

suite

.add('hessian1 encode: number', function() {
  hessian.encode(1, '1.0');
})
.add('hessian2 encode: number', function() {
  hessian.encode(1, '2.0');
})

.add('hessian1 encode: date', function() {
  hessian.encode(new Date(), '1.0');
})
.add('hessian2 encode: date', function() {
  hessian.encode(new Date(), '2.0');
})

.add('hessian1 encode: long', function() {
  hessian.encode(java.long(300), '1.0');
})
.add('hessian2 encode: long', function() {
  hessian.encode(java.long(300), '2.0');
})

.add('hessian1 encode: string', function() {
  hessian.encode('xxx1231231231231xxx123', '1.0');
})
.add('hessian2 encode: string', function() {
  hessian.encode('xxx1231231231231xxx123', '2.0');
})

.add('hessian1 encode: [1, 2, 3]', function() {
  hessian.encode([1, 2, 3], '1.0');
})
.add('hessian2 encode: [1, 2, 3]', function() {
  hessian.encode([1, 2, 3], '2.0');
})
.add('hessian1 encode array', function() {
  hessian.encode([1, "name", "xxx1231231231231xxx123"], '1.0');
})
.add('hessian2 encode array', function() {
  hessian.encode([1, "name", "xxx1231231231231xxx123"], '2.0');
})

.add('hessian1 encode: simple object', function() {
  hessian.encode(simpleObject, '1.0');
})
.add('hessian2 encode: simple object', function() {
  hessian.encode(simpleObject, '2.0');
})

.add('hessian1 encode: complex object', function() {
  hessian.encode(complexObject, '1.0');
})
.add('hessian2 encode: complex object', function() {
  hessian.encode(complexObject, '2.0');
})

.on('cycle', function(event) {
  benchmarks.add(event.target);
})
.on('start', function(event) {
  console.log('\n  node version: %s, date: %s\n  Starting...', process.version, Date());
})
.on('complete', function done() {
  benchmarks.log();
})
.run({ 'async': false });

// node version: v0.11.12, date: Tue May 13 2014 10:30:18 GMT+0800 (CST)
// Starting...
// 16 tests completed.
//
// hessian1 encode: number         x 1,262,878 ops/sec ±10.80% (74 runs sampled)
// hessian2 encode: number         x 1,816,722 ops/sec ±2.34% (92 runs sampled)
// hessian1 encode: date           x   766,202 ops/sec ±3.90% (90 runs sampled)
// hessian2 encode: date           x   673,284 ops/sec ±4.78% (83 runs sampled)
// hessian1 encode: long           x   650,132 ops/sec ±1.48% (96 runs sampled)
// hessian2 encode: long           x   636,692 ops/sec ±3.49% (88 runs sampled)
// hessian1 encode: string         x   804,401 ops/sec ±6.48% (79 runs sampled)
// hessian2 encode: string         x   967,111 ops/sec ±3.15% (88 runs sampled)
// hessian1 encode: [1, 2, 3]      x   525,540 ops/sec ±2.36% (92 runs sampled)
// hessian2 encode: [1, 2, 3]      x   623,072 ops/sec ±2.27% (97 runs sampled)
// hessian1 encode array           x   318,811 ops/sec ±8.70% (82 runs sampled)
// hessian2 encode array           x   396,659 ops/sec ±3.12% (92 runs sampled)
// hessian1 encode: simple object  x   101,458 ops/sec ±9.30% (67 runs sampled)
// hessian2 encode: simple object  x   132,938 ops/sec ±3.23% (89 runs sampled)
// hessian1 encode: complex object x    90,243 ops/sec ±2.08% (93 runs sampled)
// hessian2 encode: complex object x    80,702 ops/sec ±5.94% (86 runs sampled)
