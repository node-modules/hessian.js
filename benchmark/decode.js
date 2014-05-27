/**!
 * hessian.js - benchmark/decode.js
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

var simpleObjectBuf1 = hessian.encode(simpleObject, '1.0');
var simpleObjectBuf2 = hessian.encode(simpleObject, '2.0');

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

var complexObjectBuf1 = hessian.encode(complexObject, '1.0');
var complexObjectBuf2 = hessian.encode(complexObject, '1.0');

var number1Buf1 = hessian.encode(1, '1.0');
var number1Buf2 = hessian.encode(1, '2.0');

var dateBuf1 = hessian.encode(new Date(), '1.0');
var dateBuf2 = hessian.encode(new Date(), '2.0');

var longBuf1 = hessian.encode(java.long(300), '1.0');
var longBuf2 = hessian.encode(java.long(300), '2.0');

var stringBuf1 = hessian.encode('xxx1231231231231xxx123', '1.0');
var stringBuf2 = hessian.encode('xxx1231231231231xxx123', '2.0');

var arrBuf1 = hessian.encode([1, 2, 3], '1.0');
var arrBuf2 = hessian.encode([1, 2, 3], '2.0');

var arrObjectBuf1 = hessian.encode([1, "name", "xxx1231231231231xxx123"], '1.0');
var arrObjectBuf2 = hessian.encode([1, "name", "xxx1231231231231xxx123"], '2.0');

suite

.add('hessian1 decode: number', function() {
  hessian.decode(number1Buf1, '1.0');
})
.add('hessian2 decode: number', function() {
  hessian.decode(number1Buf2, '2.0');
})

.add('hessian1 decode: date', function() {
  hessian.decode(dateBuf1, '1.0');
})
.add('hessian2 decode: date', function() {
  hessian.decode(dateBuf2, '2.0');
})

.add('hessian1 decode: long', function() {
  hessian.decode(longBuf1, '1.0');
})
.add('hessian2 decode: long', function() {
  hessian.decode(longBuf2, '2.0');
})

.add('hessian1 decode: string', function() {
  hessian.decode(stringBuf1, '1.0');
})
.add('hessian2 decode: string', function() {
  hessian.decode(stringBuf2, '2.0');
})

.add('hessian1 decode: [1, 2, 3]', function() {
  hessian.decode(arrBuf1, '1.0');
})
.add('hessian2 decode: [1, 2, 3]', function() {
  hessian.decode(arrBuf2, '2.0');
})
.add('hessian1 decode array', function() {
  hessian.decode(arrObjectBuf1, '1.0');
})
.add('hessian2 decode array', function() {
  hessian.decode(arrObjectBuf2, '2.0');
})

.add('hessian1 decode: simple object', function() {
  hessian.decode(simpleObjectBuf1, '1.0');
})
.add('hessian2 decode: simple object', function() {
  hessian.decode(simpleObjectBuf2, '2.0');
})

.add('hessian1 decode: complex object', function() {
  hessian.decode(complexObjectBuf1, '1.0');
})
.add('hessian2 decode: complex object', function() {
  hessian.decode(complexObjectBuf2, '2.0');
})

.on('cycle', function(event) {
  benchmarks.add(event.target);
})
.on('start', function(event) {
  console.log('\n  Hessian Decode Benchmark\n  node version: %s, date: %s\n  Starting...',
    process.version, Date());
})
.on('complete', function done() {
  benchmarks.log();
})
.run({ 'async': false });

// node version: v0.11.12, date: Tue May 13 2014 10:37:32 GMT+0800 (CST)
// Starting...
// 16 tests completed.
//
// hessian1 decode: number         x 4,651,641 ops/sec ±6.29% (81 runs sampled)
// hessian2 decode: number         x 5,898,706 ops/sec ±0.95% (93 runs sampled)
// hessian1 decode: date           x 3,014,952 ops/sec ±0.96% (98 runs sampled)
// hessian2 decode: date           x 2,221,661 ops/sec ±5.35% (79 runs sampled)
// hessian1 decode: long           x 2,914,016 ops/sec ±9.69% (72 runs sampled)
// hessian2 decode: long           x 4,772,256 ops/sec ±11.16% (86 runs sampled)
// hessian1 decode: string         x 1,069,999 ops/sec ±3.00% (94 runs sampled)
// hessian2 decode: string         x   871,781 ops/sec ±8.25% (79 runs sampled)
// hessian1 decode: [1, 2, 3]      x   962,857 ops/sec ±7.55% (74 runs sampled)
// hessian2 decode: [1, 2, 3]      x 1,965,251 ops/sec ±2.11% (92 runs sampled)
// hessian1 decode array           x   500,945 ops/sec ±1.50% (94 runs sampled)
// hessian2 decode array           x   584,031 ops/sec ±1.51% (90 runs sampled)
// hessian1 decode: simple object  x   163,280 ops/sec ±4.65% (87 runs sampled)
// hessian2 decode: simple object  x   156,868 ops/sec ±1.88% (96 runs sampled)
// hessian1 decode: complex object x   131,740 ops/sec ±1.61% (95 runs sampled)
// hessian2 decode: complex object x   117,563 ops/sec ±4.65% (86 runs sampled)
