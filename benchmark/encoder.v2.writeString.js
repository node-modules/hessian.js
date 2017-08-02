'use strict';

var bench = require('fastbench');
var hessian = require('..');

var max = 10;

console.log(hessian.encode(makeStr('a', 200), '2.0'));

var run = bench([
  function writeSmallString(cb) {
    for (var i = 0; i < max; i++) {
      hessian.encode(makeStr('a', 200), '2.0');
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
