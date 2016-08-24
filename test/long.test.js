/**
 * hessian.js - test/long.test.js
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
var java = require('js-to-java');
var Long = require('long');
var hessian = require('../');
var utils = require('./utils');

describe('long.test.js', function () {
  var longBuffer = new Buffer(['L'.charCodeAt(0), 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x2c]);

  it('should write {$class: "java.lang.Long", $: null} => null', function () {
    var obj = hessian.decode(hessian.encode({
      $class: "java.lang.Long", $: null
    }));
    should.ok(obj === null);
  });

  it('should read long 300', function () {
    hessian.decode(longBuffer).should.equal(300);
  });

  it('should write long 300', function () {
    hessian.encode({
      $class: 'long',
      $: 300
    }).should.eql(longBuffer);
    hessian.encode(java.long(300)).should.eql(longBuffer);
    hessian.encode(java.long(300)).should.eql(longBuffer);
    hessian.encode(java.long(Long.fromNumber(300))).should.eql(longBuffer);
    hessian.encode(Long.fromNumber(300)).should.eql(longBuffer);
  });

  it('should write long 0', function () {
    hessian.encode(java.long(0)).should.eql(
      new Buffer(['L'.charCodeAt(0), 0, 0, 0, 0, 0, 0, 0, 0]));
  });

  it('should write and read equal java impl', function () {
    hessian.encode(java.long(0), '1.0').should.eql(utils.bytes('v1/long/0'));
    hessian.decode(utils.bytes('v1/long/0')).should.equal(0);
    hessian.encode(java.long(-8), '1.0').should.eql(utils.bytes('v1/long/-8'));
    hessian.decode(utils.bytes('v1/long/-8')).should.equal(-8);
    hessian.encode(java.long(-7), '1.0').should.eql(utils.bytes('v1/long/-7'));
    hessian.decode(utils.bytes('v1/long/-7')).should.equal(-7);
    hessian.encode(java.long(15), '1.0').should.eql(utils.bytes('v1/long/15'));
    hessian.decode(utils.bytes('v1/long/15')).should.equal(15);
    hessian.encode(java.long(14), '1.0').should.eql(utils.bytes('v1/long/14'));
    hessian.decode(utils.bytes('v1/long/14')).should.equal(14);
    hessian.encode(java.long(-9), '1.0').should.eql(utils.bytes('v1/long/-9'));
    hessian.decode(utils.bytes('v1/long/-9')).should.equal(-9);
    hessian.encode(java.long(16), '1.0').should.eql(utils.bytes('v1/long/16'));
    hessian.decode(utils.bytes('v1/long/16')).should.equal(16);
    hessian.encode(java.long(255), '1.0').should.eql(utils.bytes('v1/long/255'));
    hessian.decode(utils.bytes('v1/long/255')).should.equal(255);
    hessian.encode(java.long(-2048), '1.0').should.eql(utils.bytes('v1/long/-2048'));
    hessian.decode(utils.bytes('v1/long/-2048')).should.equal(-2048);
    hessian.encode(java.long(2047), '1.0').should.eql(utils.bytes('v1/long/2047'));
    hessian.decode(utils.bytes('v1/long/2047')).should.equal(2047);
    hessian.encode(java.long(262143), '1.0').should.eql(utils.bytes('v1/long/262143'));
    hessian.decode(utils.bytes('v1/long/262143')).should.equal(262143);
    hessian.encode(java.long(-262144), '1.0').should.eql(utils.bytes('v1/long/-262144'));
    hessian.decode(utils.bytes('v1/long/-262144')).should.equal(-262144);
    hessian.encode(java.long(2048), '1.0').should.eql(utils.bytes('v1/long/2048'));
    hessian.decode(utils.bytes('v1/long/2048')).should.equal(2048);
    hessian.encode(java.long(-2049), '1.0').should.eql(utils.bytes('v1/long/-2049'));
    hessian.decode(utils.bytes('v1/long/-2049')).should.equal(-2049);
    hessian.encode(java.long(-2147483648), '1.0').should.eql(utils.bytes('v1/long/-2147483648'));
    hessian.decode(utils.bytes('v1/long/-2147483648')).should.equal(-2147483648);
    hessian.encode(java.long(-2147483647), '1.0').should.eql(utils.bytes('v1/long/-2147483647'));
    hessian.decode(utils.bytes('v1/long/-2147483647')).should.equal(-2147483647);
    hessian.encode(java.long(2147483647), '1.0').should.eql(utils.bytes('v1/long/2147483647'));
    hessian.decode(utils.bytes('v1/long/2147483647')).should.equal(2147483647);
    hessian.encode(java.long(2147483646), '1.0').should.eql(utils.bytes('v1/long/2147483646'));
    hessian.decode(utils.bytes('v1/long/2147483646')).should.equal(2147483646);
    hessian.encode(java.long(2147483648), '1.0').should.eql(utils.bytes('v1/long/2147483648'));
    hessian.decode(utils.bytes('v1/long/2147483648')).should.equal(2147483648);
  });

  describe('v2.0', function () {
    it('should read compact long', function () {
      hessian.decode(new Buffer([0xe0]), '2.0').should.equal(0);
      hessian.decode(new Buffer([0xd8]), '2.0').should.equal(-8);
      hessian.decode(new Buffer([0xef]), '2.0').should.equal(15);

      hessian.decode(new Buffer([0xf8, 0x00]), '2.0').should.equal(0);
      hessian.decode(new Buffer([0xf0, 0x00]), '2.0').should.equal(-2048);
      hessian.decode(new Buffer([0xf7, 0x00]), '2.0').should.equal(-256);
      hessian.decode(new Buffer([0xff, 0xff]), '2.0').should.equal(2047);

      hessian.decode(new Buffer([0x3c, 0x00, 0x00]), '2.0').should.equal(0);
      hessian.decode(new Buffer([0x38, 0x00, 0x00]), '2.0').should.equal(-262144);
      hessian.decode(new Buffer([0x3f, 0xff, 0xff]), '2.0').should.equal(262143);

      // four octet longs
      hessian.decode(new Buffer([0x59, 0x00, 0x00, 0x00, 0x00]), '2.0').should.equal(0);
      hessian.decode(new Buffer([0x59, 0x00, 0x00, 0x01, 0x2c]), '2.0').should.equal(300);
      hessian.decode(new Buffer([0x59, 0x7f, 0xff, 0xff, 0xff]), '2.0').should.equal(2147483647);
      hessian.decode(new Buffer([0x59, 0x80, 0x00, 0x00, 0x00]), '2.0').should.equal(-2147483648);

      hessian.decode(new Buffer([0x4c, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]), '2.0').should.equal(0);
      hessian.decode(new Buffer([0x4c, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x2c]), '2.0').should.equal(300);
      hessian.decode(new Buffer([0x4c, 0x00, 0x00, 0x00, 0x00, 0x7f, 0xff, 0xff, 0xff]), '2.0').should.equal(2147483647);
    });

    it('should read normal long', function () {
      hessian.decode(new Buffer([0x4c, 0x00, 0x00, 0x00, 0x00, 0x80, 0x00, 0x00, 0x00]), '2.0').should.equal(2147483648);
    });

    it('should write compact long', function () {
      // -8 ~ 15
      var buf = hessian.encode(java.long(0), '2.0');
      buf.should.length(1);
      buf[0].should.equal(0xe0);
      buf.should.eql(new Buffer([0xe0]));

      buf = hessian.encode(java.long(-8), '2.0');
      buf.should.length(1);
      buf[0].should.equal(0xd8);
      buf.should.eql(new Buffer([0xd8]));

      buf = hessian.encode(java.long(-7), '2.0');
      buf.should.length(1);
      buf[0].should.equal(0xd9);
      buf.should.eql(new Buffer([0xd9]));

      buf = hessian.encode(java.long(15), '2.0');
      buf.should.length(1);
      buf[0].should.equal(0xef);
      buf.should.eql(new Buffer([0xef]));

      buf = hessian.encode(java.long(14), '2.0');
      buf.should.length(1);
      buf[0].should.equal(0xee);
      buf.should.eql(new Buffer([0xee]));

      // -2048 ~ 2047
      buf = hessian.encode(java.long(-9), '2.0');
      buf.should.length(2);
      buf[0].should.equal(0xf7);
      buf[1].should.equal(0xf7);
      buf.should.eql(new Buffer([0xf7, 0xf7]));

      buf = hessian.encode(java.long(16), '2.0');
      buf.should.length(2);
      buf[0].should.equal(0xf8);
      buf[1].should.equal(0x10);
      buf.should.eql(new Buffer([0xf8, 0x10]));

      buf = hessian.encode(java.long(255), '2.0');
      buf.should.length(2);
      buf[0].should.equal(0xf8);
      buf[1].should.equal(0xff);
      buf.should.eql(new Buffer([0xf8, 0xff]));

      buf = hessian.encode(java.long(-2048), '2.0');
      buf.should.length(2);
      buf[0].should.equal(0xf0);
      buf[1].should.equal(0);
      buf.should.eql(new Buffer([0xf0, 0x00]));

      buf = hessian.encode(java.long(2047), '2.0');
      buf.should.length(2);
      buf[0].should.equal(0xff);
      buf[1].should.equal(0xff);
      buf.should.eql(new Buffer([0xff, 0xff]));

      // -262144 ~ 262143
      buf = hessian.encode(java.long(262143), '2.0');
      buf.should.length(3);
      buf[0].should.equal(0x3f);
      buf[1].should.equal(0xff);
      buf[2].should.equal(0xff);
      buf.should.eql(new Buffer([0x3f, 0xff, 0xff]));

      buf = hessian.encode(java.long(-262144), '2.0');
      buf.should.length(3);
      buf[0].should.equal(0x38);
      buf[1].should.equal(0);
      buf[2].should.equal(0);
      buf.should.eql(new Buffer([0x38, 0x00, 0x00]));

      buf = hessian.encode(java.long(2048), '2.0');
      buf.should.length(3);
      buf[0].should.equal(0x3c);
      buf[1].should.equal(0x08);
      buf[2].should.equal(0x00);
      buf.should.eql(new Buffer([0x3c, 0x08, 0x00]));

      buf = hessian.encode(java.long(-2049), '2.0');
      buf.should.length(3);
      buf[0].should.equal(0x3b);
      buf[1].should.equal(0xf7);
      buf[2].should.equal(0xff);
      buf.should.eql(new Buffer([0x3b, 0xf7, 0xff]));

      // -2147483648 ~ 2147483647
      buf = hessian.encode(java.long(-2147483648), '2.0');
      buf.should.length(5);
      buf[0].should.equal(0x59);
      buf[1].should.equal(0x80);
      buf[2].should.equal(0x00);
      buf[3].should.equal(0x00);
      buf[4].should.equal(0x00);
      buf.should.eql(new Buffer([0x59, 0x80, 0x00, 0x00, 0x00]));

      buf = hessian.encode(java.long(2147483647), '2.0');
      buf.should.length(5);
      buf[0].should.equal(0x59);
      buf[1].should.equal(0x7f);
      buf[2].should.equal(0xff);
      buf[3].should.equal(0xff);
      buf[4].should.equal(0xff);
      buf.should.eql(new Buffer([0x59, 0x7f, 0xff, 0xff, 0xff]));

      // L
      buf = hessian.encode(java.long(2147483648), '2.0');
      buf.should.length(9);
      buf.should.eql(new Buffer([0x4c, 0x00, 0x00, 0x00, 0x00, 0x80, 0x00, 0x00, 0x00]));
    });

    it('should write { $class: "long": $: "..." } ok', function () {
      // -8 ~ 15
      var buf = hessian.encode(java.long('0'), '2.0');
      buf.should.length(1);
      buf[0].should.equal(0xe0);
      buf.should.eql(new Buffer([0xe0]));

      buf = hessian.encode(java.long('-8'), '2.0');
      buf.should.length(1);
      buf[0].should.equal(0xd8);
      buf.should.eql(new Buffer([0xd8]));

      buf = hessian.encode(java.long('-7'), '2.0');
      buf.should.length(1);
      buf[0].should.equal(0xd9);
      buf.should.eql(new Buffer([0xd9]));

      buf = hessian.encode(java.long('15'), '2.0');
      buf.should.length(1);
      buf[0].should.equal(0xef);
      buf.should.eql(new Buffer([0xef]));

      buf = hessian.encode(java.long('14'), '2.0');
      buf.should.length(1);
      buf[0].should.equal(0xee);
      buf.should.eql(new Buffer([0xee]));

      // -2048 ~ 2047
      buf = hessian.encode(java.long('-9'), '2.0');
      buf.should.length(2);
      buf[0].should.equal(0xf7);
      buf[1].should.equal(0xf7);
      buf.should.eql(new Buffer([0xf7, 0xf7]));

      buf = hessian.encode(java.long('16'), '2.0');
      buf.should.length(2);
      buf[0].should.equal(0xf8);
      buf[1].should.equal(0x10);
      buf.should.eql(new Buffer([0xf8, 0x10]));

      buf = hessian.encode(java.long('255'), '2.0');
      buf.should.length(2);
      buf[0].should.equal(0xf8);
      buf[1].should.equal(0xff);
      buf.should.eql(new Buffer([0xf8, 0xff]));

      buf = hessian.encode(java.long('-2048'), '2.0');
      buf.should.length(2);
      buf[0].should.equal(0xf0);
      buf[1].should.equal(0);
      buf.should.eql(new Buffer([0xf0, 0x00]));

      buf = hessian.encode(java.long('2047'), '2.0');
      buf.should.length(2);
      buf[0].should.equal(0xff);
      buf[1].should.equal(0xff);
      buf.should.eql(new Buffer([0xff, 0xff]));

      // -262144 ~ 262143
      buf = hessian.encode(java.long('262143'), '2.0');
      buf.should.length(3);
      buf[0].should.equal(0x3f);
      buf[1].should.equal(0xff);
      buf[2].should.equal(0xff);
      buf.should.eql(new Buffer([0x3f, 0xff, 0xff]));

      buf = hessian.encode(java.long('-262144'), '2.0');
      buf.should.length(3);
      buf[0].should.equal(0x38);
      buf[1].should.equal(0);
      buf[2].should.equal(0);
      buf.should.eql(new Buffer([0x38, 0x00, 0x00]));

      buf = hessian.encode(java.long('2048'), '2.0');
      buf.should.length(3);
      buf[0].should.equal(0x3c);
      buf[1].should.equal(0x08);
      buf[2].should.equal(0x00);
      buf.should.eql(new Buffer([0x3c, 0x08, 0x00]));

      buf = hessian.encode(java.long('-2049'), '2.0');
      buf.should.length(3);
      buf[0].should.equal(0x3b);
      buf[1].should.equal(0xf7);
      buf[2].should.equal(0xff);
      buf.should.eql(new Buffer([0x3b, 0xf7, 0xff]));

      // -2147483648 ~ 2147483647
      buf = hessian.encode(java.long('-2147483648'), '2.0');
      buf.should.length(5);
      buf[0].should.equal(0x59);
      buf[1].should.equal(0x80);
      buf[2].should.equal(0x00);
      buf[3].should.equal(0x00);
      buf[4].should.equal(0x00);
      buf.should.eql(new Buffer([0x59, 0x80, 0x00, 0x00, 0x00]));

      buf = hessian.encode(java.long('2147483647'), '2.0');
      buf.should.length(5);
      buf[0].should.equal(0x59);
      buf[1].should.equal(0x7f);
      buf[2].should.equal(0xff);
      buf[3].should.equal(0xff);
      buf[4].should.equal(0xff);
      buf.should.eql(new Buffer([0x59, 0x7f, 0xff, 0xff, 0xff]));

      // L
      buf = hessian.encode(java.long('2147483648'), '2.0');
      buf.should.length(9);
      buf.should.eql(new Buffer([0x4c, 0x00, 0x00, 0x00, 0x00, 0x80, 0x00, 0x00, 0x00]));

      // unsafe long value
      buf = hessian.encode(java.long('9007199254740992'), '2.0');
      buf.should.length(9);
      buf.should.eql(new Buffer([0x4c, 0x00, 0x20, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]));
    });

    it('should write and read equal java impl', function () {
      hessian.encode(java.long(0), '2.0').should.eql(utils.bytes('v2/long/0'));
      hessian.decode(utils.bytes('v2/long/0'), '2.0').should.equal(0);
      hessian.encode(java.long(-8), '2.0').should.eql(utils.bytes('v2/long/-8'));
      hessian.decode(utils.bytes('v2/long/-8'), '2.0').should.equal(-8);
      hessian.encode(java.long(-7), '2.0').should.eql(utils.bytes('v2/long/-7'));
      hessian.decode(utils.bytes('v2/long/-7'), '2.0').should.equal(-7);
      hessian.encode(java.long(15), '2.0').should.eql(utils.bytes('v2/long/15'));
      hessian.decode(utils.bytes('v2/long/15'), '2.0').should.equal(15);
      hessian.encode(java.long(14), '2.0').should.eql(utils.bytes('v2/long/14'));
      hessian.decode(utils.bytes('v2/long/14'), '2.0').should.equal(14);
      hessian.encode(java.long(-9), '2.0').should.eql(utils.bytes('v2/long/-9'));
      hessian.decode(utils.bytes('v2/long/-9'), '2.0').should.equal(-9);
      hessian.encode(java.long(16), '2.0').should.eql(utils.bytes('v2/long/16'));
      hessian.decode(utils.bytes('v2/long/16'), '2.0').should.equal(16);
      hessian.encode(java.long(255), '2.0').should.eql(utils.bytes('v2/long/255'));
      hessian.encode(java.long(Long.fromNumber(255)), '2.0').should.eql(utils.bytes('v2/long/255'));
      hessian.encode(Long.fromNumber(255), '2.0').should.eql(utils.bytes('v2/long/255'));

      hessian.decode(utils.bytes('v2/long/255'), '2.0').should.equal(255);
      hessian.encode(java.long(-2048), '2.0').should.eql(utils.bytes('v2/long/-2048'));
      hessian.decode(utils.bytes('v2/long/-2048'), '2.0').should.equal(-2048);
      hessian.encode(java.long(2047), '2.0').should.eql(utils.bytes('v2/long/2047'));
      hessian.decode(utils.bytes('v2/long/2047'), '2.0').should.equal(2047);
      hessian.encode(java.long(262143), '2.0').should.eql(utils.bytes('v2/long/262143'));
      hessian.decode(utils.bytes('v2/long/262143'), '2.0').should.equal(262143);
      hessian.encode(java.long(-262144), '2.0').should.eql(utils.bytes('v2/long/-262144'));
      hessian.decode(utils.bytes('v2/long/-262144'), '2.0').should.equal(-262144);
      hessian.encode(java.long(2048), '2.0').should.eql(utils.bytes('v2/long/2048'));
      hessian.decode(utils.bytes('v2/long/2048'), '2.0').should.equal(2048);
      hessian.encode(java.long(-2049), '2.0').should.eql(utils.bytes('v2/long/-2049'));
      hessian.decode(utils.bytes('v2/long/-2049'), '2.0').should.equal(-2049);
      hessian.encode(java.long(-2147483648), '2.0').should.eql(utils.bytes('v2/long/-2147483648'));
      hessian.decode(utils.bytes('v2/long/-2147483648'), '2.0').should.equal(-2147483648);
      hessian.encode(java.long(-2147483647), '2.0').should.eql(utils.bytes('v2/long/-2147483647'));
      hessian.decode(utils.bytes('v2/long/-2147483647'), '2.0').should.equal(-2147483647);
      hessian.encode(java.long(2147483647), '2.0').should.eql(utils.bytes('v2/long/2147483647'));
      hessian.decode(utils.bytes('v2/long/2147483647'), '2.0').should.equal(2147483647);
      hessian.encode(java.long(2147483646), '2.0').should.eql(utils.bytes('v2/long/2147483646'));
      hessian.decode(utils.bytes('v2/long/2147483646'), '2.0').should.equal(2147483646);
      hessian.encode(java.long(2147483648), '2.0').should.eql(utils.bytes('v2/long/2147483648'));
      hessian.decode(utils.bytes('v2/long/2147483648'), '2.0').should.equal(2147483648);
    });

    it('should read 1.0 bin as well', function () {
      hessian.decode(utils.bytes('v1/long/0'), '2.0').should.equal(0);
      hessian.decode(utils.bytes('v1/long/-8'), '2.0').should.equal(-8);
      hessian.decode(utils.bytes('v1/long/-7'), '2.0').should.equal(-7);
      hessian.decode(utils.bytes('v1/long/15'), '2.0').should.equal(15);
      hessian.decode(utils.bytes('v1/long/14'), '2.0').should.equal(14);
      hessian.decode(utils.bytes('v1/long/-9'), '2.0').should.equal(-9);
      hessian.decode(utils.bytes('v1/long/16'), '2.0').should.equal(16);
      hessian.decode(utils.bytes('v1/long/255'), '2.0').should.equal(255);
      hessian.decode(utils.bytes('v1/long/-2048'), '2.0').should.equal(-2048);
      hessian.decode(utils.bytes('v1/long/2047'), '2.0').should.equal(2047);
      hessian.decode(utils.bytes('v1/long/262143'), '2.0').should.equal(262143);
      hessian.decode(utils.bytes('v1/long/-262144'), '2.0').should.equal(-262144);
      hessian.decode(utils.bytes('v1/long/2048'), '2.0').should.equal(2048);
      hessian.decode(utils.bytes('v1/long/-2049'), '2.0').should.equal(-2049);
      hessian.decode(utils.bytes('v1/long/-2147483648'), '2.0').should.equal(-2147483648);
      hessian.decode(utils.bytes('v1/long/-2147483647'), '2.0').should.equal(-2147483647);
      hessian.decode(utils.bytes('v1/long/2147483647'), '2.0').should.equal(2147483647);
      hessian.decode(utils.bytes('v1/long/2147483646'), '2.0').should.equal(2147483646);
      hessian.decode(utils.bytes('v1/long/2147483648'), '2.0').should.equal(2147483648);
    });
  });
});
