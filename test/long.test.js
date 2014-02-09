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

      // four octet longs
      hessian.decode(new Buffer([0x59, 0x00, 0x00, 0x00, 0x00])).should.equal(0);
      hessian.decode(new Buffer([0x59, 0x00, 0x00, 0x01, 0x2c])).should.equal(300);
      hessian.decode(new Buffer([0x59, 0x7f, 0xff, 0xff, 0xff])).should.equal(2147483647);
      hessian.decode(new Buffer([0x59, 0x80, 0x00, 0x00, 0x00])).should.equal(-2147483648);
    });

    it('should write compact long', function () {
      // -8 ~ 15
      var buf = hessian.encode(hessian.java.long(0), '2.0');
      buf.should.length(1);
      buf[0].should.equal(0xe0);
      buf.should.eql(new Buffer([0xe0]));

      buf = hessian.encode(hessian.java.long(-8), '2.0');
      buf.should.length(1);
      buf[0].should.equal(0xd8);
      buf.should.eql(new Buffer([0xd8]));

      buf = hessian.encode(hessian.java.long(-7), '2.0');
      buf.should.length(1);
      buf[0].should.equal(0xd9);
      buf.should.eql(new Buffer([0xd9]));

      buf = hessian.encode(hessian.java.long(15), '2.0');
      buf.should.length(1);
      buf[0].should.equal(0xef);
      buf.should.eql(new Buffer([0xef]));

      buf = hessian.encode(hessian.java.long(14), '2.0');
      buf.should.length(1);
      buf[0].should.equal(0xee);
      buf.should.eql(new Buffer([0xee]));

      // -2048 ~ 2047
      buf = hessian.encode(hessian.java.long(-9), '2.0');
      buf.should.length(2);
      buf[0].should.equal(0xf7);
      buf[1].should.equal(0xf7);
      buf.should.eql(new Buffer([0xf7, 0xf7]));

      buf = hessian.encode(hessian.java.long(16), '2.0');
      buf.should.length(2);
      buf[0].should.equal(0xf8);
      buf[1].should.equal(0x10);
      buf.should.eql(new Buffer([0xf8, 0x10]));

      buf = hessian.encode(hessian.java.long(255), '2.0');
      buf.should.length(2);
      buf[0].should.equal(0xf8);
      buf[1].should.equal(0xff);
      buf.should.eql(new Buffer([0xf8, 0xff]));

      buf = hessian.encode(hessian.java.long(-2048), '2.0');
      buf.should.length(2);
      buf[0].should.equal(0xf0);
      buf[1].should.equal(0);
      buf.should.eql(new Buffer([0xf0, 0x00]));

      buf = hessian.encode(hessian.java.long(2047), '2.0');
      buf.should.length(2);
      buf[0].should.equal(0xff);
      buf[1].should.equal(0xff);
      buf.should.eql(new Buffer([0xff, 0xff]));

      // -262144 ~ 262143
      buf = hessian.encode(hessian.java.long(262143), '2.0');
      buf.should.length(3);
      buf[0].should.equal(0x3f);
      buf[1].should.equal(0xff);
      buf[2].should.equal(0xff);
      buf.should.eql(new Buffer([0x3f, 0xff, 0xff]));

      buf = hessian.encode(hessian.java.long(-262144), '2.0');
      buf.should.length(3);
      buf[0].should.equal(0x38);
      buf[1].should.equal(0);
      buf[2].should.equal(0);
      buf.should.eql(new Buffer([0x38, 0x00, 0x00]));

      buf = hessian.encode(hessian.java.long(2048), '2.0');
      buf.should.length(3);
      buf[0].should.equal(0x3c);
      buf[1].should.equal(0x08);
      buf[2].should.equal(0x00);
      buf.should.eql(new Buffer([0x3c, 0x08, 0x00]));

      buf = hessian.encode(hessian.java.long(-2049), '2.0');
      buf.should.length(3);
      buf[0].should.equal(0x3b);
      buf[1].should.equal(0xf7);
      buf[2].should.equal(0xff);
      buf.should.eql(new Buffer([0x3b, 0xf7, 0xff]));

      // -2147483648 ~ 2147483647
      buf = hessian.encode(hessian.java.long(-2147483648), '2.0');
      buf.should.length(5);
      buf[0].should.equal(0x59);
      buf[1].should.equal(0x80);
      buf[2].should.equal(0x00);
      buf[3].should.equal(0x00);
      buf[4].should.equal(0x00);
      buf.should.eql(new Buffer([0x59, 0x80, 0x00, 0x00, 0x00]));

      buf = hessian.encode(hessian.java.long(2147483647), '2.0');
      buf.should.length(5);
      buf[0].should.equal(0x59);
      buf[1].should.equal(0x7f);
      buf[2].should.equal(0xff);
      buf[3].should.equal(0xff);
      buf[4].should.equal(0xff);
      buf.should.eql(new Buffer([0x59, 0x7f, 0xff, 0xff, 0xff]));

      // L
      buf = hessian.encode(hessian.java.long(2147483648), '2.0');
      buf.should.length(9);
      buf.should.eql(new Buffer([0x4c, 0x00, 0x00, 0x00, 0x00, 0x80, 0x00, 0x00, 0x00]));
    });
  });
});
