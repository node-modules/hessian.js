"use strict";

var assert = require('assert');
var hessian = require('../../index');
var utils = require('../utils');
var rustDecode = require('./rustdecoder');

describe('binary.test.js', function () {
  describe('v2.0', function () {
    it('should read zero length binary data', function () {
      var buf = rustDecode(new Buffer([0x20]));
      assert(buf.length === 0);
      assert.deepEqual(buf, new Buffer(0));
    });

    it('should read short datas', function () {
      var buf = rustDecode(new Buffer([0x20, 0x23, 0x23, 0x02, 0x03, 0x20]));
      assert(buf.length === 0);
      assert.deepEqual(buf, new Buffer(0));
    });

    it('should read max length short datas', function () {
      var input = new Buffer(16);
      input.fill(0x2f);
      input[0] = 0x2f;
      var buf = rustDecode(input);
      assert(buf.length === 15);
      var output = new Buffer(15);
      output.fill(0x2f);
      assert.deepEqual(buf, output);
    });

    it('should read long binary', function () {
      var buf = hessian.encode(new Buffer(65535), '2.0');

      assert(buf[0] === 0x62);

      rustDecode(buf);
      buf = hessian.encode(new Buffer(65536), '2.0');
      rustDecode(buf);

      buf = hessian.encode(new Buffer(65535 * 2 - 10), '2.0');
      rustDecode(buf);
    });

    it('should write short binary', function () {
      assert.deepEqual(hessian.encode(new Buffer(''), '2.0'), new Buffer([0x20]));
    });

    it('should write and read as java impl', function () {
      var bytes = new Buffer(65535);
      bytes.fill(0x41);
      var buf = hessian.encode(bytes, '2.0');
      assert(buf.length === utils.bytes('v2/bytes/65535').length);
      assert.deepEqual(buf, utils.bytes('v2/bytes/65535'));
      assert.deepEqual(rustDecode(utils.bytes('v2/bytes/65535')), bytes);

      var bytes = new Buffer(32768);
      bytes.fill(0x41);
      var buf = hessian.encode(bytes, '2.0');
      assert(buf.length === utils.bytes('v2/bytes/32768').length);
      assert.deepEqual(buf, utils.bytes('v2/bytes/32768'));
      assert.deepEqual(rustDecode(utils.bytes('v2/bytes/32768')), bytes);

      var bytes = new Buffer(32769);
      bytes.fill(0x41);
      var buf = hessian.encode(bytes, '2.0');
      assert(buf.length === utils.bytes('v2/bytes/32769').length);
      assert.deepEqual(buf, utils.bytes('v2/bytes/32769'));
      assert.deepEqual(rustDecode(utils.bytes('v2/bytes/32769')), bytes);

      var bytes = new Buffer(32767);
      bytes.fill(0x41);
      var buf = hessian.encode(bytes, '2.0');
      assert(buf.length === utils.bytes('v2/bytes/32767').length);
      assert.deepEqual(buf, utils.bytes('v2/bytes/32767'));
      assert.deepEqual(rustDecode(utils.bytes('v2/bytes/32767')), bytes);

      var bytes = new Buffer(32769);
      bytes.fill(0x41);
      var buf = hessian.encode(bytes, '2.0');
      assert(buf.length === utils.bytes('v2/bytes/32769').length);
      assert.deepEqual(buf, utils.bytes('v2/bytes/32769'));
      assert.deepEqual(rustDecode(utils.bytes('v2/bytes/32769')), bytes);

      var bytes = new Buffer(42769);
      bytes.fill(0x41);
      var buf = hessian.encode(bytes, '2.0');
      assert(buf.length === utils.bytes('v2/bytes/42769').length);
      assert.deepEqual(buf, utils.bytes('v2/bytes/42769'));
      assert.deepEqual(rustDecode(utils.bytes('v2/bytes/42769')), bytes);

      var bytes = new Buffer(82769);
      bytes.fill(0x41);
      var buf = hessian.encode(bytes, '2.0');
      assert(buf.length === utils.bytes('v2/bytes/82769').length);
      assert.deepEqual(buf, utils.bytes('v2/bytes/82769'));
      assert.deepEqual(rustDecode(utils.bytes('v2/bytes/82769')), bytes);
    });

    it('should read java hessian 1.0 bin format', function () {
      var bytes = new Buffer(65535);
      bytes.fill(0x41);
      assert.deepEqual(rustDecode(utils.bytes('v1/bytes/65535')), bytes);

      var bytes = new Buffer(32767);
      bytes.fill(0x41);
      assert.deepEqual(rustDecode(utils.bytes('v1/bytes/32767')), bytes);

      var bytes = new Buffer(32768);
      bytes.fill(0x41);
      assert.deepEqual(rustDecode(utils.bytes('v1/bytes/32768')), bytes);

      var bytes = new Buffer(32769);
      bytes.fill(0x41);
      assert.deepEqual(rustDecode(utils.bytes('v1/bytes/32769')), bytes);

      var bytes = new Buffer(32767);
      bytes.fill(0x41);
      assert.deepEqual(rustDecode(utils.bytes('v1/bytes/32767')), bytes);

      var bytes = new Buffer(32769);
      bytes.fill(0x41);
      assert.deepEqual(rustDecode(utils.bytes('v1/bytes/32769')), bytes);

      var bytes = new Buffer(42769);
      bytes.fill(0x41);
      assert.deepEqual(rustDecode(utils.bytes('v1/bytes/42769')), bytes);

      var bytes = new Buffer(82769);
      bytes.fill(0x41);
      assert.deepEqual(rustDecode(utils.bytes('v1/bytes/82769')), bytes);
    });
  });
});
