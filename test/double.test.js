/**
 * hessian.js - test/double.test.js
 *
 * Copyright(c)
 * MIT Licensed
 *
 * Authors:
 *   fengmk2 <fengmk2@gmail.com> (http://fengmk2.github.com)
 */

"use strict";

var assert = require('assert');
var java = require('js-to-java');
var hessian = require('../');
var utils = require('./utils');

describe('double.test.js', function () {
  var doubleBuffer = new Buffer(['D'.charCodeAt(0),
    0x40, 0x28, 0x80, 0x00, 0x00, 0x00, 0x00, 0x00]);

  it('should read double 12.25', function () {
    assert(hessian.decode(doubleBuffer) === 12.25);
  });

  it('should write double 12.25', function () {
    assert.deepEqual(hessian.encode(12.25), doubleBuffer);
    assert.deepEqual(hessian.encode(java.double(12.25)), doubleBuffer);
    assert.deepEqual(hessian.encode({
      $class: 'double',
      $: 12.25
    }), doubleBuffer);
  });

  it('should write double 100', function () {
    assert.deepEqual(
      hessian.encode(java.double(100)),
      new Buffer(['D'.charCodeAt(0), 0x40, 0x59, 0, 0, 0, 0, 0, 0])
    );
  });

  it('should write double 0', function () {
    assert.deepEqual(
      hessian.encode(java.double(0)),
      new Buffer(['D'.charCodeAt(0), 0, 0, 0, 0, 0, 0, 0, 0])
    );
  });

  it('should write as java impl', function () {
    assert.deepEqual(hessian.encode(java.double(0), '1.0'), utils.bytes('v1/double/0'));
    assert.deepEqual(hessian.encode(java.double(0.0), '1.0'), utils.bytes('v1/double/0'));
    assert.deepEqual(hessian.encode(java.double(1), '1.0'), utils.bytes('v1/double/1'));
    assert.deepEqual(hessian.encode(java.double(1.0), '1.0'), utils.bytes('v1/double/1'));
    assert.deepEqual(hessian.encode(java.double(10), '1.0'), utils.bytes('v1/double/10'));
    assert.deepEqual(
      hessian.encode(java.double(10.123), '1.0'),
      utils.bytes('v1/double/10.123')
    );
    assert.deepEqual(hessian.encode(java.double(10.1), '1.0'), utils.bytes('v1/double/10.1'));
    assert.deepEqual(hessian.encode(java.double(-128), '1.0'), utils.bytes('v1/double/-128'));
    assert.deepEqual(
      hessian.encode(java.double(-127.9999), '1.0'),
      utils.bytes('v1/double/-127.9999')
    );
    assert.deepEqual(hessian.encode(java.double(127), '1.0'), utils.bytes('v1/double/127'));
    assert.deepEqual(
      hessian.encode(java.double(126.9989), '1.0'),
      utils.bytes('v1/double/126.9989')
    );
    assert.deepEqual(
      hessian.encode(java.double(-32768), '1.0'),
      utils.bytes('v1/double/-32768')
    );
    assert.deepEqual(
      hessian.encode(java.double(-32767.999), '1.0'),
      utils.bytes('v1/double/-32767.999')
    );
    assert.deepEqual(hessian.encode(java.double(32767), '1.0'), utils.bytes('v1/double/32767'));
    assert.deepEqual(
      hessian.encode(java.double(32766.99999), '1.0'),
      utils.bytes('v1/double/32766.99999')
    );
    assert.deepEqual(hessian.encode(java.double(32768), '1.0'), utils.bytes('v1/double/32768'));
    assert.deepEqual(
      hessian.encode(java.double(32767.99999), '1.0'),
      utils.bytes('v1/double/32767.99999')
    );

    // float byte
    assert.deepEqual(
      hessian.encode(java.double(-2147483649), '1.0'),
      utils.bytes('v1/double/-2147483649')
    );
    assert.deepEqual(
      hessian.encode(java.double(-2147483648), '1.0'),
      utils.bytes('v1/double/-2147483648')
    );
    assert.deepEqual(
      hessian.encode(java.double(-2147483647), '1.0'),
      utils.bytes('v1/double/-2147483647')
    );
    assert.deepEqual(
      hessian.encode(java.double(-2147483610.123), '1.0'),
      utils.bytes('v1/double/-2147483610.123')
    );
    assert.deepEqual(
      hessian.encode(java.double(2147483648), '1.0'),
      utils.bytes('v1/double/2147483648')
    );
    assert.deepEqual(
      hessian.encode(java.double(2147483647), '1.0'),
      utils.bytes('v1/double/2147483647')
    );
    assert.deepEqual(
      hessian.encode(java.double(2147483646), '1.0'),
      utils.bytes('v1/double/2147483646')
    );
    assert.deepEqual(
      hessian.encode(java.double(2147483646.456), '1.0'),
      utils.bytes('v1/double/2147483646.456')
    );
  });

  it('should read java bin format', function () {
    assert(hessian.decode(utils.bytes('v1/double/0'), '1.0') === 0);
    assert(hessian.decode(utils.bytes('v1/double/1'), '1.0') === 1);
    assert(hessian.decode(utils.bytes('v1/double/10'), '1.0') === 10);
    assert(hessian.decode(utils.bytes('v1/double/10.123'), '1.0') === 10.123);
    assert(hessian.decode(utils.bytes('v1/double/10.1'), '1.0') === 10.1);
    assert(hessian.decode(utils.bytes('v1/double/-128'), '1.0') === -128);
    assert(hessian.decode(utils.bytes('v1/double/-127.9999'), '1.0') === -127.9999);
    assert(hessian.decode(utils.bytes('v1/double/127'), '1.0') === 127);
    assert(hessian.decode(utils.bytes('v1/double/126.9989'), '1.0') === 126.9989);
    assert(hessian.decode(utils.bytes('v1/double/-32768'), '1.0') === -32768);
    assert(hessian.decode(utils.bytes('v1/double/-32767.999'), '1.0') === -32767.999);
    assert(hessian.decode(utils.bytes('v1/double/32767'), '1.0') === 32767);
    assert(
      hessian.decode(utils.bytes('v1/double/32766.99999'), '1.0') === 32766.99999
    );
    assert(hessian.decode(utils.bytes('v1/double/32768'), '1.0') === 32768);
    assert(
      hessian.decode(utils.bytes('v1/double/32767.99999'), '1.0') === 32767.99999
    );
    assert(
      hessian.decode(utils.bytes('v1/double/-2147483649'), '1.0') === -2147483649
    );
    assert(
      hessian.decode(utils.bytes('v1/double/-2147483648'), '1.0') === -2147483648
    );
    assert(
      hessian.decode(utils.bytes('v1/double/-2147483647'), '1.0') === -2147483647
    );
    assert(
      hessian.decode(utils.bytes('v1/double/-2147483610.123'), '1.0') === -2147483610.123
    );
    assert(hessian.decode(utils.bytes('v1/double/2147483648'), '1.0') === 2147483648);
    assert(hessian.decode(utils.bytes('v1/double/2147483647'), '1.0') === 2147483647);
    assert(hessian.decode(utils.bytes('v1/double/2147483646'), '1.0') === 2147483646);
    assert(
      hessian.decode(utils.bytes('v1/double/2147483646.456'), '1.0') === 2147483646.456
    );
  });

  describe('v2.0', function () {
    it('should read 0.0 and 1.0', function () {
      assert(hessian.decode(new Buffer([0x5b]), '2.0') === 0.0);
      assert(hessian.decode(new Buffer([0x5c]), '2.0') === 1.0);
    });

    it('should read 8 bits double', function () {
      assert(hessian.decode(new Buffer([0x5d, 0x00]), '2.0') === 0.0);
      assert(hessian.decode(new Buffer([0x5d, 0x01]), '2.0') === 1.0);
      assert(hessian.decode(new Buffer([0x5d, 0x80]), '2.0') === -128.0);
      assert(hessian.decode(new Buffer([0x5d, 0x7f]), '2.0') === 127.0);
    });

    it('should read 16 bits double', function () {
      assert(hessian.decode(new Buffer([0x5e, 0x00, 0x00]), '2.0') === 0.0);
      assert(hessian.decode(new Buffer([0x5e, 0x00, 0x01]), '2.0') === 1.0);
      assert(hessian.decode(new Buffer([0x5e, 0x00, 0x80]), '2.0') === 128.0);
      assert(hessian.decode(new Buffer([0x5e, 0x00, 0x7f]), '2.0') === 127.0);
      assert(hessian.decode(new Buffer([0x5e, 0x80, 0x00]), '2.0') === -32768.0);
      assert(hessian.decode(new Buffer([0x5e, 0x7f, 0xff]), '2.0') === 32767.0);
    });

    it('should read 32 bits float double', function () {
      assert(hessian.decode(new Buffer([0x5f, 0x00, 0x00, 0x00, 0x00]), '2.0') === 0.0);
      assert(hessian.decode(new Buffer([0x5f, 0x00, 0x00, 0x2f, 0xda]), '2.0') === 12.25);
    });

    it('should read normal double', function () {
      assert(
        hessian.decode(new Buffer([0x44, 0x40, 0x24, 0, 0, 0, 0, 0, 0]), '2.0') === 10.0
      );
    });

    it('should write 0.0 and 1.0', function () {
      assert.deepEqual(hessian.encode(java.double(0), '2.0'), new Buffer([0x5b]));
      assert.deepEqual(hessian.encode(java.double(0.0), '2.0'), new Buffer([0x5b]));

      assert.deepEqual(hessian.encode(java.double(1), '2.0'), new Buffer([0x5c]));
      assert.deepEqual(hessian.encode(java.double(1.0), '2.0'), new Buffer([0x5c]));
    });

    it('should write as java impl', function () {
      assert.deepEqual(hessian.encode(java.double(0), '2.0'), utils.bytes('v2/double/0'));
      assert.deepEqual(hessian.encode(java.double(0.0), '2.0'), utils.bytes('v2/double/0'));
      assert.deepEqual(hessian.encode(java.double(1), '2.0'), utils.bytes('v2/double/1'));
      assert.deepEqual(hessian.encode(java.double(1.0), '2.0'), utils.bytes('v2/double/1'));
      assert.deepEqual(hessian.encode(java.double(10), '2.0'), utils.bytes('v2/double/10'));
      assert.deepEqual(
        hessian.encode(java.double(10.123), '2.0'),
        utils.bytes('v2/double/10.123')
      );
      assert.deepEqual(hessian.encode(java.double(10.1), '2.0'), utils.bytes('v2/double/10.1'));
      assert.deepEqual(hessian.encode(java.double(-128), '2.0'), utils.bytes('v2/double/-128'));
      assert.deepEqual(
        hessian.encode(java.double(-127.9999), '2.0'),
        utils.bytes('v2/double/-127.9999')
      );
      assert.deepEqual(hessian.encode(java.double(127), '2.0'), utils.bytes('v2/double/127'));
      assert.deepEqual(
        hessian.encode(java.double(126.9989), '2.0'),
        utils.bytes('v2/double/126.9989')
      );
      assert.deepEqual(
        hessian.encode(java.double(-32768), '2.0'),
        utils.bytes('v2/double/-32768')
      );
      assert.deepEqual(
        hessian.encode(java.double(-32767.999), '2.0'),
        utils.bytes('v2/double/-32767.999')
      );
      assert.deepEqual(hessian.encode(java.double(32767), '2.0'), utils.bytes('v2/double/32767'));
      assert.deepEqual(
        hessian.encode(java.double(32766.99999), '2.0'),
        utils.bytes('v2/double/32766.99999')
      );
      assert.deepEqual(hessian.encode(java.double(32768), '2.0'), utils.bytes('v2/double/32768'));
      assert.deepEqual(
        hessian.encode(java.double(32767.99999), '2.0'),
        utils.bytes('v2/double/32767.99999')
      );

      // float byte
      assert(hessian.encode(java.double(-0x800000), '2.0').length === 9);
      assert.deepEqual(hessian.encode(java.double(-0x800000), '2.0'), utils.bytes('v2/double/-0x800000'));
      assert(hessian.encode(java.double(-0x80000000), '2.0').length === 9);
      assert.deepEqual(hessian.encode(java.double(-0x80000000), '2.0'), utils.bytes('v2/double/-0x80000000'));
      assert.deepEqual(hessian.encode(java.double(-2147483649), '2.0'), utils.bytes('v2/double/-2147483649'));
      assert.deepEqual(hessian.encode(java.double(-2147483648), '2.0'), utils.bytes('v2/double/-2147483648'));
      // hessian.encode(java.double(-2147483647), '2.0').should.eql(utils.bytes('v2/double/-2147483647'));
      assert.deepEqual(
        hessian.encode(java.double(-2147483610.123), '2.0'),
        utils.bytes('v2/double/-2147483610.123')
      );
      // hessian.encode(java.double(2147483648), '2.0').should.eql(utils.bytes('v2/double/2147483648'));
      // hessian.encode(java.double(2147483647), '2.0').should.eql(utils.bytes('v2/double/2147483647'));
      // hessian.encode(java.double(2147483646), '2.0').should.eql(utils.bytes('v2/double/2147483646'));
      assert.deepEqual(
        hessian.encode(java.double(2147483646.456), '2.0'),
        utils.bytes('v2/double/2147483646.456')
      );
    });

    it('should read java bin format', function () {
      assert(hessian.decode(utils.bytes('v2/double/0'), '2.0') === 0);
      assert(hessian.decode(utils.bytes('v2/double/1'), '2.0') === 1);
      assert(hessian.decode(utils.bytes('v2/double/10'), '2.0') === 10);
      assert(hessian.decode(utils.bytes('v2/double/10.123'), '2.0') === 10.123);
      assert(hessian.decode(utils.bytes('v2/double/10.1'), '2.0') === 10.1);
      assert(hessian.decode(utils.bytes('v2/double/-128'), '2.0') === -128);
      assert(hessian.decode(utils.bytes('v2/double/-127.9999'), '2.0') === -127.9999);
      assert(hessian.decode(utils.bytes('v2/double/127'), '2.0') === 127);
      assert(hessian.decode(utils.bytes('v2/double/126.9989'), '2.0') === 126.9989);
      assert(hessian.decode(utils.bytes('v2/double/-32768'), '2.0') === -32768);
      assert(hessian.decode(utils.bytes('v2/double/-32767.999'), '2.0') === -32767.999);
      assert(hessian.decode(utils.bytes('v2/double/32767'), '2.0') === 32767);
      assert(
        hessian.decode(utils.bytes('v2/double/32766.99999'), '2.0') === 32766.99999
      );
      assert(hessian.decode(utils.bytes('v2/double/32768'), '2.0') === 32768);
      assert(
        hessian.decode(utils.bytes('v2/double/32767.99999'), '2.0') === 32767.99999
      );

      // float byte
      assert(hessian.decode(utils.bytes('v2/double/-0x800000'), '2.0') === -0x800000);
      assert(
        hessian.decode(utils.bytes('v2/double/-0x80000000'), '2.0') === -0x80000000
      );
      assert(
        hessian.decode(utils.bytes('v2/double/-2147483649'), '2.0') === -2147483649
      );
      assert(
        hessian.decode(utils.bytes('v2/double/-2147483648'), '2.0') === -2147483648
      );
      assert(
        hessian.decode(utils.bytes('v2/double/-2147483647'), '2.0') === -2147483647
      );
      assert(
        hessian.decode(utils.bytes('v2/double/-2147483610.123'), '2.0') === -2147483610.123
      );
      assert(hessian.decode(utils.bytes('v2/double/2147483648'), '2.0') === 2147483648);
      assert(hessian.decode(utils.bytes('v2/double/2147483647'), '2.0') === 2147483647);
      assert(hessian.decode(utils.bytes('v2/double/2147483646'), '2.0') === 2147483646);
      assert(
        hessian.decode(utils.bytes('v2/double/2147483646.456'), '2.0') === 2147483646.456
      );
    });

    it('should read java hessian 1.0 bin format', function () {
      assert(hessian.decode(utils.bytes('v1/double/0'), '2.0') === 0);
      assert(hessian.decode(utils.bytes('v1/double/1'), '2.0') === 1);
      assert(hessian.decode(utils.bytes('v1/double/10'), '2.0') === 10);
      assert(hessian.decode(utils.bytes('v1/double/10.123'), '2.0') === 10.123);
      assert(hessian.decode(utils.bytes('v1/double/10.1'), '2.0') === 10.1);
      assert(hessian.decode(utils.bytes('v1/double/-128'), '2.0') === -128);
      assert(hessian.decode(utils.bytes('v1/double/-127.9999'), '2.0') === -127.9999);
      assert(hessian.decode(utils.bytes('v1/double/127'), '2.0') === 127);
      assert(hessian.decode(utils.bytes('v1/double/126.9989'), '2.0') === 126.9989);
      assert(hessian.decode(utils.bytes('v1/double/-32768'), '2.0') === -32768);
      assert(hessian.decode(utils.bytes('v1/double/-32767.999'), '2.0') === -32767.999);
      assert(hessian.decode(utils.bytes('v1/double/32767'), '2.0') === 32767);
      assert(
        hessian.decode(utils.bytes('v1/double/32766.99999'), '2.0') === 32766.99999
      );
      assert(hessian.decode(utils.bytes('v1/double/32768'), '2.0') === 32768);
      assert(
        hessian.decode(utils.bytes('v1/double/32767.99999'), '2.0') === 32767.99999
      );
      assert(
        hessian.decode(utils.bytes('v1/double/-2147483649'), '2.0') === -2147483649
      );
      assert(
        hessian.decode(utils.bytes('v1/double/-2147483648'), '2.0') === -2147483648
      );
      assert(
        hessian.decode(utils.bytes('v1/double/-2147483647'), '2.0') === -2147483647
      );
      assert(
        hessian.decode(utils.bytes('v1/double/-2147483610.123'), '2.0') === -2147483610.123
      );
      assert(hessian.decode(utils.bytes('v1/double/2147483648'), '2.0') === 2147483648);
      assert(hessian.decode(utils.bytes('v1/double/2147483647'), '2.0') === 2147483647);
      assert(hessian.decode(utils.bytes('v1/double/2147483646'), '2.0') === 2147483646);
      assert(
        hessian.decode(utils.bytes('v1/double/2147483646.456'), '2.0') === 2147483646.456
      );
    });
  });
});
