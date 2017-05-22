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

var assert = require('assert');
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
    assert.deepEqual(hessian.decode(intListBuffer), [0, 1]);
    assert.deepEqual(hessian.decode(intListBuffer, true), {
      '$class': '[int',
      '$': [ { '$class': 'int', '$': 0 }, { '$class': 'int', '$': 1 } ]
    });
  });

  it('should write int[] = {0, 1}', function () {
    var buf = hessian.encode(java.array.int([0, 1]));
    assert(Buffer.isBuffer(buf));
    assert(buf.length === intListBuffer.length);
    assert.deepEqual(buf, intListBuffer);

    assert.deepEqual(hessian.encode({
      $class: '[int',
      $: [0, 1]
    }), intListBuffer);

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
    assert.deepEqual(hessian.decode(empty), []);
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

    assert.deepEqual(hessian.decode(anonymousList), [0, null, 'foobar']);

    // empty
    var emptyList = Buffer.concat([
      new Buffer('V'),
      new Buffer('z'),
    ]);
    assert.deepEqual(hessian.decode(emptyList), []);
  });

  it('should write and read untyped list', function () {
    assert.deepEqual(hessian.encode([1, 2, 'foo'], '1.0'), utils.bytes('v1/list/untyped_list'));
    assert.deepEqual(hessian.encode([], '1.0'), utils.bytes('v1/list/untyped_[]'));

    assert.deepEqual(hessian.decode(utils.bytes('v1/list/untyped_list'), '1.0'), [1, 2, 'foo']);
    assert.deepEqual(hessian.decode(utils.bytes('v1/list/untyped_list'), '1.0', true), {
      $class: 'java.util.ArrayList',
      $: [
        { '$class': 'int', '$': 1 },
        { '$class': 'int', '$': 2 },
        { '$class': 'java.lang.String', '$': 'foo' }
      ]
    });
    assert.deepEqual(hessian.decode(utils.bytes('v1/list/untyped_[]'), '1.0'), []);
    assert.deepEqual(
      hessian.decode(utils.bytes('v1/list/untyped_<String>[foo,bar]'), '1.0', true),
      {
        $class: 'java.util.ArrayList',
        $: [
          { '$class': 'java.lang.String', '$': 'foo' },
          { '$class': 'java.lang.String', '$': 'bar' }
        ]
      }
    );

    // java.util.ArrayList as simple
    assert.deepEqual(hessian.encode({
      $class: 'java.util.ArrayList',
      $: [1, 2, 'foo']
    }, '1.0'), utils.bytes('v1/list/untyped_list'));
  });

  it('should write and read typed fixed-length list', function () {
    assert.deepEqual(hessian.encode({
      $class: 'hessian.demo.SomeArrayList',
      $: ['ok', 'some list']
    }, '1.0'), utils.bytes('v1/list/typed_list'));
    assert.deepEqual(hessian.decode(utils.bytes('v1/list/typed_list'), '1.0', true), {
        '$class': 'hessian.demo.SomeArrayList',
        '$': [
          { '$class': 'java.lang.String', '$': 'ok' },
          { '$class': 'java.lang.String', '$': 'some list' }
        ]
      });

    assert.deepEqual(
      hessian.decode(utils.bytes('v1/list/typed_list'), '1.0'),
      [ 'ok', 'some list' ]
    );

    var list = {
      $class: '[int',
      $: [1, 2, 3]
    };
    assert.deepEqual(hessian.encode(list, '1.0'), utils.bytes('v1/list/[int'));
    assert.deepEqual(hessian.decode(utils.bytes('v1/list/[int'), '1.0'), [1, 2, 3]);
    assert.deepEqual(hessian.decode(utils.bytes('v1/list/[int'), '1.0', true), {
      '$class': '[int',
      '$': [
        { '$class': 'int', '$': 1 },
        { '$class': 'int', '$': 2 },
        { '$class': 'int', '$': 3 }
      ]
    });

    var strs = {
      $class: '[string',
      $: ['1', '@', '3']
    };
    assert.deepEqual(hessian.encode(strs, '1.0'), utils.bytes('v1/list/[string'));
    assert.deepEqual(hessian.decode(utils.bytes('v1/list/[string'), '1.0', true), {
      '$class': '[string',
      '$': [
        { '$class': 'java.lang.String', '$': '1' },
        { '$class': 'java.lang.String', '$': '@' },
        { '$class': 'java.lang.String', '$': '3' }
      ]
    });
  });

  describe('v2.0', function () {
    it('should write and read untyped list', function () {
      assert.deepEqual(hessian.encode([1, 2, 'foo'], '2.0'), utils.bytes('v2/list/untyped_list'));
      assert.deepEqual(hessian.encode([], '2.0'), utils.bytes('v2/list/untyped_[]'));

      assert.deepEqual(hessian.decode(utils.bytes('v2/list/untyped_list'), '2.0'), [1, 2, 'foo']);
      assert.deepEqual(
        hessian.decode(utils.bytes('v2/list/untyped_list'), '2.0', true),
        [1, 2, 'foo']
      );
      assert.deepEqual(hessian.decode(utils.bytes('v2/list/untyped_[]'), '2.0'), []);
      assert.deepEqual(
        hessian.decode(utils.bytes('v2/list/untyped_<String>[foo,bar]'), '2.0', true),
        ['foo', 'bar']
      );

      // java.util.ArrayList as simple
      assert.deepEqual(hessian.encode({
        $class: 'java.util.ArrayList',
        $: [1, 2, 'foo']
      }, '2.0'), utils.bytes('v2/list/untyped_list'));
      // encode again should cache class
      assert.deepEqual(hessian.encode({
        $class: 'java.util.ArrayList',
        $: [1, 2, 'foo']
      }, '2.0'), utils.bytes('v2/list/untyped_list'));
    });

    it('should write and read typed fixed-length list', function () {
      assert.deepEqual(hessian.encode({
        $class: 'hessian.demo.SomeArrayList',
        $: ['ok', 'some list']
      }, '2.0'), utils.bytes('v2/list/typed_list'));
      // encode again should use type cache
      assert.deepEqual(hessian.encode({
        $class: 'hessian.demo.SomeArrayList',
        $: ['ok', 'some list']
      }, '2.0'), utils.bytes('v2/list/typed_list'));

      assert.deepEqual(hessian.decode(utils.bytes('v2/list/typed_list'), '2.0', true), {
          '$class': 'hessian.demo.SomeArrayList',
          '$': [ 'ok', 'some list' ]
        });

      assert.deepEqual(
        hessian.decode(utils.bytes('v2/list/typed_list'), '2.0'),
        [ 'ok', 'some list' ]
      );

      var list = {
        $class: '[int',
        $: [1, 2, 3]
      };
      assert.deepEqual(hessian.encode(list, '2.0'), utils.bytes('v2/list/[int'));
      assert.deepEqual(hessian.encode(list, '2.0'), utils.bytes('v2/list/[int'));

      assert.deepEqual(hessian.decode(utils.bytes('v2/list/[int'), '2.0'), [1, 2, 3]);
      // encode again should use type cache
      assert.deepEqual(hessian.decode(utils.bytes('v2/list/[int'), '2.0', true), list);

      var strs = {
        $class: '[string',
        $: ['1', '@', '3']
      };
      assert.deepEqual(hessian.encode(strs, '2.0'), utils.bytes('v2/list/[string'));
      assert.deepEqual(hessian.decode(utils.bytes('v2/list/[string'), '2.0', true), strs);
    });

    it('should read hessian 1.0 untyped list', function () {
      assert.deepEqual(hessian.decode(utils.bytes('v1/list/untyped_list'), '2.0'), [1, 2, 'foo']);
      assert.deepEqual(
        hessian.decode(utils.bytes('v1/list/untyped_list'), '2.0', true),
        [1, 2, 'foo']
      );
      assert.deepEqual(hessian.decode(utils.bytes('v1/list/untyped_[]'), '2.0'), []);
      assert.deepEqual(
        hessian.decode(utils.bytes('v1/list/untyped_<String>[foo,bar]'), '2.0', true),
        ['foo', 'bar']
      );
    });
  });
});
