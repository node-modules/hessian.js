/*!
 * hessian.js - test/null.test.js
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

describe('null.test.js', function () {
  it('should read null', function () {
    var a = hessian.Decoder.decode(new Buffer('N'));
    should.ok(a === null);
  });

  it('should write null', function () {
    hessian.Encoder.encode(null).should.eql(new Buffer('N'));
  });
});
