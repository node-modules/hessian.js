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

// http://hessian.caucho.com/doc/hessian-1.0-spec.xtp#map

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
      $class: "com.caucho.test.Car",
      $: {
        model: 'Beetle',
        color: 'aquamarine',
        mileage: 65536
      }
    });
  });

  it('should write {hasOwnProperty: 1, a: 0, b: false, c: null} obj', function () {
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
        'H'.charCodeAt(0),
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
      new Buffer('Z')
    ]);

    it('should read java hash map', function () {
      hessian.decode(hashmapBuffer, '2.0').should.eql({
        1: 'fee',
        16: 'fie',
        256: 'foe'
      });
    });

    it('should read Circular map', function () {
      var buf = Buffer.concat([
        new Buffer([
          'H'.charCodeAt(0),
          0x05
        ]),
        new Buffer('color'),
        new Buffer([
          0x0a
        ]),
        new Buffer('aquamarine'),

        new Buffer([
          0x05
        ]),
        new Buffer('model'),
        new Buffer([
          0x06
        ]),
        new Buffer('Beetle'),

        new Buffer([
          0x04
        ]),
        new Buffer('self'), // map.self => map
        new Buffer([
          0x51, 0x90
        ]),
        new Buffer('Z')
      ]);

      var obj = hessian.decode(buf, '2.0');
      obj.should.have.keys('color', 'model', 'self');
      obj.color.should.equal('aquamarine');
      obj.model.should.equal('Beetle');
      obj.self.should.equal(obj);
      obj.self.should.have.keys('color', 'model', 'self');
    });

    it('should read a java Object', function () {
      // public class Car implements Serializable {
      //   String color = "aquamarine";
      //   String model = "Beetle";
      //   int mileage = 65536;
      // }
      var buf = Buffer.concat([
        new Buffer([
          'M'.charCodeAt(0),
          0x13
        ]),
        new Buffer('com.caucho.test.Car'),
        new Buffer([
          0x05
        ]),
        new Buffer('color'),
        new Buffer([
          0x0a
        ]),
        new Buffer('aquamarine'),

        new Buffer([
          0x05
        ]),
        new Buffer('model'),
        new Buffer([
          0x06
        ]),
        new Buffer('Beetle'),

        new Buffer([
          0x07
        ]),
        new Buffer('mileage'),
        new Buffer([
          'I'.charCodeAt(0),
          0x00, 0x01, 0x00, 0x00
        ]),
        new Buffer('Z')
      ]);
      hessian.decode(buf, '2.0').should.eql({
        color: 'aquamarine',
        model: 'Beetle',
        mileage: 65536
      });

      hessian.decode(buf, '2.0', true).should.eql({
        $class: 'com.caucho.test.Car',
        $: {
          color: 'aquamarine',
          model: 'Beetle',
          mileage: 65536
        }
      });
    });

    it('should read a Circular java Object', function () {
      var buf = Buffer.concat([
        new Buffer([
          'M'.charCodeAt(0),
          0x13
        ]),
        new Buffer('com.caucho.test.Car'),
        new Buffer([
          0x05
        ]),
        new Buffer('color'),
        new Buffer([
          0x0a
        ]),
        new Buffer('aquamarine'),

        new Buffer([
          0x05
        ]),
        new Buffer('model'),
        new Buffer([
          0x06
        ]),
        new Buffer('Beetle'),

        new Buffer([
          0x07
        ]),
        new Buffer('mileage'),
        new Buffer([
          'I'.charCodeAt(0),
          0x00, 0x01, 0x00, 0x00
        ]),

        new Buffer([
          0x04
        ]),
        new Buffer('self'),
        new Buffer([
          0x51, 0x90
        ]),
        new Buffer('Z'),

        new Buffer([
          'M'.charCodeAt(0),
          0x90,
          0x05
        ]),
        new Buffer('color'),
        new Buffer([
          0x05
        ]),
        new Buffer('black'),

        new Buffer([
          0x05
        ]),
        new Buffer('model'),
        new Buffer([
          0x05
        ]),
        new Buffer('smark'),

        new Buffer([
          0x04
        ]),
        new Buffer('prev'),
        new Buffer([
          0x51, 0x90
        ]),

        new Buffer([
          0x04
        ]),
        new Buffer('self'),
        new Buffer([
          0x51, 0x91
        ]),
        new Buffer('Z')
      ]);

      var decoder = new hessian.DecoderV2(buf);
      var obj = decoder.read();
      obj.should.have.keys('color', 'model', 'mileage', 'self');
      obj.self.should.equal(obj);
      decoder.types[0].should.equal('com.caucho.test.Car');

      var o = decoder.read(true);
      o.should.have.keys('$class', '$');
      o.$.should.have.keys('color', 'model', 'prev', 'self');
      o.$.prev.$.should.equal(obj);
      o.$.self.should.equal(o);

      var obj2 = hessian.decode(buf, '2.0', true);
      obj2.should.have.keys('$class', '$');
      obj2.$.should.have.keys('color', 'model', 'mileage', 'self');
      obj2.$.self.should.have.keys('$class', '$');
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
      bufRef.slice(buf.length).should.eql(new Buffer([0x51, 0x90]));

      var buf2 = hessian.encode({
        $class: 'java.util.HashMap',
        $: map
      }, '2.0');
      buf2.should.eql(buf);
      hessian.decode(buf2, '2.0').should.eql(map);
    });

    it('should write "{$class: java.utils.Map, $: {a: 1}}"', function () {
      var obj = {
        $class: 'java.utils.Map',
        $: {a: 1, b: 'map'}
      };
      var buf = hessian.encode(obj, '2.0');
      buf[0].should.equal(0x4d);
      hessian.decode(buf, '2.0').should.eql(obj.$);
      hessian.decode(buf, '2.0', true).should.eql(obj);
    });
  });
});
