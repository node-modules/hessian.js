/*!
 * hessian.js - test/map.test.js
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

describe('map.test.js', function () {
  it('should read Serialization of a Java Object', function () {
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

    hessian.decode(mapBuffer).should.eql({
      model: 'Beetle',
      color: 'aquamarine',
      mileage: 65536
    });

    hessian.decode(mapBuffer, true).should.eql({
      '$class': 'com.caucho.test.Car',
      '$': {
        model: { '$class': 'java.lang.String', '$': 'Beetle' },
        color: { '$class': 'java.lang.String', '$': 'aquamarine' },
        mileage: { '$class': 'int', '$': 65536 }
      }
    });
  });

  it('should write {hasOwnProperty: 1, a: 0, b: false, c: null} obj', function () {
    /* jshint -W001 */
    var buf = hessian.encode({hasOwnProperty: 1, a: 0, b: false, c: null});
    buf.should.be.a.Buffer;
    hessian.decode(buf).should.eql({hasOwnProperty: 1, a: 0, b: false, c: null});
  });

  it('should read A sparse array', function () {
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

    hessian.decode(mapBuffer).should.eql({
      '1': 'fee',
      '16': 'fie',
      '256': 'foe',
    });
  });

  it('should write js object to no type hash map', function () {
    var buf = hessian.encode({ foo: '' });
    buf.should.eql(utils.bytes('v1/map/foo_empty'));
    hessian.decode(utils.bytes('v1/map/foo_empty'), '1.0').should.eql({
      foo: ''
    });

    hessian.encode({
      '123': 456,
      foo: 'bar',
      zero: 0,
      '中文key': '中文哈哈value',
    }).should.eql(utils.bytes('v1/map/foo_bar'));

    // read it
    hessian.decode(utils.bytes('v1/map/foo_bar'), '1.0').should.eql({
      foo: 'bar',
      '中文key': '中文哈哈value',
      '123': 456,
      zero: 0,
    });
  });

  it('should decode successful when key is null', function () {
    var data = new Buffer([77, 116, 0, 0, 78, 83, 0, 4, 110, 117, 108, 108, 122]);
    var rv = hessian.decode(data);
    rv.should.eql({null: 'null'});
  });

  it('should write es6 Map to java.util.Map', function() {
    if (typeof Map !== 'function') {
      // pass if not support es6 Map
      return;
    }
    
    var map = new Map();
    map.set({ '$class': 'java.lang.Long', '$': 123 }, 123456);
    map.set({ '$class': 'java.lang.Long', '$': 123456 }, 123);
    var buf = hessian.encode({ '$class': 'java.util.Map', '$': map });
    // decode auto transfer key to string
    hessian.decode(buf).should.eql({
      '123': 123456,
      '123456': 123
    });
  });

  it('should write es6 Map to java.util.HashMap', function() {
    if (typeof Map !== 'function') {
      // pass if not support es6 Map
      return;
    }
    
    var map = new Map();
    map.set({ '$class': 'java.lang.Long', '$': 123 }, 123456);
    map.set({ '$class': 'java.lang.Long', '$': 123456 }, 123);
    var buf = hessian.encode(map);
    buf.should.eql(utils.bytes('v1/map/generic'));

    buf = hessian.encode({ '$class': 'java.util.HashMap', '$': map });
    buf.should.eql(utils.bytes('v1/map/generic'));

    // decode auto transfer key to string
    hessian.decode(utils.bytes('v1/map/generic'), '1.0').should.eql({
      '123': 123456,
      '123456': 123
    });
  });

  describe('v2.0', function () {
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
        }
      };
      var buf = encoder.write(car).get();
      buf.should.eql(utils.bytes('v2/map/car'));
    });

    it('should read java hash map', function () {
      hessian.decode(hashmapBuffer, '2.0').should.eql({
        1: 'fee',
        16: 'fie',
        256: 'foe'
      });
    });

    it('should read a Circular java Object', function () {
      var car = hessian.decode(utils.bytes('v2/map/car'), '2.0');
      car.should.eql({
        a: 'a',
        c: 'c',
        b: 'b',
        model: 'Beetle',
        color: 'aquamarine',
        mileage: 65536
      });

      var obj = hessian.decode(utils.bytes('v2/map/car1'), '2.0');
      obj.should.have.keys('color', 'model', 'mileage', 'self', 'prev');
      obj.self.should.equal(obj);
      should.not.exist(obj.prev);
      obj.self.should.have.keys('color', 'model', 'mileage', 'self', 'prev');
    });

    it('should write js object to no type hash map', function () {
      var encoder = new hessian.EncoderV2();
      var buf = encoder.write({ foo: '' }).get();
      buf.should.eql(utils.bytes('v2/map/foo_empty'));
      hessian.decode(utils.bytes('v2/map/foo_empty'), '2.0').should.eql({
        foo: ''
      });

      encoder = new hessian.EncoderV2();
      buf = encoder.write({
        foo: 'bar',
        '中文key': '中文哈哈value',
        '123': 456,
        zero: 0,
      }).get();
      buf.should.eql(utils.bytes('v2/map/foo_bar'));

      // read it
      hessian.decode(utils.bytes('v2/map/foo_bar'), '2.0').should.eql({
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
        3: "foe"
      };
      var encoder = new hessian.EncoderV2();
      var buf = encoder.write(map).get();
      hessian.decode(buf, '2.0').should.eql(map);

      // writeRef
      var bufRef = encoder.write(map).get();
      hessian.decode(bufRef, '2.0').should.eql(map);
      bufRef.slice(buf.length).should.eql(new Buffer([0x51, 0x90]));

      var buf2 = hessian.encode({
        $class: 'java.util.HashMap',
        $: map
      }, '2.0');
      buf2.should.eql(buf);
      hessian.decode(buf2, '2.0').should.eql(map);
    });

    it('should decode map with type', function () {

      hessian.decode(utils.bytes('v2/map/hashtable'), '2.0').should.eql({
        'foo': 'bar',
        '中文key': '中文哈哈value'
      });

    });

    it('should write es6 Map to java.util.Map', function() {
      if (typeof Map !== 'function') {
        // pass if not support es6 Map
        return;
      }
      
      var map = new Map();
      map.set({ '$class': 'java.lang.Long', '$': 123 }, 123456);
      map.set({ '$class': 'java.lang.Long', '$': 123456 }, 123);
      var buf = hessian.encode({ '$class': 'java.util.Map', '$': map }, '2.0');
      // decode auto transfer key to string
      hessian.decode(buf, '2.0').should.eql({
        '123': 123456,
        '123456': 123
      });
    });

    it('should write es6 Map to java.util.HashMap', function() {
      if (typeof Map !== 'function') {
        // pass if not support es6 Map
        return;
      }

      var map = new Map();
      map.set({ '$class': 'java.lang.Long', '$': 123 }, 123456);
      map.set({ '$class': 'java.lang.Long', '$': 123456 }, 123);
      var encoder = new hessian.EncoderV2();
      var buf = encoder.write(map).get();
      buf.should.eql(utils.bytes('v2/map/generic'));

      encoder.reset();

      buf = encoder.write({ '$class': 'java.util.HashMap', '$': map }).get();
      buf.should.eql(utils.bytes('v2/map/generic'));

      // decode auto transfer key to string
      hessian.decode(utils.bytes('v2/map/generic'), '2.0').should.eql({
        '123': 123456,
        '123456': 123
      });
    });
    
  });

});
