'use strict';

const { describe, it } = require('test');
const assert = require('assert');
const hessian = require('..');

describe('null.test.js', function () {
  it('should read null', function () {
    var a = hessian.decode(new Buffer('N'));
    assert(a === null);
  });

  it('should write null', function () {
    assert.deepEqual(hessian.encode(null), new Buffer('N'));
  });

  describe('v2.0', function () {
    it('should read write as 1.0', function () {
      assert.deepEqual(hessian.encode(null, '2.0'), new Buffer('N'));
      assert(hessian.decode(new Buffer('N'), '2.0') === null);
    });
  });
});
