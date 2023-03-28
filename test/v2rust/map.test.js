"use strict";

var assert = require('assert');
var hessian = require('../../index');
var utils = require('../utils');
var rustDecode = require('./rustdecoder');
describe('map.test.js', function () {

  describe('v2.0', function () {
    it('should write es6 Map to java.util.Map', function() {
      if (typeof Map !== 'function') {
        // pass if not support es6 Map
        return;
      }
      var generic = new Buffer('4df87bd5e2403de240c87b7a', 'hex');
      var map = new Map();
      map.set({ $class: 'java.lang.Long', $: 123 }, 123456);
      map.set({ $class: 'java.lang.Long', $: 123456 }, 123);
      var encoder = new hessian.EncoderV2();
      var buf = encoder.write(map).get();
      assert.deepEqual(buf, generic);

      encoder.reset();

      buf = encoder.write({ $class: 'java.util.HashMap', $: map }).get();
      assert.deepEqual(buf, generic);

      // decode auto transfer key to string
      assert.deepEqual(rustDecode(generic), {
        123: 123456,
        123456: 123,
      });
    });
    // map = new HashMap();
    // map.put(new Integer(1), "fee");
    // map.put(new Integer(16), "fie");
    // map.put(new Integer(256), "foe");
    var hashmapBuffer = Buffer.concat([
      new Buffer([
        'M'.charCodeAt(0),
        0x91, // 1
        0x03,
      ]),
      new Buffer('fee'), // 'fee'
      new Buffer([
        0xa0, // 16
        0x03,
      ]),
      new Buffer('fie'), // 'fie'
      new Buffer([
        0xc9, 0x00, // 256
        0x03,
      ]),
      new Buffer('foe'), // 'foe'
      new Buffer('z'),
    ]);

    it('should write a java Class instance', function () {
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
        },
      };
      var buf = encoder.write(car).get();
      assert.deepEqual(buf, utils.bytes('v2/map/car'));
    });

    it('should read java hash map', function () {
      assert.deepEqual(rustDecode(hashmapBuffer), {
        1: 'fee',
        16: 'fie',
        256: 'foe',
      });
    });

    it('should read a Circular java Object', function () {
      var car = rustDecode(utils.bytes('v2/map/car'));
      assert.deepEqual(car, {
        a: 'a',
        c: 'c',
        b: 'b',
        model: 'Beetle',
        color: 'aquamarine',
        mileage: 65536,
      });

      var obj = rustDecode(utils.bytes('v2/map/car1'));
      [ 'color', 'model', 'mileage', 'self', 'prev' ].forEach(function(p) {
        assert(Object.prototype.hasOwnProperty.call(obj, p));
      });
      assert(obj.self === obj);
      assert(!obj.prev);
      [ 'color', 'model', 'mileage', 'self', 'prev' ].forEach(function(p) {
        assert(Object.prototype.hasOwnProperty.call(obj.self, p));
      });
    });

    it('should write js object to no type hash map', function () {
      var encoder = new hessian.EncoderV2();
      var fooEmpty = new Buffer('4d03666f6f007a', 'hex');
      var buf = encoder.write({ foo: '' }).get();
      assert.deepEqual(buf, fooEmpty);
      assert.deepEqual(rustDecode(fooEmpty), {
        foo: '',
      });

      var fooBar = new Buffer('4d03313233c9c803666f6f03626172047a65726f9005e4b8ade696876b657909e4b8ade69687e59388e5938876616c75657a', 'hex');
      encoder = new hessian.EncoderV2();
      buf = encoder.write({
        foo: 'bar',
        中文key: '中文哈哈value',
        123: 456,
        zero: 0,
      }).get();
      assert.deepEqual(buf, fooBar);

      // read it
      assert.deepEqual(rustDecode(fooBar), {
        foo: 'bar',
        中文key: '中文哈哈value',
        123: 456,
        zero: 0,
      });
    });

    it('should read hessian 1.0 hash map', function () {
      assert.deepEqual(rustDecode(utils.bytes('v1/map/foo_empty')), {
        foo: '',
      });
      assert.deepEqual(rustDecode(utils.bytes('v1/map/foo_bar')), {
        foo: 'bar',
        中文key: '中文哈哈value',
        123: 456,
        zero: 0,
      });
    });

    it('should write simple map to java hash map', function () {
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
        3: "foe",
      };
      var encoder = new hessian.EncoderV2();
      var buf = encoder.write(map).get();
      assert.deepEqual(rustDecode(buf), map);

      // writeRef
      var bufRef = encoder.write(map).get();
      assert.deepEqual(rustDecode(bufRef), map);
      assert.deepEqual(bufRef.slice(buf.length), new Buffer([0x4a, 0x00]));

      var buf2 = hessian.encode({
        $class: 'java.util.HashMap',
        $: map,
      }, '2.0');
      assert.deepEqual(buf2, buf);
      assert.deepEqual(rustDecode(buf2), map);
    });
  });

  it('should decode successful when key is null', function () {
    var data = new Buffer([77, 116, 0, 0, 78, 83, 0, 4, 110, 117, 108, 108, 122]);
    var rv = rustDecode(data);
    assert.deepEqual(rv, { null: 'null' });
  });

  it('should map with object key work', function () {
    const data = require('../../benchmark/v2rust/big3');
    var rv = rustDecode(data);
    var rv2 = hessian.decode(data, '2.0');
    assert.deepEqual(rv, rv2);
  });
});
