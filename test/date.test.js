'use strict';

const { describe, it } = require('test');
const assert = require('assert');
const hessian = require('..');
const utils = require('./utils');

describe('date.test.js', function () {
  var dateBuffer = new Buffer(['d'.charCodeAt(0), 0x00, 0x00, 0x00, 0xd0, 0x4b, 0x92, 0x84, 0xb8]);

  it('should read date 2:51:31 May 8, 1998', function () {
    var d = hessian.decode(dateBuffer);
    assert(Object.prototype.toString.call(d) === '[object Date]');
    assert(d.getFullYear() === 1998);
    assert(d.getTime() === 894621091000);
    assert(d.toUTCString() === 'Fri, 08 May 1998 09:51:31 GMT');
    assert(d.toISOString() === '1998-05-08T09:51:31.000Z');
  });

  it('should write date 2:51:31 May 8, 1998', function () {
    assert.deepEqual(hessian.encode(new Date(894621091000)), dateBuffer);
  });

  it('should write date 0 and read', function () {
    assert.deepEqual(
      hessian.encode(new Date(0)),
      new Buffer(['d'.charCodeAt(0), 0, 0, 0, 0, 0, 0, 0, 0])
    );
  });

  it('should read date 09:51:31 May 8, 1998 UTC', function () {
    var d = hessian.decode(utils.bytes('v1/date/894621091000'), '1.0');
    assert(Object.prototype.toString.call(d) === '[object Date]');
    assert(d.getFullYear() === 1998);
    assert(d.getTime() === 894621091000);
    assert(d.toUTCString() === 'Fri, 08 May 1998 09:51:31 GMT');
    assert(d.toISOString() === '1998-05-08T09:51:31.000Z');
  });

  it('should read date 09:51:00 May 8, 1998 UTC', function () {
    var d = hessian.decode(utils.bytes('v1/date/894621060000'), '1.0');
    assert(Object.prototype.toString.call(d) === '[object Date]');
    assert(d.getFullYear() === 1998);
    assert(d.getTime() === 894621060000);
    assert(d.toUTCString() === 'Fri, 08 May 1998 09:51:00 GMT');
    assert(d.toISOString() === '1998-05-08T09:51:00.000Z');
  });

  it('should write date', function () {
    var now = new Date(1398280514000);
    assert.deepEqual(hessian.encode(now, '1.0'), utils.bytes('v1/date/now'));
    // read it
    assert.deepEqual(hessian.decode(utils.bytes('v1/date/now'), '1.0'), now);
  });

  describe('hessian 2.0', function () {
    it('should read date 09:51:31 May 8, 1998 UTC', function () {
      var d = hessian.decode(utils.bytes('v2/date/894621091000'), '2.0');
      assert(Object.prototype.toString.call(d) === '[object Date]');
      assert(d.getFullYear() === 1998);
      assert(d.getTime() === 894621091000);
      assert(d.toUTCString() === 'Fri, 08 May 1998 09:51:31 GMT');
      assert(d.toISOString() === '1998-05-08T09:51:31.000Z');
    });

    it('should read Compact: date in minutes, 09:51:00 May 8, 1998 UTC', function () {
      var d = hessian.decode(utils.bytes('v2/date/894621060000'), '2.0');
      assert(Object.prototype.toString.call(d) === '[object Date]');
      assert(d.getFullYear() === 1998);
      assert(d.getTime() === 894621060000);
      assert(d.toUTCString() === 'Fri, 08 May 1998 09:51:00 GMT');
      assert(d.toISOString() === '1998-05-08T09:51:00.000Z');
    });

    it('should write and read date, Thu, 23 Jan 6053 02:08:00 GMT', function () {
      // Maximum of 32-bit integer
      var overflow32BitInt = Math.pow(2, 31);
      var milliseconds = overflow32BitInt * 60000;
      var date = new Date();
      date.setTime(milliseconds);

      var bytes = utils.bytes('v2/date/' + milliseconds.toString());

      assert.deepEqual(hessian.encode(date, '2.0'), bytes);
      assert.deepEqual(hessian.decode(bytes, '2.0'), date);
    });

    it('should write and read date, Wed, 08 Dec -2114 21:53:00 GMT (2115 B.C.)', function () {
      // Minimum of 32-bit integer
      var overflow32BitInt = -1 * (Math.pow(2, 31) + 1);
      var milliseconds = overflow32BitInt * 60000;
      var date = new Date();
      date.setTime(milliseconds);

      var bytes = utils.bytes('v2/date/' + milliseconds.toString());

      assert.deepEqual(hessian.encode(date, '2.0'), bytes);
      assert.deepEqual(hessian.decode(bytes, '2.0'), date);
    });


    it('should write and read date', function () {
      var now = new Date(1398280514000);
      assert.deepEqual(hessian.encode(now, '2.0'), utils.bytes('v2/date/now'));
      // read it
      assert.deepEqual(hessian.decode(utils.bytes('v2/date/now'), '2.0'), now);
    });

    it('should write and read Wed Jan 04 1950 00:00:00 GMT+0800 (CST)', function () {
      var date = new Date('Wed Jan 04 1950 00:00:00 GMT+0800 (CST)');
      var bin = new Buffer('4bff5f8c60', 'hex');
      assert.deepEqual(hessian.encode(date, '2.0'), bin);
      assert.deepEqual(hessian.decode(bin, '2.0'), date);
    });

    // it('should read 1.0 format', function () {
    //   hessian.decode(utils.bytes('v1/date/894621091000'), '2.0').getTime()
    //     .should.equal(894621091000);
    //   hessian.decode(utils.bytes('v1/date/894621060000'), '2.0').getTime()
    //     .should.equal(894621060000);
    //   hessian.decode(utils.bytes('v1/date/now'), '2.0').getTime()
    //     .should.equal(1398280514000);
    // });
  });
});
