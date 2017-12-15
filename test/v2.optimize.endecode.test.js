'use strict';

var assert = require('assert');
var hessian = require('../');
var utils = require('./utils');
var supportES6Map = require('../lib/utils').supportES6Map;
var DecoderV2 = require('../lib/v2_optimize/decoder');
var EncoderV2 = require('../lib/v2_optimize/encoder');

var cache = [];

describe('v2.optimize.endecode.test.js', function () {
  var decode = hessian.decode;
  var encode = hessian.encode;
  var encoder = new EncoderV2({
    size: 1024 * 1024,
    classRefs: [],
    classRefFields: {},
  });
  before(function() {
    hessian.decode = function(buf, version, withType) {
      return new DecoderV2(buf, cache).read(withType);
    };

    hessian.encode = function(obj) {
      encoder.reset();
      return encoder.write(obj).get();
    };
  });

  // reset and check cache
  after(function() {
    assert(cache.length);
    hessian.decode = decode;
    hessian.encode = encode;
  });

  describe('encode/decode', function () {
    it('should encode/decode class and match ref', function () {
      var obj = {
        $class: 'hessian.test.demo.Car',
        $: { a: 1, b: 'map' }
      };
      var buf = hessian.encode(obj);
      assert(buf[0] === 0x43);
      assert.deepEqual(hessian.decode(buf), obj.$);
      assert.deepEqual(hessian.decode(buf, '2.0', true), obj);

      buf = hessian.encode(obj);
      assert(buf[0] === 0x60);
      assert.deepEqual(hessian.decode(buf), obj.$);
      assert.deepEqual(hessian.decode(buf, '2.0', true), obj);
    });
  });
});
