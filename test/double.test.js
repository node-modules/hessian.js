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

  describe('v2.0', function () {
    it('should read 0.0 and 1.0', function () {
      hessian.decode(new Buffer([0x5b])).should.equal(0.0);
      hessian.decode(new Buffer([0x5c])).should.equal(1.0);
    });

    it('should read 8 bits double', function () {
      hessian.decode(new Buffer([0x5d, 0x00])).should.equal(0.0);
      hessian.decode(new Buffer([0x5d, 0x01])).should.equal(1.0);
      hessian.decode(new Buffer([0x5d, 0x80])).should.equal(-128.0);
      hessian.decode(new Buffer([0x5d, 0x7f])).should.equal(127.0);
    });

    it('should read 16 bits double', function () {
      hessian.decode(new Buffer([0x5e, 0x00, 0x00])).should.equal(0.0);
      hessian.decode(new Buffer([0x5e, 0x00, 0x01])).should.equal(1.0);
      hessian.decode(new Buffer([0x5e, 0x00, 0x80])).should.equal(128.0);
      hessian.decode(new Buffer([0x5e, 0x00, 0x7f])).should.equal(127.0);
      hessian.decode(new Buffer([0x5e, 0x80, 0x00])).should.equal(-32768.0);
      hessian.decode(new Buffer([0x5e, 0x7f, 0xff])).should.equal(32767.0);
    });

    it('should read 32 bits float double', function () {
      hessian.decode(new Buffer([0x5f, 0x00, 0x00, 0x00, 0x00])).should.equal(0.0);
      hessian.decode(new Buffer([0x5f, 0x41, 0x44, 0x00, 0x00])).should.equal(12.25);
    });
  });
});
