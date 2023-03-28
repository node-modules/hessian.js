"use strict";

var assert = require('assert');
var hessian = require('../../index');
var utils = require('../utils');
var rustDecode = require('./rustdecoder');

describe('list.test.js', function () {
  describe('v2.0', function () {
    it('should write and read untyped list', function () {
      assert.deepEqual(rustDecode(utils.bytes('v2/list/untyped_list')), [1, 2, 'foo']);
      assert.deepEqual(
        rustDecode(utils.bytes('v2/list/untyped_list')),
        [1, 2, 'foo']
      );
      assert.deepEqual(rustDecode(utils.bytes('v2/list/untyped_[]')), []);
      assert.deepEqual(
        rustDecode(utils.bytes('v2/list/untyped_<String>[foo,bar]')),
        ['foo', 'bar']
      );
    });

    it('should write and read typed fixed-length list', function () {
      assert.deepEqual(
        rustDecode(utils.bytes('v2/list/typed_list')),
        [ 'ok', 'some list' ]
      );

      assert.deepEqual(rustDecode(utils.bytes('v2/list/[int')), [1, 2, 3]);

      var strs = ['1', '@', '3'];
      assert.deepEqual(rustDecode(utils.bytes('v2/list/[string')), strs);
    });

    it('should read hessian 1.0 untyped list', function () {
      assert.deepEqual(rustDecode(utils.bytes('v1/list/untyped_list')), [1, 2, 'foo']);
      assert.deepEqual(
        rustDecode(utils.bytes('v1/list/untyped_list')),
        [1, 2, 'foo']
      );
      assert.deepEqual(rustDecode(utils.bytes('v1/list/untyped_[]')), []);
      assert.deepEqual(
        rustDecode(utils.bytes('v1/list/untyped_<String>[foo,bar]')),
        ['foo', 'bar']
      );
    });
  });
});
