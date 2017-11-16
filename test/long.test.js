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

var assert = require('assert');
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
    assert(obj === null);
  });

  it('should read long 300', function () {
    assert(hessian.decode(longBuffer) === 300);
  });

  it('should write long 300', function () {
    assert.deepEqual(hessian.encode({
      $class: 'long',
      $: 300
    }), longBuffer);
    assert.deepEqual(hessian.encode(java.long(300)), longBuffer);
    assert.deepEqual(hessian.encode(java.long(300)), longBuffer);
    assert.deepEqual(hessian.encode(java.long(Long.fromNumber(300))), longBuffer);
    assert.deepEqual(hessian.encode(Long.fromNumber(300)), longBuffer);
  });

  it('should write long 0', function () {
    assert.deepEqual(
      hessian.encode(java.long(0)),
      new Buffer(['L'.charCodeAt(0), 0, 0, 0, 0, 0, 0, 0, 0])
    );
  });

  it('should write and read equal java impl', function () {
    assert.deepEqual(hessian.encode(java.long(0), '1.0'), utils.bytes('v1/long/0'));
    assert(hessian.decode(utils.bytes('v1/long/0')) === 0);
    assert.deepEqual(hessian.encode(java.long(-8), '1.0'), utils.bytes('v1/long/-8'));
    assert(hessian.decode(utils.bytes('v1/long/-8')) === -8);
    assert.deepEqual(hessian.encode(java.long(-7), '1.0'), utils.bytes('v1/long/-7'));
    assert(hessian.decode(utils.bytes('v1/long/-7')) === -7);
    assert.deepEqual(hessian.encode(java.long(15), '1.0'), utils.bytes('v1/long/15'));
    assert(hessian.decode(utils.bytes('v1/long/15')) === 15);
    assert.deepEqual(hessian.encode(java.long(14), '1.0'), utils.bytes('v1/long/14'));
    assert(hessian.decode(utils.bytes('v1/long/14')) === 14);
    assert.deepEqual(hessian.encode(java.long(-9), '1.0'), utils.bytes('v1/long/-9'));
    assert(hessian.decode(utils.bytes('v1/long/-9')) === -9);
    assert.deepEqual(hessian.encode(java.long(16), '1.0'), utils.bytes('v1/long/16'));
    assert(hessian.decode(utils.bytes('v1/long/16')) === 16);
    assert.deepEqual(hessian.encode(java.long(255), '1.0'), utils.bytes('v1/long/255'));
    assert(hessian.decode(utils.bytes('v1/long/255')) === 255);
    assert.deepEqual(hessian.encode(java.long(-2048), '1.0'), utils.bytes('v1/long/-2048'));
    assert(hessian.decode(utils.bytes('v1/long/-2048')) === -2048);
    assert.deepEqual(hessian.encode(java.long(2047), '1.0'), utils.bytes('v1/long/2047'));
    assert(hessian.decode(utils.bytes('v1/long/2047')) === 2047);
    assert.deepEqual(hessian.encode(java.long(262143), '1.0'), utils.bytes('v1/long/262143'));
    assert(hessian.decode(utils.bytes('v1/long/262143')) === 262143);
    assert.deepEqual(hessian.encode(java.long(-262144), '1.0'), utils.bytes('v1/long/-262144'));
    assert(hessian.decode(utils.bytes('v1/long/-262144')) === -262144);
    assert.deepEqual(hessian.encode(java.long(2048), '1.0'), utils.bytes('v1/long/2048'));
    assert(hessian.decode(utils.bytes('v1/long/2048')) === 2048);
    assert.deepEqual(hessian.encode(java.long(-2049), '1.0'), utils.bytes('v1/long/-2049'));
    assert(hessian.decode(utils.bytes('v1/long/-2049')) === -2049);
    assert.deepEqual(
      hessian.encode(java.long(-2147483648), '1.0'),
      utils.bytes('v1/long/-2147483648')
    );
    assert(hessian.decode(utils.bytes('v1/long/-2147483648')) === -2147483648);
    assert.deepEqual(
      hessian.encode(java.long(-2147483647), '1.0'),
      utils.bytes('v1/long/-2147483647')
    );
    assert(hessian.decode(utils.bytes('v1/long/-2147483647')) === -2147483647);
    assert.deepEqual(
      hessian.encode(java.long(2147483647), '1.0'),
      utils.bytes('v1/long/2147483647')
    );
    assert(hessian.decode(utils.bytes('v1/long/2147483647')) === 2147483647);
    assert.deepEqual(
      hessian.encode(java.long(2147483646), '1.0'),
      utils.bytes('v1/long/2147483646')
    );
    assert(hessian.decode(utils.bytes('v1/long/2147483646')) === 2147483646);
    assert.deepEqual(
      hessian.encode(java.long(2147483648), '1.0'),
      utils.bytes('v1/long/2147483648')
    );
    assert(hessian.decode(utils.bytes('v1/long/2147483648')) === 2147483648);
  });

  it('should decode with type', function () {
    assert.deepEqual(hessian.decode(utils.bytes('v1/long/-7'), true), {
      $class: 'long',
      $: -7,
    });

    assert.deepEqual(hessian.decode(utils.bytes('v1/long/262143'), true), {
      $class: 'long',
      $: 262143,
    });

    assert.deepEqual(hessian.decode(utils.bytes('v1/long/2147483648'), true), {
      $class: 'long',
      $: 2147483648,
    });
  });

  describe('v2.0', function () {
    it('should read compact long', function () {
      assert(hessian.decode(new Buffer([0xe0]), '2.0') === 0);
      assert(hessian.decode(new Buffer([0xd8]), '2.0') === -8);
      assert(hessian.decode(new Buffer([0xef]), '2.0') === 15);

      assert(hessian.decode(new Buffer([0xf8, 0x00]), '2.0') === 0);
      assert(hessian.decode(new Buffer([0xf0, 0x00]), '2.0') === -2048);
      assert(hessian.decode(new Buffer([0xf7, 0x00]), '2.0') === -256);
      assert(hessian.decode(new Buffer([0xff, 0xff]), '2.0') === 2047);

      assert(hessian.decode(new Buffer([0x3c, 0x00, 0x00]), '2.0') === 0);
      assert(hessian.decode(new Buffer([0x38, 0x00, 0x00]), '2.0') === -262144);
      assert(hessian.decode(new Buffer([0x3f, 0xff, 0xff]), '2.0') === 262143);

      // four octet longs
      assert(hessian.decode(new Buffer([0x77, 0x00, 0x00, 0x00, 0x00]), '2.0') === 0);
      assert(hessian.decode(new Buffer([0x77, 0x00, 0x00, 0x01, 0x2c]), '2.0') === 300);
      assert(
        hessian.decode(new Buffer([0x77, 0x7f, 0xff, 0xff, 0xff]), '2.0') === 2147483647
      );
      assert(
        hessian.decode(new Buffer([0x77, 0x80, 0x00, 0x00, 0x00]), '2.0') === -2147483648
      );
    });

    it('should read normal long', function () {
      assert(
        hessian.decode(new Buffer([0x4c, 0x00, 0x00, 0x00, 0x00, 0x80, 0x00, 0x00, 0x00]), '2.0') === 2147483648
      );
    });

    it('should write compact long', function () {
      // -8 ~ 15
      var buf = hessian.encode(java.long(0), '2.0');
      assert(buf.length === 1);
      assert(buf[0] === 0xe0);
      assert.deepEqual(buf, new Buffer([0xe0]));

      buf = hessian.encode(java.long(-8), '2.0');
      assert(buf.length === 1);
      assert(buf[0] === 0xd8);
      assert.deepEqual(buf, new Buffer([0xd8]));

      buf = hessian.encode(java.long(-7), '2.0');
      assert(buf.length === 1);
      assert(buf[0] === 0xd9);
      assert.deepEqual(buf, new Buffer([0xd9]));

      buf = hessian.encode(java.long(15), '2.0');
      assert(buf.length === 1);
      assert(buf[0] === 0xef);
      assert.deepEqual(buf, new Buffer([0xef]));

      buf = hessian.encode(java.long(14), '2.0');
      assert(buf.length === 1);
      assert(buf[0] === 0xee);
      assert.deepEqual(buf, new Buffer([0xee]));

      // -2048 ~ 2047
      buf = hessian.encode(java.long(-9), '2.0');
      assert(buf.length === 2);
      assert(buf[0] === 0xf7);
      assert(buf[1] === 0xf7);
      assert.deepEqual(buf, new Buffer([0xf7, 0xf7]));

      buf = hessian.encode(java.long(16), '2.0');
      assert(buf.length === 2);
      assert(buf[0] === 0xf8);
      assert(buf[1] === 0x10);
      assert.deepEqual(buf, new Buffer([0xf8, 0x10]));

      buf = hessian.encode(java.long(255), '2.0');
      assert(buf.length === 2);
      assert(buf[0] === 0xf8);
      assert(buf[1] === 0xff);
      assert.deepEqual(buf, new Buffer([0xf8, 0xff]));

      buf = hessian.encode(java.long(-2048), '2.0');
      assert(buf.length === 2);
      assert(buf[0] === 0xf0);
      assert(buf[1] === 0);
      assert.deepEqual(buf, new Buffer([0xf0, 0x00]));

      buf = hessian.encode(java.long(2047), '2.0');
      assert(buf.length === 2);
      assert(buf[0] === 0xff);
      assert(buf[1] === 0xff);
      assert.deepEqual(buf, new Buffer([0xff, 0xff]));

      // -262144 ~ 262143
      buf = hessian.encode(java.long(262143), '2.0');
      assert(buf.length === 3);
      assert(buf[0] === 0x3f);
      assert(buf[1] === 0xff);
      assert(buf[2] === 0xff);
      assert.deepEqual(buf, new Buffer([0x3f, 0xff, 0xff]));

      buf = hessian.encode(java.long(-262144), '2.0');
      assert(buf.length === 3);
      assert(buf[0] === 0x38);
      assert(buf[1] === 0);
      assert(buf[2] === 0);
      assert.deepEqual(buf, new Buffer([0x38, 0x00, 0x00]));

      buf = hessian.encode(java.long(2048), '2.0');
      assert(buf.length === 3);
      assert(buf[0] === 0x3c);
      assert(buf[1] === 0x08);
      assert(buf[2] === 0x00);
      assert.deepEqual(buf, new Buffer([0x3c, 0x08, 0x00]));

      buf = hessian.encode(java.long(-2049), '2.0');
      assert(buf.length === 3);
      assert(buf[0] === 0x3b);
      assert(buf[1] === 0xf7);
      assert(buf[2] === 0xff);
      assert.deepEqual(buf, new Buffer([0x3b, 0xf7, 0xff]));

      // -2147483648 ~ 2147483647
      buf = hessian.encode(java.long(-2147483648), '2.0');
      assert(buf.length === 5);
      assert(buf[0] === 0x77);
      assert(buf[1] === 0x80);
      assert(buf[2] === 0x00);
      assert(buf[3] === 0x00);
      assert(buf[4] === 0x00);
      assert.deepEqual(buf, new Buffer([0x77, 0x80, 0x00, 0x00, 0x00]));

      buf = hessian.encode(java.long(2147483647), '2.0');
      assert(buf.length === 5);
      assert(buf[0] === 0x77);
      assert(buf[1] === 0x7f);
      assert(buf[2] === 0xff);
      assert(buf[3] === 0xff);
      assert(buf[4] === 0xff);
      assert.deepEqual(buf, new Buffer([0x77, 0x7f, 0xff, 0xff, 0xff]));

      // L
      buf = hessian.encode(java.long(2147483648), '2.0');
      assert(buf.length === 9);
      assert.deepEqual(buf, new Buffer([0x4c, 0x00, 0x00, 0x00, 0x00, 0x80, 0x00, 0x00, 0x00]));
    });

    it('should write { $class: "long": $: "..." } ok', function () {
      // -8 ~ 15
      var buf = hessian.encode(java.long('0'), '2.0');
      assert.equal(buf.length, 1);
      assert.equal(buf[0], 0xe0);
      assert.deepEqual(buf, new Buffer([0xe0]));

      buf = hessian.encode(java.long('-8'), '2.0');
      assert.equal(buf.length, 1);
      assert.equal(buf[0], 0xd8);
      assert.deepEqual(buf, new Buffer([0xd8]));

      buf = hessian.encode(java.long('-7'), '2.0');
      assert.equal(buf.length, 1);
      assert.equal(buf[0], 0xd9);
      assert.deepEqual(buf, new Buffer([0xd9]));

      buf = hessian.encode(java.long('15'), '2.0');
      assert.equal(buf.length, 1);
      assert.equal(buf[0], 0xef);
      assert.deepEqual(buf, new Buffer([0xef]));

      buf = hessian.encode(java.long('14'), '2.0');
      assert.equal(buf.length, 1);
      assert.equal(buf[0], 0xee);
      assert.deepEqual(buf, new Buffer([0xee]));

      // -2048 ~ 2047
      buf = hessian.encode(java.long('-9'), '2.0');
      assert.equal(buf.length, 2);
      assert.equal(buf[0], 0xf7);
      assert.equal(buf[1], 0xf7);
      assert.deepEqual(buf, new Buffer([0xf7, 0xf7]));

      buf = hessian.encode(java.long('16'), '2.0');
      assert.equal(buf.length, 2);
      assert.equal(buf[0], 0xf8);
      assert.equal(buf[1], 0x10);
      assert.deepEqual(buf, new Buffer([0xf8, 0x10]));

      buf = hessian.encode(java.long('255'), '2.0');
      assert.equal(buf.length, 2);
      assert.equal(buf[0], 0xf8);
      assert.equal(buf[1], 0xff);
      assert.deepEqual(buf, new Buffer([0xf8, 0xff]));

      buf = hessian.encode(java.long('-2048'), '2.0');
      assert.equal(buf.length, 2);
      assert.equal(buf[0], 0xf0);
      assert.equal(buf[1], 0);
      assert.deepEqual(buf, new Buffer([0xf0, 0x00]));

      buf = hessian.encode(java.long('2047'), '2.0');
      assert.equal(buf.length, 2);
      assert.equal(buf[0], 0xff);
      assert.equal(buf[1], 0xff);
      assert.deepEqual(buf, new Buffer([0xff, 0xff]));

      // -262144 ~ 262143
      buf = hessian.encode(java.long('262143'), '2.0');
      assert.equal(buf.length, 3);
      assert.equal(buf[0], 0x3f);
      assert.equal(buf[1], 0xff);
      assert.equal(buf[2], 0xff);
      assert.deepEqual(buf, new Buffer([0x3f, 0xff, 0xff]));

      buf = hessian.encode(java.long('-262144'), '2.0');
      assert.equal(buf.length, 3);
      assert.equal(buf[0], 0x38);
      assert.equal(buf[1], 0);
      assert.equal(buf[2], 0);
      assert.deepEqual(buf, new Buffer([0x38, 0x00, 0x00]));

      buf = hessian.encode(java.long('2048'), '2.0');
      assert.equal(buf.length, 3);
      assert.equal(buf[0], 0x3c);
      assert.equal(buf[1], 0x08);
      assert.equal(buf[2], 0x00);
      assert.deepEqual(buf, new Buffer([0x3c, 0x08, 0x00]));

      buf = hessian.encode(java.long('-2049'), '2.0');
      assert.equal(buf.length, 3);
      assert.equal(buf[0], 0x3b);
      assert.equal(buf[1], 0xf7);
      assert.equal(buf[2], 0xff);
      assert.deepEqual(buf, new Buffer([0x3b, 0xf7, 0xff]));

      // -2147483648 ~ 2147483647
      buf = hessian.encode(java.long('-2147483648'), '2.0');
      assert.equal(buf.length, 5);
      assert.equal(buf[0], 0x77);
      assert.equal(buf[1], 0x80);
      assert.equal(buf[2], 0x00);
      assert.equal(buf[3], 0x00);
      assert.equal(buf[4], 0x00);
      assert.deepEqual(buf, new Buffer([0x77, 0x80, 0x00, 0x00, 0x00]));

      buf = hessian.encode(java.long('2147483647'), '2.0');
      assert.equal(buf.length, 5);
      assert.equal(buf[0], 0x77);
      assert.equal(buf[1], 0x7f);
      assert.equal(buf[2], 0xff);
      assert.equal(buf[3], 0xff);
      assert.equal(buf[4], 0xff);
      assert.deepEqual(buf, new Buffer([0x77, 0x7f, 0xff, 0xff, 0xff]));

      // L
      buf = hessian.encode(java.long('2147483648'), '2.0');
      assert.equal(buf.length, 9);
      assert.deepEqual(buf, new Buffer([0x4c, 0x00, 0x00, 0x00, 0x00, 0x80, 0x00, 0x00, 0x00]));

      // unsafe long value
      buf = hessian.encode(java.long('9007199254740992'), '2.0');
      assert.equal(buf.length, 9);
      assert.deepEqual(buf, new Buffer([0x4c, 0x00, 0x20, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]));
    });

    it('should write and read equal java impl', function () {
      assert.deepEqual(hessian.encode(java.long(Long.fromNumber(15)), '2.0'), utils.bytes('v2/long/15'));
      assert.deepEqual(hessian.encode(java.long(Long.fromNumber(-8)), '2.0'), utils.bytes('v2/long/-8'));
      assert.deepEqual(hessian.encode(java.long(Long.fromNumber(-2048)), '2.0'), utils.bytes('v2/long/-2048'));
      assert.deepEqual(hessian.encode(java.long(Long.fromNumber(2047)), '2.0'), utils.bytes('v2/long/2047'));
      assert.deepEqual(hessian.encode(java.long(Long.fromNumber(-262144)), '2.0'), utils.bytes('v2/long/-262144'));
      assert.deepEqual(hessian.encode(java.long(Long.fromNumber(262143)), '2.0'), utils.bytes('v2/long/262143'));
      assert.deepEqual(hessian.encode(java.long(Long.fromNumber(-2147483648)), '2.0'), utils.bytes('v2/long/-2147483648'));
      assert.deepEqual(hessian.encode(java.long(Long.fromNumber(2147483647)), '2.0'), utils.bytes('v2/long/2147483647'));

      assert.deepEqual(hessian.encode(java.long(0), '2.0'), utils.bytes('v2/long/0'));
      assert(hessian.decode(utils.bytes('v2/long/0'), '2.0') === 0);
      assert.deepEqual(hessian.encode(java.long(-8), '2.0'), utils.bytes('v2/long/-8'));
      assert(hessian.decode(utils.bytes('v2/long/-8'), '2.0') === -8);
      assert.deepEqual(hessian.encode(java.long(-7), '2.0'), utils.bytes('v2/long/-7'));
      assert(hessian.decode(utils.bytes('v2/long/-7'), '2.0') === -7);
      assert.deepEqual(hessian.encode(java.long(15), '2.0'), utils.bytes('v2/long/15'));
      assert(hessian.decode(utils.bytes('v2/long/15'), '2.0') === 15);
      assert.deepEqual(hessian.encode(java.long(14), '2.0'), utils.bytes('v2/long/14'));
      assert(hessian.decode(utils.bytes('v2/long/14'), '2.0') === 14);
      assert.deepEqual(hessian.encode(java.long(-9), '2.0'), utils.bytes('v2/long/-9'));
      assert(hessian.decode(utils.bytes('v2/long/-9'), '2.0') === -9);
      assert.deepEqual(hessian.encode(java.long(16), '2.0'), utils.bytes('v2/long/16'));
      assert(hessian.decode(utils.bytes('v2/long/16'), '2.0') === 16);
      assert.deepEqual(hessian.encode(java.long(255), '2.0'), utils.bytes('v2/long/255'));
      assert.deepEqual(
        hessian.encode(java.long(Long.fromNumber(255)), '2.0'),
        utils.bytes('v2/long/255')
      );
      assert.deepEqual(hessian.encode(Long.fromNumber(255), '2.0'), utils.bytes('v2/long/255'));

      assert(hessian.decode(utils.bytes('v2/long/255'), '2.0') === 255);
      assert.deepEqual(hessian.encode(java.long(-2048), '2.0'), utils.bytes('v2/long/-2048'));
      assert(hessian.decode(utils.bytes('v2/long/-2048'), '2.0') === -2048);
      assert.deepEqual(hessian.encode(java.long(2047), '2.0'), utils.bytes('v2/long/2047'));
      assert(hessian.decode(utils.bytes('v2/long/2047'), '2.0') === 2047);
      assert.deepEqual(hessian.encode(java.long(262143), '2.0'), utils.bytes('v2/long/262143'));
      assert(hessian.decode(utils.bytes('v2/long/262143'), '2.0') === 262143);
      assert.deepEqual(hessian.encode(java.long(-262144), '2.0'), utils.bytes('v2/long/-262144'));
      assert(hessian.decode(utils.bytes('v2/long/-262144'), '2.0') === -262144);
      assert.deepEqual(hessian.encode(java.long(2048), '2.0'), utils.bytes('v2/long/2048'));
      assert(hessian.decode(utils.bytes('v2/long/2048'), '2.0') === 2048);
      assert.deepEqual(hessian.encode(java.long(-2049), '2.0'), utils.bytes('v2/long/-2049'));
      assert(hessian.decode(utils.bytes('v2/long/-2049'), '2.0') === -2049);
      assert.deepEqual(
        hessian.encode(java.long(-2147483648), '2.0'),
        utils.bytes('v2/long/-2147483648')
      );
      assert(hessian.decode(utils.bytes('v2/long/-2147483648'), '2.0') === -2147483648);
      assert.deepEqual(
        hessian.encode(java.long(-2147483647), '2.0'),
        utils.bytes('v2/long/-2147483647')
      );
      assert(hessian.decode(utils.bytes('v2/long/-2147483647'), '2.0') === -2147483647);
      assert.deepEqual(
        hessian.encode(java.long(2147483647), '2.0'),
        utils.bytes('v2/long/2147483647')
      );
      assert(hessian.decode(utils.bytes('v2/long/2147483647'), '2.0') === 2147483647);
      assert.deepEqual(
        hessian.encode(java.long(2147483646), '2.0'),
        utils.bytes('v2/long/2147483646')
      );
      assert(hessian.decode(utils.bytes('v2/long/2147483646'), '2.0') === 2147483646);
      assert.deepEqual(
        hessian.encode(java.long(2147483648), '2.0'),
        utils.bytes('v2/long/2147483648')
      );
      assert(hessian.decode(utils.bytes('v2/long/2147483648'), '2.0') === 2147483648);
    });

    it('should read 1.0 bin as well', function () {
      assert(hessian.decode(utils.bytes('v1/long/0'), '2.0') === 0);
      assert(hessian.decode(utils.bytes('v1/long/-8'), '2.0') === -8);
      assert(hessian.decode(utils.bytes('v1/long/-7'), '2.0') === -7);
      assert(hessian.decode(utils.bytes('v1/long/15'), '2.0') === 15);
      assert(hessian.decode(utils.bytes('v1/long/14'), '2.0') === 14);
      assert(hessian.decode(utils.bytes('v1/long/-9'), '2.0') === -9);
      assert(hessian.decode(utils.bytes('v1/long/16'), '2.0') === 16);
      assert(hessian.decode(utils.bytes('v1/long/255'), '2.0') === 255);
      assert(hessian.decode(utils.bytes('v1/long/-2048'), '2.0') === -2048);
      assert(hessian.decode(utils.bytes('v1/long/2047'), '2.0') === 2047);
      assert(hessian.decode(utils.bytes('v1/long/262143'), '2.0') === 262143);
      assert(hessian.decode(utils.bytes('v1/long/-262144'), '2.0') === -262144);
      assert(hessian.decode(utils.bytes('v1/long/2048'), '2.0') === 2048);
      assert(hessian.decode(utils.bytes('v1/long/-2049'), '2.0') === -2049);
      assert(hessian.decode(utils.bytes('v1/long/-2147483648'), '2.0') === -2147483648);
      assert(hessian.decode(utils.bytes('v1/long/-2147483647'), '2.0') === -2147483647);
      assert(hessian.decode(utils.bytes('v1/long/2147483647'), '2.0') === 2147483647);
      assert(hessian.decode(utils.bytes('v1/long/2147483646'), '2.0') === 2147483646);
      assert(hessian.decode(utils.bytes('v1/long/2147483648'), '2.0') === 2147483648);
    });
  });

  it('should decode with type', function () {
    assert.deepEqual(hessian.decode(new Buffer([0x38, 0x00, 0x00]), '2.0', true), {
      $class: 'long',
      $: -262144,
    });

    assert.deepEqual(hessian.decode(utils.bytes('v2/long/-2048'), '2.0', true), {
      $class: 'long',
      $: -2048,
    });

    assert.deepEqual(hessian.decode(utils.bytes('v2/long/2147483646'), '2.0', true), {
      $class: 'long',
      $: 2147483646,
    });
  });

});
