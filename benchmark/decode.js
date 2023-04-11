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
    },
    hashMap: {
      name: 'getData',
      args: [1, "name", "xxx1231231231231xxx123"],
      conn: {
        foo: 'bar'
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

var bigStringBuf1 = hessian.encode(new Array(15).fill('xxx1231231231231xxx123').join(''), '1.0');
var bigStringBuf2 = hessian.encode(new Array(15).fill('xxx1231231231231xxx123').join(''), '2.0');


var arrBuf1 = hessian.encode([1, 2, 3], '1.0');
var arrBuf2 = hessian.encode([1, 2, 3], '2.0');

var arrObjectBuf1 = hessian.encode([1, "name", "xxx1231231231231xxx123"], '1.0');
var arrObjectBuf2 = hessian.encode([1, "name", "xxx1231231231231xxx123"], '2.0');

const classCache = new Map();
classCache.enableCompile = true;
const options = {
  classCache,
};

var decoderV2RustState = hessian.DecoderV2Rust.makeState();
function decoderV2Rust(bf) {
  var decoderV2Rust = new hessian.DecoderV2Rust(bf);
  decoderV2Rust.rustState = decoderV2RustState;
  return decoderV2Rust.read();
}

suite

.add('hessian1 decode: number', function() {
  hessian.decode(number1Buf1, '1.0');
})
.add('hessian2 decode: number', function() {
  hessian.decode(number1Buf2, '2.0');
})

.add('hessian2Rust decode: number', function() {
  decoderV2Rust(number1Buf2);
})
.add('hessian1 decode: date', function() {
  hessian.decode(dateBuf1, '1.0');
})
.add('hessian2 decode: date', function() {
  hessian.decode(dateBuf2, '2.0');
})
.add('hessian2Rust decode: date', function() {
  decoderV2Rust(dateBuf2);
})

.add('hessian1 decode: long', function() {
  hessian.decode(longBuf1, '1.0');
})
.add('hessian2 decode: long', function() {
  hessian.decode(longBuf2, '2.0');
})
.add('hessian2Rust decode: long', function() {
  decoderV2Rust(longBuf2);
})

.add('hessian1 decode: string', function() {
  hessian.decode(stringBuf1, '1.0');
})
.add('hessian2 decode: string', function() {
  hessian.decode(stringBuf2, '2.0');
})

.add('hessian2Rust decode: string', function() {
  decoderV2Rust(stringBuf2);
})


.add('hessian1 decode: big string', function() {
  hessian.decode(bigStringBuf1, '1.0');
})
.add('hessian2 decode: big string', function() {
  hessian.decode(bigStringBuf2, '2.0');
})

.add('hessian2Rust decode: big string', function() {
  decoderV2Rust(bigStringBuf2);
})


.add('hessian1 decode: [1, 2, 3]', function() {
  hessian.decode(arrBuf1, '1.0');
})
.add('hessian2 decode: [1, 2, 3]', function() {
  hessian.decode(arrBuf2, '2.0');
})
.add('hessian2Rust decode: [1, 2, 3]', function() {
  decoderV2Rust(arrBuf2);
})
.add('hessian1 decode array', function() {
  hessian.decode(arrObjectBuf1, '1.0');
})
.add('hessian2 decode array', function() {
  hessian.decode(arrObjectBuf2, '2.0');
})

.add('hessian2Rust decode: array', function() {
  decoderV2Rust(arrObjectBuf2);
})
.add('hessian1 decode: simple object', function() {
  hessian.decode(simpleObjectBuf1, '1.0', options);
})
.add('hessian2 decode: simple object', function() {
  hessian.decode(simpleObjectBuf2, '2.0', options);
})
.add('hessian2Rust decode: simple object', function() {
  decoderV2Rust(simpleObjectBuf2);
})
.add('hessian1 decode: complex object', function() {
  hessian.decode(complexObjectBuf1, '1.0', options);
})
.add('hessian2 decode: complex object', function() {
  hessian.decode(complexObjectBuf2, '2.0', options);
})
.add('hessian2Rust decode: complex object', function() {
  decoderV2Rust(complexObjectBuf2);
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
// node version: v8.9.0, date: Thu Nov 16 2017 13:22:44 GMT+0800 (CST)
// Starting...
// 32 tests completed.mpleted.
//
// hessian1 decode: number                   x 6,407,809 ops/sec ±1.19% (85 runs sampled)
// hessian2 decode: number                   x 6,718,377 ops/sec ±1.89% (84 runs sampled)
// hessian1 decode: date                     x 3,088,496 ops/sec ±1.32% (84 runs sampled)
// hessian2 decode: date                     x 2,779,038 ops/sec ±3.23% (82 runs sampled)
// hessian1 decode: long                     x 6,479,134 ops/sec ±1.49% (82 runs sampled)
// hessian2 decode: long                     x 6,517,015 ops/sec ±0.86% (88 runs sampled)
// hessian1 decode: string                   x 2,182,911 ops/sec ±1.00% (87 runs sampled)
// hessian2 decode: string                   x 1,976,073 ops/sec ±1.85% (83 runs sampled)
// hessian1 decode: [1, 2, 3]                x 1,366,544 ops/sec ±0.97% (87 runs sampled)
// hessian2 decode: [1, 2, 3]                x 1,581,973 ops/sec ±1.75% (85 runs sampled)
// hessian1 decode array                     x   770,107 ops/sec ±1.11% (85 runs sampled)
// hessian2 decode array                     x   818,306 ops/sec ±1.30% (86 runs sampled)
// hessian1 decode: simple object            x   235,523 ops/sec ±1.14% (86 runs sampled)
// hessian2 decode: simple object            x   211,751 ops/sec ±1.07% (87 runs sampled)
// hessian1 decode: complex object           x   158,066 ops/sec ±0.92% (88 runs sampled)
// hessian2 decode: complex object           x   142,748 ops/sec ±2.36% (84 runs sampled)
// hessian1 decode with type: number         x 5,315,547 ops/sec ±0.84% (85 runs sampled)
// hessian2 decode with type: number         x 6,400,855 ops/sec ±1.87% (85 runs sampled)
// hessian1 decode with type: date           x 2,895,382 ops/sec ±0.90% (87 runs sampled)
// hessian2 decode with type: date           x 2,696,164 ops/sec ±1.83% (86 runs sampled)
// hessian1 decode with type: long           x 5,691,891 ops/sec ±1.46% (87 runs sampled)
// hessian2 decode with type: long           x 5,307,340 ops/sec ±2.48% (86 runs sampled)
// hessian1 decode with type: string         x 1,965,375 ops/sec ±1.82% (86 runs sampled)
// hessian2 decode with type: string         x 2,078,900 ops/sec ±1.87% (81 runs sampled)
// hessian1 decode with type: [1, 2, 3]      x 1,092,637 ops/sec ±1.23% (84 runs sampled)
// hessian2 decode with type: [1, 2, 3]      x 1,421,983 ops/sec ±1.20% (88 runs sampled)
// hessian1 decode with type array           x   663,286 ops/sec ±1.41% (86 runs sampled)
// hessian2 decode with type array           x   824,021 ops/sec ±1.16% (86 runs sampled)
// hessian1 decode with type: simple object  x   218,865 ops/sec ±1.20% (87 runs sampled)
// hessian2 decode with type: simple object  x   213,464 ops/sec ±1.07% (86 runs sampled)
// hessian1 decode with type: complex object x   150,044 ops/sec ±1.34% (86 runs sampled)
// hessian2 decode with type: complex object x   149,879 ops/sec ±1.02% (89 runs sampled)
