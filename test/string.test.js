/*!
 * hessian.js - test/string.test.js
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

describe('string.test.js', function () {
  var helloBuffer = Buffer.concat([new Buffer(['S'.charCodeAt(0), 0x00, 0x05]),
    new Buffer('hello')]);

  it('should read string', function () {
    hessian.decode(helloBuffer).should.equal('hello');
    hessian.decode(Buffer.concat([new Buffer(['s'.charCodeAt(0), 0x00, 0x07]),
        new Buffer('hello, '), new Buffer(['S'.charCodeAt(0), 0x00, 0x05]),
        new Buffer('world')])).should.equal('hello, world');
  });

  it('should write string', function () {
    var s = hessian.encode('hello');
    s.should.be.a.Buffer;
    s.should.length(8);
    s.should.eql(helloBuffer);
  });

  it('should read write empty string', function () {
    hessian.decode(new Buffer(['S'.charCodeAt(0), 0, 0])).should.equal('');
    hessian.encode('').should.eql(new Buffer(['S'.charCodeAt(0), 0, 0]));
  });

  describe('v2.0', function () {
    it('should read short strings', function () {
      hessian.decode(new Buffer([0x00])).should.equal('');
      hessian.decode(new Buffer([0x00]), '2.0', true).should.equal('');
      hessian.decode(Buffer.concat([new Buffer([0x05]),
        new Buffer('hello')])).should.equal('hello');
      hessian.decode(new Buffer([0x01, 0xc3, 0x83])).should.equal('\u00c3');
      hessian.decode(Buffer.concat([new Buffer([0x09]),
        new Buffer('hello, 中文')])).should.equal('hello, 中文');
    });

    it('should read "hello" in long form', function () {
      hessian.decode(Buffer.concat([new Buffer(['S'.charCodeAt(0), 0x00, 0x05]),
        new Buffer('hello')])).should.equal('hello');
    });

    it('should read split into two chunks: R and short strings', function () {
      hessian.decode(Buffer.concat([new Buffer([0x52, 0x00, 0x07]),
        new Buffer('hello, '), new Buffer([0x05]), new Buffer('world')]), '2.0')
      .should.equal('hello, world');
    });

    it('should write short strings', function () {
      hessian.encode('', '2.0').should.eql(new Buffer([0x00]));
      hessian.encode('foo', '2.0').should.eql(
        Buffer.concat([
          new Buffer([0x03]),
          new Buffer('foo')
        ])
      );
      hessian.encode('0123456789012345678901234567890', '2.0').should.eql(
        Buffer.concat([
          new Buffer([0x1f]),
          new Buffer('0123456789012345678901234567890')
        ])
      );

      var len32Buf = new Buffer(2);
      len32Buf.writeInt16BE(32, 0);
      hessian.encode('01234567890123456789012345678901', '2.0').should.eql(
        Buffer.concat([
          new Buffer([0x53]),
          len32Buf,
          new Buffer('01234567890123456789012345678901')
        ])
      );

      var largeBuf = new Buffer(65535);
      largeBuf.fill(0x41);
      hessian.encode(largeBuf.toString(), '2.0');

      largeBuf = new Buffer(65535 * 3 + 100);
      largeBuf.fill(0x41);
      hessian.encode(largeBuf.toString(), '2.0');
    });
  });
});
