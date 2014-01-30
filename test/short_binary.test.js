/*!
 * hessian.js - test/short_binary.test.js
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

describe('short_binary.test.js', function () {
  it('should read zero length binary data', function () {
    var buf = hessian.Decoder.decode(new Buffer([0x20]));
    buf.should.length(0);
    buf.should.eql(new Buffer(0));
  });

  it('should read short datas', function () {
    var decoder = new hessian.Decoder();
    decoder.init(new Buffer([0x20, 0x23, 0x23, 0x02, 0x03, 0x20]));
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
    var buf = hessian.Decoder.decode(input);
    buf.should.length(15);
    var output = new Buffer(15);
    output.fill(0x2f);
    buf.should.eql(output);
  });
});
