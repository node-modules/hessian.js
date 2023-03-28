"use strict";

var assert = require('assert');
var java = require('js-to-java');
var Long = require('long');
var hessian = require('../../index');
var utils = require('../utils');
var rustDecode = require('./rustdecoder');

describe('long.test.js', function () {
  describe('v2.0', function () {
    it('should read compact long', function () {
      assert(rustDecode(new Buffer([0xe0])) === 0);
      assert(rustDecode(new Buffer([0xd8])) === -8);
      assert(rustDecode(new Buffer([0xef])) === 15);

      assert(rustDecode(new Buffer([0xf8, 0x00])) === 0);
      assert(rustDecode(new Buffer([0xf0, 0x00])) === -2048);
      assert(rustDecode(new Buffer([0xf7, 0x00])) === -256);
      assert(rustDecode(new Buffer([0xff, 0xff])) === 2047);

      assert(rustDecode(new Buffer([0x3c, 0x00, 0x00])) === 0);
      assert(rustDecode(new Buffer([0x38, 0x00, 0x00])) === -262144);
      assert(rustDecode(new Buffer([0x3f, 0xff, 0xff])) === 262143);

      // four octet longs
      assert(rustDecode(new Buffer([0x77, 0x00, 0x00, 0x00, 0x00])) === 0);
      assert(rustDecode(new Buffer([0x77, 0x00, 0x00, 0x01, 0x2c])) === 300);
      assert(
        rustDecode(new Buffer([0x77, 0x7f, 0xff, 0xff, 0xff])) === 2147483647
      );
      assert(
        rustDecode(new Buffer([0x77, 0x80, 0x00, 0x00, 0x00])) === -2147483648
      );
    });

    it('should read normal long', function () {
      assert(
        rustDecode(new Buffer([0x4c, 0x00, 0x00, 0x00, 0x00, 0x80, 0x00, 0x00, 0x00])) === 2147483648
      );
    });

    it('should write and read equal java impl', function () {
      assert(rustDecode(utils.bytes('v2/long/0')) === 0);
      assert(rustDecode(utils.bytes('v2/long/-8')) === -8);
      assert(rustDecode(utils.bytes('v2/long/-7')) === -7);
      assert(rustDecode(utils.bytes('v2/long/15')) === 15);
      assert(rustDecode(utils.bytes('v2/long/14')) === 14);
      assert(rustDecode(utils.bytes('v2/long/-9')) === -9);
      assert(rustDecode(utils.bytes('v2/long/16')) === 16);
      assert(rustDecode(utils.bytes('v2/long/255')) === 255);
      assert(rustDecode(utils.bytes('v2/long/-2048')) === -2048);
      assert(rustDecode(utils.bytes('v2/long/2047')) === 2047);
      assert(rustDecode(utils.bytes('v2/long/262143')) === 262143);
      assert(rustDecode(utils.bytes('v2/long/-262144')) === -262144);
      assert(rustDecode(utils.bytes('v2/long/2048')) === 2048);
      assert(rustDecode(utils.bytes('v2/long/-2049')) === -2049);
      assert(rustDecode(utils.bytes('v2/long/-2147483648')) === -2147483648);
      assert(rustDecode(utils.bytes('v2/long/-2147483647')) === -2147483647);
      assert(rustDecode(utils.bytes('v2/long/2147483647')) === 2147483647);
      assert(rustDecode(utils.bytes('v2/long/2147483646')) === 2147483646);
      assert(rustDecode(utils.bytes('v2/long/2147483648')) === 2147483648);
    });

    it('should read 1.0 bin as well', function () {
      assert(rustDecode(utils.bytes('v1/long/0')) === 0);
      assert(rustDecode(utils.bytes('v1/long/-8')) === -8);
      assert(rustDecode(utils.bytes('v1/long/-7')) === -7);
      assert(rustDecode(utils.bytes('v1/long/15')) === 15);
      assert(rustDecode(utils.bytes('v1/long/14')) === 14);
      assert(rustDecode(utils.bytes('v1/long/-9')) === -9);
      assert(rustDecode(utils.bytes('v1/long/16')) === 16);
      assert(rustDecode(utils.bytes('v1/long/255')) === 255);
      assert(rustDecode(utils.bytes('v1/long/-2048')) === -2048);
      assert(rustDecode(utils.bytes('v1/long/2047')) === 2047);
      assert(rustDecode(utils.bytes('v1/long/262143')) === 262143);
      assert(rustDecode(utils.bytes('v1/long/-262144')) === -262144);
      assert(rustDecode(utils.bytes('v1/long/2048')) === 2048);
      assert(rustDecode(utils.bytes('v1/long/-2049')) === -2049);
      assert(rustDecode(utils.bytes('v1/long/-2147483648')) === -2147483648);
      assert(rustDecode(utils.bytes('v1/long/-2147483647')) === -2147483647);
      assert(rustDecode(utils.bytes('v1/long/2147483647')) === 2147483647);
      assert(rustDecode(utils.bytes('v1/long/2147483646')) === 2147483646);
      assert(rustDecode(utils.bytes('v1/long/2147483648')) === 2147483648);
    });
  });

  it('should decode with type', function () {
    assert.deepEqual(rustDecode(new Buffer([0x38, 0x00, 0x00])), -262144);

    assert.deepEqual(rustDecode(utils.bytes('v2/long/-2048')), -2048);

    assert.deepEqual(rustDecode(utils.bytes('v2/long/2147483646')), 2147483646);
  });

});
