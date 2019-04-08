'use strict';

const Benchmark = require('benchmark');
const benchmarks = require('beautify-benchmark');
const assert = require('assert');

const ByteBuffer = require('byte');
const io = ByteBuffer.allocate(1024 * 1024);

const str = '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234';
io.putRawString(str);
const buf = io.array();

// io.position(0);
// console.log(io.getRawStringByStringLength(1024));
// console.log(buf.toString());

io.position(0);
assert(io.getRawStringByStringLength(1024) === buf.toString());

function getUTF(buf) {
  const data = [];
  const length = buf.length;
  for (let i = 0; i < length; i++) {
    const ch = buf[i];
    if (ch < 0x80) {
      data.push(ch);
    } else if ((ch & 0xe0) === 0xc0) {
      const ch1 = buf[++i];
      const v = ((ch & 0x1f) << 6) + (ch1 & 0x3f);
      data.push(v);
    } else if ((ch & 0xf0) === 0xe0) {
      const ch1 = buf[++i];
      const ch2 = buf[++i];
      const v = ((ch & 0x0f) << 12) + ((ch1 & 0x3f) << 6) + (ch2 & 0x3f);
      data.push(v);
    } else {
      throw new Error('string is not valid UTF-8 encode');
    }
  }
  return String.fromCharCode.apply(String, data);
}

assert(getUTF(buf) === buf.toString());


function getUTF2(buf) {
  const length = buf.length;
  const data = [];
  const start = 0;
  const numInts = length >> 2;
  for (let i = 0; i < numInts; i++) {
    const num = buf.readInt32BE(i * 4);
    if ((num & 0x80808080) !== 0) {
      throw new Error();
    }
  }
  const offset = start + length;
  return buf.toString('utf8', 0, offset);

  // while (i < length) {
  //   const num = buf.readInt32BE(i);
  //   if ((num & 0x80808080) === 0) {
  //     data.push(buf[i]);
  //     data.push(buf[i + 1]);
  //     data.push(buf[i + 2]);
  //     data.push(buf[i + 3]);
  //     i += 4;
  //   } else {
  //     assert(false);
  //   }
  // }
  // return String.fromCharCode.apply(String, data);
}

assert(getUTF2(buf) === buf.toString());
io.position(0);
assert(io.getRawStringFast(1024) === buf.toString());

const suite = new Benchmark.Suite();
suite
  .add('io.getRawStringByStringLength', function() {
    io._offset = 0;
    io.getRawStringByStringLength(1024);
  })
  .add('io.getRawStringFast', function() {
    io._offset = 0;
    io.getRawStringFast(1024);
  })
  .add('buf.toString', function() {
    buf.toString();
  })
  .add('getUTF', function() {
    getUTF(buf);
  })
  .add('getUTF2', function() {
    getUTF2(buf);
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
