"use strict";

var assert = require('assert');
var hessian = require('../../index');
var utils = require('../utils');
var rustDecode = require('./rustdecoder');

describe('date.test.js', function () {
  describe('hessian 2.0', function () {
    it('should read date 09:51:31 May 8, 1998 UTC', function () {
      var d = rustDecode(utils.bytes('v2/date/894621091000'));
      assert(Object.prototype.toString.call(d) === '[object Date]');
      assert(d.getFullYear() === 1998);
      assert(d.getTime() === 894621091000);
      assert(d.toUTCString() === 'Fri, 08 May 1998 09:51:31 GMT');
      assert(d.toISOString() === '1998-05-08T09:51:31.000Z');
    });

    it('should read Compact: date in minutes, 09:51:00 May 8, 1998 UTC', function () {
      var d = rustDecode(utils.bytes('v2/date/894621060000'));
      assert(Object.prototype.toString.call(d) === '[object Date]');
      assert(d.getFullYear() === 1998);
      assert(d.getTime() === 894621060000);
      assert(d.toUTCString() === 'Fri, 08 May 1998 09:51:00 GMT');
      assert(d.toISOString() === '1998-05-08T09:51:00.000Z');
    });

    it('should write and read date', function () {
      var now = new Date(1398280514000);
      assert.deepEqual(hessian.encode(now), utils.bytes('v2/date/now'));
      // read it
      assert.deepEqual(rustDecode(utils.bytes('v2/date/now')), now);
    });

    it('should read 1.0 format', function () {
      assert(
        rustDecode(utils.bytes('v1/date/894621091000')).getTime() === 894621091000
      );
      assert(
        rustDecode(utils.bytes('v1/date/894621060000')).getTime() === 894621060000
      );
      assert(
        rustDecode(utils.bytes('v1/date/now')).getTime() === 1398280514000
      );
    });
  });
});
