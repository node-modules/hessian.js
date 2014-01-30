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
});
