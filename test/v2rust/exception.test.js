"use strict";

var assert = require('assert');
var hessian = require('../../index');
var utils = require('../utils');
var java = require('js-to-java');
var rustDecode = require('./rustdecoder');

describe('exception.test.js', function () {
  describe('v2.0', function () {
    it('should read java exception as js error', function () {
      var ioe = rustDecode(utils.bytes('v2/exception/IOException'));
      assert(ioe instanceof Error);
      assert((ioe instanceof Error) === true);
      assert(ioe.name === 'unknow');
      assert(ioe.message === 'this is a java IOException instance');
      assert(
        ioe.stack === 'unknow: this is a java IOException instance\n    at hessian.Main.main (Main.java:1283)'
      );

      var e = rustDecode(utils.bytes('v2/exception/UndeclaredThrowableException'));
      assert(e instanceof Error);
      assert((e instanceof Error) === true);
      assert(e.name === 'unknow');
      assert(e.message === 'this is a java IOException instance');
      assert(
        e.stack === 'unknow: this is a java IOException instance\n    at hessian.Main.main (Main.java:1283)'
      );

      var e = rustDecode(utils.bytes('v2/exception/UndeclaredThrowableException2'));
      assert(e instanceof Error);
      assert((e instanceof Error) === true);
      assert(e.name === 'unknow');
      assert(e.message === '模拟测试异常; this is a java IOException instance');
      assert(
        e.stack === 'unknow: 模拟测试异常; this is a java IOException instance\n    at hessian.Main.main (Main.java:1303)'
      );
    });

    it('should read hessian 1.0 exception', function () {
      var ioe = rustDecode(utils.bytes('v1/exception/IOException'));
      assert(ioe instanceof Error);
      assert((ioe instanceof Error) === true);
      assert(ioe.name === 'unknow');
      assert(ioe.message === 'this is a java IOException instance');
      assert(
        ioe.stack === 'unknow: this is a java IOException instance\n    at hessian.Main.main (Main.java:1283)'
      );

      var e = rustDecode(utils.bytes('v1/exception/UndeclaredThrowableException'));
      assert(e instanceof Error);
      assert((e instanceof Error) === true);
      assert(e.name === 'unknow');
      assert(e.message === 'this is a java IOException instance');
      assert(
        e.stack === 'unknow: this is a java IOException instance\n    at hessian.Main.main (Main.java:1283)'
      );

      var e = rustDecode(utils.bytes('v1/exception/UndeclaredThrowableException2'));
      assert(e instanceof Error);
      assert((e instanceof Error) === true);
      assert(e.name === 'unknow');
      assert(e.message === '模拟测试异常; this is a java IOException instance');
      assert(
        e.stack === 'unknow: 模拟测试异常; this is a java IOException instance\n    at hessian.Main.main (Main.java:1303)'
      );
    });

    it('should read exception type not endsWith Exception', function () {
      var e = rustDecode(new Buffer('4FB9636F6D2E616C697061792E736F66612E7270632E717569636B73746172742E54657374244572726F72940D64657461696C4D6573736167650563617573650A737461636B54726163651473757070726573736564457863657074696F6E736F90076D6573736167654A005674001C5B6A6176612E6C616E672E537461636B5472616365456C656D656E746E014FAB6A6176612E6C616E672E537461636B5472616365456C656D656E74940E6465636C6172696E67436C6173730A6D6574686F644E616D650866696C654E616D650A6C696E654E756D6265726F91530023636F6D2E616C697061792E736F66612E7270632E717569636B73746172742E54657374046D61696E09546573742E6A617661AE7A567400326A6176612E7574696C2E436F6C6C656374696F6E7324556E6D6F6469666961626C6552616E646F6D4163636573734C6973746E007A', 'hex'));
      assert(e instanceof Error);
      assert(e.message === 'message');
    });

    it('should detect exception without cause', function () {
      var e = java.exception(new Error('mock error'));
      delete e.$.cause;
      var buf = hessian.encode(e);
      assert(Buffer.isBuffer(buf));

      var err = rustDecode(buf);
      assert(err instanceof Error);
      assert(err.message === 'Error: mock error');

      buf = hessian.encode(e, '1.0');
      assert(Buffer.isBuffer(buf));

      err = rustDecode(buf);
      assert(err instanceof Error);
      assert(err.message === 'Error: mock error');
    });
  });
});
