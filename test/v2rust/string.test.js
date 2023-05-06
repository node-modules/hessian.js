"use strict";

var assert = require('assert');
var hessian = require('../../index');
var utils = require('../utils');
var rustDecode = require('./rustdecoder');

describe('string.test.js', function () {
  this.timeout(0);

  describe('v2.0', function () {
    it('should emoji work', function () {
      let bf = hessian.encode({
        hello: "i am 😈"
      }, "2.0");
      assert(rustDecode(bf).hello === "i am 😈");
    });
    it('should read short strings', function () {
      assert(rustDecode(new Buffer([0x00])) === '');
      assert(rustDecode(new Buffer([0x00])) === '');
      assert(rustDecode(Buffer.concat([new Buffer([0x05]),
        new Buffer('hello')])) === 'hello');
      assert(rustDecode(new Buffer([0x01, 0xc3, 0x83])) === '\u00c3');
      assert(rustDecode(Buffer.concat([new Buffer([0x09]),
        new Buffer('hello, 中文')])) === 'hello, 中文');
    });

    it('should read "hello" in long form', function () {
      assert(rustDecode(Buffer.concat([new Buffer(['S'.charCodeAt(0), 0x00, 0x05]),
        new Buffer('hello')])) === 'hello');
    });

    it('should read split into two chunks: s and short strings', function () {
      assert(rustDecode(Buffer.concat([new Buffer(['s'.charCodeAt(0), 0x00, 0x07]),
        new Buffer('hello, '), new Buffer([0x05]), new Buffer('world')])) === 'hello, world');
    });

    it('should read java string', function () {
      assert(rustDecode(utils.bytes('v2/string/empty')) === '');
      assert(rustDecode(utils.bytes('v2/string/foo')) === 'foo');
      assert(rustDecode(utils.bytes('v2/string/chinese')) === '中文 Chinese');
      // assert(
      //   rustDecode(utils.bytes('v2/string/text4k')) === utils.string('4k')
      // );

      var largeBuf = new Buffer(32767);
      largeBuf.fill(0x41);
      assert(
        rustDecode(utils.bytes('v2/string/large_string_32767')) === largeBuf.toString()
      );

      var largeBuf = new Buffer(32768);
      largeBuf.fill(0x41);
      assert(
        rustDecode(utils.bytes('v2/string/large_string_32768')) === largeBuf.toString()
      );

      var largeBuf = new Buffer(32769);
      largeBuf.fill(0x41);
      assert(
        rustDecode(utils.bytes('v2/string/large_string_32769')) === largeBuf.toString()
      );

      var largeBuf = new Buffer(65534);
      largeBuf.fill(0x41);
      assert(
        rustDecode(utils.bytes('v2/string/large_string_65534')) === largeBuf.toString()
      );

      var largeBuf = new Buffer(65535);
      largeBuf.fill(0x41);
      assert(
        rustDecode(utils.bytes('v2/string/large_string_65535')) === largeBuf.toString()
      );

      var largeBuf = new Buffer(65536);
      largeBuf.fill(0x41);
      assert(
        rustDecode(utils.bytes('v2/string/large_string_65536')) === largeBuf.toString()
      );

      var largeBuf = new Buffer(65537);
      largeBuf.fill(0x41);
      assert(
        rustDecode(utils.bytes('v2/string/large_string_65537')) === largeBuf.toString()
      );
    });

    it.skip('should write string same as java write exclude', function () {
      var largeString = new Array(65535);
      for (var i = 0; i < largeString.length; i += 2) {
        largeString[i] = String.fromCharCode(0xd800);
        if (i + 1 < largeString.length) {
          largeString[i + 1] = String.fromCharCode(0xdbff);
        }
      }
      largeString = largeString.join('');
      assert.deepEqual(
        hessian.encode(largeString),
        utils.bytes('v2/string/large_string_chars')
      );
    });

    it('should read and write utf8 string as java', function () {
      var str = '';
      for (var i = 0; i < 32767; i++) {
        str += '锋';
      }
      assert(rustDecode(utils.bytes('v2/string/utf8_32767')) === str);
      assert(rustDecode(utils.bytes('v1/string/utf8_32767')) === str);

      var str = '';
      for (var i = 0; i < 32768; i++) {
        str += '锋';
      }
      assert(rustDecode(utils.bytes('v2/string/utf8_32768')) === str);
      assert(rustDecode(utils.bytes('v1/string/utf8_32768')) === str);

      var str = '';
      for (var i = 0; i < 32769; i++) {
        str += '锋';
      }
      assert(rustDecode(utils.bytes('v2/string/utf8_32769')) === str);
      assert(rustDecode(utils.bytes('v1/string/utf8_32769')) === str);

      var str = '';
      for (var i = 0; i < 65534; i++) {
        str += '锋';
      }
      assert(rustDecode(utils.bytes('v1/string/utf8_65534')) === str);
      assert(rustDecode(utils.bytes('v1/string/utf8_65534')) === str);

      var str = '';
      for (var i = 0; i < 65535; i++) {
        str += '锋';
      }
      assert.deepEqual(hessian.encode(str), utils.bytes('v2/string/utf8_65535'));
      assert(rustDecode(utils.bytes('v2/string/utf8_65535')) === str);
      assert(rustDecode(utils.bytes('v1/string/utf8_65535')) === str);

      var str = '';
      for (var i = 0; i < 65536; i++) {
        str += '锋';
      }
      assert(rustDecode(utils.bytes('v2/string/utf8_65536')) === str);
      assert(rustDecode(utils.bytes('v1/string/utf8_65536')) === str);

      var str = '';
      for (var i = 0; i < 65537; i++) {
        str += '锋';
      }
      assert(rustDecode(utils.bytes('v2/string/utf8_65537')) === str);
      assert(rustDecode(utils.bytes('v1/string/utf8_65537')) === str);
    });
  });
});
