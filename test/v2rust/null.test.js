"use strict";

var assert = require('assert');
var hessian = require('../../index');
var rustDecode = require('./rustdecoder');

describe('null.test.js', function () {
  describe('v2.0', function () {
    it('should read write as 1.0', function () {
      assert.deepEqual(hessian.encode(null), new Buffer('N'));
      assert(rustDecode(new Buffer('N')) === null);
    });
  });
});
