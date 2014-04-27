/**!
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
var java = require('js-to-java');
var hessian = require('../');
var utils = require('./utils');

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
    var buf = hessian.encode(java.array.int([0, 1]));
    buf.should.be.a.Buffer;
    buf.should.length(intListBuffer.length);
    buf.should.eql(intListBuffer);

    hessian.encode({
      $class: '[int',
      $: [0, 1]
    }).should.eql(intListBuffer);

    // empty list
    var empty = Buffer.concat([
      new Buffer([
        'V'.charCodeAt(0),
        't'.charCodeAt(0), 0x00, 0x04
      ]),
      new Buffer('[int'),
      new Buffer([
        'l'.charCodeAt(0), 0, 0, 0, 0x00,
        'z'.charCodeAt(0)
      ])
    ]);
    hessian.decode(empty).should.eql([]);
  });

  it('should read write anonymous variable-length list = {0, null, "foobar"}', function () {
    var anonymousList = Buffer.concat([
      new Buffer('V'),
      new Buffer([
        'I'.charCodeAt(0), 0, 0, 0, 0x00,
        'N'.charCodeAt(0),
        'S'.charCodeAt(0), 0, 0x06,
      ]),
      new Buffer('foobar'),
      new Buffer('z'),
    ]);

    hessian.decode(anonymousList).should.eql([0, null, 'foobar']);

    // empty
    var emptyList = Buffer.concat([
      new Buffer('V'),
      new Buffer('z'),
    ]);
    hessian.decode(emptyList).should.eql([]);
  });

  it('should write and read untyped list', function () {
    hessian.encode([1, 2, 'foo'], '1.0').should.eql(utils.bytes('v1/list/untyped_list'));
    hessian.encode([], '1.0').should.eql(utils.bytes('v1/list/untyped_[]'));

    hessian.decode(utils.bytes('v1/list/untyped_list'), '1.0').should.eql([1, 2, 'foo']);
    hessian.decode(utils.bytes('v1/list/untyped_list'), '1.0', true).should.eql([1, 2, 'foo']);
    hessian.decode(utils.bytes('v1/list/untyped_[]'), '1.0').should.eql([]);
    hessian.decode(utils.bytes('v1/list/untyped_<String>[foo,bar]'), '1.0', true).should.eql(['foo', 'bar']);

    // java.util.ArrayList as simple
    hessian.encode({
      $class: 'java.util.ArrayList',
      $: [1, 2, 'foo']
    }, '1.0').should.eql(utils.bytes('v1/list/untyped_list'));
  });

  it('should write and read typed fixed-length list', function () {
    hessian.encode({
      $class: 'hessian.demo.SomeArrayList',
      $: ['ok', 'some list']
    }, '1.0').should.eql(utils.bytes('v1/list/typed_list'));
    hessian.decode(utils.bytes('v1/list/typed_list'), '1.0', true)
      .should.eql({
        '$class': 'hessian.demo.SomeArrayList',
        '$': [ 'ok', 'some list' ]
      });

    hessian.decode(utils.bytes('v1/list/typed_list'), '1.0')
      .should.eql([ 'ok', 'some list' ]);

    var list = {
      $class: '[int',
      $: [1, 2, 3]
    };
    hessian.encode(list, '1.0').should.eql(utils.bytes('v1/list/[int'));
    hessian.decode(utils.bytes('v1/list/[int'), '1.0').should.eql([1, 2, 3]);
    hessian.decode(utils.bytes('v1/list/[int'), '1.0', true).should.eql(list);

    var strs = {
      $class: '[string',
      $: ['1', '@', '3']
    };
    hessian.encode(strs, '1.0').should.eql(utils.bytes('v1/list/[string'));
    hessian.decode(utils.bytes('v1/list/[string'), '1.0', true).should.eql(strs);
  });

  describe('v2.0', function () {
    it('should write and read untyped list', function () {
      hessian.encode([1, 2, 'foo'], '2.0').should.eql(utils.bytes('v2/list/untyped_list'));
      hessian.encode([], '2.0').should.eql(utils.bytes('v2/list/untyped_[]'));

      hessian.decode(utils.bytes('v2/list/untyped_list'), '2.0').should.eql([1, 2, 'foo']);
      hessian.decode(utils.bytes('v2/list/untyped_list'), '2.0', true).should.eql([1, 2, 'foo']);
      hessian.decode(utils.bytes('v2/list/untyped_[]'), '2.0').should.eql([]);
      hessian.decode(utils.bytes('v2/list/untyped_<String>[foo,bar]'), '2.0', true).should.eql(['foo', 'bar']);

      // java.util.ArrayList as simple
      hessian.encode({
        $class: 'java.util.ArrayList',
        $: [1, 2, 'foo']
      }, '2.0').should.eql(utils.bytes('v2/list/untyped_list'));
    });

    it('should write and read typed fixed-length list', function () {
      hessian.encode({
        $class: 'hessian.demo.SomeArrayList',
        $: ['ok', 'some list']
      }, '2.0').should.eql(utils.bytes('v2/list/typed_list'));
      hessian.decode(utils.bytes('v2/list/typed_list'), '2.0', true)
        .should.eql({
          '$class': 'hessian.demo.SomeArrayList',
          '$': [ 'ok', 'some list' ]
        });

      hessian.decode(utils.bytes('v2/list/typed_list'), '2.0')
        .should.eql([ 'ok', 'some list' ]);

      var list = {
        $class: '[int',
        $: [1, 2, 3]
      };
      hessian.encode(list, '2.0').should.eql(utils.bytes('v2/list/[int'));
      hessian.decode(utils.bytes('v2/list/[int'), '2.0').should.eql([1, 2, 3]);
      hessian.decode(utils.bytes('v2/list/[int'), '2.0', true).should.eql(list);

      var strs = {
        $class: '[string',
        $: ['1', '@', '3']
      };
      hessian.encode(strs, '2.0').should.eql(utils.bytes('v2/list/[string'));
      hessian.decode(utils.bytes('v2/list/[string'), '2.0', true).should.eql(strs);
    });
  });
});
