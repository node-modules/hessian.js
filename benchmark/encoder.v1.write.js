'use strict';

var bench = require('fastbench');
var java = require('js-to-java');
var hessian = require('..');

var max = 10;

var complexObject = {
  $class: 'com.hessiantest.org.MockRequest',
  $: {
    id: 123,
    name: 'getData',
    args: [1, makeStr('name', 1), makeStr('a', 200)],
    conn: {
      $class: 'com.hessiantest.org.MockRequestConnection',
      $: {
        ctx: java.long(1024)
      }
    }
  }
};
console.log(hessian.encode(complexObject, '1.0').length, hessian.encode(complexObject, '1.0'));

var run = bench([
  function writeComplexObject(cb) {
    for (var i = 0; i < max; i++) {
      var complexObject = {
        $class: 'com.hessiantest.org.MockRequest',
        $: {
          id: 123,
          name: 'getData',
          args: [1, makeStr('name', 1), makeStr('a', 200)],
          conn: {
            $class: 'com.hessiantest.org.MockRequestConnection',
            $: {
              ctx: java.long(1024)
            }
          }
        }
      };
      hessian.encode(complexObject, '1.0');
    }
    setImmediate(cb);
  },
], 10000);

run(run);

function makeStr(str, concats) {
  var s = ''
  while (concats--) {
    s += str
  }
  return s
}

// node benchmark/encoder.v1.write.js
// 360 <Buffer 4d 74 00 1f 63 6f 6d 2e 68 65 73 73 69 61 6e 74 65 73 74 2e 6f 72 67 2e 4d 6f 63 6b 52 65 71 75 65 73 74 53 00 02 69 64 49 00 00 00 7b 53 00 04 6e 61 ... >
// writeComplexObject*10000: 1214.816ms
// writeComplexObject*10000: 1151.431ms
