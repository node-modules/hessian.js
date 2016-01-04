/*!
 * hessian.js - test/call-reply.test.js
 *
 * Copyright(c) 2016
 * MIT Licensed
 *
 * Authors:
 *   tangzhi <tangz97@gmail.com> (http://github.com/tangzhi)
 */

"use strict";

/**
 * Module dependencies.
 */

var should = require('should');
var hessian = require('../');
var utils = require('./utils');

describe('call-reply.test.js', function () {
  //c x01 x00
  //  m x00 x04 add2
  //  I x00 x00 x00 x02
  //  I x00 x00 x00 x03
  //  z
  var simpleBuffer = Buffer.concat([
    new Buffer(['c'.charCodeAt(0), 0x01, 0x00]), 
    new Buffer(['m'.charCodeAt(0), 0x00, 0x04]), new Buffer('add2'),
    new Buffer(['I'.charCodeAt(0), 0x00, 0x00, 0x00, 0x02]),
    new Buffer(['I'.charCodeAt(0), 0x00, 0x00, 0x00, 0x03]),
    new Buffer('z')
  ]);

  it('should read call [add2(2,3)]', function () {
    hessian.decode(simpleBuffer).should.eql({
      method: 'add2',
      header: {},
      arguments: [2,3]
    });
  });

  it('should write reply 5', function() {
    var buf = hessian.encode({$class:"reply", $:{value: 5}});
    buf.should.be.a.Buffer;
    // r x01 x00
    //   I x00 x00 x00 x05
    //   z
    buf.should.eql(Buffer.concat([
      new Buffer(['r'.charCodeAt(0), 0x01, 0x00]),
      new Buffer(['I'.charCodeAt(0), 0x00, 0x00, 0x00, 0x05]),
      new Buffer('z')  
    ]));
  });

  it('should write reply fault', function() {
    var fault = {
      message: 'time out'
    };
    var buf = hessian.encode({$class:"reply", $:{fault: fault}});
    buf.should.be.a.Buffer;
    // r x01 x00
    //   f
    //   S x00 x04 code
    //   S x00 x10 ServiceException
    //   S x00 x07 message
    //   S x00 x08 time out
    //   z
    buf.should.eql(Buffer.concat([
      new Buffer(['r'.charCodeAt(0), 0x01, 0x00]),
      new Buffer('f'),
      new Buffer(['S'.charCodeAt(0), 0x00, 0x04]), new Buffer('code'),
      new Buffer(['S'.charCodeAt(0), 0x00, 0x10]), new Buffer('ServiceException'),
      new Buffer(['S'.charCodeAt(0), 0x00, 0x07]), new Buffer('message'),
      new Buffer(['S'.charCodeAt(0), 0x00, 0x08]), new Buffer('time out'),
      new Buffer('z')  
    ]));
  });

  it('should write reply fault with detail', function() {
    var fault = {
      message : 'time out',
      detail  : {
        $class : 'java.io.FileNotFoundException',
        $: {}
      }
    };
    var buf = hessian.encode({$class:"reply", $:{fault: fault}});
    buf.should.be.a.Buffer;
    // r x01 x00
    //   f
    //   S x00 x04 code
    //   S x00 x10 ServiceException
    //   S x00 x07 message
    //   S x00 x08 time out
    //   S x00 x06 detail
    //   M t x00 x1d java.io.FileNotFoundException
    //     z
    //   z
    buf.should.eql(Buffer.concat([
      new Buffer(['r'.charCodeAt(0), 0x01, 0x00]),
      new Buffer('f'),
      new Buffer(['S'.charCodeAt(0), 0x00, 0x04]), new Buffer('code'),
      new Buffer(['S'.charCodeAt(0), 0x00, 0x10]), new Buffer('ServiceException'),
      new Buffer(['S'.charCodeAt(0), 0x00, 0x07]), new Buffer('message'),
      new Buffer(['S'.charCodeAt(0), 0x00, 0x08]), new Buffer('time out'),
      new Buffer(['S'.charCodeAt(0), 0x00, 0x06]), new Buffer('detail'),
      new Buffer(['M'.charCodeAt(0), 't'.charCodeAt(0), 0x00, 0x1d]), new Buffer('java.io.FileNotFoundException'),
      new Buffer('zz')  
    ]));
  });
  
});
