'use strict';

const assert = require('assert');
const hessian = require('../');

describe('null.test.js', function() {
  it('should read null', function() {
    const a = hessian.decode(Buffer.from('N'));
    assert(a === null);
  });

  it('should write null', function() {
    assert.deepEqual(hessian.encode(null), Buffer.from('N'));
  });

  describe('v2.0', function() {
    it('should read write as 1.0', function() {
      assert.deepEqual(hessian.encode(null, '2.0'), Buffer.from('N'));
      assert(hessian.decode(Buffer.from('N'), '2.0') === null);
    });
  });
});
