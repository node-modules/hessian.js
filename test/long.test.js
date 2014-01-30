/*!
 * hessian.js - test/long.test.js
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

describe('long.test.js', function () {
  var longBuffer = new Buffer(['L'.charCodeAt(0), 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x2c]);

  it('should read long 300', function () {
    hessian.decode(longBuffer).should.equal(300);
  });

  it('should write long 300', function () {
    hessian.encode({
      $class: 'long',
      $: 300
    }).should.eql(longBuffer);
    hessian.encode(hessian.java.long(300)).should.eql(longBuffer);
  });

  it('should write long 0', function () {
    hessian.encode(hessian.java.long(0)).should.eql(
      new Buffer(['L'.charCodeAt(0), 0, 0, 0, 0, 0, 0, 0, 0]));
  });

  describe('v2.0', function () {
    it('should read compact long', function () {
      hessian.decode(new Buffer([0xe0])).should.equal(0);
      hessian.decode(new Buffer([0xd8])).should.equal(-8);
      hessian.decode(new Buffer([0xef])).should.equal(15);

      hessian.decode(new Buffer([0xf8, 0x00])).should.equal(0);
      hessian.decode(new Buffer([0xf0, 0x00])).should.equal(-2048);
      hessian.decode(new Buffer([0xf7, 0x00])).should.equal(-256);
      hessian.decode(new Buffer([0xff, 0xff])).should.equal(2047);

      hessian.decode(new Buffer([0x3c, 0x00, 0x00])).should.equal(0);
      hessian.decode(new Buffer([0x38, 0x00, 0x00])).should.equal(-262144);
      hessian.decode(new Buffer([0x3f, 0xff, 0xff])).should.equal(262143);

      // TODO: four octet longs
      // hessian.decode(new Buffer([0x4c, 0x00, 0x00, 0x00, 0x00])).should.equal(0);
      // hessian.decode(new Buffer([0x4c, 0x00, 0x00, 0x01, 0x2c])).should.equal(300);
    });
  });
});
