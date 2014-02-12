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
    it('should read zero length binary data', function () {
      var buf = hessian.decode(new Buffer([0x20]), '2.0');
      buf.should.length(0);
      buf.should.eql(new Buffer(0));
    });

    it('should read short datas', function () {
      var decoder = new hessian.DecoderV2(new Buffer([0x20, 0x23, 0x23, 0x02, 0x03, 0x20]));
      var buf = decoder.read();
      buf.should.length(0);
      buf.should.eql(new Buffer(0));

      buf = decoder.read();
      buf.should.length(3);
      buf.should.eql(new Buffer([0x23, 2, 3]));

      buf = decoder.read();
      buf.should.length(0);
      buf.should.eql(new Buffer(0));
    });

    it('should read max length short datas', function () {
      var input = new Buffer(16);
      input.fill(0x2f);
      input[0] = 0x2f;
      var buf = hessian.decode(input, '2.0');
      buf.should.length(15);
      var output = new Buffer(15);
      output.fill(0x2f);
      buf.should.eql(output);
    });

    it('should read long binary', function () {
      var buf = hessian.encode(new Buffer(65535), '2.0');
      buf[0].should.equal(0x41);
      hessian.decode(buf, '2.0');

      buf = hessian.encode(new Buffer(65536), '2.0');
      hessian.decode(buf, '2.0');

      buf = hessian.encode(new Buffer(65535 * 2 - 10), '2.0');
      hessian.decode(buf, '2.0');
    });

    it('should write short binary', function () {
      hessian.encode(new Buffer(''), '2.0').should.eql(new Buffer([0x20]));
      var buf = hessian.encode(new Buffer(65535), '2.0');
      // 'b' + b1b0 + 65535 + 0x20
      buf.should.length(65535 + 4);
      buf[0].should.equal(0x41);
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
