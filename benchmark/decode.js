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
.add('hessian1 decode with type: number', function() {
  hessian.decode(number1Buf1, '1.0', true);
})
.add('hessian2 decode with type: number', function() {
  hessian.decode(number1Buf2, '2.0', true);
})

.add('hessian1 decode with type: date', function() {
  hessian.decode(dateBuf1, '1.0', true);
})
.add('hessian2 decode with type: date', function() {
  hessian.decode(dateBuf2, '2.0', true);
})

.add('hessian1 decode with type: long', function() {
  hessian.decode(longBuf1, '1.0', true);
})
.add('hessian2 decode with type: long', function() {
  hessian.decode(longBuf2, '2.0', true);
})

.add('hessian1 decode with type: string', function() {
  hessian.decode(stringBuf1, '1.0', true);
})
.add('hessian2 decode with type: string', function() {
  hessian.decode(stringBuf2, '2.0', true);
})

.add('hessian1 decode with type: [1, 2, 3]', function() {
  hessian.decode(arrBuf1, '1.0', true);
})
.add('hessian2 decode with type: [1, 2, 3]', function() {
  hessian.decode(arrBuf2, '2.0', true);
})
.add('hessian1 decode with type array', function() {
  hessian.decode(arrObjectBuf1, '1.0', true);
})
.add('hessian2 decode with type array', function() {
  hessian.decode(arrObjectBuf2, '2.0', true);
})

.add('hessian1 decode with type: simple object', function() {
  hessian.decode(simpleObjectBuf1, '1.0', true);
})
.add('hessian2 decode with type: simple object', function() {
  hessian.decode(simpleObjectBuf2, '2.0', true);
})

.add('hessian1 decode with type: complex object', function() {
  hessian.decode(complexObjectBuf1, '1.0', true);
})
.add('hessian2 decode with type: complex object', function() {
  hessian.decode(complexObjectBuf2, '2.0', true);
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

 // Hessian Decode Benchmark
 //  node version: v0.11.12, date: Wed Jun 25 2014 10:46:26 GMT+0800 (CST)
 //  Starting...
 //  32 tests completed.

 //  hessian1 decode: number                   x 5,983,374 ops/sec ±1.57% (94 runs sampled)
 //  hessian2 decode: number                   x 5,713,562 ops/sec ±2.22% (91 runs sampled)
 //  hessian1 decode: date                     x 2,959,698 ops/sec ±1.19% (92 runs sampled)
 //  hessian2 decode: date                     x 2,548,345 ops/sec ±1.32% (91 runs sampled)
 //  hessian1 decode: long                     x 3,880,734 ops/sec ±1.66% (93 runs sampled)
 //  hessian2 decode: long                     x 5,221,659 ops/sec ±2.30% (90 runs sampled)
 //  hessian1 decode: string                   x 1,109,890 ops/sec ±1.59% (94 runs sampled)
 //  hessian2 decode: string                   x 1,075,246 ops/sec ±1.43% (92 runs sampled)
 //  hessian1 decode: [1, 2, 3]                x 1,186,054 ops/sec ±1.24% (92 runs sampled)
 //  hessian2 decode: [1, 2, 3]                x 2,049,867 ops/sec ±1.75% (98 runs sampled)
 //  hessian1 decode array                     x   511,250 ops/sec ±0.92% (95 runs sampled)
 //  hessian2 decode array                     x   600,564 ops/sec ±1.27% (90 runs sampled)
 //  hessian1 decode: simple object            x   186,875 ops/sec ±0.81% (93 runs sampled)
 //  hessian2 decode: simple object            x   174,768 ops/sec ±0.74% (94 runs sampled)
 //  hessian1 decode: complex object           x   133,573 ops/sec ±1.31% (97 runs sampled)
 //  hessian2 decode: complex object           x   131,234 ops/sec ±1.45% (95 runs sampled)
 //  hessian1 decode with type: number         x 5,014,602 ops/sec ±1.97% (91 runs sampled)
 //  hessian2 decode with type: number         x 5,890,098 ops/sec ±1.81% (89 runs sampled)
 //  hessian1 decode with type: date           x 2,797,789 ops/sec ±1.82% (91 runs sampled)
 //  hessian2 decode with type: date           x 2,541,107 ops/sec ±2.40% (92 runs sampled)
 //  hessian1 decode with type: long           x 3,869,288 ops/sec ±1.31% (93 runs sampled)
 //  hessian2 decode with type: long           x 5,598,654 ops/sec ±1.20% (95 runs sampled)
 //  hessian1 decode with type: string         x 1,068,879 ops/sec ±1.89% (92 runs sampled)
 //  hessian2 decode with type: string         x 1,110,680 ops/sec ±0.89% (94 runs sampled)
 //  hessian1 decode with type: [1, 2, 3]      x 1,150,027 ops/sec ±0.94% (94 runs sampled)
 //  hessian2 decode with type: [1, 2, 3]      x 1,834,472 ops/sec ±0.90% (94 runs sampled)
 //  hessian1 decode with type array           x   508,028 ops/sec ±0.99% (96 runs sampled)
 //  hessian2 decode with type array           x   605,446 ops/sec ±1.10% (96 runs sampled)
 //  hessian1 decode with type: simple object  x   190,014 ops/sec ±0.92% (97 runs sampled)
 //  hessian2 decode with type: simple object  x   176,337 ops/sec ±1.16% (96 runs sampled)
 //  hessian1 decode with type: complex object x   133,815 ops/sec ±1.21% (90 runs sampled)
 //  hessian2 decode with type: complex object x   134,814 ops/sec ±0.96% (96 runs sampled)
