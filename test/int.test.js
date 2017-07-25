/**
 * hessian.js - test/int.test.js
 *
 * Copyright(c)
 * MIT Licensed
 *
 * Authors:
 *   fengmk2 <fengmk2@gmail.com> (http://fengmk2.github.com)
 */

"use strict";

var assert = require('assert');
var hessian = require('../');
var utils = require('./utils');

describe('int.test.js', function () {
  it('should read integer 300', function () {
    assert(
      hessian.decode(new Buffer(['I'.charCodeAt(0), 0x00, 0x00, 0x01, 0x2c])) === 300
    );
  });

  it('should write integer 300', function () {
    assert.deepEqual(
      hessian.encode(300),
      new Buffer(['I'.charCodeAt(0), 0x00, 0x00, 0x01, 0x2c])
    );
  });

  it('should write integer 0', function () {
    assert.deepEqual(hessian.encode(0), new Buffer(['I'.charCodeAt(0), 0, 0, 0, 0]));
  });

  it('should write number as java write', function () {
    assert.deepEqual(hessian.encode(0, '1.0'), utils.bytes('v1/number/0'));
    assert.deepEqual(hessian.encode(1), utils.bytes('v1/number/1'));
    assert.deepEqual(hessian.encode(10), utils.bytes('v1/number/10'));
    assert.deepEqual(hessian.encode(16), utils.bytes('v1/number/16'));
    assert.deepEqual(hessian.encode(2047), utils.bytes('v1/number/2047'));
    assert.deepEqual(hessian.encode(255, '1.0'), utils.bytes('v1/number/255'));
    assert.deepEqual(hessian.encode(256, '1.0'), utils.bytes('v1/number/256'));
    assert.deepEqual(hessian.encode(262143, '1.0'), utils.bytes('v1/number/262143'));
    assert.deepEqual(hessian.encode(262144, '1.0'), utils.bytes('v1/number/262144'));
    assert.deepEqual(hessian.encode(46, '1.0'), utils.bytes('v1/number/46'));
    assert.deepEqual(hessian.encode(47, '1.0'), utils.bytes('v1/number/47'));

    assert.deepEqual(hessian.encode(-16, '1.0'), utils.bytes('v1/number/-16'));
    assert.deepEqual(hessian.encode(-2048, '1.0'), utils.bytes('v1/number/-2048'));
    assert.deepEqual(hessian.encode(-256), utils.bytes('v1/number/-256'));
    assert.deepEqual(hessian.encode(-262144, '1.0'), utils.bytes('v1/number/-262144'));
    assert.deepEqual(hessian.encode(-262145, '1.0'), utils.bytes('v1/number/-262145'));
  });

  it('should read java number bin', function () {
    assert(hessian.decode(utils.bytes('v1/number/0'), '1.0') === 0);
    assert(hessian.decode(utils.bytes('v1/number/1'), '1.0') === 1);
    assert(hessian.decode(utils.bytes('v1/number/10'), '1.0') === 10);
    assert(hessian.decode(utils.bytes('v1/number/16'), '1.0') === 16);
    assert(hessian.decode(utils.bytes('v1/number/2047'), '1.0') === 2047);
    assert(hessian.decode(utils.bytes('v1/number/255'), '1.0') === 255);
    assert(hessian.decode(utils.bytes('v1/number/256'), '1.0') === 256);
    assert(hessian.decode(utils.bytes('v1/number/262143'), '1.0') === 262143);
    assert(hessian.decode(utils.bytes('v1/number/262144'), '1.0') === 262144);
    assert(hessian.decode(utils.bytes('v1/number/46'), '1.0') === 46);
    assert(hessian.decode(utils.bytes('v1/number/47'), '1.0') === 47);
    assert(hessian.decode(utils.bytes('v1/number/-16'), '1.0') === -16);
    assert(hessian.decode(utils.bytes('v1/number/-2048'), '1.0') === -2048);
    assert(hessian.decode(utils.bytes('v1/number/-256'), '1.0') === -256);
    assert(hessian.decode(utils.bytes('v1/number/-262144'), '1.0') === -262144);
    assert(hessian.decode(utils.bytes('v1/number/-262145'), '1.0') === -262145);
  });

  describe('v2.0', function () {
    it('should read compact integers', function () {
      assert(hessian.decode(new Buffer([0x90]), '2.0') === 0);
      assert(hessian.decode(new Buffer([0x80]), '2.0') === -16);
      assert(hessian.decode(new Buffer([0xbf]), '2.0') === 47);

      assert(hessian.decode(new Buffer([0xc8, 0x00]), '2.0') === 0);
      assert(hessian.decode(new Buffer([0xc0, 0x00]), '2.0') === -2048);
      assert(hessian.decode(new Buffer([0xc7, 0x00]), '2.0') === -256);
      assert(hessian.decode(new Buffer([0xcf, 0xff]), '2.0') === 2047);

      assert(hessian.decode(new Buffer([0xd4, 0x00, 0x00]), '2.0') === 0);
      assert(hessian.decode(new Buffer([0xd0, 0x00, 0x00]), '2.0') === -262144);
      assert(hessian.decode(new Buffer([0xd7, 0xff, 0xff]), '2.0') === 262143);

      assert(
        hessian.decode(new Buffer(['I'.charCodeAt(0), 0x00, 0x00, 0x00, 0x00]), '2.0') === 0
      );
      assert(
        hessian.decode(new Buffer(['I'.charCodeAt(0), 0x00, 0x00, 0x01, 0x2c]), '2.0') === 300
      );
    });

    it('should write number as java write', function () {
      assert.deepEqual(hessian.encode(0, '2.0'), utils.bytes('v2/number/0'));
      assert.deepEqual(hessian.encode(1, '2.0'), utils.bytes('v2/number/1'));
      assert.deepEqual(hessian.encode(10, '2.0'), utils.bytes('v2/number/10'));
      assert.deepEqual(hessian.encode(16, '2.0'), utils.bytes('v2/number/16'));
      assert.deepEqual(hessian.encode(2047, '2.0'), utils.bytes('v2/number/2047'));
      assert.deepEqual(hessian.encode(255, '2.0'), utils.bytes('v2/number/255'));
      assert.deepEqual(hessian.encode(256, '2.0'), utils.bytes('v2/number/256'));
      assert.deepEqual(hessian.encode(262143, '2.0'), utils.bytes('v2/number/262143'));
      assert.deepEqual(hessian.encode(262144, '2.0'), utils.bytes('v2/number/262144'));
      assert.deepEqual(hessian.encode(46, '2.0'), utils.bytes('v2/number/46'));
      assert.deepEqual(hessian.encode(47, '2.0'), utils.bytes('v2/number/47'));
      assert.deepEqual(hessian.encode(-16, '2.0'), utils.bytes('v2/number/-16'));
      assert.deepEqual(hessian.encode(-2048, '2.0'), utils.bytes('v2/number/-2048'));
      assert.deepEqual(hessian.encode(-256, '2.0'), utils.bytes('v2/number/-256'));
      assert.deepEqual(hessian.encode(-262144, '2.0'), utils.bytes('v2/number/-262144'));
      assert.deepEqual(hessian.encode(-262145, '2.0'), utils.bytes('v2/number/-262145'));
    });

    it('should read java number bin', function () {
      assert(hessian.decode(utils.bytes('v2/number/0'), '2.0') === 0);
      assert(hessian.decode(utils.bytes('v2/number/1'), '2.0') === 1);
      assert(hessian.decode(utils.bytes('v2/number/10'), '2.0') === 10);
      assert(hessian.decode(utils.bytes('v2/number/16'), '2.0') === 16);
      assert(hessian.decode(utils.bytes('v2/number/2047'), '2.0') === 2047);
      assert(hessian.decode(utils.bytes('v2/number/255'), '2.0') === 255);
      assert(hessian.decode(utils.bytes('v2/number/256'), '2.0') === 256);
      assert(hessian.decode(utils.bytes('v2/number/262143'), '2.0') === 262143);
      assert(hessian.decode(utils.bytes('v2/number/262144'), '2.0') === 262144);
      assert(hessian.decode(utils.bytes('v2/number/46'), '2.0') === 46);
      assert(hessian.decode(utils.bytes('v2/number/47'), '2.0') === 47);
      assert(hessian.decode(utils.bytes('v2/number/-16'), '2.0') === -16);
      assert(hessian.decode(utils.bytes('v2/number/-2048'), '2.0') === -2048);
      assert(hessian.decode(utils.bytes('v2/number/-256'), '2.0') === -256);
      assert(hessian.decode(utils.bytes('v2/number/-262144'), '2.0') === -262144);
      assert(hessian.decode(utils.bytes('v2/number/-262145'), '2.0') === -262145);
    });

    it('should read hessian 1.0 number bin', function () {
      assert(hessian.decode(utils.bytes('v1/number/0'), '2.0') === 0);
      assert(hessian.decode(utils.bytes('v1/number/1'), '2.0') === 1);
      assert(hessian.decode(utils.bytes('v1/number/10'), '2.0') === 10);
      assert(hessian.decode(utils.bytes('v1/number/16'), '2.0') === 16);
      assert(hessian.decode(utils.bytes('v1/number/2047'), '2.0') === 2047);
      assert(hessian.decode(utils.bytes('v1/number/255'), '2.0') === 255);
      assert(hessian.decode(utils.bytes('v1/number/256'), '2.0') === 256);
      assert(hessian.decode(utils.bytes('v1/number/262143'), '2.0') === 262143);
      assert(hessian.decode(utils.bytes('v1/number/262144'), '2.0') === 262144);
      assert(hessian.decode(utils.bytes('v1/number/46'), '2.0') === 46);
      assert(hessian.decode(utils.bytes('v1/number/47'), '2.0') === 47);
      assert(hessian.decode(utils.bytes('v1/number/-16'), '2.0') === -16);
      assert(hessian.decode(utils.bytes('v1/number/-2048'), '2.0') === -2048);
      assert(hessian.decode(utils.bytes('v1/number/-256'), '2.0') === -256);
      assert(hessian.decode(utils.bytes('v1/number/-262144'), '2.0') === -262144);
      assert(hessian.decode(utils.bytes('v1/number/-262145'), '2.0') === -262145);
    });

    it('should write compact integers', function () {
      // -16 ~ 47
      var buf = hessian.encode(0, '2.0');
      assert(buf.length === 1);
      assert(buf[0] === 0x90);
      assert.deepEqual(buf, new Buffer([0x90]));

      buf = hessian.encode(1, '2.0');
      assert(buf.length === 1);
      assert(buf[0] === 0x91);
      assert.deepEqual(buf, new Buffer([0x91]));

      buf = hessian.encode(-16, '2.0');
      assert(buf.length === 1);
      assert(buf[0] === 0x80);
      assert.deepEqual(buf, new Buffer([0x80]));

      buf = hessian.encode(46, '2.0');
      assert(buf.length === 1);
      assert(buf[0] === 0xbe);
      assert.deepEqual(buf, new Buffer([0xbe]));

      buf = hessian.encode(47, '2.0');
      assert(buf.length === 1);
      assert(buf[0] === 0xbf);
      assert.deepEqual(buf, new Buffer([0xbf]));

      // -2048 ~ 2047
      buf = hessian.encode(-2048, '2.0');
      assert(buf.length === 2);
      assert(buf[0] === 0xc0);
      assert(buf[1] === 0x00);
      assert.deepEqual(buf, new Buffer([0xc0, 0x00]));

      buf = hessian.encode(-256, '2.0');
      assert(buf.length === 2);
      assert(buf[0] === 0xc7);
      assert(buf[1] === 0x00);
      assert.deepEqual(buf, new Buffer([0xc7, 0x00]));

      buf = hessian.encode(255, '2.0');
      assert(buf.length === 2);
      assert(buf[0] === 0xc8);
      assert(buf[1] === 0xff);
      assert.deepEqual(buf, new Buffer([0xc8, 0xff]));

      buf = hessian.encode(256, '2.0');
      assert(buf.length === 2);
      assert(buf[0] === 0xc9);
      assert(buf[1] === 0x00);
      assert.deepEqual(buf, new Buffer([0xc9, 0x00]));

      buf = hessian.encode(2047, '2.0');
      assert(buf.length === 2);
      assert(buf[0] === 0xcf);
      assert(buf[1] === 0xff);
      assert.deepEqual(buf, new Buffer([0xcf, 0xff]));

      // -262144 ~ 262143
      buf = hessian.encode(-262144, '2.0');
      assert(buf.length === 3);
      assert(buf[0] === 0xd0);
      assert(buf[1] === 0x00);
      assert(buf[2] === 0x00);
      assert.deepEqual(buf, new Buffer([0xd0, 0x00, 0x00]));

      buf = hessian.encode(262143, '2.0');
      assert(buf.length === 3);
      assert(buf[0] === 0xd7);
      assert(buf[1] === 0xff);
      assert(buf[2] === 0xff);
      assert.deepEqual(buf, new Buffer([0xd7, 0xff, 0xff]));

      // 262144
      buf = hessian.encode(262144, '2.0');
      assert(buf.length === 5);
      assert(buf[0] === 'I'.charCodeAt(0));
      assert(buf[1] === 0x00);
      assert(buf[2] === 0x04);
      assert(buf[3] === 0x00);
      assert(buf[4] === 0x00);
      assert.deepEqual(buf, new Buffer(['I'.charCodeAt(0), 0x00, 0x04, 0x00, 0x00]));

      buf = hessian.encode(-262145, '2.0');
      assert(buf.length === 5);
      assert(buf[0] === 'I'.charCodeAt(0));
      assert(buf[1] === 0xff);
      assert(buf[2] === 0xfb);
      assert(buf[3] === 0xff);
      assert(buf[4] === 0xff);
      assert.deepEqual(buf, new Buffer(['I'.charCodeAt(0), 0xff, 0xfb, 0xff, 0xff]));
    });
  });
});
