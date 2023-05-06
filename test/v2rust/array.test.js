"use strict";

var assert = require('assert');
var hessian = require('../../index');
var rustDecode = require('./rustdecoder');
describe('array.test.js', function () {
  it('should write null v2', function () {
    var b = hessian.encode([
      {
        $class: '[java.lang.Integer',
        $: null,
      },
      {
        $class: '[java.lang.Integer',
        $: [1],
      },
    ]);
    var a = rustDecode(b);
    assert.deepEqual(a, [null, [1]]);
  });

  it('should write undefined v2', function () {
    var b = hessian.encode([
      {
        $class: '[java.lang.Integer',
        $: undefined,
      },
      {
        $class: '[java.lang.Integer',
        $: [1],
      },
    ]);
    var a = rustDecode(b);
    assert.deepEqual(a, [null, [1]]);
  });
});
