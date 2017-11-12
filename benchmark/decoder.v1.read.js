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
        ctx: java.long(1024),
        name: makeStr('p', 200),
      }
    }
  }
};
var complexObjectBuf = hessian.encode(complexObject, '1.0');
console.log(JSON.stringify(hessian.decode(complexObjectBuf, '1.0', true), null, 2));

var run = bench([
  function readComplexObject(cb) {
    for (var i = 0; i < max; i++) {
      hessian.decode(complexObjectBuf, '1.0', true);
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

//  node benchmark/decoder.v1.read.js
// {
//   "$class": "com.hessiantest.org.MockRequest",
//   "$": {
//     "id": {
//       "$class": "int",
//       "$": 123
//     },
//     "name": {
//       "$class": "java.lang.String",
//       "$": "getData"
//     },
//     "args": {
//       "$class": "java.util.ArrayList",
//       "$": [
//         {
//           "$class": "int",
//           "$": 1
//         },
//         {
//           "$class": "java.lang.String",
//           "$": "name"
//         },
//         {
//           "$class": "java.lang.String",
//           "$": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
//         }
//       ]
//     },
//     "conn": {
//       "$class": "com.hessiantest.org.MockRequestConnection",
//       "$": {
//         "ctx": {
//           "$class": "long",
//           "$": 1024
//         },
//         "name": {
//           "$class": "java.lang.String",
//           "$": "pppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppp"
//         }
//       }
//     }
//   }
// }
// readComplexObject*10000: 2062.029ms
// readComplexObject*10000: 1711.482ms
