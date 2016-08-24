/**
 * hessian.js - test/null.test.js
 *
 * Copyright(c)
 * MIT Licensed
 *
 * Authors:
 *   fengmk2 <fengmk2@gmail.com> (http://fengmk2.github.com)
 */

"use strict";

/**
 * Module dependencies.
 */

var should = require('should');
var hessian = require('../');

describe('null.test.js', function () {
  it('should read null', function () {
    var a = hessian.decode(new Buffer('N'));
    should.ok(a === null);
  });

  it('should write null', function () {
    hessian.encode(null).should.eql(new Buffer('N'));
  });

  describe('v2.0', function () {
    it('should read write as 1.0', function () {
      hessian.encode(null, '2.0').should.eql(new Buffer('N'));
      should.ok(hessian.decode(new Buffer('N'), '2.0') === null);
    });
  });
});
