/*!
 * hessian.js - test/boolean.test.js
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

describe('boolean.test.js', function () {
  it('should read true and false', function () {
    hessian.decode(new Buffer('T')).should.equal(true);
    hessian.decode(new Buffer('F')).should.equal(false);
  });

  it('should write true and false', function () {
    hessian.encode(true).should.eql(new Buffer('T'));
    hessian.encode(false).should.eql(new Buffer('F'));
  });
});
