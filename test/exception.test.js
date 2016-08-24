/**
 * hessian.js - test/exception.test.js
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

describe('exception.test.js', function () {
  describe('v1.0', function () {
    it('should read java exception as js error', function () {
      var ioe = hessian.decode(utils.bytes('v1/exception/IOException'));
      ioe.should.be.an.Error;
      ioe.name.should.equal('java.io.IOException');
      ioe.message.should.equal('this is a java IOException instance');
      ioe.stack.should.equal('java.io.IOException: this is a java IOException instance\n    at hessian.Main.main (Main.java:1283)');

      var ioe = hessian.decode(utils.bytes('v1/exception/IOException'), true);
      ioe.$.should.be.an.Error;
      ioe.$.name.should.equal('java.io.IOException');
      ioe.$.message.should.equal('this is a java IOException instance');
      ioe.$.stack.should.equal('java.io.IOException: this is a java IOException instance\n    at hessian.Main.main (Main.java:1283)');

      var e = hessian.decode(utils.bytes('v1/exception/UndeclaredThrowableException'));
      e.should.be.an.Error;
      should.ok((e instanceof Error) === true);
      e.name.should.equal('java.io.IOException');
      e.message.should.equal('this is a java IOException instance');
      e.stack.should.equal('java.io.IOException: this is a java IOException instance\n    at hessian.Main.main (Main.java:1283)');
      should.exist(e.cause);
      e.cause.detailMessage.should.equal('this is a java IOException instance');

      var e = hessian.decode(utils.bytes('v1/exception/UndeclaredThrowableException'), true);
      e.$.should.be.an.Error;
      e.$.name.should.equal('java.io.IOException');
      e.$.message.should.equal('this is a java IOException instance');
      e.$.stack.should.equal('java.io.IOException: this is a java IOException instance\n    at hessian.Main.main (Main.java:1283)');
      should.exist(e.$.cause);
      e.$.cause.$class.should.equal('java.io.IOException');
      e.$.cause.$.should.be.an.Error;
      e.$.cause.$.name.should.equal('java.io.IOException');

      var e = hessian.decode(utils.bytes('v1/exception/UndeclaredThrowableException2'));
      e.should.be.an.Error;
      should.ok((e instanceof Error) === true);
      e.name.should.equal('java.io.IOException');
      e.message.should.equal('模拟测试异常; this is a java IOException instance');
      e.stack.should.equal('java.io.IOException: 模拟测试异常; this is a java IOException instance\n    at hessian.Main.main (Main.java:1303)');

      var e = hessian.decode(utils.bytes('v1/exception/UndeclaredThrowableException2'), true);
      e.$.should.be.an.Error;
      e.$.name.should.equal('java.io.IOException');
      e.$.message.should.equal('模拟测试异常; this is a java IOException instance');
      e.$.stack.should.equal('java.io.IOException: 模拟测试异常; this is a java IOException instance\n    at hessian.Main.main (Main.java:1303)');
    });
  });

  describe('v2.0', function () {
    it('should read java exception as js error', function () {
      var ioe = hessian.decode(utils.bytes('v2/exception/IOException'), '2.0');
      ioe.should.be.an.Error;
      should.ok((ioe instanceof Error) === true);
      ioe.name.should.equal('java.io.IOException');
      ioe.message.should.equal('this is a java IOException instance');
      ioe.stack.should.equal('java.io.IOException: this is a java IOException instance\n    at hessian.Main.main (Main.java:1283)');

      var e = hessian.decode(utils.bytes('v2/exception/UndeclaredThrowableException'), '2.0');
      e.should.be.an.Error;
      should.ok((e instanceof Error) === true);
      e.name.should.equal('java.io.IOException');
      e.message.should.equal('this is a java IOException instance');
      e.stack.should.equal('java.io.IOException: this is a java IOException instance\n    at hessian.Main.main (Main.java:1283)');

      var e = hessian.decode(utils.bytes('v2/exception/UndeclaredThrowableException2'), '2.0');
      e.should.be.an.Error;
      should.ok((e instanceof Error) === true);
      e.name.should.equal('java.io.IOException');
      e.message.should.equal('模拟测试异常; this is a java IOException instance');
      e.stack.should.equal('java.io.IOException: 模拟测试异常; this is a java IOException instance\n    at hessian.Main.main (Main.java:1303)');
      
      var e = hessian.decode(utils.bytes('v2/exception/UndeclaredThrowableException3'), '2.0');
      e.should.be.an.Error;
      should.ok((e instanceof Error) === true);
      e.name.should.equal('com.taobao.hsf.exception.HSFServiceAddressNotFoundException');
      e.message.should.equal('HSFServiceAddressNotFoundException-');
      e.cause.stackTrace.length.should.equal(56);
    });

    // it('should read hessian 1.0 exception', function () {
    //   var ioe = hessian.decode(utils.bytes('v1/exception/IOException'), '2.0');
    //   ioe.should.be.an.Error;
    //   should.ok((ioe instanceof Error) === true);
    //   ioe.name.should.equal('java.io.IOException');
    //   ioe.message.should.equal('this is a java IOException instance');
    //   ioe.stack.should.equal('java.io.IOException: this is a java IOException instance\n    at hessian.Main.main (Main.java:1283)');

    //   var e = hessian.decode(utils.bytes('v1/exception/UndeclaredThrowableException'), '2.0');
    //   e.should.be.an.Error;
    //   should.ok((e instanceof Error) === true);
    //   e.name.should.equal('java.io.IOException');
    //   e.message.should.equal('this is a java IOException instance');
    //   e.stack.should.equal('java.io.IOException: this is a java IOException instance\n    at hessian.Main.main (Main.java:1283)');

    //   var e = hessian.decode(utils.bytes('v1/exception/UndeclaredThrowableException2'), '2.0');
    //   e.should.be.an.Error;
    //   should.ok((e instanceof Error) === true);
    //   e.name.should.equal('java.io.IOException');
    //   e.message.should.equal('模拟测试异常; this is a java IOException instance');
    //   e.stack.should.equal('java.io.IOException: 模拟测试异常; this is a java IOException instance\n    at hessian.Main.main (Main.java:1303)');
    // });
  });
});
