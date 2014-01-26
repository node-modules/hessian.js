/**!
 * hessian.js - test/v1.test.js
 * Copyright(c) 2014
 * MIT Licensed
 *
 * Authors:
 *   dead_horse <dead_horse@qq.com> (http://deadhorse.me)
 */

var fs = require('fs');
var path = require('path');
var should = require('should');
var Encoder = require('../').Encoder;
var Decoder = require('../').Decoder;
var utils = require('../lib/utils');

var encoder = new Encoder();
var decoder = new Decoder();

var fixtureString = fs.readFileSync(path.join(__dirname, 'support', 'fixture.dat'), 'utf8');
var fixtureBytes = fs.readFileSync(path.join(__dirname, 'support', 'fixture.png'));

describe('hessian v1', function () {
  afterEach(function () {
    encoder.clean();
    decoder.clean();
  });

  describe('null', function () {
    it('should write and read null ok', function () {
      var buf = encoder.writeNull().get();
      buf.should.eql(new Buffer('N'));

      decoder.init(buf);
      (decoder.readNull() === null).should.be.ok;
    });
  });

  describe('bool', function () {
    it('should write and read true ok', function () {
      var buf = encoder.writeBool(true).get();
      buf.should.eql(new Buffer('T'));

      decoder.init(buf).readBool().should.eql(true);
    });

    it('should write and read false ok', function () {
      var buf = encoder.writeBool(false).get();
      buf.should.eql(new Buffer('F'));

      decoder.init(buf).readBool().should.eql(false);
    });
  });

  describe('int', function () {
    it('should write and read int ok', function () {
      var tests = [
        [-10000, '<Buffer 49 ff ff d8 f0>'],
        [-1, '<Buffer 49 ff ff ff ff>'],
        [0, '<Buffer 49 00 00 00 00>'],
        [100000, '<Buffer 49 00 01 86 a0>'],
        [Math.pow(2, 31) - 1, '<Buffer 49 7f ff ff ff>'],
      ];

      tests.forEach(function (t) {
        var buf = encoder.writeInt(t[0]).get();
        buf.inspect().should.equal(t[1]);
        decoder.init(buf);
        decoder.readInt().should.equal(t[0]);
        encoder.clean();
        decoder.clean();
      });
    });

    it('should write int error', function () {
      var tests = [
        1.1,
        Math.pow(2, 31),
        -Math.pow(2, 31) - 1
      ];

      tests.forEach(function (t) {
        (function () {
          var buf = encoder.writeInt(t);
        }).should.throw('value is out of bounds');
      });
    });

    it('should read int error', function () {
      var tests = [
        [new Buffer([0x48, 0x00, 0x00, 0x00, 0x00]), 'hessian readInt only accept label `I` but get unexpect label `H`'],
        [new Buffer([0x49, 0x00, 0x00, 0x00]), 'Trying to access beyond buffer length']
      ];
      tests.forEach(function (t) {
        (function () {
          decoder.init(t[0]).readInt();
        }).should.throw(t[1]);
      });
    });
  });

  describe('long', function () {
    it('should write and read long ok', function () {
      var tests = [
        ['-9223372036854775808', '<Buffer 4c 80 00 00 00 00 00 00 00>'],
        [-10000, '<Buffer 4c ff ff ff ff ff ff d8 f0>'],
        [-1, '<Buffer 4c ff ff ff ff ff ff ff ff>'],
        [0, '<Buffer 4c 00 00 00 00 00 00 00 00>'],
        [10000, '<Buffer 4c 00 00 00 00 00 00 27 10>'],
        [9007199254740992, '<Buffer 4c 00 20 00 00 00 00 00 00>'],
        ['9007199254740993', '<Buffer 4c 00 20 00 00 00 00 00 01>'],
        ['9223372036854775807', '<Buffer 4c 7f ff ff ff ff ff ff ff>'],
      ];

      tests.forEach(function (t) {
        var buf = encoder.writeLong(t[0]).get();
        buf.inspect().should.equal(t[1]);
        decoder.init(buf).readLong().should.eql(t[0]);
        encoder.clean();
        decoder.clean();
      });
    });

    it('should write long error', function () {
      var tests = [
        '-9223372036854775.1',
        '92233720368547758111'
      ];

      tests.forEach(function (t) {
        var buf = encoder.writeLong(t).get();
        decoder.init(buf).readLong().should.not.eql(t);
      });
    });

    it('should read long error', function () {
      var tests = [
        [new Buffer([0x4b, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]),
        'hessian readLong only accept label `L` but get unexpect label `K`'],
        [new Buffer([0x4c, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]),
        'Trying to access beyond buffer length']
      ];
      tests.forEach(function (t) {
        (function () {
          decoder.init(t[0]).readLong();
        }).should.throw(t[1]);
      });
    });
  });

  describe('double', function () {
    it('should write and read double ok', function () {
      var tests = [
        [-1e100, '<Buffer 44 d4 b2 49 ad 25 94 c3 7d>'],
        [-1.123, '<Buffer 44 bf f1 f7 ce d9 16 87 2b>'],
        [-1, '<Buffer 44 bf f0 00 00 00 00 00 00>'],
        [0, '<Buffer 44 00 00 00 00 00 00 00 00>'],
        [1, '<Buffer 44 3f f0 00 00 00 00 00 00>'],
        [1.111, '<Buffer 44 3f f1 c6 a7 ef 9d b2 2d>'],
        [1e320, '<Buffer 44 7f f0 00 00 00 00 00 00>'],
      ];

      tests.forEach(function (t) {
        var buf = encoder.writeDouble(t[0]).get();
        buf.inspect().should.equal(t[1]);
        decoder.init(buf).readDouble().should.equal(t[0]);
        encoder.clean();
        decoder.clean();
      });
    });

    it('should read double error', function () {
      var tests = [
        [new Buffer([0x45, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]),
        'hessian readDouble only accept label `D` but get unexpect label `E`'],
        [new Buffer([0x44, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]),
        'Trying to access beyond buffer length']
      ];
      tests.forEach(function (t) {
        (function () {
          decoder.init(t[0]).readDouble();
        }).should.throw(t[1]);
      });
    });
  });

  describe('date', function () {
    it('should write and read Date ok', function () {
      var tests = [
        [new Date('2010-10-10'), '<Buffer 64 00 00 01 2b 93 6f d0 00>'],
        [new Date(0), '<Buffer 64 00 00 00 00 00 00 00 00>'],
      ];

      tests.forEach(function (t) {
        var buf = encoder.writeDate(t[0]).get();
        buf.inspect().should.equal(t[1]);
        decoder.init(buf).readDate().should.eql(t[0]);
        encoder.clean();
        decoder.clean();
      });
    });

    it('should read date error', function () {
      var tests = [
        [new Buffer([0x65, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]),
        'hessian readDate only accept label `d` but get unexpect label `e`'],
        [new Buffer([0x64, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]),
        'Trying to access beyond buffer length']
      ];
      tests.forEach(function (t) {
        (function () {
          decoder.init(t[0]).readDate();
        }).should.throw(t[1]);
      });
    });
  });

  describe('bytes', function () {
    it('should write and read small bytes ok', function () {
      var inputBuffer = new Buffer([1, 2, 3, 4, 5]);
      var buf = encoder.writeBytes(inputBuffer).get();
      buf.inspect().should.equal('<Buffer 42 00 05 01 02 03 04 05>');
      decoder.init(buf).readBytes().should.eql(inputBuffer);
    });

    it('should write and read big bytes ok', function () {
      var inputBuffer = fixtureBytes;
      var inputLength = inputBuffer.length;
      var buf = encoder.writeBytes(inputBuffer).get();
      buf.length.should.equal(inputLength +
        Math.ceil(inputLength / utils.MAX_BYTE_TRUNK_SIZE) * 3);
      decoder.init(buf).readBytes().should.eql(inputBuffer);
    });

    it('should read bytes error', function () {
      var tests = [
        [new Buffer([0x41, 0x00, 0x02, 0x00]), 'hessian readBytes only accept label `b,B` but get unexpect label `A`'],
        [new Buffer([0x62, 0x00, 0x01, 0x00, 0x01]), 'hessian readBytes only accept label `b,B` but get unexpect label `\u0001`'],
      ];

      tests.forEach(function (t) {
        (function () {
          var buf = decoder.init(t[0]).readBytes();
        }).should.throw(t[1]);
      });
    });
  });

  describe('string', function () {
    it('should write and read small string ok', function () {
      var inputStr = '你好，hessian.∆∆˚œø∂πß∂µ';
      var buf = encoder.writeString(inputStr).get();
      buf.inspect().should.equal('<Buffer 53 00 15 e4 bd a0 e5 a5 bd ef bc 8c 68 65 73 73 69 61 6e 2e e2 88 86 e2 88 86 cb 9a c5 93 c3 b8 e2 88 82 cf 80 c3 9f e2 88 82 c2 b5>');
      decoder.init(buf).readString().should.equal(inputStr);
    });

    it('should write and read big string ok', function () {
      var inputStr = fixtureString;
      var inputStrLength = inputStr.length;
      var buf = encoder.writeString(inputStr).get();
      buf.length.should.equal(new Buffer(inputStr).length +
        Math.ceil(inputStrLength / utils.MAX_CHAR_TRUNK_SIZE) * 3);
      decoder.init(buf).readString().should.equal(inputStr);
    });
  });
});
