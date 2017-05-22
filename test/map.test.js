/**
 * hessian.js - test/map.test.js
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
var supportES6Map = require('../lib/utils').supportES6Map;

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

    var mapBuffer = Buffer.concat([
      new Buffer('M'),
      new Buffer([
        't'.charCodeAt(0), 0x00, 0x13,
      ]),
      new Buffer('com.caucho.test.Car'),
      new Buffer([
        'S'.charCodeAt(0), 0x00, 0x05,
      ]),
      new Buffer('model'),
      new Buffer([
        'S'.charCodeAt(0), 0x00, 0x06,
      ]),
      new Buffer('Beetle'),

      new Buffer([
        'S'.charCodeAt(0), 0x00, 0x05,
      ]),
      new Buffer('color'),
      new Buffer([
        'S'.charCodeAt(0), 0x00, 0x0a,
      ]),
      new Buffer('aquamarine'),

      new Buffer([
        'S'.charCodeAt(0), 0x00, 0x07,
      ]),
      new Buffer('mileage'),
      new Buffer([
        'I'.charCodeAt(0), 0x00, 0x01, 0x00, 0x00,
      ]),

      new Buffer('z'),
    ]);

    assert.deepEqual(hessian.decode(mapBuffer), {
      model: 'Beetle',
      color: 'aquamarine',
      mileage: 65536
    });

    assert.deepEqual(hessian.decode(mapBuffer, true), {
      '$class': 'com.caucho.test.Car',
      '$': {
        model: { '$class': 'java.lang.String', '$': 'Beetle' },
        color: { '$class': 'java.lang.String', '$': 'aquamarine' },
        mileage: { '$class': 'int', '$': 65536 }
      }
    });
  });

  it('should write {hasOwnProperty: 1, a: 0, b: false, c: null} obj', function() {
    /* jshint -W001 */
    var buf = hessian.encode({ hasOwnProperty: 1, a: 0, b: false, c: null });
    assert(Buffer.isBuffer(buf));
    assert.deepEqual(hessian.decode(buf), { hasOwnProperty: 1, a: 0, b: false, c: null });
  });

  it('should read A sparse array', function() {
    // map = new HashMap();
    // map.put(new Integer(1), "fee");
    // map.put(new Integer(16), "fie");
    // map.put(new Integer(256), "foe");
    var mapBuffer = Buffer.concat([
      new Buffer('M'),
      new Buffer([
        'I'.charCodeAt(0), 0, 0, 0, 0x01,
      ]),
      new Buffer([
        'S'.charCodeAt(0), 0x00, 0x03,
      ]),
      new Buffer('fee'),

      new Buffer([
        'I'.charCodeAt(0), 0, 0, 0, 0x10,
      ]),
      new Buffer([
        'S'.charCodeAt(0), 0x00, 0x03,
      ]),
      new Buffer('fie'),

      new Buffer([
        'I'.charCodeAt(0), 0, 0, 0x01, 0x00,
      ]),
      new Buffer([
        'S'.charCodeAt(0), 0x00, 0x03,
      ]),
      new Buffer('foe'),

      new Buffer('z'),
    ]);

    assert.deepEqual(hessian.decode(mapBuffer), {
      '1': 'fee',
      '16': 'fie',
      '256': 'foe',
    });
  });

  it('should write js object to no type hash map', function() {
    var buf = hessian.encode({ foo: '' });
    assert.deepEqual(buf, utils.bytes('v1/map/foo_empty'));
    assert.deepEqual(hessian.decode(utils.bytes('v1/map/foo_empty'), '1.0'), {
      foo: ''
    });

    assert.deepEqual(hessian.encode({
      '123': 456,
      foo: 'bar',
      zero: 0,
      '中文key': '中文哈哈value',
    }), utils.bytes('v1/map/foo_bar'));

    // read it
    assert.deepEqual(hessian.decode(utils.bytes('v1/map/foo_bar'), '1.0'), {
      foo: 'bar',
      '中文key': '中文哈哈value',
      '123': 456,
      zero: 0,
    });
  });

  it('should decode successful when key is null', function() {
    var data = new Buffer([77, 116, 0, 0, 78, 83, 0, 4, 110, 117, 108, 108, 122]);
    var rv = hessian.decode(data);
    assert.deepEqual(rv, { null: 'null' });

    if (!supportES6Map) {
      // pass if not support es6 Map
      return;
    }

    assert(rv.$map);
    assert(rv.$map instanceof Map);
    assert(rv.$map.size === 1);
    assert(rv.$map.get(null) === 'null');
  });

  it('should write es6 Map to java.util.Map', function() {
    if (!supportES6Map) {
      // pass if not support es6 Map
      return;
    }

    var map = new Map();
    map.set({ '$class': 'java.lang.Long', '$': 123 }, 123456);
    map.set({ '$class': 'java.lang.Long', '$': 123456 }, 123);
    var buf = hessian.encode({ '$class': 'java.util.Map', '$': map });
    // decode auto transfer key to string
    var result = hessian.decode(buf);
    assert.deepEqual(result, {
      '123': 123456,
      '123456': 123
    });

    assert(result.$map);
    assert(result.$map instanceof Map);
    assert(result.$map.size === 2);

    assert(result.$map.get(123) === 123456);
    assert(result.$map.get(123456) === 123);
  });

  it('should write es6 Map to java.util.HashMap', function() {
    if (!supportES6Map) {
      // pass if not support es6 Map
      return;
    }

    var map = new Map();
    map.set({ '$class': 'java.lang.Long', '$': 123 }, 123456);
    map.set({ '$class': 'java.lang.Long', '$': 123456 }, 123);
    var buf = hessian.encode(map);
    assert.deepEqual(buf, utils.bytes('v1/map/generic'));

    buf = hessian.encode({ '$class': 'java.util.HashMap', '$': map });
    assert.deepEqual(buf, utils.bytes('v1/map/generic'));

    // decode auto transfer key to string
    var result = hessian.decode(utils.bytes('v1/map/generic'), '1.0');
    assert.deepEqual(result, {
      '123': 123456,
      '123456': 123
    });

    assert(result.$map);
    assert(result.$map instanceof Map);
    assert(result.$map.size === 2);

    assert(result.$map.get(123) === 123456);
    assert(result.$map.get(123456) === 123);
  });

  describe('v2.0', function() {
    // map = new HashMap();
    // map.put(new Integer(1), "fee");
    // map.put(new Integer(16), "fie");
    // map.put(new Integer(256), "foe");
    var hashmapBuffer = Buffer.concat([
      new Buffer([
        0x48,
        0x01, // 1
        0x31,
        0x03
      ]),
      new Buffer('fee'), // 'fee'
      new Buffer([
        0x02, // 16
        0x31,
        0x36,
        0x03
      ]),
      new Buffer('fie'), // 'fie'
      new Buffer([
        0x03,
        0x32, // 256
        0x35,
        0x36,
        0x03
      ]),
      new Buffer('foe'), // 'foe'
      new Buffer('Z')
    ]);

    it('should write a java Class instance', function() {
      var encoder = new hessian.EncoderV2();
      var car = {
        $class: 'hessian.demo.Car',
        $: {
          // field defined sort must same as java Class defined
          a: 'a',
          c: 'c',
          b: 'b',
          model: 'Beetle',
          color: 'aquamarine',
          mileage: 65536,
        }
      };
      var buf = encoder.write(car).get();
      assert.deepEqual(buf, utils.bytes('v2/map/car'));
    });

    it('should read java hash map', function() {
      assert.deepEqual(hessian.decode(hashmapBuffer, '2.0'), {
        1: 'fee',
        16: 'fie',
        256: 'foe'
      });
    });

    it('should read a Circular java Object', function() {
      var car = hessian.decode(utils.bytes('v2/map/car'), '2.0');
      assert.deepEqual(car, {
        a: 'a',
        c: 'c',
        b: 'b',
        model: 'Beetle',
        color: 'aquamarine',
        mileage: 65536
      });

      var obj = hessian.decode(utils.bytes('v2/map/car1'), '2.0');
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
      var encoder = new hessian.EncoderV2();
      var buf = encoder.write({ foo: '' }).get();
      assert.deepEqual(buf, utils.bytes('v2/map/foo_empty'));
      assert.deepEqual(hessian.decode(utils.bytes('v2/map/foo_empty'), '2.0'), {
        foo: ''
      });

      encoder = new hessian.EncoderV2();
      buf = encoder.write({
        foo: 'bar',
        '中文key': '中文哈哈value',
        '123': 456,
        zero: 0,
      }).get();
      assert.deepEqual(buf, utils.bytes('v2/map/foo_bar'));

      // read it
      assert.deepEqual(hessian.decode(utils.bytes('v2/map/foo_bar'), '2.0'), {
        foo: 'bar',
        '中文key': '中文哈哈value',
        '123': 456,
        zero: 0,
      });
    });

    // it('should read hessian 1.0 hash map', function () {
    //   hessian.decode(utils.bytes('v1/map/foo_empty'), '2.0').should.eql({
    //     foo: ''
    //   });
    //   hessian.decode(utils.bytes('v1/map/foo_bar'), '2.0').should.eql({
    //     foo: 'bar',
    //     '中文key': '中文哈哈value',
    //     '123': 456,
    //     zero: 0,
    //   });
    // });

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
      var map = {
        1: "fee",
        2: "fie",
        3: "foe"
      };
      var encoder = new hessian.EncoderV2();
      var buf = encoder.write(map).get();
      assert.deepEqual(hessian.decode(buf, '2.0'), map);

      // writeRef
      var bufRef = encoder.write(map).get();
      assert.deepEqual(hessian.decode(bufRef, '2.0'), map);
      assert.deepEqual(bufRef.slice(buf.length), new Buffer([0x51, 0x90]));

      var buf2 = hessian.encode({
        $class: 'java.util.HashMap',
        $: map
      }, '2.0');
      assert.deepEqual(buf2, buf);
      assert.deepEqual(hessian.decode(buf2, '2.0'), map);
    });

    it('should decode map with type', function() {

      assert.deepEqual(hessian.decode(utils.bytes('v2/map/hashtable'), '2.0'), {
        'foo': 'bar',
        '中文key': '中文哈哈value'
      });

    });

    it('should write es6 Map to java.util.Map', function() {
      if (!supportES6Map) {
        // pass if not support es6 Map
        return;
      }

      var map = new Map();
      map.set({ '$class': 'java.lang.Long', '$': 123 }, 123456);
      map.set({ '$class': 'java.lang.Long', '$': 123456 }, 123);
      var buf = hessian.encode({ '$class': 'java.util.Map', '$': map }, '2.0');
      // decode auto transfer key to string
      var result = hessian.decode(buf, '2.0');
      assert.deepEqual(result, {
        '123': 123456,
        '123456': 123
      });

      assert(result.$map);
      assert(result.$map instanceof Map);
      assert(result.$map.size === 2);

      assert(result.$map.get(123) === 123456);
      assert(result.$map.get(123456) === 123);
    });

    it('should write es6 Map to java.util.HashMap', function() {
      if (!supportES6Map) {
        // pass if not support es6 Map
        return;
      }

      var map = new Map();
      map.set({ '$class': 'java.lang.Long', '$': 123 }, 123456);
      map.set({ '$class': 'java.lang.Long', '$': 123456 }, 123);
      var encoder = new hessian.EncoderV2();
      var buf = encoder.write(map).get();
      assert.deepEqual(buf, utils.bytes('v2/map/generic'));

      encoder.reset();

      buf = encoder.write({ '$class': 'java.util.HashMap', '$': map }).get();
      assert.deepEqual(buf, utils.bytes('v2/map/generic'));

      // decode auto transfer key to string
      var result = hessian.decode(utils.bytes('v2/map/generic'), '2.0');
      assert.deepEqual(result, {
        '123': 123456,
        '123456': 123
      });

      assert(result.$map);
      assert(result.$map instanceof Map);
      assert(result.$map.size === 2);

      assert(result.$map.get(123) === 123456);
      assert(result.$map.get(123456) === 123);
    });

    it('should read java.util.HashMap', function() {
      if (!supportES6Map || !Array.from) {
        // pass if not support es6 Map
        return;
      }

      var buf = new Buffer('43302c636f6d2e74616f62616f2e63756e2e74726164652e726573756c746d6f64656c2e526573756c744d6f64656c940773756363657373086572726f724d7367096572726f72436f6465046461746160544e4e4843303d636f6d2e74616f62616f2e63756e2e74726164652e7472616465706c6174666f726d2e706172616d2e5061636b6167655175657279506172616d73564f93066974656d49640a616374697669747949640a6469766973696f6e4964614c000002006a3b9b5204313233343daef1e2613c411f04313233343daef13e895f5a', 'hex');
      var res = new hessian.DecoderV2(buf).read();

      assert(res.data);
      assert(res.data.$map);
      assert(res.data.$map instanceof Map);
      assert(res.data.$map.size === 2);

      var keys = Array.from(res.data.$map.keys());
      var values = Array.from(res.data.$map.values());

      assert.deepEqual(keys[0], { itemId: 2200805546834, activityId: '1234', divisionId: 110321 });
      assert.deepEqual(keys[1], { itemId: 16671, activityId: '1234', divisionId: 110321 });

      assert(values[0] === 2);
      assert(values[1] === 166239);

      var plainObject = JSON.parse(JSON.stringify(res.data));
      assert.deepEqual(plainObject, { '[object Object]': 166239 });
    });
  });

});
