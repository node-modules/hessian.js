'use strict';

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
var complexObjectBuf2 = hessian.encode(complexObject, '2.0');

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
// node version: v8.9.0, date: Thu Nov 16 2017 13:31:15 GMT+0800 (CST)
// Starting...
// 32 tests completed.
//
// hessian1 decode: number                   x 6,546,954 ops/sec ±1.41% (87 runs sampled)
// hessian2 decode: number                   x 6,247,164 ops/sec ±2.10% (84 runs sampled)
// hessian1 decode: date                     x 2,378,658 ops/sec ±2.29% (86 runs sampled)
// hessian2 decode: date                     x 2,378,814 ops/sec ±1.71% (84 runs sampled)
// hessian1 decode: long                     x 3,669,483 ops/sec ±1.88% (85 runs sampled)
// hessian2 decode: long                     x 6,125,751 ops/sec ±1.13% (81 runs sampled)
// hessian1 decode: string                   x 2,123,485 ops/sec ±1.26% (88 runs sampled)
// hessian2 decode: string                   x 1,968,578 ops/sec ±1.53% (86 runs sampled)
// hessian1 decode: [1, 2, 3]                x 1,292,327 ops/sec ±3.02% (83 runs sampled)
// hessian2 decode: [1, 2, 3]                x 1,463,036 ops/sec ±2.95% (82 runs sampled)
// hessian1 decode array                     x   764,305 ops/sec ±1.10% (85 runs sampled)
// hessian2 decode array                     x   819,871 ops/sec ±4.13% (85 runs sampled)
// hessian1 decode: simple object            x   225,427 ops/sec ±1.02% (87 runs sampled)
// hessian2 decode: simple object            x   206,072 ops/sec ±1.41% (85 runs sampled)
// hessian1 decode: complex object           x   139,136 ops/sec ±2.46% (86 runs sampled)
// hessian2 decode: complex object           x   132,702 ops/sec ±3.12% (80 runs sampled)
// hessian1 decode with type: number         x 4,971,071 ops/sec ±1.97% (83 runs sampled)
// hessian2 decode with type: number         x 6,165,893 ops/sec ±1.59% (86 runs sampled)
// hessian1 decode with type: date           x 2,205,802 ops/sec ±1.86% (85 runs sampled)
// hessian2 decode with type: date           x 2,290,528 ops/sec ±2.34% (86 runs sampled)
// hessian1 decode with type: long           x 3,340,413 ops/sec ±1.27% (86 runs sampled)
// hessian2 decode with type: long           x 6,072,529 ops/sec ±0.94% (89 runs sampled)
// hessian1 decode with type: string         x 1,986,114 ops/sec ±1.30% (86 runs sampled)
// hessian2 decode with type: string         x 2,074,055 ops/sec ±0.97% (88 runs sampled)
// hessian1 decode with type: [1, 2, 3]      x 1,026,832 ops/sec ±1.26% (86 runs sampled)
// hessian2 decode with type: [1, 2, 3]      x 1,565,525 ops/sec ±1.06% (87 runs sampled)
// hessian1 decode with type array           x   632,280 ops/sec ±4.27% (80 runs sampled)
// hessian2 decode with type array           x   876,049 ops/sec ±2.26% (86 runs sampled)
// hessian1 decode with type: simple object  x   189,740 ops/sec ±3.36% (82 runs sampled)
// hessian2 decode with type: simple object  x   238,079 ops/sec ±1.85% (84 runs sampled)
// hessian1 decode with type: complex object x   130,701 ops/sec ±2.27% (87 runs sampled)
// hessian2 decode with type: complex object x   160,600 ops/sec ±1.63% (87 runs sampled)
