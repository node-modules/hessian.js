/**!
 * hessian.js - test/date.test.js
 *
 * Copyright(c) 2014
 * MIT Licensed
 *
 * Authors:
 *   fengmk2 <fengmk2@gmail.com> (http://fengmk2.github.com)
 */

'use strict';

const assert = require('assert');
const hessian = require('../');
const utils = require('./utils');

describe('date.test.js', function() {
  const dateBuffer = Buffer.from([ 'd'.charCodeAt(0), 0x00, 0x00, 0x00, 0xd0, 0x4b, 0x92, 0x84, 0xb8 ]);

  it('should read date 2:51:31 May 8, 1998', function() {
    const d = hessian.decode(dateBuffer);
    assert(Object.prototype.toString.call(d) === '[object Date]');
    assert(d.getFullYear() === 1998);
    assert(d.getTime() === 894621091000);
    assert(d.toUTCString() === 'Fri, 08 May 1998 09:51:31 GMT');
    assert(d.toISOString() === '1998-05-08T09:51:31.000Z');
  });

  it('should write date 2:51:31 May 8, 1998', function() {
    assert.deepEqual(hessian.encode(new Date(894621091000)), dateBuffer);
  });

  it('should write date 0 and read', function() {
    assert.deepEqual(
      hessian.encode(new Date(0)),
      Buffer.from([ 'd'.charCodeAt(0), 0, 0, 0, 0, 0, 0, 0, 0 ])
    );
  });

  it('should read date 09:51:31 May 8, 1998 UTC', function() {
    const d = hessian.decode(utils.bytes('v1/date/894621091000'), '1.0');
    assert(Object.prototype.toString.call(d) === '[object Date]');
    assert(d.getFullYear() === 1998);
    assert(d.getTime() === 894621091000);
    assert(d.toUTCString() === 'Fri, 08 May 1998 09:51:31 GMT');
    assert(d.toISOString() === '1998-05-08T09:51:31.000Z');
  });

  it('should read date 09:51:00 May 8, 1998 UTC', function() {
    const d = hessian.decode(utils.bytes('v1/date/894621060000'), '1.0');
    assert(Object.prototype.toString.call(d) === '[object Date]');
    assert(d.getFullYear() === 1998);
    assert(d.getTime() === 894621060000);
    assert(d.toUTCString() === 'Fri, 08 May 1998 09:51:00 GMT');
    assert(d.toISOString() === '1998-05-08T09:51:00.000Z');
  });

  it('should write date', function() {
    const now = new Date(1398280514000);
    assert.deepEqual(hessian.encode(now, '1.0'), utils.bytes('v1/date/now'));
    // read it
    assert.deepEqual(hessian.decode(utils.bytes('v1/date/now'), '1.0'), now);
  });

  describe('hessian 2.0', function() {
    it('should read date 09:51:31 May 8, 1998 UTC', function() {
      const d = hessian.decode(utils.bytes('v2/date/894621091000'), '2.0');
      assert(Object.prototype.toString.call(d) === '[object Date]');
      assert(d.getFullYear() === 1998);
      assert(d.getTime() === 894621091000);
      assert(d.toUTCString() === 'Fri, 08 May 1998 09:51:31 GMT');
      assert(d.toISOString() === '1998-05-08T09:51:31.000Z');
    });

    it('should read Compact: date in minutes, 09:51:00 May 8, 1998 UTC', function() {
      const d = hessian.decode(utils.bytes('v2/date/894621060000'), '2.0');
      assert(Object.prototype.toString.call(d) === '[object Date]');
      assert(d.getFullYear() === 1998);
      assert(d.getTime() === 894621060000);
      assert(d.toUTCString() === 'Fri, 08 May 1998 09:51:00 GMT');
      assert(d.toISOString() === '1998-05-08T09:51:00.000Z');
    });

    it('should write and read date', function() {
      const now = new Date(1398280514000);
      assert.deepEqual(hessian.encode(now, '2.0'), utils.bytes('v2/date/now'));
      // read it
      assert.deepEqual(hessian.decode(utils.bytes('v2/date/now'), '2.0'), now);
    });

    it('should read 1.0 format', function() {
      assert(
        hessian.decode(utils.bytes('v1/date/894621091000'), '2.0').getTime() === 894621091000
      );
      assert(
        hessian.decode(utils.bytes('v1/date/894621060000'), '2.0').getTime() === 894621060000
      );
      assert(
        hessian.decode(utils.bytes('v1/date/now'), '2.0').getTime() === 1398280514000
      );
    });
  });
});
