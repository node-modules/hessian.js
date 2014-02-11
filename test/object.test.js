/**!
 * hessian.js - test/object.test.js
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

describe('object.test.js', function () {
  describe('v2.0', function () {
    it('should read a class and object', function () {
      // class Car {
      //   String color;
      //   String model;
      // }

      // out.writeObject(new Car("red", "corvette"));
      // out.writeObject(new Car("green", "civic"));
      var buf = Buffer.concat([
        new Buffer([
          'C'.charCodeAt(0),
          0x0b,
        ]),
        new Buffer('example.Car'),
        new Buffer([
          0x92,
          0x05
        ]),
        new Buffer('color'),
        new Buffer([0x05]),
        new Buffer('model'),

        new Buffer([
          'O'.charCodeAt(0),
          0x90,
          0x03
        ]),
        new Buffer('red'),
        new Buffer([0x08]),
        new Buffer('corvette'),

        new Buffer([
          0x60,
          0x05
        ]),
        new Buffer('green'),
        new Buffer([0x05]),
        new Buffer('civic'),

        new Buffer([
          'O'.charCodeAt(0),
          0x90,
          0x05
        ]),
        new Buffer('black'),
        new Buffer([0x04]),
        new Buffer('golf'),
      ]);

      var decoder = new hessian.DecoderV2(buf);
      decoder.read().should.eql({
        color: 'red',
        model: 'corvette'
      });
      decoder.read(true).should.eql({
        $class: 'example.Car',
        $: {
          color: 'green',
          model: 'civic'
        }
      });
      decoder.read(true).should.eql({
        $class: 'example.Car',
        $: {
          color: 'black',
          model: 'golf'
        }
      });
      decoder.classes[0].should.eql({
        name: 'example.Car',
        fields: ['color', 'model']
      });
    });

    it('should read enum Color', function () {
      // enum Color {
      //   RED,
      //   GREEN,
      //   BLUE,
      // }

      // out.writeObject(Color.RED);
      // out.writeObject(Color.GREEN);
      // out.writeObject(Color.BLUE);
      // out.writeObject(Color.GREEN);
      // C                         # class definition #0
      //   x0b example.Color       # type is example.Color
      //   x91                     # one field
      //   x04 name                # enumeration field is "name"

      // x60                       # object #0 (class def #0)
      //   x03 RED                 # RED value

      // x60                       # object #1 (class def #0)
      //   x90                     # object definition ref #0
      //   x05 GREEN               # GREEN value

      // x60                       # object #2 (class def #0)
      //   x04 BLUE                # BLUE value

      // x51 x91                   # object ref #1, i.e. Color.GREEN
      var buf = Buffer.concat([
        new Buffer([
          'C'.charCodeAt(0),
          0x0d
        ]),
        new Buffer('example.Color'),
        new Buffer([
          0x91,
          0x04
        ]),
        new Buffer('name'),

        new Buffer([
          0x60,
          0x03
        ]),
        new Buffer('RED'),

        new Buffer([
          0x60,
          0x05
        ]),
        new Buffer('GREEN'),

        new Buffer([
          0x60,
          0x04
        ]),
        new Buffer('BLUE'),

        new Buffer([0x51, 0x91]), // object ref #1, i.e. Color.GREEN
        new Buffer([0x51, 0x90]), // object ref #0, i.e. Color.RED
        new Buffer([0x51, 0x92]), // object ref #2, i.e. Color.BLUE
      ]);

      var decoder = new hessian.DecoderV2(buf);
      decoder.read().should.eql({
        name: 'RED'
      });

      decoder.read(true).should.eql({
        $class: 'example.Color',
        $: {
          name: 'GREEN'
        }
      });

      decoder.read().should.eql({
        name: 'BLUE'
      });

      decoder.read(false).should.eql({
        name: 'GREEN'
      });

      decoder.read(true).should.eql({
        $class: 'example.Color',
        $: {
          name: 'RED'
        }
      });

      decoder.read().should.eql({
        name: 'BLUE'
      });

      decoder.classes[0].should.eql({
        name: 'example.Color',
        fields: ['name']
      });
    });
  });
});
