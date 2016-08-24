/**
 * hessian.js - test/v1.test.js
 * Copyright(c)
 * MIT Licensed
 *
 * Authors:
 *   dead_horse <dead_horse@qq.com> (http://deadhorse.me)
 *   fengmk2 <fengmk2@gmail.com> (http://fengmk2.github.com)
 */

'use strict';

var fs = require('fs');
var path = require('path');
var should = require('should');
var hessian = require('../');
var Encoder = hessian.Encoder;
var Decoder = hessian.Decoder;
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

      tests.forEach(function (t, idx) {
        (function () {
          var buf = encoder.writeInt(t);
        }).should.throw('hessian writeInt expect input type is `int32`, but got `number` : ' + tests[idx] + ' ');
      });
    });

    it('should read int error', function () {
      var tests = [
        [new Buffer([0x48, 0x00, 0x00, 0x00, 0x00]), 'hessian readInt only accept label `I` but got unexpect label `H`'],
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
        [9007199254740991, '<Buffer 4c 00 1f ff ff ff ff ff ff>'],
        ['9007199254740992', '<Buffer 4c 00 20 00 00 00 00 00 00>'],
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
        'hessian readLong only accept label `L` but got unexpect label `K`']
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
        // 1e320
        [Infinity, '<Buffer 44 7f f0 00 00 00 00 00 00>'],
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
        'hessian readDouble only accept label `D` but got unexpect label `E`']
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
        'hessian readDate only accept label `d` but got unexpect label `e`']
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
        [new Buffer([0x41, 0x00, 0x02, 0x00]), 'hessian readBytes only accept label `b,B` but got unexpect label `A`'],
        [new Buffer([0x62, 0x00, 0x01, 0x00, 0x01]), 'hessian readBytes only accept label `b,B` but got unexpect label `\u0001`'],
      ];

      tests.forEach(function (t) {
        (function () {
          var buf = decoder.init(t[0]).readBytes();
        }).should.throw(t[1]);
      });
    });

    it('should bytes length equal MAX_BYTE_TRUNK_SIZE work', function () {
      var oneTrunkBuf = new Buffer(utils.MAX_BYTE_TRUNK_SIZE);
      var buf = encoder.writeBytes(oneTrunkBuf).get();
      decoder.init(buf).readBytes().should.eql(oneTrunkBuf);

      encoder.clean();
      var twoTrunkBuf = new Buffer(utils.MAX_BYTE_TRUNK_SIZE * 2);
      buf = encoder.writeBytes(twoTrunkBuf).get();
      decoder.init(buf).readBytes().should.eql(twoTrunkBuf);
    });

    it('should write type error', function () {
      (function () {
        encoder.writeBytes();
      }).should.throw('hessian writeBytes expect input type is `buffer`, but got `undefined` : undefined ');
      (function () {
        encoder.writeBytes('');
      }).should.throw('hessian writeBytes expect input type is `buffer`, but got `string` : "" ');
      (function () {
        encoder.writeBytes(null);
      }).should.throw('hessian writeBytes expect input type is `buffer`, but got `object` : null ');
      (function () {
        encoder.writeBytes(100);
      }).should.throw('hessian writeBytes expect input type is `buffer`, but got `number` : 100 ');
    });

    it('should write and read empty bytes', function () {
      var buf = encoder.writeBytes(new Buffer('')).get();
      decoder.init(buf).readBytes().should.eql(new Buffer(''));
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

    it('should read string error', function () {
      var tests = [
        [new Buffer([0x72, 0x00, 0x02, 0x00]), 'hessian readString error, unexpect string code: 0x72'],
        [new Buffer([0x73, 0x00, 0x01, 0x00, 0x01]), 'hessian readString error, unexpect string code: 0x1'],
        [new Buffer([0x73, 0x00, 0x01, 0xf0, 0x20]), 'string is not valid UTF-8 encode'],
      ];

      tests.forEach(function (t) {
        (function () {
          var buf = decoder.init(t[0]).readString();
        }).should.throw(t[1]);
      });
    });

    it('should write type error', function () {
      (function () {
        encoder.writeString();
      }).should.throw('hessian writeString expect input type is `string`, but got `undefined` : undefined ');
      // v0.10.28 return [1,2,3,4,5]
      // (function () {
      //   encoder.writeString(new Buffer([1,2,3,4,5]));
      // }).should.throw('hessian writeString expect input type is `string`, but got `object` : {"type":"Buffer","data":[1,2,3,4,5]} ');
      (function () {
        encoder.writeString(null);
      }).should.throw('hessian writeString expect input type is `string`, but got `object` : null ');
      (function () {
        encoder.writeString(100);
      }).should.throw('hessian writeString expect input type is `string`, but got `number` : 100 ');
    });

    it('should string length equal MAX_CHAR_TRUNK_SIZE work', function () {
      var oneTrunkString = new Buffer(utils.MAX_CHAR_TRUNK_SIZE);
      oneTrunkString.fill(0x41);
      oneTrunkString = oneTrunkString.toString();
      var buf = encoder.writeString(oneTrunkString).get();
      decoder.init(buf).readString().should.eql(oneTrunkString);
      encoder.clean();

      var twoTrunkString = new Buffer(utils.MAX_CHAR_TRUNK_SIZE * 2);
      twoTrunkString.fill(0x41);
      twoTrunkString = twoTrunkString.toString();
      buf = encoder.writeString(twoTrunkString).get();
      decoder.init(buf).read().should.eql(twoTrunkString);
    });

    it('should write and read empty string', function () {
      var buf = encoder.writeString('').get();
      decoder.init(buf).read().should.eql('');
    });
  });

  describe('object', function () {
    it('should write and get simple object ok', function () {
      var testObject = {
        a: 1,
        b: 'string',
        c: true,
        d: 1.1,
        e: Math.pow(2, 40),
        f: [1, 2, 3, '4', true, 5],
        g: {a: 1, b: true, c: 'string'}
      };
      var buf = encoder.writeObject(testObject).get();
      decoder.init(buf).readObject().should.eql(testObject);
    });

    it('should write null obejct ok', function () {
      var nullObject = null;
      var nullBuf = encoder.writeObject(nullObject).get();
      (decoder.init(nullBuf).read() === null).should.be.ok;
    });

    it('should write and read object with circular ok', function () {
      var testObject = {
        a: 1,
        b: 'string',
        c: {},
        d: [1, 2]
      };
      testObject.c.a = testObject;
      testObject.d.push(testObject.c);

      var buf = encoder.writeObject(testObject).get();
      var res = decoder.init(buf).readObject();
      res.a.should.equal(testObject.a);
      res.b.should.equal(testObject.b);
      res.c.a.a.should.equal(testObject.a);
      res.c.a.b.should.equal(testObject.b);
      res.d[2].a.a.should.equal(testObject.a);
      res.d[2].a.b.should.equal(testObject.b);
    });

    it('should write and read complex object ok', function () {
      var testObject = {
        $class: 'com.hessian.TestObject',
        $: {
          a: 1,
          b: {$class: 'java.util.List', $: [1, 2, 3]}
        }
      };

      var buf = encoder.writeObject(testObject).get();
      var res = decoder.init(buf).readObject();
      res.should.eql({a:1, b:[1, 2, 3]});
      var resWithType = decoder.init(buf).readObject(true);
      resWithType.should.eql( {
        '$class': 'com.hessian.TestObject',
        '$': {
          a: { '$class': 'int', '$': 1 },
          b: {
            '$class': 'java.util.List',
            '$': [
              { '$class': 'int', '$': 1 },
              { '$class': 'int', '$': 2 },
              { '$class': 'int', '$': 3 }
            ]
          }
        }
      });
    });

    it('should read complex object type use positon ok', function () {
      var testObject = {
        $class: 'com.hessian.TestObject',
        $: {
          a: 1,
          b: {$class: 'java.util.List', $: [1, 2, 3]}
        }
      };

      var buf = encoder.writeObject(testObject).get();
      decoder.init(buf);
      decoder.position().should.equal(0);
      decoder.position(1); //skip 'M'
      decoder.readType().should.equal('com.hessian.TestObject');
      decoder.position().should.equal(26);
      decoder.position(0).readObject(true).should.eql({
        '$class': 'com.hessian.TestObject',
        '$': {
          a: { '$class': 'int', '$': 1 },
          b: {
            '$class': 'java.util.List',
            '$': [
              { '$class': 'int', '$': 1 },
              { '$class': 'int', '$': 2 },
              { '$class': 'int', '$': 3 }
            ]
          }
        }
      });
    });

    it('should write "java.util.HashMap" treat as {}', function () {
      var testObject = {
        $class: 'java.util.HashMap',
        $: {foo: 'bar'}
      };
      var buf = encoder.writeObject(testObject).get();
      encoder.clean();

      buf.should.eql(encoder.writeObject({foo: 'bar'}).get());
      decoder.init(buf).read().should.eql({foo: 'bar'});
      decoder.init(buf).read(true).should.eql({
        '$class': 'java.util.HashMap',
        '$': {
          foo: { '$class': 'java.lang.String', '$': 'bar' }
        }
      });
    });

    it('should write type error', function () {
      (function () {
        encoder.writeObject('123');
      }).should.throw('hessian writeObject / writeMap expect input type is `object`, but got `string` : "123" ');
      (function () {
        encoder.writeObject(1.111);
      }).should.throw('hessian writeObject / writeMap expect input type is `object`, but got `number` : 1.111 ');
      (function () {
        encoder.writeObject(100);
      }).should.throw('hessian writeObject / writeMap expect input type is `object`, but got `number` : 100 ');
    });
  });

  describe('array', function () {
    it('should write and read simple array ok', function () {
      var testArray = [1, true, 'string', 1.1, new Date()];
      var buf = encoder.writeArray(testArray).get();
      decoder.init(buf).readArray().should.eql(testArray);
    });

    it('should write circular array ok', function () {
      var testArray = [1];
      testArray.push(testArray);
      var buf = encoder.writeArray(testArray).get();
      var res = decoder.init(buf).readArray();
      res[0].should.equal(testArray[0]);
      res[1][1][1][0].should.equal(testArray[0]);
    });

    it('should write and read complex array ok', function () {
      var testArray = {
        $class: 'java.util.Set',
        $: [{
          $class: 'java.util.List',
          $: [1, 2, 3]
        }]
      };
      var buf = encoder.writeArray(testArray).get();
      decoder.init(buf).readArray().should.eql([[1, 2, 3]]);
      decoder.init(buf).readArray(true).should.eql({
        '$class': 'java.util.Set',
        '$': [
          {
            '$class': 'java.util.List',
            '$': [
              { '$class': 'int', '$': 1 },
              { '$class': 'int', '$': 2 },
              { '$class': 'int', '$': 3 }
            ]
          }
        ]
      });
    });

    it('should write "java.util.ArrayList" treat as []', function () {
      var testArray = {
        $class: 'java.util.ArrayList',
        $: [1, 2, 3]
      };
      var buf = encoder.writeArray(testArray).get();
      encoder.clean();

      buf.should.eql(encoder.writeArray([1, 2, 3]).get());
      decoder.init(buf).read().should.eql([1, 2, 3]);
      decoder.init(buf).read(true).should.eql({
        $class: 'java.util.ArrayList',
        $: [
          { '$class': 'int', '$': 1 },
          { '$class': 'int', '$': 2 },
          { '$class': 'int', '$': 3 }
        ]
      });
    });

    it('should read unexpect end label', function () {
      var buf = encoder.writeArray([1, 2, 3]).get();
      buf[buf.length - 1] = 40;
      (function () {
        decoder.init(buf).read('hessian readArray error, unexpect end label: (');
      }).should.throw();
    });

    it('should write type error', function () {
      (function () {
        encoder.writeArray();
      }).should.throw('hessian writeArray input type invalid');
      (function () {
        encoder.writeArray('123');
      }).should.throw('hessian writeArray input type invalid');
      (function () {
        encoder.writeArray(1.111);
      }).should.throw('hessian writeArray input type invalid');
      (function () {
        encoder.writeArray(100);
      }).should.throw('hessian writeArray input type invalid');
    });
  });

  describe('java.lang.Object', function () {
    it('should encode and decode ok', function () {
      [
        100,
        'string',
        true,
        new Date(),
        [1, 2, 3],
        {foo: 'bar'}
      ].forEach(function(val) {
        var buf = encoder.write({$class:'java.lang.Object', $: val}).get();
        encoder.clean();
        decoder.init(buf).read().should.eql(val);
      });
    });
  });

  describe('encode and decode', function () {
    it('should encode and decode work ok', function () {
      var now = new Date();
      var tests = [
        [1, {$class: 'int', $: 1}],
        [1.1, {$class: 'double', $: 1.1}],
        [-10, {$class: 'int', $: -10}],
        [Math.pow(2, 50), { '$class': 'long', '$': Math.pow(2, 50)}],
        [{$class: 'long', $: '288230376151711740'}],
        [{$class: 'boolean', $: 1}, {$class: 'boolean', $: true}],
        [now, {'$class': 'java.util.Date', $: now}],
        [true, {$class: 'boolean', $: true}],
        [false, {$class: 'boolean', $: false}],
        [null],
        [undefined],
        [{ a: 1, b: [true, false], c: now, d: {}, e: null }, {
            $class: 'java.util.HashMap',
            $:{
              a: { '$class': 'int', '$': 1 },
              b: {
                $class: 'java.util.ArrayList',
                $: [ { '$class': 'boolean', '$': true }, { '$class': 'boolean', '$': false } ]
              },
              c: { '$class': 'java.util.Date', '$': now },
              d: { '$class': 'java.util.HashMap', '$': {} },
              e: null
            }
          }
        ]
      ];
      tests.forEach(function (t) {
        var buf = hessian.encode(t[0]);
        var res = hessian.decode(buf, true);
        if (res) {
          res.should.eql(t[1] || t[0]);
        } else {
          /* jshint eqeqeq: false */
          should.ok(res == t[0]);
        }
      });
    });

    it('should decode error', function () {
      var buf = new Buffer([0x50, 0x11]);
      (function() {
        hessian.decode(buf);
      }).should.throw('hessian read got an unexpect code: 0x50');
    });
  });
});
