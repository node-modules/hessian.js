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
});
