/* !
 * hessian.js - test/map.test.js
 *
 * Copyright(c) 2014
 * MIT Licensed
 *
 * Authors:
 *   fengmk2 <fengmk2@gmail.com> (http://fengmk2.github.com)
 */

'use strict';

const assert = require('assert');
const hessian = require('../');
const utils = require('./utils');

describe('map.test.js', function() {
  it('should read Serialization of a Java Object', function() {
    // public class Car implements Serializable {
    //   String model = "Beetle";
    //   String color = "aquamarine";
    //   int mileage = 65536;
    // }
    //
    // =>
    //
    // M t x00 x13 com.caucho.test.Car
    //   S x00 x05 model
    //   S x00 x06 Beetle

    //   S x00 x05 color
    //   S x00 x0a aquamarine

    //   S x00 x07 mileage
    //   I x00 x01 x00 x00
    //   z

    const mapBuffer = Buffer.concat([
      Buffer.from('M'),
      Buffer.from([
        't'.charCodeAt(0), 0x00, 0x13,
      ]),
      Buffer.from('com.caucho.test.Car'),
      Buffer.from([
        'S'.charCodeAt(0), 0x00, 0x05,
      ]),
      Buffer.from('model'),
      Buffer.from([
        'S'.charCodeAt(0), 0x00, 0x06,
      ]),
      Buffer.from('Beetle'),

      Buffer.from([
        'S'.charCodeAt(0), 0x00, 0x05,
      ]),
      Buffer.from('color'),
      Buffer.from([
        'S'.charCodeAt(0), 0x00, 0x0a,
      ]),
      Buffer.from('aquamarine'),

      Buffer.from([
        'S'.charCodeAt(0), 0x00, 0x07,
      ]),
      Buffer.from('mileage'),
      Buffer.from([
        'I'.charCodeAt(0), 0x00, 0x01, 0x00, 0x00,
      ]),

      Buffer.from('z'),
    ]);

    assert.deepEqual(hessian.decode(mapBuffer), {
      model: 'Beetle',
      color: 'aquamarine',
      mileage: 65536,
    });

    assert.deepEqual(hessian.decode(mapBuffer, true), {
      $class: 'com.caucho.test.Car',
      $: {
        model: { $class: 'java.lang.String', $: 'Beetle' },
        color: { $class: 'java.lang.String', $: 'aquamarine' },
        mileage: { $class: 'int', $: 65536 },
      },
    });
  });

  it('should write {hasOwnProperty: 1, a: 0, b: false, c: null} obj', function() {
    /* jshint -W001 */
    const buf = hessian.encode({ hasOwnProperty: 1, a: 0, b: false, c: null });
    assert(Buffer.isBuffer(buf));
    assert.deepEqual(hessian.decode(buf), { hasOwnProperty: 1, a: 0, b: false, c: null });
  });

  it('should read A sparse array', function() {
    // map = new HashMap();
    // map.put(new Integer(1), "fee");
    // map.put(new Integer(16), "fie");
    // map.put(new Integer(256), "foe");
    const mapBuffer = Buffer.concat([
      Buffer.from('M'),
      Buffer.from([
        'I'.charCodeAt(0), 0, 0, 0, 0x01,
      ]),
      Buffer.from([
        'S'.charCodeAt(0), 0x00, 0x03,
      ]),
      Buffer.from('fee'),

      Buffer.from([
        'I'.charCodeAt(0), 0, 0, 0, 0x10,
      ]),
      Buffer.from([
        'S'.charCodeAt(0), 0x00, 0x03,
      ]),
      Buffer.from('fie'),

      Buffer.from([
        'I'.charCodeAt(0), 0, 0, 0x01, 0x00,
      ]),
      Buffer.from([
        'S'.charCodeAt(0), 0x00, 0x03,
      ]),
      Buffer.from('foe'),

      Buffer.from('z'),
    ]);

    assert.deepEqual(hessian.decode(mapBuffer), {
      1: 'fee',
      16: 'fie',
      256: 'foe',
    });
  });

  it('should write js object to no type hash map', function() {
    const buf = hessian.encode({ foo: '' });
    assert.deepEqual(buf, utils.bytes('v1/map/foo_empty'));
    assert.deepEqual(hessian.decode(utils.bytes('v1/map/foo_empty'), '1.0'), {
      foo: '',
    });

    assert.deepEqual(hessian.encode({
      123: 456,
      foo: 'bar',
      zero: 0,
      中文key: '中文哈哈value',
    }), utils.bytes('v1/map/foo_bar'));

    // read it
    assert.deepEqual(hessian.decode(utils.bytes('v1/map/foo_bar'), '1.0'), {
      foo: 'bar',
      中文key: '中文哈哈value',
      123: 456,
      zero: 0,
    });
  });

  it('should write es6 Map to java.util.HashMap', function() {
    if (typeof Map !== 'function') {
      // pass if not support es6 Map
      return;
    }

    const map = new Map();
    map.set({ $class: 'java.lang.Long', $: 123 }, 123456);
    map.set({ $class: 'java.lang.Long', $: 123456 }, 123);
    let buf = hessian.encode(map);
    assert.deepEqual(buf, utils.bytes('v1/map/generic'));

    buf = hessian.encode({ $class: 'java.util.HashMap', $: map });
    assert.deepEqual(buf, utils.bytes('v1/map/generic'));

    // decode auto transfer key to string
    assert.deepEqual(hessian.decode(utils.bytes('v1/map/generic'), '1.0'), {
      123: 123456,
      123456: 123,
    });
  });

  describe('v2.0', function() {
    it('should write es6 Map to java.util.Map', function() {
      if (typeof Map !== 'function') {
        // pass if not support es6 Map
        return;
      }
      const generic = Buffer.from('4df87bd5e2403de240c87b7a', 'hex');
      const map = new Map();
      map.set({ $class: 'java.lang.Long', $: 123 }, 123456);
      map.set({ $class: 'java.lang.Long', $: 123456 }, 123);
      const encoder = new hessian.EncoderV2();
      let buf = encoder.write(map).get();
      assert.deepEqual(buf, generic);

      encoder.reset();

      buf = encoder.write({ $class: 'java.util.HashMap', $: map }).get();
      assert.deepEqual(buf, generic);

      // decode auto transfer key to string
      assert.deepEqual(hessian.decode(generic, '2.0'), {
        123: 123456,
        123456: 123,
      });
    });
    // map = new HashMap();
    // map.put(new Integer(1), "fee");
    // map.put(new Integer(16), "fie");
    // map.put(new Integer(256), "foe");
    const hashmapBuffer = Buffer.concat([
      Buffer.from([
        'M'.charCodeAt(0),
        0x91, // 1
        0x03,
      ]),
      Buffer.from('fee'), // 'fee'
      Buffer.from([
        0xa0, // 16
        0x03,
      ]),
      Buffer.from('fie'), // 'fie'
      Buffer.from([
        0xc9, 0x00, // 256
        0x03,
      ]),
      Buffer.from('foe'), // 'foe'
      Buffer.from('z'),
    ]);

    it('should write a java Class instance', function() {
      const encoder = new hessian.EncoderV2();
      const car = {
        $class: 'hessian.demo.Car',
        $: {
          // field defined sort must same as java Class defined
          a: 'a',
          c: 'c',
          b: 'b',
          model: 'Beetle',
          color: 'aquamarine',
          mileage: 65536,
        },
      };
      const buf = encoder.write(car).get();
      assert.deepEqual(buf, utils.bytes('v2/map/car'));
    });

    it('should read java hash map', function() {
      assert.deepEqual(hessian.decode(hashmapBuffer, '2.0'), {
        1: 'fee',
        16: 'fie',
        256: 'foe',
      });
    });

    it('should read a Circular java Object', function() {
      const car = hessian.decode(utils.bytes('v2/map/car'), '2.0');
      assert.deepEqual(car, {
        a: 'a',
        c: 'c',
        b: 'b',
        model: 'Beetle',
        color: 'aquamarine',
        mileage: 65536,
      });

      const obj = hessian.decode(utils.bytes('v2/map/car1'), '2.0');
      [ 'color', 'model', 'mileage', 'self', 'prev' ].forEach(function(p) {
        assert(Object.prototype.hasOwnProperty.call(obj, p));
      });
      assert(obj.self === obj);
      assert(!obj.prev);
      [ 'color', 'model', 'mileage', 'self', 'prev' ].forEach(function(p) {
        assert(Object.prototype.hasOwnProperty.call(obj.self, p));
      });
    });

    it('should write js object to no type hash map', function() {
      let encoder = new hessian.EncoderV2();
      const fooEmpty = Buffer.from('4d03666f6f007a', 'hex');
      let buf = encoder.write({ foo: '' }).get();
      assert.deepEqual(buf, fooEmpty);
      assert.deepEqual(hessian.decode(fooEmpty, '2.0'), {
        foo: '',
      });

      const fooBar = Buffer.from('4d03313233c9c803666f6f03626172047a65726f9005e4b8ade696876b657909e4b8ade69687e59388e5938876616c75657a', 'hex');
      encoder = new hessian.EncoderV2();
      buf = encoder.write({
        foo: 'bar',
        中文key: '中文哈哈value',
        123: 456,
        zero: 0,
      }).get();
      assert.deepEqual(buf, fooBar);

      // read it
      assert.deepEqual(hessian.decode(fooBar, '2.0'), {
        foo: 'bar',
        中文key: '中文哈哈value',
        123: 456,
        zero: 0,
      });
    });

    it('should read hessian 1.0 hash map', function() {
      assert.deepEqual(hessian.decode(utils.bytes('v1/map/foo_empty'), '2.0'), {
        foo: '',
      });
      assert.deepEqual(hessian.decode(utils.bytes('v1/map/foo_bar'), '2.0'), {
        foo: 'bar',
        中文key: '中文哈哈value',
        123: 456,
        zero: 0,
      });
    });

    it('should write simple map to java hash map', function() {
      // map = new HashMap();
      // map.put(new Integer(1), "fee");
      // map.put(new Integer(16), "fie");
      // map.put(new Integer(256), "foe");
      // ---

      // H           # untyped map (HashMap for Java)
      //   x91       # 1
      //   x03 fee   # "fee"

      //   xa0       # 16
      //   x03 fie   # "fie"

      //   xc9 x00   # 256
      //   x03 foe   # "foe"

      //   Z
      const map = {
        1: 'fee',
        2: 'fie',
        3: 'foe',
      };
      const encoder = new hessian.EncoderV2();
      const buf = encoder.write(map).get();
      assert.deepEqual(hessian.decode(buf, '2.0'), map);

      // writeRef
      const bufRef = encoder.write(map).get();
      assert.deepEqual(hessian.decode(bufRef, '2.0'), map);
      assert.deepEqual(bufRef.slice(buf.length), Buffer.from([ 0x4a, 0x00 ]));

      const buf2 = hessian.encode({
        $class: 'java.util.HashMap',
        $: map,
      }, '2.0');
      assert.deepEqual(buf2, buf);
      assert.deepEqual(hessian.decode(buf2, '2.0'), map);
    });
  });

  it('should decode successful when key is null', function() {
    const data = Buffer.from([ 77, 116, 0, 0, 78, 83, 0, 4, 110, 117, 108, 108, 122 ]);
    const rv = hessian.decode(data);
    assert.deepEqual(rv, { null: 'null' });
  });
});
