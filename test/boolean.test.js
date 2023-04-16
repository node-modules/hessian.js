'use strict';

const assert = require('assert');
const hessian = require('..');

describe('boolean.test.js', function () {
  it('should read true and false', function () {
    assert(hessian.decode(new Buffer('T')) === true);
    assert(hessian.decode(new Buffer('F')) === false);
  });

  it('should write true and false', function () {
    assert.deepEqual(hessian.encode(true), new Buffer('T'));
    assert.deepEqual(hessian.encode(false), new Buffer('F'));
  });

  describe('v2.0', function () {
    it('should read write as 1.0', function () {
      assert.deepEqual(hessian.encode(true, '2.0'), new Buffer('T'));
      assert.deepEqual(hessian.encode(false, '2.0'), new Buffer('F'));
      assert(hessian.decode(new Buffer('T'), '2.0') === true);
      assert(hessian.decode(new Buffer('F'), '2.0') === false);
    });
  });
});
