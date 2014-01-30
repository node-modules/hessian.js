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
  var helloBuffer = Buffer.concat([new Buffer(['S'.charCodeAt(0), 0x00, 0x05]), new Buffer('hello')]);

  it('should read string', function () {
    hessian.decode(helloBuffer).should.equal('hello');
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
});
