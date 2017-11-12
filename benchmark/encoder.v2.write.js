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
console.log(hessian.encode(complexObject, '2.0').length, hessian.encode(complexObject, '2.0'));

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
      hessian.encode(complexObject, '2.0');
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

// node benchmark/encoder.v2.write.js 
// 324 <Buffer 43 1f 63 6f 6d 2e 68 65 73 73 69 61 6e 74 65 73 74 2e 6f 72 67 2e 4d 6f 63 6b 52 65 71 75 65 73 74 94 02 69 64 04 6e 61 6d 65 04 61 72 67 73 04 63 6f ... >
// writeComplexObject*10000: 1162.727ms
// writeComplexObject*10000: 1032.622ms
