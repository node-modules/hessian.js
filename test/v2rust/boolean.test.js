"use strict";

var assert = require('assert');
var hessian = require('../../index');
var rustDecode = require('./rustdecoder');

describe('boolean.test.js', function () {
  describe('v2.0', function () {
    it('should read write as 1.0', function () {
      assert.deepEqual(hessian.encode(true), new Buffer('T'));
      assert.deepEqual(hessian.encode(false), new Buffer('F'));
      assert(rustDecode(new Buffer('T')) === true);
      assert(rustDecode(new Buffer('F')) === false);
    });
  });
});
