/**
 * hessian.js - test/string.test.js
 *
 * Copyright(c)
 * MIT Licensed
 *
 * Authors:
 *   fengmk2 <fengmk2@gmail.com> (http://fengmk2.github.com)
 */

"use strict";

var assert = require('assert');
var hessian = require('../');
var utils = require('./utils');

describe('string.test.js', function () {
  var helloBuffer = Buffer.concat([new Buffer(['S'.charCodeAt(0), 0x00, 0x05]),
    new Buffer('hello')]);

  it('should read string', function () {
    assert(hessian.decode(helloBuffer) === 'hello');
    assert(hessian.decode(Buffer.concat([new Buffer(['s'.charCodeAt(0), 0x00, 0x07]),
        new Buffer('hello, '), new Buffer(['S'.charCodeAt(0), 0x00, 0x05]),
        new Buffer('world')])) === 'hello, world');
  });

  it('should write string', function () {
    var s = hessian.encode('hello');
    assert(Buffer.isBuffer(s));
    assert(s.length === 8);
    assert.deepEqual(s, helloBuffer);
  });

  it('should read write empty string', function () {
    assert(hessian.decode(new Buffer(['S'.charCodeAt(0), 0, 0])) === '');
    assert.deepEqual(hessian.encode(''), new Buffer(['S'.charCodeAt(0), 0, 0]));
  });

  it('should read and write utf8 string as java', function () {
    var str = '';
    for (var i = 0; i < 32767; i++) {
      str += '锋';
    }
    assert.deepEqual(hessian.encode(str, '1.0'), utils.bytes('v1/string/utf8_32767'));
    assert(hessian.decode(utils.bytes('v1/string/utf8_32767')) === str);

    var str = '';
    for (var i = 0; i < 32768; i++) {
      str += '锋';
    }
    assert.deepEqual(hessian.encode(str, '1.0'), utils.bytes('v1/string/utf8_32768'));
    assert(hessian.decode(utils.bytes('v1/string/utf8_32768')) === str);

    var str = '';
    for (var i = 0; i < 32769; i++) {
      str += '锋';
    }
    assert.deepEqual(hessian.encode(str, '1.0'), utils.bytes('v1/string/utf8_32769'));
    assert(hessian.decode(utils.bytes('v1/string/utf8_32769')) === str);

    var str = '';
    for (var i = 0; i < 65534; i++) {
      str += '锋';
    }
    assert.deepEqual(hessian.encode(str, '1.0'), utils.bytes('v1/string/utf8_65534'));
    assert(hessian.decode(utils.bytes('v1/string/utf8_65534')) === str);

    var str = '';
    for (var i = 0; i < 65535; i++) {
      str += '锋';
    }
    assert.deepEqual(hessian.encode(str, '1.0'), utils.bytes('v1/string/utf8_65535'));
    assert(hessian.decode(utils.bytes('v1/string/utf8_65535')) === str);

    var str = '';
    for (var i = 0; i < 65536; i++) {
      str += '锋';
    }
    assert.deepEqual(hessian.encode(str, '1.0'), utils.bytes('v1/string/utf8_65536'));
    assert(hessian.decode(utils.bytes('v1/string/utf8_65536')) === str);

    var str = '';
    for (var i = 0; i < 65537; i++) {
      str += '锋';
    }
    assert.deepEqual(hessian.encode(str, '1.0'), utils.bytes('v1/string/utf8_65537'));
    assert(hessian.decode(utils.bytes('v1/string/utf8_65537')) === str);
  });

  it('should write string same as java write', function () {
    assert.deepEqual(hessian.encode('', '1.0'), utils.bytes('v1/string/empty'));
    assert.deepEqual(hessian.encode('foo'), utils.bytes('v1/string/foo'));
    assert.deepEqual(hessian.encode('中文 Chinese', '1.0'), utils.bytes('v1/string/chinese'));
    var text4k = utils.string('4k');
    assert.deepEqual(hessian.encode(text4k, '1.0'), utils.bytes('v1/string/text4k'));
    assert(hessian.decode(utils.bytes('v1/string/text4k')) === text4k);

    var largeBuf = new Buffer(32767);
    largeBuf.fill(0x41);
    assert.deepEqual(
      hessian.encode(largeBuf.toString(), '1.0'),
      utils.bytes('v1/string/large_string_32767')
    );
    assert(
      hessian.decode(utils.bytes('v1/string/large_string_32767')) === largeBuf.toString()
    );

    var largeBuf = new Buffer(32768);
    largeBuf.fill(0x41);
    assert.deepEqual(
      hessian.encode(largeBuf.toString(), '1.0'),
      utils.bytes('v1/string/large_string_32768')
    );
    assert(
      hessian.decode(utils.bytes('v1/string/large_string_32768')) === largeBuf.toString()
    );

    var largeBuf = new Buffer(32769);
    largeBuf.fill(0x41);
    assert.deepEqual(
      hessian.encode(largeBuf.toString(), '1.0'),
      utils.bytes('v1/string/large_string_32769')
    );
    assert(
      hessian.decode(utils.bytes('v1/string/large_string_32769')) === largeBuf.toString()
    );

    var largeBuf = new Buffer(65534);
    largeBuf.fill(0x41);
    assert.deepEqual(
      hessian.encode(largeBuf.toString(), '1.0'),
      utils.bytes('v1/string/large_string_65534')
    );
    assert(
      hessian.decode(utils.bytes('v1/string/large_string_65534')) === largeBuf.toString()
    );

    var largeBuf = new Buffer(65535);
    largeBuf.fill(0x41);
    assert.deepEqual(
      hessian.encode(largeBuf.toString(), '1.0'),
      utils.bytes('v1/string/large_string_65535')
    );
    assert(
      hessian.decode(utils.bytes('v1/string/large_string_65535')) === largeBuf.toString()
    );

    var largeBuf = new Buffer(65536);
    largeBuf.fill(0x41);
    assert.deepEqual(
      hessian.encode(largeBuf.toString(), '1.0'),
      utils.bytes('v1/string/large_string_65536')
    );
    assert(
      hessian.decode(utils.bytes('v1/string/large_string_65536')) === largeBuf.toString()
    );

    var largeBuf = new Buffer(65537);
    largeBuf.fill(0x41);
    assert.deepEqual(
      hessian.encode(largeBuf.toString(), '1.0'),
      utils.bytes('v1/string/large_string_65537')
    );
    assert(
      hessian.decode(utils.bytes('v1/string/large_string_65537')) === largeBuf.toString()
    );

  });
  
  it.skip('should write string same as java write exclude', function () {
    var largeString = new Array(65535);
    for (var i = 0; i < largeString.length; i += 2) {
      largeString[i] = '\ud800';
      // largeString[i] = String.fromCharCode(0xd800);
      if (i + 1 < largeString.length) {
        largeString[i + 1] = '\udbff';
        // largeString[i + 1] = String.fromCharCode(0xdbff);
      }
    }
    largeString = largeString.join('');
    assert.deepEqual(
      hessian.encode(largeString, '1.0'),
      utils.bytes('v1/string/large_string_chars')
    );
    // read it
    assert(
      hessian.decode(utils.bytes('v1/string/large_string_chars')) === largeString
    );
  });

  describe('v2.0', function () {
    it('should read short strings', function () {
      assert(hessian.decode(new Buffer([0x00]), '2.0') === '');
      assert(hessian.decode(new Buffer([0x00]), '2.0', true) === '');
      assert(hessian.decode(Buffer.concat([new Buffer([0x05]),
        new Buffer('hello')]), '2.0') === 'hello');
      assert(hessian.decode(new Buffer([0x01, 0xc3, 0x83]), '2.0') === '\u00c3');
      assert(hessian.decode(Buffer.concat([new Buffer([0x09]),
        new Buffer('hello, 中文')]), '2.0') === 'hello, 中文');
    });

    it('should read "hello" in long form', function () {
      assert(hessian.decode(Buffer.concat([new Buffer(['S'.charCodeAt(0), 0x00, 0x05]),
        new Buffer('hello')]), '2.0') === 'hello');
    });

    it('should read split into two chunks: s and short strings', function () {
      assert(hessian.decode(Buffer.concat([new Buffer([0x52, 0x00, 0x07]),
        new Buffer('hello, '), new Buffer([0x05]), new Buffer('world')]), '2.0') === 'hello, world');
    });

    it('should write short strings', function () {
      assert.deepEqual(hessian.encode('', '2.0'), new Buffer([0x00]));
      assert.deepEqual(hessian.encode('foo', '2.0'), Buffer.concat([
        new Buffer([0x03]),
        new Buffer('foo')
      ]));
      assert.deepEqual(hessian.encode('0123456789012345678901234567890', '2.0'), Buffer.concat([
        new Buffer([0x1f]),
        new Buffer('0123456789012345678901234567890')
      ]));

      // var len32Buf = new Buffer(2);
      // len32Buf.writeInt16BE(32, 0);
      assert.deepEqual(hessian.encode('01234567890123456789012345678901', '2.0'), Buffer.concat([
          new Buffer([0x30, 0x20]),
          // len32Buf,
          new Buffer('01234567890123456789012345678901')
        ])
      );

      var largeBuf = new Buffer(65535);
      largeBuf.fill(0x41);
      hessian.encode(largeBuf.toString(), '2.0');

      largeBuf = new Buffer(65535 * 3 + 100);
      largeBuf.fill(0x41);
      hessian.encode(largeBuf.toString(), '2.0');
    });

    it('should read java string', function () {
      assert(hessian.decode(utils.bytes('v2/string/empty'), '2.0') === '');
      assert(hessian.decode(utils.bytes('v2/string/foo'), '2.0') === 'foo');
      assert(hessian.decode(utils.bytes('v2/string/chinese'), '2.0') === '中文 Chinese');
      assert(
        hessian.decode(utils.bytes('v2/string/text4k'), '2.0') === utils.string('4k')
      );

      var largeBuf = new Buffer(32767);
      largeBuf.fill(0x41);
      assert(
        hessian.decode(utils.bytes('v2/string/large_string_32767'), '2.0') === largeBuf.toString()
      );

      var largeBuf = new Buffer(32768);
      largeBuf.fill(0x41);
      assert(
        hessian.decode(utils.bytes('v2/string/large_string_32768'), '2.0') === largeBuf.toString()
      );

      var largeBuf = new Buffer(32769);
      largeBuf.fill(0x41);
      assert(
        hessian.decode(utils.bytes('v2/string/large_string_32769'), '2.0') === largeBuf.toString()
      );

      var largeBuf = new Buffer(65534);
      largeBuf.fill(0x41);
      assert(
        hessian.decode(utils.bytes('v2/string/large_string_65534'), '2.0') === largeBuf.toString()
      );

      var largeBuf = new Buffer(65535);
      largeBuf.fill(0x41);
      assert(
        hessian.decode(utils.bytes('v2/string/large_string_65535'), '2.0') === largeBuf.toString()
      );

      var largeBuf = new Buffer(65536);
      largeBuf.fill(0x41);
      assert(
        hessian.decode(utils.bytes('v2/string/large_string_65536'), '2.0') === largeBuf.toString()
      );

      var largeBuf = new Buffer(65537);
      largeBuf.fill(0x41);
      assert(
        hessian.decode(utils.bytes('v2/string/large_string_65537'), '2.0') === largeBuf.toString()
      );
    });

    it('should write string same as java write', function () {
      assert.deepEqual(hessian.encode('', '2.0'), utils.bytes('v2/string/empty'));
      assert.deepEqual(hessian.encode('foo', '2.0'), utils.bytes('v2/string/foo'));
      assert.deepEqual(hessian.encode('中文 Chinese', '2.0'), utils.bytes('v2/string/chinese'));
      var text4k = utils.string('4k');
      assert.deepEqual(hessian.encode(text4k, '2.0'), utils.bytes('v2/string/text4k'));

      var largeBuf = new Buffer(32767);
      largeBuf.fill(0x41);
      assert.deepEqual(
        hessian.encode(largeBuf.toString(), '2.0'),
        utils.bytes('v2/string/large_string_32767')
      );
      var largeBuf = new Buffer(32768);
      largeBuf.fill(0x41);
      assert.deepEqual(
        hessian.encode(largeBuf.toString(), '2.0'),
        utils.bytes('v2/string/large_string_32768')
      );
      var largeBuf = new Buffer(32769);
      largeBuf.fill(0x41);
      assert.deepEqual(
        hessian.encode(largeBuf.toString(), '2.0'),
        utils.bytes('v2/string/large_string_32769')
      );

      var largeBuf = new Buffer(65534);
      largeBuf.fill(0x41);
      assert.deepEqual(
        hessian.encode(largeBuf.toString(), '2.0'),
        utils.bytes('v2/string/large_string_65534')
      );

      var largeBuf = new Buffer(65535);
      largeBuf.fill(0x41);
      assert.deepEqual(
        hessian.encode(largeBuf.toString(), '2.0'),
        utils.bytes('v2/string/large_string_65535')
      );

      var largeBuf = new Buffer(65536);
      largeBuf.fill(0x41);
      assert.deepEqual(
        hessian.encode(largeBuf.toString(), '2.0'),
        utils.bytes('v2/string/large_string_65536')
      );

      var largeBuf = new Buffer(65537);
      largeBuf.fill(0x41);
      assert.deepEqual(
        hessian.encode(largeBuf.toString(), '2.0'),
        utils.bytes('v2/string/large_string_65537')
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
        hessian.encode(largeString, '2.0'),
        utils.bytes('v2/string/large_string_chars')
      );
    });

    it('should read and write utf8 string as java', function () {
      var str = '';
      for (var i = 0; i < 32767; i++) {
        str += '锋';
      }
      assert.deepEqual(hessian.encode(str, '2.0'), utils.bytes('v2/string/utf8_32767'));
      assert(hessian.decode(utils.bytes('v2/string/utf8_32767'), '2.0') === str);
      assert(hessian.decode(utils.bytes('v1/string/utf8_32767'), '2.0') === str);

      var str = '';
      for (var i = 0; i < 32768; i++) {
        str += '锋';
      }
      assert.deepEqual(hessian.encode(str, '2.0'), utils.bytes('v2/string/utf8_32768'));
      assert(hessian.decode(utils.bytes('v2/string/utf8_32768'), '2.0') === str);
      assert(hessian.decode(utils.bytes('v1/string/utf8_32768'), '2.0') === str);

      var str = '';
      for (var i = 0; i < 32769; i++) {
        str += '锋';
      }
      assert.deepEqual(hessian.encode(str, '2.0'), utils.bytes('v2/string/utf8_32769'));
      assert(hessian.decode(utils.bytes('v2/string/utf8_32769'), '2.0') === str);
      // hessian.decode(utils.bytes('v1/string/utf8_32769'), '2.0').should.equal(str);

      var str = '';
      for (var i = 0; i < 65534; i++) {
        str += '锋';
      }
      assert.deepEqual(hessian.encode(str, '2.0'), utils.bytes('v2/string/utf8_65534'));
      assert(hessian.decode(utils.bytes('v2/string/utf8_65534'), '2.0') === str);
      // hessian.decode(utils.bytes('v1/string/utf8_65534'), '2.0').should.equal(str);

      var str = '';
      for (var i = 0; i < 65535; i++) {
        str += '锋';
      }
      assert.deepEqual(hessian.encode(str, '2.0'), utils.bytes('v2/string/utf8_65535'));
      assert(hessian.decode(utils.bytes('v2/string/utf8_65535'), '2.0') === str);
      // hessian.decode(utils.bytes('v1/string/utf8_65535'), '2.0').should.equal(str);

      var str = '';
      for (var i = 0; i < 65536; i++) {
        str += '锋';
      }
      assert.deepEqual(hessian.encode(str, '2.0'), utils.bytes('v2/string/utf8_65536'));
      assert(hessian.decode(utils.bytes('v2/string/utf8_65536'), '2.0') === str);
      // hessian.decode(utils.bytes('v1/string/utf8_65536'), '2.0').should.equal(str);

      var str = '';
      for (var i = 0; i < 65537; i++) {
        str += '锋';
      }
      assert.deepEqual(hessian.encode(str, '2.0'), utils.bytes('v2/string/utf8_65537'));
      assert(hessian.decode(utils.bytes('v2/string/utf8_65537'), '2.0') === str);
      // hessian.decode(utils.bytes('v1/string/utf8_65537'), '2.0').should.equal(str);
    });
  });
});
