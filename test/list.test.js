/*!
 * hessian.js - test/list.test.js
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

describe('list.test.js', function () {
  var intListBuffer = Buffer.concat([
    new Buffer([
      'V'.charCodeAt(0),
      't'.charCodeAt(0), 0x00, 0x04
    ]),
    new Buffer('[int'),
    new Buffer([
      'l'.charCodeAt(0), 0, 0, 0, 0x02,
      'I'.charCodeAt(0), 0, 0, 0, 0x00,
      'I'.charCodeAt(0), 0, 0, 0, 0x01,
      'z'.charCodeAt(0)
    ])
  ]);

  it('should read int[] = {0, 1}', function () {
    hessian.decode(intListBuffer).should.eql([0, 1]);
    hessian.decode(intListBuffer, true).should.eql({
      '$class': '[int', '$': [ 0, 1 ]
    });
  });

  it('should write int[] = {0, 1}', function () {
    var buf = hessian.encode(hessian.java.intList([0, 1]));
    buf.should.be.a.Buffer;
    buf.should.length(intListBuffer.length);
    buf.should.eql(intListBuffer);

    hessian.encode({
      $class: '[int',
      $: [0, 1]
    }).should.eql(intListBuffer);
  });

  it('should read write anonymous variable-length list = {0, "foobar"}', function () {
    var anonymousList = Buffer.concat([
      new Buffer('V'),
      new Buffer([
        'I'.charCodeAt(0), 0, 0, 0, 0x00,
        'S'.charCodeAt(0), 0, 0x06,
      ]),
      new Buffer('foobar'),
      new Buffer('z'),
    ]);

    hessian.decode(anonymousList).should.eql([0, 'foobar']);

    // empty
    var emptyList = Buffer.concat([
      new Buffer('V'),
      new Buffer('z'),
    ]);
    hessian.decode(emptyList).should.eql([]);
  });
});
