/*!
 * hessian.js - test/binary.test.js
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

describe('binary.test.js', function () {
  it('should read "foo" binary', function () {
    hessian.decode(Buffer.concat([new Buffer(['B'.charCodeAt(0), 0x00, 0x03]), new Buffer('foo')]));
  });

  it('should write "foo"', function () {
    hessian.encode(new Buffer('foo')).should.eql(
      Buffer.concat([new Buffer(['B'.charCodeAt(0), 0x00, 0x03]), new Buffer('foo')]));
  });

  it('should read and write empty binary', function () {
    var empty = hessian.decode(new Buffer(['B'.charCodeAt(0), 0x00, 0x00]));
    empty.should.be.a.Buffer;
    empty.should.length(0);

    hessian.encode(new Buffer('')).should.eql(new Buffer(['B'.charCodeAt(0), 0x00, 0x00]));
  });

  describe('v2.0', function () {
    it('should write short binary', function () {
      hessian.encode(new Buffer(''), '2.0').should.eql(new Buffer([0x20]));
      var buf = hessian.encode(new Buffer(65535), '2.0');
      // 'b' + b1b0 + 65535 + 0x20
      buf.should.length(65535 + 4);
      buf[65538].should.equal(0x20);

      buf = hessian.encode(new Buffer(65536), '2.0');
      // 'b' + b1b0 + 65535 + 0x21 b0
      buf.should.length(65535 + 5);
      buf[65538].should.equal(0x21);
    });

    it('should write long binary', function () {
      var buf = hessian.encode(new Buffer(65535 * 2 - 10), '2.0');
      // 'b' + b1b0 + 65535 * 2 - 10
      buf.should.length(65535 * 2 - 10 + 6);
      buf[65538].should.equal('B'.charCodeAt(0));
    });
  });
});
