'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const hessian = require('../');
const Encoder = hessian.Encoder;
const Decoder = hessian.Decoder;
const utils = require('../lib/utils');

const encoder = new Encoder();
const decoder = new Decoder();

const fixtureString = fs.readFileSync(path.join(__dirname, 'support', 'fixture.dat'), 'utf8');
const fixtureBytes = fs.readFileSync(path.join(__dirname, 'support', 'fixture.png'));

describe('hessian v1', function() {
  afterEach(function() {
    encoder.clean();
    decoder.clean();
  });

  describe('null', function() {
    it('should write and read null ok', function() {
      const buf = encoder.writeNull().get();
      assert.deepEqual(buf, Buffer.from('N'));

      decoder.init(buf);
      assert(decoder.readNull() === null);
    });
  });

  describe('bool', function() {
    it('should write and read true ok', function() {
      const buf = encoder.writeBool(true).get();
      assert.deepEqual(buf, Buffer.from('T'));

      assert(decoder.init(buf).readBool() === true);
    });

    it('should write and read false ok', function() {
      const buf = encoder.writeBool(false).get();
      assert.deepEqual(buf, Buffer.from('F'));

      assert(decoder.init(buf).readBool() === false);
    });
  });

  describe('int', function() {
    it('should write and read int ok', function() {
      const tests = [
        [ -10000, '<Buffer 49 ff ff d8 f0>' ],
        [ -1, '<Buffer 49 ff ff ff ff>' ],
        [ 0, '<Buffer 49 00 00 00 00>' ],
        [ 100000, '<Buffer 49 00 01 86 a0>' ],
        [ Math.pow(2, 31) - 1, '<Buffer 49 7f ff ff ff>' ],
      ];

      tests.forEach(function(t) {
        const buf = encoder.writeInt(t[0]).get();
        assert(buf.inspect() === t[1]);
        decoder.init(buf);
        assert(decoder.readInt() === t[0]);
        encoder.clean();
        decoder.clean();
      });
    });

    it('should write int error', function() {
      const tests = [
        1.1,
        Math.pow(2, 31),
        -Math.pow(2, 31) - 1,
      ];

      tests.forEach(function(t, idx) {
        assert.throws(function() {
          encoder.writeInt(t);
        }, null, 'hessian writeInt expect input type is `int32`, but got `number` : ' + tests[idx] + ' ');
      });
    });

    it('should read int error', function() {
      const tests = [
        [ Buffer.from([ 0x48, 0x00, 0x00, 0x00, 0x00 ]), 'hessian readInt only accept label `I` but got unexpect label `H`' ],
      ];
      tests.forEach(function(t) {
        assert.throws(function() {
          decoder.init(t[0]).readInt();
        }, null, t[1]);
      });
    });
  });

  describe('long', function() {
    it('should write and read long ok', function() {
      const tests = [
        [ '-9223372036854775808', '<Buffer 4c 80 00 00 00 00 00 00 00>' ],
        [ -10000, '<Buffer 4c ff ff ff ff ff ff d8 f0>' ],
        [ -1, '<Buffer 4c ff ff ff ff ff ff ff ff>' ],
        [ 0, '<Buffer 4c 00 00 00 00 00 00 00 00>' ],
        [ 10000, '<Buffer 4c 00 00 00 00 00 00 27 10>' ],
        [ 9007199254740992, '<Buffer 4c 00 20 00 00 00 00 00 00>' ],
        [ '9007199254740993', '<Buffer 4c 00 20 00 00 00 00 00 01>' ],
        [ '9223372036854775807', '<Buffer 4c 7f ff ff ff ff ff ff ff>' ],
      ];

      tests.forEach(function(t) {
        const buf = encoder.writeLong(t[0]).get();
        assert(buf.inspect() === t[1]);
        assert.deepEqual(decoder.init(buf).readLong(), t[0]);
        encoder.clean();
        decoder.clean();
      });
    });

    it('should write long error', function() {
      const tests = [
        '-9223372036854775.1',
        '92233720368547758111',
      ];

      tests.forEach(function(t) {
        const buf = encoder.writeLong(t).get();
        assert.notStrictEqual(decoder.init(buf).readLong(), t);
      });
    });

    it('should read long error', function() {
      const tests = [
        [ Buffer.from([ 0x4b, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00 ]),
          'hessian readLong only accept label `L` but got unexpect label `K`',
        ],
      ];
      tests.forEach(function(t) {
        assert.throws(function() {
          decoder.init(t[0]).readLong();
        }, null, t[1]);
      });
    });
  });

  describe('double', function() {
    it('should write and read double ok', function() {
      const tests = [
        [ -1e100, '<Buffer 44 d4 b2 49 ad 25 94 c3 7d>' ],
        [ -1.123, '<Buffer 44 bf f1 f7 ce d9 16 87 2b>' ],
        [ -1, '<Buffer 44 bf f0 00 00 00 00 00 00>' ],
        [ 0, '<Buffer 44 00 00 00 00 00 00 00 00>' ],
        [ 1, '<Buffer 44 3f f0 00 00 00 00 00 00>' ],
        [ 1.111, '<Buffer 44 3f f1 c6 a7 ef 9d b2 2d>' ],
        // 1e320
        [ Infinity, '<Buffer 44 7f f0 00 00 00 00 00 00>' ],
      ];

      tests.forEach(function(t) {
        const buf = encoder.writeDouble(t[0]).get();
        assert(buf.inspect() === t[1]);
        assert(decoder.init(buf).readDouble() === t[0]);
        encoder.clean();
        decoder.clean();
      });
    });

    it('should read double error', function() {
      const tests = [
        [ Buffer.from([ 0x45, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00 ]),
          'hessian readDouble only accept label `D` but got unexpect label `E`',
        ],
      ];
      tests.forEach(function(t) {
        assert.throws(function() {
          decoder.init(t[0]).readDouble();
        }, null, t[1]);
      });
    });
  });

  describe('date', function() {
    it('should write and read Date ok', function() {
      const tests = [
        [ new Date('2010-10-10'), '<Buffer 64 00 00 01 2b 93 6f d0 00>' ],
        [ new Date(0), '<Buffer 64 00 00 00 00 00 00 00 00>' ],
      ];

      tests.forEach(function(t) {
        const buf = encoder.writeDate(t[0]).get();
        assert(buf.inspect() === t[1]);
        assert.deepEqual(decoder.init(buf).readDate(), t[0]);
        encoder.clean();
        decoder.clean();
      });
    });

    it('should read date error', function() {
      const tests = [
        [ Buffer.from([ 0x65, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00 ]),
          'hessian readDate only accept label `d` but got unexpect label `e`',
        ],
      ];
      tests.forEach(function(t) {
        assert.throws(function() {
          decoder.init(t[0]).readDate();
        }, null, t[1]);
      });
    });
  });

  describe('bytes', function() {
    it('should write and read small bytes ok', function() {
      const inputBuffer = Buffer.from([ 1, 2, 3, 4, 5 ]);
      const buf = encoder.writeBytes(inputBuffer).get();
      assert(buf.inspect() === '<Buffer 42 00 05 01 02 03 04 05>');
      assert.deepEqual(decoder.init(buf).readBytes(), inputBuffer);
    });

    it('should write and read big bytes ok', function() {
      const inputBuffer = fixtureBytes;
      const inputLength = inputBuffer.length;
      const buf = encoder.writeBytes(inputBuffer).get();
      assert(buf.length === inputLength +
        Math.ceil(inputLength / utils.MAX_BYTE_TRUNK_SIZE) * 3);
      assert.deepEqual(decoder.init(buf).readBytes(), inputBuffer);
    });

    it('should read bytes error', function() {
      const tests = [
        [ Buffer.from([ 0x41, 0x00, 0x02, 0x00 ]), 'hessian readBytes only accept label `b,B` but got unexpect label `A`' ],
        [ Buffer.from([ 0x62, 0x00, 0x01, 0x00, 0x01 ]), 'hessian readBytes only accept label `b,B` but got unexpect label `\u0001`' ],
      ];

      tests.forEach(function(t) {
        assert.throws(function() {
          decoder.init(t[0]).readBytes();
        }, null, t[1]);
      });
    });

    it('should bytes length equal MAX_BYTE_TRUNK_SIZE work', function() {
      const oneTrunkBuf = Buffer.alloc(utils.MAX_BYTE_TRUNK_SIZE);
      let buf = encoder.writeBytes(oneTrunkBuf).get();
      assert.deepEqual(decoder.init(buf).readBytes(), oneTrunkBuf);

      encoder.clean();
      const twoTrunkBuf = Buffer.alloc(utils.MAX_BYTE_TRUNK_SIZE * 2);
      buf = encoder.writeBytes(twoTrunkBuf).get();
      assert.deepEqual(decoder.init(buf).readBytes(), twoTrunkBuf);
    });

    it('should write type error', function() {
      assert.throws(function() {
        encoder.writeBytes();
      }, null, 'hessian writeBytes expect input type is `buffer`, but got `undefined` : undefined ');
      assert.throws(function() {
        encoder.writeBytes('');
      }, null, 'hessian writeBytes expect input type is `buffer`, but got `string` : "" ');
      assert.throws(function() {
        encoder.writeBytes(null);
      }, null, 'hessian writeBytes expect input type is `buffer`, but got `object` : null ');
      assert.throws(function() {
        encoder.writeBytes(100);
      }, null, 'hessian writeBytes expect input type is `buffer`, but got `number` : 100 ');
    });

    it('should write and read empty bytes', function() {
      const buf = encoder.writeBytes(Buffer.from('')).get();
      assert.deepEqual(decoder.init(buf).readBytes(), Buffer.from(''));
    });
  });

  describe('string', function() {
    it('should write and read small string ok', function() {
      const inputStr = '你好，hessian.∆∆˚œø∂πß∂µ';
      const buf = encoder.writeString(inputStr).get();
      assert(
        buf.inspect() === '<Buffer 53 00 15 e4 bd a0 e5 a5 bd ef bc 8c 68 65 73 73 69 61 6e 2e e2 88 86 e2 88 86 cb 9a c5 93 c3 b8 e2 88 82 cf 80 c3 9f e2 88 82 c2 b5>'
      );
      assert(decoder.init(buf).readString() === inputStr);
    });

    it('should write and read big string ok', function() {
      const inputStr = fixtureString;
      const inputStrLength = inputStr.length;
      const buf = encoder.writeString(inputStr).get();
      assert(buf.length === Buffer.from(inputStr).length +
        Math.ceil(inputStrLength / utils.MAX_CHAR_TRUNK_SIZE) * 3);
      assert(decoder.init(buf).readString() === inputStr);
    });

    it('should read string error', function() {
      const tests = [
        [ Buffer.from([ 0x72, 0x00, 0x02, 0x00 ]), 'hessian readString error, unexpect string code: 0x72' ],
        [ Buffer.from([ 0x73, 0x00, 0x01, 0x00, 0x01 ]), 'hessian readString error, unexpect string code: 0x1' ],
        [ Buffer.from([ 0x73, 0x00, 0x01, 0xf0, 0x20 ]), 'string is not valid UTF-8 encode' ],
      ];

      tests.forEach(function(t) {
        assert.throws(function() {
          decoder.init(t[0]).readString();
        }, null, t[1]);
      });
    });

    it('should write type error', function() {
      assert.throws(function() {
        encoder.writeString();
      }, null, 'hessian writeString expect input type is `string`, but got `undefined` : undefined ');
      // v0.10.28 return [1,2,3,4,5]
      // (function () {
      //   encoder.writeString(Buffer.from([1,2,3,4,5]));
      // }).should.throw('hessian writeString expect input type is `string`, but got `object` : {"type":"Buffer","data":[1,2,3,4,5]} ');
      assert.throws(function() {
        encoder.writeString(null);
      }, null, 'hessian writeString expect input type is `string`, but got `object` : null ');
      assert.throws(function() {
        encoder.writeString(100);
      }, null, 'hessian writeString expect input type is `string`, but got `number` : 100 ');
    });

    it('should string length equal MAX_CHAR_TRUNK_SIZE work', function() {
      let oneTrunkString = Buffer.alloc(utils.MAX_CHAR_TRUNK_SIZE);
      oneTrunkString.fill(0x41);
      oneTrunkString = oneTrunkString.toString();
      let buf = encoder.writeString(oneTrunkString).get();
      assert.deepEqual(decoder.init(buf).readString(), oneTrunkString);
      encoder.clean();

      let twoTrunkString = Buffer.alloc(utils.MAX_CHAR_TRUNK_SIZE * 2);
      twoTrunkString.fill(0x41);
      twoTrunkString = twoTrunkString.toString();
      buf = encoder.writeString(twoTrunkString).get();
      assert.deepEqual(decoder.init(buf).read(), twoTrunkString);
    });

    it('should write and read empty string', function() {
      const buf = encoder.writeString('').get();
      assert(decoder.init(buf).read() === '');
    });
  });

  describe('object', function() {
    it('should write and get simple object ok', function() {
      const testObject = {
        a: 1,
        b: 'string',
        c: true,
        d: 1.1,
        e: Math.pow(2, 40),
        f: [ 1, 2, 3, '4', true, 5 ],
        g: { a: 1, b: true, c: 'string' },
      };
      const buf = encoder.writeObject(testObject).get();
      assert.deepEqual(decoder.init(buf).readObject(), testObject);
    });

    it('should write null obejct ok', function() {
      const nullObject = null;
      const nullBuf = encoder.writeObject(nullObject).get();
      assert(decoder.init(nullBuf).read() === null);
    });

    it('should write and read object with circular ok', function() {
      const testObject = {
        a: 1,
        b: 'string',
        c: {},
        d: [ 1, 2 ],
      };
      testObject.c.a = testObject;
      testObject.d.push(testObject.c);

      const buf = encoder.writeObject(testObject).get();
      const res = decoder.init(buf).readObject();
      assert(res.a === testObject.a);
      assert(res.b === testObject.b);
      assert(res.c.a.a === testObject.a);
      assert(res.c.a.b === testObject.b);
      assert(res.d[2].a.a === testObject.a);
      assert(res.d[2].a.b === testObject.b);
    });

    it('should write and read complex object ok', function() {
      const testObject = {
        $class: 'com.hessian.TestObject',
        $: {
          a: 1,
          b: { $class: 'java.util.List', $: [ 1, 2, 3 ] },
        },
      };

      const buf = encoder.writeObject(testObject).get();
      const res = decoder.init(buf).readObject();
      assert.deepEqual(res, { a: 1, b: [ 1, 2, 3 ] });
      const resWithType = decoder.init(buf).readObject(true);
      assert.deepEqual(resWithType, {
        $class: 'com.hessian.TestObject',
        $: {
          a: { $class: 'int', $: 1 },
          b: {
            $class: 'java.util.List',
            $: [
              { $class: 'int', $: 1 },
              { $class: 'int', $: 2 },
              { $class: 'int', $: 3 },
            ],
          },
        },
      });
    });

    it('should read complex object type use positon ok', function() {
      const testObject = {
        $class: 'com.hessian.TestObject',
        $: {
          a: 1,
          b: { $class: 'java.util.List', $: [ 1, 2, 3 ] },
        },
      };

      const buf = encoder.writeObject(testObject).get();
      decoder.init(buf);
      assert(decoder.position() === 0);
      decoder.position(1); // skip 'M'
      assert(decoder.readType() === 'com.hessian.TestObject');
      assert(decoder.position() === 26);
      assert.deepEqual(decoder.position(0).readObject(true), {
        $class: 'com.hessian.TestObject',
        $: {
          a: { $class: 'int', $: 1 },
          b: {
            $class: 'java.util.List',
            $: [
              { $class: 'int', $: 1 },
              { $class: 'int', $: 2 },
              { $class: 'int', $: 3 },
            ],
          },
        },
      });
    });

    it('should write "java.util.HashMap" treat as {}', function() {
      const testObject = {
        $class: 'java.util.HashMap',
        $: { foo: 'bar' },
      };
      const buf = encoder.writeObject(testObject).get();
      encoder.clean();

      assert.deepEqual(buf, encoder.writeObject({ foo: 'bar' }).get());
      assert.deepEqual(decoder.init(buf).read(), { foo: 'bar' });
      assert.deepEqual(decoder.init(buf).read(true), {
        $class: 'java.util.HashMap',
        $: {
          foo: { $class: 'java.lang.String', $: 'bar' },
        },
      });
    });

    it('should write type error', function() {
      assert.throws(function() {
        encoder.writeObject('123');
      }, null, 'hessian writeObject / writeMap expect input type is `object`, but got `string` : "123" ');
      assert.throws(function() {
        encoder.writeObject(1.111);
      }, null, 'hessian writeObject / writeMap expect input type is `object`, but got `number` : 1.111 ');
      assert.throws(function() {
        encoder.writeObject(100);
      }, null, 'hessian writeObject / writeMap expect input type is `object`, but got `number` : 100 ');
    });
  });

  describe('array', function() {
    it('should write and read simple array ok', function() {
      const testArray = [ 1, true, 'string', 1.1, new Date() ];
      const buf = encoder.writeArray(testArray).get();
      assert.deepEqual(decoder.init(buf).readArray(), testArray);
    });

    it('should write circular array ok', function() {
      const testArray = [ 1 ];
      testArray.push(testArray);
      const buf = encoder.writeArray(testArray).get();
      const res = decoder.init(buf).readArray();
      assert(res[0] === testArray[0]);
      assert(res[1][1][1][0] === testArray[0]);
    });

    it('should write and read complex array ok', function() {
      const testArray = {
        $class: 'java.util.Set',
        $: [{
          $class: 'java.util.List',
          $: [ 1, 2, 3 ],
        }],
      };
      const buf = encoder.writeArray(testArray).get();
      assert.deepEqual(decoder.init(buf).readArray(), [
        [ 1, 2, 3 ],
      ]);
      assert.deepEqual(decoder.init(buf).readArray(true), {
        $class: 'java.util.Set',
        $: [{
          $class: 'java.util.List',
          $: [
            { $class: 'int', $: 1 },
            { $class: 'int', $: 2 },
            { $class: 'int', $: 3 },
          ],
        }],
      });
    });

    it('should write "java.util.ArrayList" treat as []', function() {
      const testArray = {
        $class: 'java.util.ArrayList',
        $: [ 1, 2, 3 ],
      };
      const buf = encoder.writeArray(testArray).get();
      encoder.clean();

      assert.deepEqual(buf, encoder.writeArray([ 1, 2, 3 ]).get());
      assert.deepEqual(decoder.init(buf).read(), [ 1, 2, 3 ]);
      assert.deepEqual(decoder.init(buf).read(true), {
        $class: 'java.util.ArrayList',
        $: [
          { $class: 'int', $: 1 },
          { $class: 'int', $: 2 },
          { $class: 'int', $: 3 },
        ],
      });
    });

    it('should read unexpect end label', function() {
      const buf = encoder.writeArray([ 1, 2, 3 ]).get();
      buf[buf.length - 1] = 40;
      assert.throws(function() {
        decoder.init(buf).read('hessian readArray error, unexpect end label: (');
      });
    });

    it('should write type error', function() {
      assert.throws(function() {
        encoder.writeArray();
      }, null, 'hessian writeArray input type invalid');
      assert.throws(function() {
        encoder.writeArray('123');
      }, null, 'hessian writeArray input type invalid');
      assert.throws(function() {
        encoder.writeArray(1.111);
      }, null, 'hessian writeArray input type invalid');
      assert.throws(function() {
        encoder.writeArray(100);
      }, null, 'hessian writeArray input type invalid');
    });
  });

  describe('java.lang.Object', function() {
    it('should encode and decode ok', function() {
      [
        100,
        'string',
        true,
        new Date(),
        [ 1, 2, 3 ],
        { foo: 'bar' },
      ].forEach(function(val) {
        const buf = encoder.write({ $class: 'java.lang.Object', $: val }).get();
        encoder.clean();
        assert.deepEqual(decoder.init(buf).read(), val);
      });
    });
  });

  describe('encode and decode', function() {
    it('should encode and decode work ok', function() {
      const now = new Date();
      const tests = [
        [ 1, { $class: 'int', $: 1 }],
        [ 1.1, { $class: 'double', $: 1.1 }],
        [ -10, { $class: 'int', $: -10 }],
        [ Math.pow(2, 50), { $class: 'long', $: Math.pow(2, 50) }],
        [{ $class: 'long', $: '288230376151711740' }],
        [{ $class: 'boolean', $: 1 }, { $class: 'boolean', $: true }],
        [ now, { $class: 'java.util.Date', $: now }],
        [ true, { $class: 'boolean', $: true }],
        [ false, { $class: 'boolean', $: false }],
        [ null ],
        [ undefined ],
        [{ a: 1, b: [ true, false ], c: now, d: {}, e: null }, {
          $class: 'java.util.HashMap',
          $: {
            a: { $class: 'int', $: 1 },
            b: {
              $class: 'java.util.ArrayList',
              $: [{ $class: 'boolean', $: true }, { $class: 'boolean', $: false }],
            },
            c: { $class: 'java.util.Date', $: now },
            d: { $class: 'java.util.HashMap', $: {} },
            e: null,
          },
        }],
      ];
      tests.forEach(function(t) {
        const buf = hessian.encode(t[0]);
        const res = hessian.decode(buf, true);
        if (res) {
          assert.deepEqual(res, t[1] || t[0]);
        } else {
          /* jshint eqeqeq: false */
          assert.deepEqual(res, t[0]);
        }
      });
    });

    it('should decode error', function() {
      const buf = Buffer.from([ 0x50, 0x11 ]);
      assert.throws(function() {
        hessian.decode(buf);
      }, null, 'hessian read got an unexpect code: 0x50');
    });
  });
});
