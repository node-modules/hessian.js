'use strict';

const assert = require('assert');
const hessian = require('..');
const utils = require('./utils');

describe('exception.test.js', function () {
  describe('v1.0', function () {
    it('should read java exception as js error', function () {
      var ioe = hessian.decode(utils.bytes('v1/exception/IOException'));
      assert(ioe instanceof Error);
      assert(ioe.name === 'java.io.IOException');
      assert(ioe.message === 'this is a java IOException instance');
      assert(
        ioe.stack === 'java.io.IOException: this is a java IOException instance\n    at hessian.Main.main (Main.java:1283)'
      );

      var ioe = hessian.decode(utils.bytes('v1/exception/IOException'), true);
      assert(ioe.$ instanceof Error);
      assert(ioe.$.name === 'java.io.IOException');
      assert(ioe.$.message === 'this is a java IOException instance');
      assert(
        ioe.$.stack === 'java.io.IOException: this is a java IOException instance\n    at hessian.Main.main (Main.java:1283)'
      );

      var e = hessian.decode(utils.bytes('v1/exception/UndeclaredThrowableException'));
      assert(e instanceof Error);
      assert((e instanceof Error) === true);
      assert(e.name === 'java.io.IOException');
      assert(e.message === 'this is a java IOException instance');
      assert(
        e.stack === 'java.io.IOException: this is a java IOException instance\n    at hessian.Main.main (Main.java:1283)'
      );
      assert(e.cause);
      assert(e.cause.detailMessage === 'this is a java IOException instance');

      var e = hessian.decode(utils.bytes('v1/exception/UndeclaredThrowableException'), true);
      assert(e.$ instanceof Error);
      assert(e.$.name === 'java.io.IOException');
      assert(e.$.message === 'this is a java IOException instance');
      assert(
        e.$.stack === 'java.io.IOException: this is a java IOException instance\n    at hessian.Main.main (Main.java:1283)'
      );
      assert(e.$.cause);
      assert(e.$.cause.$class === 'java.io.IOException');
      assert(e.$.cause.$ instanceof Error);
      assert(e.$.cause.$.name === 'java.io.IOException');

      var e = hessian.decode(utils.bytes('v1/exception/UndeclaredThrowableException2'));
      assert(e instanceof Error);
      assert((e instanceof Error) === true);
      assert(e.name === 'java.io.IOException');
      assert(e.message === '模拟测试异常; this is a java IOException instance');
      assert(
        e.stack === 'java.io.IOException: 模拟测试异常; this is a java IOException instance\n    at hessian.Main.main (Main.java:1303)'
      );

      var e = hessian.decode(utils.bytes('v1/exception/UndeclaredThrowableException2'), true);
      assert(e.$ instanceof Error);
      assert(e.$.name === 'java.io.IOException');
      assert(e.$.message === '模拟测试异常; this is a java IOException instance');
      assert(
        e.$.stack === 'java.io.IOException: 模拟测试异常; this is a java IOException instance\n    at hessian.Main.main (Main.java:1303)'
      );
    });
  });

  describe('v2.0', function () {
    it('should read java exception as js error', function () {
      var ioe = hessian.decode(utils.bytes('v2/exception/IOException'), '2.0');
      assert(ioe instanceof Error);
      assert((ioe instanceof Error) === true);
      assert(ioe.name === 'java.io.IOException');
      assert(ioe.message === 'this is a java IOException instance');
      assert(
        ioe.stack === 'java.io.IOException: this is a java IOException instance\n    at hessian.Main.main (Main.java:1283)'
      );

      var e = hessian.decode(utils.bytes('v2/exception/UndeclaredThrowableException'), '2.0');
      assert(e instanceof Error);
      assert(e.name === 'java.io.IOException');
      assert(e.message === 'this is a java IOException instance');
      assert(
        e.stack === 'java.io.IOException: this is a java IOException instance\n    at hessian.Main.main (Main.java:1283)'
      );

      var e = hessian.decode(utils.bytes('v2/exception/UndeclaredThrowableException2'), '2.0');
      assert(e instanceof Error);
      assert(e.name === 'java.io.IOException');
      assert(e.message === '模拟测试异常; this is a java IOException instance');
      assert(e.stack === 'java.io.IOException: 模拟测试异常; this is a java IOException instance\n    at hessian.Main.main (Main.java:1303)');

      var e = hessian.decode(utils.bytes('v2/exception/UndeclaredThrowableException3'), '2.0');
      assert(e instanceof Error);
      assert(e.name === 'com.taobao.hsf.exception.HSFServiceAddressNotFoundException');
      assert(e.message === 'HSFServiceAddressNotFoundException-');
      assert(e.cause.stackTrace.length === 56);
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
