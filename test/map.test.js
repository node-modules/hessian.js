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
  // http://hessian.caucho.com/doc/hessian-1.0-spec.xtp#map

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
      $class: "com.caucho.test.Car",
      $: {
        model: 'Beetle',
        color: 'aquamarine',
        mileage: 65536
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

  describe('v2.0', function () {
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
      new Buffer('z')
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
      // public class CarSelf implements Serializable {
      //   String color = "aquamarine";
      //   String model = "Beetle";
      //   int mileage = 65536;
      //   CarSelf self = this;
      //   CarSelf prev = null;
      //
      //   public CarSelf(CarSelf prev) {
      //     this.prev = prev;
      //   }
      //
      //   public CarSelf() {
      //   }
      // }

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

    //   var obj2 = hessian.decode(utils.bytes('v2/map/car2'), '2.0', true);
    //   obj2.should.have.keys('$class', '$');
    //   obj2.$.should.have.keys('color', 'model', 'mileage', 'self');
    //   obj2.$.self.should.have.keys('$class', '$');
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
      bufRef.slice(buf.length).should.eql(new Buffer([0x4a, 0x00]));

      var buf2 = hessian.encode({
        $class: 'java.util.HashMap',
        $: map
      }, '2.0');
      buf2.should.eql(buf);
      hessian.decode(buf2, '2.0').should.eql(map);
    });
  });
});
