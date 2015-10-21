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
var utils = require('./utils');

describe('string.test.js', function () {
  var helloBuffer = Buffer.concat([new Buffer(['S'.charCodeAt(0), 0x00, 0x05]),
    new Buffer('hello')]);

  it('should read string', function () {
    hessian.decode(helloBuffer).should.equal('hello');
    hessian.decode(helloBuffer, true).should.eql({$class: 'java.lang.String', $: 'hello'});
    hessian.decode(Buffer.concat([new Buffer(['s'.charCodeAt(0), 0x00, 0x07]),
        new Buffer('hello, '), new Buffer(['S'.charCodeAt(0), 0x00, 0x05]),
        new Buffer('world')])).should.equal('hello, world');
  });

  it('should write string', function () {
    var s = hessian.encode('hello');
    s.should.be.a.Buffer;
    s.should.length(8);
    s.should.eql(helloBuffer);

    var s2 = hessian.encode({$class: 'java.lang.String', $: 'hello'});
    s2.should.be.a.Buffer;
    s2.should.length(8);
    s2.should.eql(helloBuffer);
  });

  it('should read write empty string', function () {
    hessian.decode(new Buffer(['S'.charCodeAt(0), 0, 0])).should.equal('');
    hessian.decode(new Buffer(['S'.charCodeAt(0), 0, 0]), true).should.eql({$class: 'java.lang.String', $: ''});
    hessian.encode('').should.eql(new Buffer(['S'.charCodeAt(0), 0, 0]));
    hessian.encode({$class: 'java.lang.String', $: ''}).should.eql(new Buffer(['S'.charCodeAt(0), 0, 0]));
  });

  it('should read and write utf8 string as java', function () {
    var str = '';
    for (var i = 0; i < 32767; i++) {
      str += '锋';
    }
    hessian.encode(str, '1.0').should.eql(utils.bytes('v1/string/utf8_32767'));
    hessian.encode({$class: 'java.lang.String', $: str}, '1.0').should.eql(utils.bytes('v1/string/utf8_32767'));
    hessian.decode(utils.bytes('v1/string/utf8_32767')).should.equal(str);
    hessian.decode(utils.bytes('v1/string/utf8_32767'), true).should.eql({$class: 'java.lang.String', $: str});

    var str = '';
    for (var i = 0; i < 32768; i++) {
      str += '锋';
    }
    hessian.encode(str, '1.0').should.eql(utils.bytes('v1/string/utf8_32768'));
    hessian.encode({$class: 'java.lang.String', $: str}, '1.0').should.eql(utils.bytes('v1/string/utf8_32768'));
    hessian.decode(utils.bytes('v1/string/utf8_32768')).should.equal(str);
    hessian.decode(utils.bytes('v1/string/utf8_32768'), true).should.eql({$class: 'java.lang.String', $: str});

    var str = '';
    for (var i = 0; i < 32769; i++) {
      str += '锋';
    }
    hessian.encode(str, '1.0').should.eql(utils.bytes('v1/string/utf8_32769'));
    hessian.encode({$class: 'java.lang.String', $: str}, '1.0').should.eql(utils.bytes('v1/string/utf8_32769'));
    hessian.decode(utils.bytes('v1/string/utf8_32769')).should.equal(str);
    hessian.decode(utils.bytes('v1/string/utf8_32769'), true).should.eql({$class: 'java.lang.String', $: str});

    var str = '';
    for (var i = 0; i < 65534; i++) {
      str += '锋';
    }
    hessian.encode(str, '1.0').should.eql(utils.bytes('v1/string/utf8_65534'));
    hessian.encode({$class: 'java.lang.String', $: str}, '1.0').should.eql(utils.bytes('v1/string/utf8_65534'));
    hessian.decode(utils.bytes('v1/string/utf8_65534')).should.equal(str);
    hessian.decode(utils.bytes('v1/string/utf8_65534'), true).should.eql({$class: 'java.lang.String', $: str});

    var str = '';
    for (var i = 0; i < 65535; i++) {
      str += '锋';
    }
    hessian.encode(str, '1.0').should.eql(utils.bytes('v1/string/utf8_65535'));
    hessian.encode({$class: 'java.lang.String', $: str}, '1.0').should.eql(utils.bytes('v1/string/utf8_65535'));
    hessian.decode(utils.bytes('v1/string/utf8_65535')).should.equal(str);
    hessian.decode(utils.bytes('v1/string/utf8_65535'), true).should.eql({$class: 'java.lang.String', $: str});

    var str = '';
    for (var i = 0; i < 65536; i++) {
      str += '锋';
    }
    hessian.encode(str, '1.0').should.eql(utils.bytes('v1/string/utf8_65536'));
    hessian.encode({$class: 'java.lang.String', $: str}, '1.0').should.eql(utils.bytes('v1/string/utf8_65536'));
    hessian.decode(utils.bytes('v1/string/utf8_65536')).should.equal(str);
    hessian.decode(utils.bytes('v1/string/utf8_65536'), true).should.eql({$class: 'java.lang.String', $: str});

    var str = '';
    for (var i = 0; i < 65537; i++) {
      str += '锋';
    }
    hessian.encode(str, '1.0').should.eql(utils.bytes('v1/string/utf8_65537'));
    hessian.encode({$class: 'java.lang.String', $: str}, '1.0').should.eql(utils.bytes('v1/string/utf8_65537'));
    hessian.decode(utils.bytes('v1/string/utf8_65537')).should.equal(str);
    hessian.decode(utils.bytes('v1/string/utf8_65537'), true).should.eql({$class: 'java.lang.String', $: str});
  });

  it('should write string same as java write', function () {
    hessian.encode('', '1.0').should.eql(utils.bytes('v1/string/empty'));
    hessian.encode('foo').should.eql(utils.bytes('v1/string/foo'));
    hessian.encode('中文 Chinese', '1.0').should.eql(utils.bytes('v1/string/chinese'));
    hessian.encode({$class: 'java.lang.String', $: '中文 Chinese'}, '1.0').should.eql(utils.bytes('v1/string/chinese'));

    var text4k = utils.string('4k');
    hessian.encode(text4k, '1.0').should.eql(utils.bytes('v1/string/text4k'));
    hessian.encode({$class: 'java.lang.String', $: text4k}, '1.0').should.eql(utils.bytes('v1/string/text4k'));
    hessian.decode(utils.bytes('v1/string/text4k')).should.equal(text4k);
    hessian.decode(utils.bytes('v1/string/text4k'), true).should.eql({$class: 'java.lang.String', $: text4k});

    var largeBuf = new Buffer(32767);
    largeBuf.fill(0x41);
    hessian.encode(largeBuf.toString(), '1.0').should.eql(utils.bytes('v1/string/large_string_32767'));
    hessian.encode({$class: 'java.lang.String', $: largeBuf.toString()}, '1.0').should.eql(utils.bytes('v1/string/large_string_32767'));
    hessian.decode(utils.bytes('v1/string/large_string_32767')).should.equal(largeBuf.toString());
    hessian.decode(utils.bytes('v1/string/large_string_32767'), true).should.eql({$class: 'java.lang.String', $: largeBuf.toString()});

    var largeBuf = new Buffer(32768);
    largeBuf.fill(0x41);
    hessian.encode(largeBuf.toString(), '1.0').should.eql(utils.bytes('v1/string/large_string_32768'));
    hessian.encode({$class: 'java.lang.String', $: largeBuf.toString()}, '1.0').should.eql(utils.bytes('v1/string/large_string_32768'));
    hessian.decode(utils.bytes('v1/string/large_string_32768')).should.equal(largeBuf.toString());
    hessian.decode(utils.bytes('v1/string/large_string_32768'), true).should.eql({$class: 'java.lang.String', $: largeBuf.toString()});

    var largeBuf = new Buffer(32769);
    largeBuf.fill(0x41);
    hessian.encode(largeBuf.toString(), '1.0').should.eql(utils.bytes('v1/string/large_string_32769'));
    hessian.encode({$class: 'java.lang.String', $: largeBuf.toString()}, '1.0').should.eql(utils.bytes('v1/string/large_string_32769'));
    hessian.decode(utils.bytes('v1/string/large_string_32769')).should.equal(largeBuf.toString());
    hessian.decode(utils.bytes('v1/string/large_string_32769'), true).should.eql({$class: 'java.lang.String', $: largeBuf.toString()});

    var largeBuf = new Buffer(65534);
    largeBuf.fill(0x41);
    hessian.encode(largeBuf.toString(), '1.0').should.eql(utils.bytes('v1/string/large_string_65534'));
    hessian.encode({$class: 'java.lang.String', $: largeBuf.toString()}, '1.0').should.eql(utils.bytes('v1/string/large_string_65534'));
    hessian.decode(utils.bytes('v1/string/large_string_65534')).should.equal(largeBuf.toString());
    hessian.decode(utils.bytes('v1/string/large_string_65534'), true).should.eql({$class: 'java.lang.String', $: largeBuf.toString()});

    var largeBuf = new Buffer(65535);
    largeBuf.fill(0x41);
    hessian.encode(largeBuf.toString(), '1.0').should.eql(utils.bytes('v1/string/large_string_65535'));
    hessian.encode({$class: 'java.lang.String', $: largeBuf.toString()}, '1.0').should.eql(utils.bytes('v1/string/large_string_65535'));
    hessian.decode(utils.bytes('v1/string/large_string_65535')).should.equal(largeBuf.toString());
    hessian.decode(utils.bytes('v1/string/large_string_65535'), true).should.eql({$class: 'java.lang.String', $: largeBuf.toString()});

    var largeBuf = new Buffer(65536);
    largeBuf.fill(0x41);
    hessian.encode(largeBuf.toString(), '1.0').should.eql(utils.bytes('v1/string/large_string_65536'));
    hessian.encode({$class: 'java.lang.String', $: largeBuf.toString()}, '1.0').should.eql(utils.bytes('v1/string/large_string_65536'));
    hessian.decode(utils.bytes('v1/string/large_string_65536')).should.equal(largeBuf.toString());
    hessian.decode(utils.bytes('v1/string/large_string_65536'), true).should.eql({$class: 'java.lang.String', $: largeBuf.toString()});

    var largeBuf = new Buffer(65537);
    largeBuf.fill(0x41);
    hessian.encode(largeBuf.toString(), '1.0').should.eql(utils.bytes('v1/string/large_string_65537'));
    hessian.encode({$class: 'java.lang.String', $: largeBuf.toString()}, '1.0').should.eql(utils.bytes('v1/string/large_string_65537'));
    hessian.decode(utils.bytes('v1/string/large_string_65537')).should.equal(largeBuf.toString());
    hessian.decode(utils.bytes('v1/string/large_string_65537'), true).should.eql({$class: 'java.lang.String', $: largeBuf.toString()});

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
    hessian.encode(largeString, '1.0').should.eql(utils.bytes('v1/string/large_string_chars'));
    // read it
    hessian.decode(utils.bytes('v1/string/large_string_chars')).should.equal(largeString);
  });

  describe('v2.0', function () {
    it('should read short strings', function () {
      hessian.decode(new Buffer([0x00]), '2.0').should.equal('');
      hessian.decode(new Buffer([0x00]), '2.0', true).should.eql({$class: 'java.lang.String', $: ''});
      hessian.decode(Buffer.concat([new Buffer([0x05]),
        new Buffer('hello')]), '2.0').should.equal('hello');
      hessian.decode(new Buffer([0x01, 0xc3, 0x83]), '2.0').should.equal('\u00c3');
      hessian.decode(Buffer.concat([new Buffer([0x09]),
        new Buffer('hello, 中文')]), '2.0').should.equal('hello, 中文');
      hessian.decode(Buffer.concat([new Buffer([0x09]),
        new Buffer('hello, 中文')]), '2.0', true).should.eql({$class: 'java.lang.String', $: 'hello, 中文'});
    });

    it('should read "hello" in long form', function () {
      hessian.decode(Buffer.concat([new Buffer(['S'.charCodeAt(0), 0x00, 0x05]),
        new Buffer('hello')]), '2.0').should.equal('hello');
      hessian.decode(Buffer.concat([new Buffer(['S'.charCodeAt(0), 0x00, 0x05]),
        new Buffer('hello')]), '2.0', true).should.eql({$class: 'java.lang.String', $: 'hello'});
    });

    it('should read split into two chunks: s and short strings', function () {
      hessian.decode(Buffer.concat([new Buffer([0x52, 0x00, 0x07]),
        new Buffer('hello, '), new Buffer([0x05]), new Buffer('world')]), '2.0')
      .should.equal('hello, world');
      hessian.decode(Buffer.concat([new Buffer([0x52, 0x00, 0x07]),
        new Buffer('hello, '), new Buffer([0x05]), new Buffer('world')]), '2.0', true)
      .should.eql({$class: 'java.lang.String', $: 'hello, world'});
    });

    it('should write short strings', function () {
      hessian.encode('', '2.0').should.eql(new Buffer([0x00]));
      hessian.encode({$class: 'java.lang.String', $: ''}, '2.0').should.eql(new Buffer([0x00]));
      hessian.encode('foo', '2.0').should.eql(
        Buffer.concat([
          new Buffer([0x03]),
          new Buffer('foo')
        ])
      );
      hessian.encode({$class: 'java.lang.String', $: 'foo'}, '2.0').should.eql(
        Buffer.concat([
          new Buffer([0x03]),
          new Buffer('foo')
        ])
      );
      hessian.encode('0123456789012345678901234567890', '2.0').should.eql(
        Buffer.concat([
          new Buffer([0x1f]),
          new Buffer('0123456789012345678901234567890')
        ])
      );
      hessian.encode({$class: 'java.lang.String', $: '0123456789012345678901234567890'}, '2.0').should.eql(
        Buffer.concat([
          new Buffer([0x1f]),
          new Buffer('0123456789012345678901234567890')
        ])
      );

      // var len32Buf = new Buffer(2);
      // len32Buf.writeInt16BE(32, 0);
      hessian.encode('01234567890123456789012345678901', '2.0').should.eql(
        Buffer.concat([
          new Buffer([0x30, 0x20]),
          // len32Buf,
          new Buffer('01234567890123456789012345678901')
        ])
      );
      hessian.encode({$class: 'java.lang.String', $: '01234567890123456789012345678901'}, '2.0').should.eql(
        Buffer.concat([
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
      hessian.decode(utils.bytes('v2/string/empty'), '2.0').should.equal('');
      hessian.decode(utils.bytes('v2/string/foo'), '2.0').should.equal('foo');
      hessian.decode(utils.bytes('v2/string/chinese'), '2.0').should.equal('中文 Chinese');
      hessian.decode(utils.bytes('v2/string/text4k'), '2.0').should.equal(utils.string('4k'));
      hessian.decode(utils.bytes('v2/string/text4k'), '2.0', true).should.eql({$class: 'java.lang.String', $: utils.string('4k')});

      var largeBuf = new Buffer(32767);
      largeBuf.fill(0x41);
      hessian.decode(utils.bytes('v2/string/large_string_32767'), '2.0').should.equal(largeBuf.toString());

      var largeBuf = new Buffer(32768);
      largeBuf.fill(0x41);
      hessian.decode(utils.bytes('v2/string/large_string_32768'), '2.0').should.equal(largeBuf.toString());

      var largeBuf = new Buffer(32769);
      largeBuf.fill(0x41);
      hessian.decode(utils.bytes('v2/string/large_string_32769'), '2.0').should.equal(largeBuf.toString());

      var largeBuf = new Buffer(65534);
      largeBuf.fill(0x41);
      hessian.decode(utils.bytes('v2/string/large_string_65534'), '2.0').should.equal(largeBuf.toString());

      var largeBuf = new Buffer(65535);
      largeBuf.fill(0x41);
      hessian.decode(utils.bytes('v2/string/large_string_65535'), '2.0').should.equal(largeBuf.toString());

      var largeBuf = new Buffer(65536);
      largeBuf.fill(0x41);
      hessian.decode(utils.bytes('v2/string/large_string_65536'), '2.0').should.equal(largeBuf.toString());
      hessian.decode(utils.bytes('v2/string/large_string_65536'), '2.0', true).should.eql({$class: 'java.lang.String', $: largeBuf.toString()});

      var largeBuf = new Buffer(65537);
      largeBuf.fill(0x41);
      hessian.decode(utils.bytes('v2/string/large_string_65537'), '2.0').should.equal(largeBuf.toString());
    });

    it('should write string same as java write', function () {
      hessian.encode('', '2.0').should.eql(utils.bytes('v2/string/empty'));
      hessian.encode('foo', '2.0').should.eql(utils.bytes('v2/string/foo'));
      hessian.encode('中文 Chinese', '2.0').should.eql(utils.bytes('v2/string/chinese'));
      var text4k = utils.string('4k');
      hessian.encode(text4k, '2.0').should.eql(utils.bytes('v2/string/text4k'));

      var largeBuf = new Buffer(32767);
      largeBuf.fill(0x41);
      hessian.encode(largeBuf.toString(), '2.0').should.eql(utils.bytes('v2/string/large_string_32767'));
      var largeBuf = new Buffer(32768);
      largeBuf.fill(0x41);
      hessian.encode(largeBuf.toString(), '2.0').should.eql(utils.bytes('v2/string/large_string_32768'));
      var largeBuf = new Buffer(32769);
      largeBuf.fill(0x41);
      hessian.encode(largeBuf.toString(), '2.0').should.eql(utils.bytes('v2/string/large_string_32769'));

      var largeBuf = new Buffer(65534);
      largeBuf.fill(0x41);
      hessian.encode(largeBuf.toString(), '2.0').should.eql(utils.bytes('v2/string/large_string_65534'));

      var largeBuf = new Buffer(65535);
      largeBuf.fill(0x41);
      hessian.encode(largeBuf.toString(), '2.0').should.eql(utils.bytes('v2/string/large_string_65535'));

      var largeBuf = new Buffer(65536);
      largeBuf.fill(0x41);
      hessian.encode(largeBuf.toString(), '2.0').should.eql(utils.bytes('v2/string/large_string_65536'));

      var largeBuf = new Buffer(65537);
      largeBuf.fill(0x41);
      hessian.encode(largeBuf.toString(), '2.0').should.eql(utils.bytes('v2/string/large_string_65537'));

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
      hessian.encode(largeString, '2.0').should.eql(utils.bytes('v2/string/large_string_chars'));
    });

    it('should read and write utf8 string as java', function () {
      var str = '';
      for (var i = 0; i < 32767; i++) {
        str += '锋';
      }
      hessian.encode(str, '2.0').should.eql(utils.bytes('v2/string/utf8_32767'));
      hessian.decode(utils.bytes('v2/string/utf8_32767'), '2.0').should.equal(str);
      hessian.decode(utils.bytes('v1/string/utf8_32767'), '2.0').should.equal(str);
      hessian.decode(utils.bytes('v1/string/utf8_32767', true), '2.0', true).should.eql({$class: 'java.lang.String', $: str});

      var str = '';
      for (var i = 0; i < 32768; i++) {
        str += '锋';
      }
      hessian.encode(str, '2.0').should.eql(utils.bytes('v2/string/utf8_32768'));
      hessian.decode(utils.bytes('v2/string/utf8_32768'), '2.0').should.equal(str);
      hessian.decode(utils.bytes('v1/string/utf8_32768'), '2.0').should.equal(str);

      var str = '';
      for (var i = 0; i < 32769; i++) {
        str += '锋';
      }
      hessian.encode(str, '2.0').should.eql(utils.bytes('v2/string/utf8_32769'));
      hessian.decode(utils.bytes('v2/string/utf8_32769'), '2.0').should.equal(str);
      // hessian.decode(utils.bytes('v1/string/utf8_32769'), '2.0').should.equal(str);

      var str = '';
      for (var i = 0; i < 65534; i++) {
        str += '锋';
      }
      hessian.encode(str, '2.0').should.eql(utils.bytes('v2/string/utf8_65534'));
      hessian.decode(utils.bytes('v2/string/utf8_65534'), '2.0').should.equal(str);
      // hessian.decode(utils.bytes('v1/string/utf8_65534'), '2.0').should.equal(str);

      var str = '';
      for (var i = 0; i < 65535; i++) {
        str += '锋';
      }
      hessian.encode(str, '2.0').should.eql(utils.bytes('v2/string/utf8_65535'));
      hessian.decode(utils.bytes('v2/string/utf8_65535'), '2.0').should.equal(str);
      // hessian.decode(utils.bytes('v1/string/utf8_65535'), '2.0').should.equal(str);

      var str = '';
      for (var i = 0; i < 65536; i++) {
        str += '锋';
      }
      hessian.encode(str, '2.0').should.eql(utils.bytes('v2/string/utf8_65536'));
      hessian.decode(utils.bytes('v2/string/utf8_65536'), '2.0').should.equal(str);
      // hessian.decode(utils.bytes('v1/string/utf8_65536'), '2.0').should.equal(str);

      var str = '';
      for (var i = 0; i < 65537; i++) {
        str += '锋';
      }
      hessian.encode(str, '2.0').should.eql(utils.bytes('v2/string/utf8_65537'));
      hessian.decode(utils.bytes('v2/string/utf8_65537'), '2.0').should.equal(str);
      // hessian.decode(utils.bytes('v1/string/utf8_65537'), '2.0').should.equal(str);
    });
  });
});
