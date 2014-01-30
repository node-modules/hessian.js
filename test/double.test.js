/*!
 * hessian.js - test/double.test.js
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

describe('double.test.js', function () {
  var doubleBuffer = new Buffer(['D'.charCodeAt(0),
    0x40, 0x28, 0x80, 0x00, 0x00, 0x00, 0x00, 0x00]);

  it('should read double 12.25', function () {
    hessian.decode(doubleBuffer).should.equal(12.25);
  });

  it('should write double 12.25', function () {
    hessian.encode(12.25).should.eql(doubleBuffer);
    hessian.encode(hessian.java.double(12.25)).should.eql(doubleBuffer);
    hessian.encode({
      $class: 'double',
      $: 12.25
    }).should.eql(doubleBuffer);
  });

  it('should write double 100', function () {
    hessian.encode(hessian.java.double(100)).should.eql(
      new Buffer(['D'.charCodeAt(0), 0x40, 0x59, 0, 0, 0, 0, 0, 0]));
  });

  it('should write double 0', function () {
    hessian.encode(hessian.java.double(0)).should.eql(
      new Buffer(['D'.charCodeAt(0), 0, 0, 0, 0, 0, 0, 0, 0]));
  });
});
