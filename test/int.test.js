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

  it('should write integer 0', function () {
    hessian.encode(0).should.eql(new Buffer(['I'.charCodeAt(0), 0, 0, 0, 0]));
  });

  describe('v2.0', function () {
    it('should read compact integers', function () {
      hessian.decode(new Buffer([0x90])).should.equal(0);
      hessian.decode(new Buffer([0x80])).should.equal(-16);
      hessian.decode(new Buffer([0xbf])).should.equal(47);

      hessian.decode(new Buffer([0xc8, 0x00])).should.equal(0);
      hessian.decode(new Buffer([0xc0, 0x00])).should.equal(-2048);
      hessian.decode(new Buffer([0xc7, 0x00])).should.equal(-256);
      hessian.decode(new Buffer([0xcf, 0xff])).should.equal(2047);

      hessian.decode(new Buffer([0xd4, 0x00, 0x00])).should.equal(0);
      hessian.decode(new Buffer([0xd0, 0x00, 0x00])).should.equal(-262144);
      hessian.decode(new Buffer([0xd7, 0xff, 0xff])).should.equal(262143);

      hessian.decode(new Buffer(['I'.charCodeAt(0), 0x00, 0x00, 0x00, 0x00])).should.equal(0);
      hessian.decode(new Buffer(['I'.charCodeAt(0), 0x00, 0x00, 0x01, 0x2c])).should.equal(300);
    });
  });
});
