'use strict';

var assert = require('assert');
var hessian = require('../../index');
var java = require('js-to-java');

describe('test/convert.test.js', function() {
  [
    '1.0',
  ].forEach(function(version) {
    describe(version, function() {
      it('should convert java.util.Locale to com.caucho.hessian.io.LocaleHandle', function() {
        var buf1 = hessian.encode(java.Locale('zh_CN'), version);
        var buf2 = hessian.encode({
          $class: 'java.util.Locale',
          $: 'zh_CN',
        }, version);
        assert.deepEqual(buf1, buf2);
      });
    });
  });
});
