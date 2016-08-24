/**
 * hessian.js - test/date.test.js
 *
 * Copyright(c)
 * MIT Licensed
 *
 * Authors:
 *   fengmk2 <fengmk2@gmail.com> (http://fengmk2.github.com)
 */

/* global describe, it */

'use strict';

/**
 * Module dependencies.
 */

var should = require('should');
var hessian = require('../');
var utils = require('./utils');

describe('date.test.js', function () {
  var dateBuffer = new Buffer(['d'.charCodeAt(0), 0x00, 0x00, 0x00, 0xd0, 0x4b, 0x92, 0x84, 0xb8]);

  it('should read date 2:51:31 May 8, 1998', function () {
    var d = hessian.decode(dateBuffer);
    d.should.be.a.Date;
    d.getFullYear().should.equal(1998);
    d.getTime().should.equal(894621091000);
    d.toUTCString().should.equal('Fri, 08 May 1998 09:51:31 GMT');
    d.toISOString().should.equal('1998-05-08T09:51:31.000Z');
  });

  it('should write date 2:51:31 May 8, 1998', function () {
    hessian.encode(new Date(894621091000)).should.eql(dateBuffer);
  });

  it('should write date 0 and read', function () {
    hessian.encode(new Date(0)).should.eql(new Buffer(['d'.charCodeAt(0), 0, 0, 0, 0, 0, 0, 0, 0]));
  });

  it('should read date 09:51:31 May 8, 1998 UTC', function () {
    var d = hessian.decode(utils.bytes('v1/date/894621091000'), '1.0');
    d.should.be.a.Date;
    d.getFullYear().should.equal(1998);
    d.getTime().should.equal(894621091000);
    d.toUTCString().should.equal('Fri, 08 May 1998 09:51:31 GMT');
    d.toISOString().should.equal('1998-05-08T09:51:31.000Z');
  });

  it('should read date 09:51:00 May 8, 1998 UTC', function () {
    var d = hessian.decode(utils.bytes('v1/date/894621060000'), '1.0');
    d.should.be.a.Date;
    d.getFullYear().should.equal(1998);
    d.getTime().should.equal(894621060000);
    d.toUTCString().should.equal('Fri, 08 May 1998 09:51:00 GMT');
    d.toISOString().should.equal('1998-05-08T09:51:00.000Z');
  });

  it('should write date', function () {
    var now = new Date(1398280514000);
    hessian.encode(now, '1.0').should.eql(utils.bytes('v1/date/now'));
    // read it
    hessian.decode(utils.bytes('v1/date/now'), '1.0').should.eql(now);
  });

  describe('hessian 2.0', function () {
    it('should read date 09:51:31 May 8, 1998 UTC', function () {
      var d = hessian.decode(utils.bytes('v2/date/894621091000'), '2.0');
      d.should.be.a.Date;
      d.getFullYear().should.equal(1998);
      d.getTime().should.equal(894621091000);
      d.toUTCString().should.equal('Fri, 08 May 1998 09:51:31 GMT');
      d.toISOString().should.equal('1998-05-08T09:51:31.000Z');
    });

    it('should read Compact: date in minutes, 09:51:00 May 8, 1998 UTC', function () {
      var d = hessian.decode(utils.bytes('v2/date/894621060000'), '2.0');
      d.should.be.a.Date;
      d.getFullYear().should.equal(1998);
      d.getTime().should.equal(894621060000);
      d.toUTCString().should.equal('Fri, 08 May 1998 09:51:00 GMT');
      d.toISOString().should.equal('1998-05-08T09:51:00.000Z');
    });

    it('should write and read date, Thu, 23 Jan 6053 02:08:00 GMT', function () {
      // Maximum of 32-bit integer
      var overflow32BitInt = Math.pow(2, 31);
      var milliseconds = overflow32BitInt * 60000;
      var date = new Date();
      date.setTime(milliseconds);

      var bytes = utils.bytes('v2/date/' + milliseconds.toString());

      hessian.encode(date, '2.0').should.eql(bytes);
      hessian.decode(bytes, '2.0').should.eql(date);
    });

    it('should write and read date, Wed, 08 Dec -2114 21:53:00 GMT (2115 B.C.)', function () {
      // Minimum of 32-bit integer
      var overflow32BitInt = -1 * (Math.pow(2, 31) + 1);
      var milliseconds = overflow32BitInt * 60000;
      var date = new Date();
      date.setTime(milliseconds);

      var bytes = utils.bytes('v2/date/' + milliseconds.toString());

      hessian.encode(date, '2.0').should.eql(bytes);
      hessian.decode(bytes, '2.0').should.eql(date);
    });


    it('should write and read date', function () {
      var now = new Date(1398280514000);
      hessian.encode(now, '2.0').should.eql(utils.bytes('v2/date/now'));
      // read it
      hessian.decode(utils.bytes('v2/date/now'), '2.0').should.eql(now);
    });

    it('should write and read Wed Jan 04 1950 00:00:00 GMT+0800 (CST)', function () {
      var date = new Date('Wed Jan 04 1950 00:00:00 GMT+0800 (CST)');
      var bin = new Buffer('4bff5f8c60', 'hex');
      hessian.encode(date, '2.0').should.eql(bin);
      hessian.decode(bin, '2.0').should.eql(date);
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
