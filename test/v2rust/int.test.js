"use strict";

var assert = require('assert');
var hessian = require('../../index');
var utils = require('../utils');
var rustDecode = require('./rustdecoder');

describe('int.test.js', function () {
  describe('v2.0', function () {
    it('should read compact integers', function () {
      assert(rustDecode(new Buffer([0x90])) === 0);
      assert(rustDecode(new Buffer([0x80])) === -16);
      assert(rustDecode(new Buffer([0xbf])) === 47);

      assert(rustDecode(new Buffer([0xc8, 0x00])) === 0);
      assert(rustDecode(new Buffer([0xc0, 0x00])) === -2048);
      assert(rustDecode(new Buffer([0xc7, 0x00])) === -256);
      assert(rustDecode(new Buffer([0xcf, 0xff])) === 2047);

      assert(rustDecode(new Buffer([0xd4, 0x00, 0x00])) === 0);
      assert(rustDecode(new Buffer([0xd0, 0x00, 0x00])) === -262144);
      assert(rustDecode(new Buffer([0xd7, 0xff, 0xff])) === 262143);

      assert(
        rustDecode(new Buffer(['I'.charCodeAt(0), 0x00, 0x00, 0x00, 0x00])) === 0
      );
      assert(
        rustDecode(new Buffer(['I'.charCodeAt(0), 0x00, 0x00, 0x01, 0x2c])) === 300
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
      assert(rustDecode(utils.bytes('v2/number/0')) === 0);
      assert(rustDecode(utils.bytes('v2/number/1')) === 1);
      assert(rustDecode(utils.bytes('v2/number/10')) === 10);
      assert(rustDecode(utils.bytes('v2/number/16')) === 16);
      assert(rustDecode(utils.bytes('v2/number/2047')) === 2047);
      assert(rustDecode(utils.bytes('v2/number/255')) === 255);
      assert(rustDecode(utils.bytes('v2/number/256')) === 256);
      assert(rustDecode(utils.bytes('v2/number/262143')) === 262143);
      assert(rustDecode(utils.bytes('v2/number/262144')) === 262144);
      assert(rustDecode(utils.bytes('v2/number/46')) === 46);
      assert(rustDecode(utils.bytes('v2/number/47')) === 47);
      assert(rustDecode(utils.bytes('v2/number/-16')) === -16);
      assert(rustDecode(utils.bytes('v2/number/-2048')) === -2048);
      assert(rustDecode(utils.bytes('v2/number/-256')) === -256);
      assert(rustDecode(utils.bytes('v2/number/-262144')) === -262144);
      assert(rustDecode(utils.bytes('v2/number/-262145')) === -262145);
    });

    it('should read hessian 1.0 number bin', function () {
      assert(rustDecode(utils.bytes('v1/number/0')) === 0);
      assert(rustDecode(utils.bytes('v1/number/1')) === 1);
      assert(rustDecode(utils.bytes('v1/number/10')) === 10);
      assert(rustDecode(utils.bytes('v1/number/16')) === 16);
      assert(rustDecode(utils.bytes('v1/number/2047')) === 2047);
      assert(rustDecode(utils.bytes('v1/number/255')) === 255);
      assert(rustDecode(utils.bytes('v1/number/256')) === 256);
      assert(rustDecode(utils.bytes('v1/number/262143')) === 262143);
      assert(rustDecode(utils.bytes('v1/number/262144')) === 262144);
      assert(rustDecode(utils.bytes('v1/number/46')) === 46);
      assert(rustDecode(utils.bytes('v1/number/47')) === 47);
      assert(rustDecode(utils.bytes('v1/number/-16')) === -16);
      assert(rustDecode(utils.bytes('v1/number/-2048')) === -2048);
      assert(rustDecode(utils.bytes('v1/number/-256')) === -256);
      assert(rustDecode(utils.bytes('v1/number/-262144')) === -262144);
      assert(rustDecode(utils.bytes('v1/number/-262145')) === -262145);
    });
  });
});
