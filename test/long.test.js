/*!
 * hessian.js - test/long.test.js
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

describe('long.test.js', function () {
  var longBuffer = new Buffer(['L'.charCodeAt(0), 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x2c]);

  it('should read long 300', function () {
    hessian.decode(longBuffer).should.equal(300);
  });

  it('should write long 300', function () {
    hessian.encode({
      $class: 'long',
      $: 300
    }).should.eql(longBuffer);
    hessian.encode(hessian.java.long(300)).should.eql(longBuffer);
  });

  it('should write long 0', function () {
    hessian.encode(hessian.java.long(0)).should.eql(
      new Buffer(['L'.charCodeAt(0), 0, 0, 0, 0, 0, 0, 0, 0]));
  });
});
