"use strict";

var assert = require('assert');
var java = require('js-to-java');
var hessian = require('../../index');
var utils = require('../utils');
var rustDecode = require('./rustdecoder');

describe('double.test.js', function () {
  describe('v2.0', function () {
    it('should read 0.0 and 1.0', function () {
      assert(rustDecode(new Buffer([0x67])) === 0.0);
      assert(rustDecode(new Buffer([0x68])) === 1.0);
    });

    it('should read 8 bits double', function () {
      assert(rustDecode(new Buffer([0x69, 0x00])) === 0.0);
      assert(rustDecode(new Buffer([0x69, 0x01])) === 1.0);
      assert(rustDecode(new Buffer([0x69, 0x80])) === -128.0);
      assert(rustDecode(new Buffer([0x69, 0x7f])) === 127.0);
    });

    it('should read 16 bits double', function () {
      assert(rustDecode(new Buffer([0x6a, 0x00, 0x00])) === 0.0);
      assert(rustDecode(new Buffer([0x6a, 0x00, 0x01])) === 1.0);
      assert(rustDecode(new Buffer([0x6a, 0x00, 0x80])) === 128.0);
      assert(rustDecode(new Buffer([0x6a, 0x00, 0x7f])) === 127.0);
      assert(rustDecode(new Buffer([0x6a, 0x80, 0x00])) === -32768.0);
      assert(rustDecode(new Buffer([0x6a, 0x7f, 0xff])) === 32767.0);
    });

    it('should read 32 bits float double', function () {
      assert(rustDecode(new Buffer([0x6b, 0x00, 0x00, 0x00, 0x00])) === 0.0);
      assert(
        rustDecode(new Buffer([0x6b, 0x41, 0x44, 0x00, 0x00])) === 12.25
      );
    });

    it('should read normal double', function () {
      assert(
        rustDecode(new Buffer([0x44, 0x40, 0x24, 0, 0, 0, 0, 0, 0])) === 10.0
      );
    });

    it('should decode with type', function () {
      assert.deepEqual(rustDecode(new Buffer([0x69, 0x01])), 1.0);

      assert.deepEqual(
        rustDecode(new Buffer([0x44, 0x40, 0x24, 0, 0, 0, 0, 0, 0])),
        10.0
      );

      assert.deepEqual(rustDecode(new Buffer([0x6a, 0x00, 0x80])), 128.0);
    });

    it('should write 0.0 and 1.0', function () {
      assert.deepEqual(hessian.encode(java.double(0), "2.0"), new Buffer([0x67]));
      assert.deepEqual(hessian.encode(java.double(0.0), "2.0"), new Buffer([0x67]));

      assert.deepEqual(hessian.encode(java.double(1), "2.0"), new Buffer([0x68]));
      assert.deepEqual(hessian.encode(java.double(1.0), "2.0"), new Buffer([0x68]));
    });

    it('should write as java impl', function () {
      for (var i = 0; i < 100; i++) {
        assert.deepEqual(hessian.encode(java.double(0), "2.0"), utils.bytes('v2/double/0'));
        assert.deepEqual(hessian.encode(java.double(0.0), "2.0"), utils.bytes('v2/double/0'));
        assert.deepEqual(hessian.encode(java.double(1), "2.0"), utils.bytes('v2/double/1'));
        assert.deepEqual(hessian.encode(java.double(1.0), "2.0"), utils.bytes('v2/double/1'));
        assert.deepEqual(hessian.encode(java.double(10), "2.0"), utils.bytes('v2/double/10'));
        assert.deepEqual(
          hessian.encode(java.double(10.123), "2.0"),
          utils.bytes('v2/double/10.123')
        );
        assert.deepEqual(hessian.encode(java.double(10.1), "2.0"), utils.bytes('v2/double/10.1'));
        assert.deepEqual(hessian.encode(java.double(-128), "2.0"), utils.bytes('v2/double/-128'));
        assert.deepEqual(
          hessian.encode(java.double(-127.9999), "2.0"),
          utils.bytes('v2/double/-127.9999')
        );
        assert.deepEqual(hessian.encode(java.double(127), "2.0"), utils.bytes('v2/double/127'));
        assert.deepEqual(
          hessian.encode(java.double(126.9989), "2.0"),
          utils.bytes('v2/double/126.9989')
        );
        assert.deepEqual(
          hessian.encode(java.double(-32768), "2.0"),
          utils.bytes('v2/double/-32768')
        );
        assert.deepEqual(
          hessian.encode(java.double(-32767.999), "2.0"),
          utils.bytes('v2/double/-32767.999')
        );
        assert.deepEqual(hessian.encode(java.double(32767), "2.0"), utils.bytes('v2/double/32767'));
        assert.deepEqual(
          hessian.encode(java.double(32766.99999), "2.0"),
          utils.bytes('v2/double/32766.99999')
        );
        assert.deepEqual(hessian.encode(java.double(32768), "2.0"), utils.bytes('v2/double/32768'));
        assert.deepEqual(hessian.encode(java.double(19400447), "2.0"), utils.bytes('v2/double/19400447'));
        assert.deepEqual(hessian.encode(java.double(19400448), "2.0"), utils.bytes('v2/double/19400448'));
        assert.deepEqual(
          hessian.encode(java.double(32767.99999), "2.0"),
          utils.bytes('v2/double/32767.99999')
        );

        // float byte
        assert(hessian.encode(java.double(-0x800000), "2.0").length === 5);
        assert.deepEqual(
          hessian.encode(java.double(-0x800000), "2.0"),
          utils.bytes('v2/double/-0x800000')
        );
        assert(hessian.encode(java.double(-0x80000000), "2.0").length === 5);
        assert.deepEqual(
          hessian.encode(java.double(-0x80000000), "2.0"),
          utils.bytes('v2/double/-0x80000000')
        );
        assert.deepEqual(
          hessian.encode(java.double(-2147483649), "2.0"),
          utils.bytes('v2/double/-2147483649')
        );
        assert.deepEqual(
          hessian.encode(java.double(-2147483648), "2.0"),
          utils.bytes('v2/double/-2147483648')
        );
        // hessian.encode(java.double(-2147483647)).should.eql(utils.bytes('v2/double/-2147483647'));
        assert.deepEqual(
          hessian.encode(java.double(-2147483610.123), "2.0"),
          utils.bytes('v2/double/-2147483610.123')
        );
        // hessian.encode(java.double(2147483648)).should.eql(utils.bytes('v2/double/2147483648'));
        // hessian.encode(java.double(2147483647)).should.eql(utils.bytes('v2/double/2147483647'));
        // hessian.encode(java.double(2147483646)).should.eql(utils.bytes('v2/double/2147483646'));
        assert.deepEqual(
          hessian.encode(java.double(2147483646.456), "2.0"),
          utils.bytes('v2/double/2147483646.456')
        );
      }
    });

    it('should write double between 0x80000000L and 0x7fffffffL', function () {
      var map = new Map();
      for (var i = -2147483648; i < -2147473648; i++) {
        map.set(i, hessian.encode(java.double(i)));
      }
      for (var i = 2147473648; i < 2147483648; i++) {
        map.set(i, hessian.encode(java.double(i)));
      }
      for (var k of map.keys()) {
        assert.deepEqual(map.get(k), hessian.encode(java.double(k)));
      }
    });

    it('should read java bin format', function () {
      assert(rustDecode(utils.bytes('v2/double/0')) === 0);
      assert(rustDecode(utils.bytes('v2/double/1')) === 1);
      assert(rustDecode(utils.bytes('v2/double/10')) === 10);
      assert(rustDecode(utils.bytes('v2/double/10.123')) === 10.123);
      assert(rustDecode(utils.bytes('v2/double/10.1')) === 10.1);
      assert(rustDecode(utils.bytes('v2/double/-128')) === -128);
      assert(rustDecode(utils.bytes('v2/double/-127.9999')) === -127.9999);
      assert(rustDecode(utils.bytes('v2/double/127')) === 127);
      assert(rustDecode(utils.bytes('v2/double/126.9989')) === 126.9989);
      assert(rustDecode(utils.bytes('v2/double/-32768')) === -32768);
      assert(rustDecode(utils.bytes('v2/double/-32767.999')) === -32767.999);
      assert(rustDecode(utils.bytes('v2/double/32767')) === 32767);
      assert(
        rustDecode(utils.bytes('v2/double/32766.99999')) === 32766.99999
      );
      assert(rustDecode(utils.bytes('v2/double/32768')) === 32768);
      assert(
        rustDecode(utils.bytes('v2/double/32767.99999')) === 32767.99999
      );

      // float byte
      assert(rustDecode(utils.bytes('v2/double/-0x800000')) === -0x800000);
      assert(
        rustDecode(utils.bytes('v2/double/-0x80000000')) === -0x80000000
      );
      assert(
        rustDecode(utils.bytes('v2/double/-2147483649')) === -2147483649
      );
      assert(
        rustDecode(utils.bytes('v2/double/-2147483648')) === -2147483648
      );
      assert(
        rustDecode(utils.bytes('v2/double/-2147483647')) === -2147483647
      );
      assert(
        rustDecode(utils.bytes('v2/double/-2147483610.123')) === -2147483610.123
      );
      assert(rustDecode(utils.bytes('v2/double/2147483648')) === 2147483648);
      assert(rustDecode(utils.bytes('v2/double/2147483647')) === 2147483647);
      assert(rustDecode(utils.bytes('v2/double/2147483646')) === 2147483646);
      assert(
        rustDecode(utils.bytes('v2/double/2147483646.456')) === 2147483646.456
      );
    });

    it('should read java hessian 1.0 bin format', function () {
      assert(rustDecode(utils.bytes('v1/double/0')) === 0);
      assert(rustDecode(utils.bytes('v1/double/1')) === 1);
      assert(rustDecode(utils.bytes('v1/double/10')) === 10);
      assert(rustDecode(utils.bytes('v1/double/10.123')) === 10.123);
      assert(rustDecode(utils.bytes('v1/double/10.1')) === 10.1);
      assert(rustDecode(utils.bytes('v1/double/-128')) === -128);
      assert(rustDecode(utils.bytes('v1/double/-127.9999')) === -127.9999);
      assert(rustDecode(utils.bytes('v1/double/127')) === 127);
      assert(rustDecode(utils.bytes('v1/double/126.9989')) === 126.9989);
      assert(rustDecode(utils.bytes('v1/double/-32768')) === -32768);
      assert(rustDecode(utils.bytes('v1/double/-32767.999')) === -32767.999);
      assert(rustDecode(utils.bytes('v1/double/32767')) === 32767);
      assert(
        rustDecode(utils.bytes('v1/double/32766.99999')) === 32766.99999
      );
      assert(rustDecode(utils.bytes('v1/double/32768')) === 32768);
      assert(
        rustDecode(utils.bytes('v1/double/32767.99999')) === 32767.99999
      );
      assert(
        rustDecode(utils.bytes('v1/double/-2147483649')) === -2147483649
      );
      assert(
        rustDecode(utils.bytes('v1/double/-2147483648')) === -2147483648
      );
      assert(
        rustDecode(utils.bytes('v1/double/-2147483647')) === -2147483647
      );
      assert(
        rustDecode(utils.bytes('v1/double/-2147483610.123')) === -2147483610.123
      );
      assert(rustDecode(utils.bytes('v1/double/2147483648')) === 2147483648);
      assert(rustDecode(utils.bytes('v1/double/2147483647')) === 2147483647);
      assert(rustDecode(utils.bytes('v1/double/2147483646')) === 2147483646);
      assert(
        rustDecode(utils.bytes('v1/double/2147483646.456')) === 2147483646.456
      );
    });
  });
});
