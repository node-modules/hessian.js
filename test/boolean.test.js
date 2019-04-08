'use strict';

const assert = require('assert');
const hessian = require('../');

describe('boolean.test.js', function() {
  it('should read true and false', function() {
    assert(hessian.decode(Buffer.from('T')) === true);
    assert(hessian.decode(Buffer.from('F')) === false);
  });

  it('should write true and false', function() {
    assert.deepEqual(hessian.encode(true), Buffer.from('T'));
    assert.deepEqual(hessian.encode(false), Buffer.from('F'));
  });

  describe('v2.0', function() {
    it('should read write as 1.0', function() {
      assert.deepEqual(hessian.encode(true, '2.0'), Buffer.from('T'));
      assert.deepEqual(hessian.encode(false, '2.0'), Buffer.from('F'));
      assert(hessian.decode(Buffer.from('T'), '2.0') === true);
      assert(hessian.decode(Buffer.from('F'), '2.0') === false);
    });
  });
});
