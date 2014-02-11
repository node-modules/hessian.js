/**!
 * hessian.js - test/date.test.js
 *
 * Copyright(c) 2014
 * MIT Licensed
 *
 * Authors:
 *   fengmk2 <fengmk2@gmail.com> (http://fengmk2.github.com)
 */

"use strict";

/**
 * Module dependencies.
 */

var should = require('should');
var hessian = require('../');

describe('date.test.js', function () {
  var dateBuffer = new Buffer(['d'.charCodeAt(0), 0x00, 0x00, 0x00, 0xd0, 0x4b, 0x92, 0x84, 0xb8]);

  it('should read date 2:51:31 May 8, 1998', function () {
    var d = hessian.decode(dateBuffer);
    d.should.be.an.Date;
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

  describe('hessian 2.0', function () {
    // date ::= x4a(J) b7 b6 b5 b4 b3 b2 b1 b0
    //      ::= x4b(K) b3 b2 b1 b0
    var dateV2Buffer = new Buffer([0x4a, 0x00, 0x00, 0x00, 0xd0, 0x4b, 0x92, 0x84, 0xb8]);

    it('should read date 09:51:31 May 8, 1998 UTC', function () {
      var d = hessian.decode(dateV2Buffer, '2.0');
      d.should.be.a.Date;
      d.getFullYear().should.equal(1998);
      d.getTime().should.equal(894621091000);
      d.toUTCString().should.equal('Fri, 08 May 1998 09:51:31 GMT');
      d.toISOString().should.equal('1998-05-08T09:51:31.000Z');
    });

    it('should read Compact: date in minutes, 09:51:00 May 8, 1998 UTC', function () {
      var dateBuf = new Buffer([0x4b, 0x00, 0xe3, 0x83, 0x8f]);
      var d = hessian.decode(dateBuf, '2.0');
      d.should.be.a.Date;
      d.getFullYear().should.equal(1998);
      d.getTime().should.equal(894621060000);
      d.toUTCString().should.equal('Fri, 08 May 1998 09:51:00 GMT');
      d.toISOString().should.equal('1998-05-08T09:51:00.000Z');
    });

    it('should write date', function () {
      hessian.encode(new Date(894621091000), '2.0').should.eql(dateV2Buffer);
    });
  });
});
