'use strict';

var assert = require('assert');
var hessian = require('../');

describe('array.test.js', function () {
  it('should write null v1', function () {
    var b = hessian.encode([
      {
        $class: '[java.lang.Integer',
        $: null
      },
      {
        $class: '[java.lang.Integer',
        $: [1]
      }
    ]);
    var a = hessian.decode(b);
    assert.deepEqual(a, [null, [1]]);
  });

  it('should write undefined v1', function () {
    var b = hessian.encode([
      {
        $class: '[java.lang.Integer',
        $: undefined
      },
      {
        $class: '[java.lang.Integer',
        $: [1]
      }
    ]);
    var a = hessian.decode(b);
    assert.deepEqual(a, [null, [1]]);
  });

  it('should write null v2', function () {
    var b = hessian.encode([
      {
        $class: '[java.lang.Integer',
        $: null
      },
      {
        $class: '[java.lang.Integer',
        $: [1]
      }
    ], '2.0');
    var a = hessian.decode(b, '2.0');
    assert.deepEqual(a, [null, [1]]);
  });

  it('should write undefined v2', function () {
    var b = hessian.encode([
      {
        $class: '[java.lang.Integer',
        $: undefined
      },
      {
        $class: '[java.lang.Integer',
        $: [1]
      }
    ], '2.0');
    var a = hessian.decode(b, '2.0');
    assert.deepEqual(a, [null, [1]]);
  });
});
