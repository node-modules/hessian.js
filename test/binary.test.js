/*
 * hessian.js - test/binary.test.js
 *
 * Copyright(c)
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
var utils = require('./utils');

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

  it('should write and read as java impl', function () {
    var bytes = new Buffer(65535);
    bytes.fill(0x41);
    var buf = hessian.encode(bytes, '1.0');
    buf.should.length(utils.bytes('v1/bytes/65535').length);
    buf.should.eql(utils.bytes('v1/bytes/65535'));
    hessian.decode(utils.bytes('v1/bytes/65535'), '1.0').should.eql(bytes);

    var bytes = new Buffer(32768);
    bytes.fill(0x41);
    var buf = hessian.encode(bytes, '1.0');
    buf.should.length(utils.bytes('v1/bytes/32768').length);
    buf.should.eql(utils.bytes('v1/bytes/32768'));
    hessian.decode(utils.bytes('v1/bytes/32768'), '1.0').should.eql(bytes);

    var bytes = new Buffer(32769);
    bytes.fill(0x41);
    var buf = hessian.encode(bytes, '1.0');
    buf.should.length(utils.bytes('v1/bytes/32769').length);
    buf.should.eql(utils.bytes('v1/bytes/32769'));
    hessian.decode(utils.bytes('v1/bytes/32769'), '1.0').should.eql(bytes);

    var bytes = new Buffer(32767);
    bytes.fill(0x41);
    var buf = hessian.encode(bytes, '1.0');
    buf.should.length(utils.bytes('v1/bytes/32767').length);
    buf.should.eql(utils.bytes('v1/bytes/32767'));
    hessian.decode(utils.bytes('v1/bytes/32767'), '1.0').should.eql(bytes);

    var bytes = new Buffer(32769);
    bytes.fill(0x41);
    var buf = hessian.encode(bytes, '1.0');
    buf.should.length(utils.bytes('v1/bytes/32769').length);
    buf.should.eql(utils.bytes('v1/bytes/32769'));
    hessian.decode(utils.bytes('v1/bytes/32769'), '1.0').should.eql(bytes);

    var bytes = new Buffer(42769);
    bytes.fill(0x41);
    var buf = hessian.encode(bytes, '1.0');
    buf.should.length(utils.bytes('v1/bytes/42769').length);
    buf.should.eql(utils.bytes('v1/bytes/42769'));
    hessian.decode(utils.bytes('v1/bytes/42769'), '1.0').should.eql(bytes);

    var bytes = new Buffer(82769);
    bytes.fill(0x41);
    var buf = hessian.encode(bytes, '1.0');
    buf.should.length(utils.bytes('v1/bytes/82769').length);
    buf.should.eql(utils.bytes('v1/bytes/82769'));
    hessian.decode(utils.bytes('v1/bytes/82769'), '1.0').should.eql(bytes);
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
      decoder.clean();
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

      var buf15 = new Buffer(15);
      buf15.fill(0x41);
      hessian.encode(buf15, '2.0').should.eql(utils.bytes('v2/bytes/15'));
      hessian.decode(utils.bytes('v2/bytes/15'), '2.0').should.eql(buf15);

      var buf16 = new Buffer(16);
      buf16.fill(0x41);
      hessian.encode(buf16, '2.0').should.eql(utils.bytes('v2/bytes/16'));
      hessian.decode(utils.bytes('v2/bytes/16'), '2.0').should.eql(buf16);
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
    });

    it('should write and read as java impl', function () {
      var bytes = new Buffer(65535);
      bytes.fill(0x41);
      var buf = hessian.encode(bytes, '2.0');
      buf.should.length(utils.bytes('v2/bytes/65535').length);
      buf.should.eql(utils.bytes('v2/bytes/65535'));
      hessian.decode(utils.bytes('v2/bytes/65535'), '2.0').should.eql(bytes);

      var bytes = new Buffer(32768);
      bytes.fill(0x41);
      var buf = hessian.encode(bytes, '2.0');
      buf.should.length(utils.bytes('v2/bytes/32768').length);
      buf.should.eql(utils.bytes('v2/bytes/32768'));
      hessian.decode(utils.bytes('v2/bytes/32768'), '2.0').should.eql(bytes);

      var bytes = new Buffer(32769);
      bytes.fill(0x41);
      var buf = hessian.encode(bytes, '2.0');
      buf.should.length(utils.bytes('v2/bytes/32769').length);
      buf.should.eql(utils.bytes('v2/bytes/32769'));
      hessian.decode(utils.bytes('v2/bytes/32769'), '2.0').should.eql(bytes);

      var bytes = new Buffer(32767);
      bytes.fill(0x41);
      var buf = hessian.encode(bytes, '2.0');
      buf.should.length(utils.bytes('v2/bytes/32767').length);
      buf.should.eql(utils.bytes('v2/bytes/32767'));
      hessian.decode(utils.bytes('v2/bytes/32767'), '2.0').should.eql(bytes);

      var bytes = new Buffer(32769);
      bytes.fill(0x41);
      var buf = hessian.encode(bytes, '2.0');
      buf.should.length(utils.bytes('v2/bytes/32769').length);
      buf.should.eql(utils.bytes('v2/bytes/32769'));
      hessian.decode(utils.bytes('v2/bytes/32769'), '2.0').should.eql(bytes);

      var bytes = new Buffer(42769);
      bytes.fill(0x41);
      var buf = hessian.encode(bytes, '2.0');
      buf.should.length(utils.bytes('v2/bytes/42769').length);
      buf.should.eql(utils.bytes('v2/bytes/42769'));
      hessian.decode(utils.bytes('v2/bytes/42769'), '2.0').should.eql(bytes);

      var bytes = new Buffer(82769);
      bytes.fill(0x41);
      var buf = hessian.encode(bytes, '2.0');
      buf.should.length(utils.bytes('v2/bytes/82769').length);
      buf.should.eql(utils.bytes('v2/bytes/82769'));
      hessian.decode(utils.bytes('v2/bytes/82769'), '2.0').should.eql(bytes);
    });

    // it('should read java hessian 1.0 bin format', function () {
    //   var bytes = new Buffer(65535);
    //   bytes.fill(0x41);
    //   hessian.decode(utils.bytes('v1/bytes/65535'), '2.0').should.eql(bytes);

    //   var bytes = new Buffer(32767);
    //   bytes.fill(0x41);
    //   hessian.decode(utils.bytes('v1/bytes/32767'), '2.0').should.eql(bytes);

    //   var bytes = new Buffer(32768);
    //   bytes.fill(0x41);
    //   hessian.decode(utils.bytes('v1/bytes/32768'), '2.0').should.eql(bytes);

    //   var bytes = new Buffer(32769);
    //   bytes.fill(0x41);
    //   hessian.decode(utils.bytes('v1/bytes/32769'), '2.0').should.eql(bytes);

    //   var bytes = new Buffer(32767);
    //   bytes.fill(0x41);
    //   hessian.decode(utils.bytes('v1/bytes/32767'), '2.0').should.eql(bytes);

    //   var bytes = new Buffer(32769);
    //   bytes.fill(0x41);
    //   hessian.decode(utils.bytes('v1/bytes/32769'), '2.0').should.eql(bytes);

    //   var bytes = new Buffer(42769);
    //   bytes.fill(0x41);
    //   hessian.decode(utils.bytes('v1/bytes/42769'), '2.0').should.eql(bytes);

    //   var bytes = new Buffer(82769);
    //   bytes.fill(0x41);
    //   hessian.decode(utils.bytes('v1/bytes/82769'), '2.0').should.eql(bytes);
    // });
  });
});
