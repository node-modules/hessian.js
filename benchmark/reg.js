'use strict';

var Benchmark = require('benchmark');
var benchmarks = require('beautify-benchmark');

var suite = new Benchmark.Suite();


var INNER_CLASS_PROPERTY_REG = /^this\$\d+$/;
var INNER_CLASS_LABEL = '$$ignore_inner_property$$';

var name1 = 'foobar';
var name2 = 'this$123';
var name3 = INNER_CLASS_LABEL;

suite

.add('dynamic', function() {
  /^this\$\d+/.test(name1);
  /^this\$\d+/.test(name2);
})
.add('static', function() {
  INNER_CLASS_PROPERTY_REG.test(name1);
  INNER_CLASS_PROPERTY_REG.test(name2);
})
.add('equal', function() {
  name1 === INNER_CLASS_LABEL;
  name3 === INNER_CLASS_LABEL;
})

.on('cycle', function(event) {
  benchmarks.add(event.target);
})
.on('start', function(event) {
  console.log('\n  Reg Benchmark\n  node version: %s, date: %s\n  Starting...',
    process.version, Date());
})
.on('complete', function done() {
  benchmarks.log();
})
.run({ 'async': false });

// node version: v8.5.0, date: Sat Oct 21 2017 08:00:33 GMT+0800 (CST)
// Starting...
// 3 tests completed.
//
// dynamic x   8,355,274 ops/sec ±1.00% (85 runs sampled)
// static  x  10,547,340 ops/sec ±0.90% (89 runs sampled)
// equal   x 488,054,083 ops/sec ±0.67% (88 runs sampled)
