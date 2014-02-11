/**!
 * hessian.js - test/ref.test.js
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

describe('ref.test.js', function () {
  describe('v2.0', function () {
    it('should Circular list', function () {
      // list = new LinkedList();
      // list.data = 1;
      // list.tail = list;
      // ---
      // C
      //   x0a LinkedList
      //   x92
      //   x04 data
      //   x04 tail

      // o x90      # object stores ref #0
      //   x91      # data = 1
      //   x51 x90  # next field refers to itself, i.e. ref #0
      var buf = Buffer.concat([
        new Buffer([
          'C'.charCodeAt(0),
          0x0a
        ]),
        new Buffer('LinkedList'),
        new Buffer([
          0x92,
          0x04
        ]),
        new Buffer('data'),
        new Buffer([0x04]),
        new Buffer('tail'),

        new Buffer([
          'O'.charCodeAt(0),
          0x90,
          0x91,
          0x51, 0x90
        ]),
      ]);

      var decoder = new hessian.DecoderV2(buf);
      var list = decoder.read();
      list.should.have.keys('data', 'tail');
      list.data.should.equal(1);
      list.tail.should.equal(list);

      decoder.classes[0].should.eql({
        name: 'LinkedList',
        fields: ['data', 'tail']
      });
    });
  });
});
