/*!
 * hessian.js - test/int.test.js
 *
 * Copyright(c) 2014
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

describe('int.test.js', function () {
  it('should read integer 300', function () {
    hessian.decode(new Buffer(['I'.charCodeAt(0), 0x00, 0x00, 0x01, 0x2c])).should.equal(300);
  });

  it('should write integer 300', function () {
    hessian.encode(300).should.eql(new Buffer(['I'.charCodeAt(0), 0x00, 0x00, 0x01, 0x2c]));
  });
});