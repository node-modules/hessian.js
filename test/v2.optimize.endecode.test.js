'use strict';

const { describe, it } = require('test');
const assert = require('assert');
const hessian = require('..');
const DecoderV2 = require('../lib/v2_optimize/decoder');
const EncoderV2 = require('../lib/v2_optimize/encoder');

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

    it('should reset encoder ok', function () {
      encoder.byteBuffer.putChar('o');
      encoder.objects.ok = true;
      encoder._typeRefs.push('ok');
      encoder.reset();
      assert.equal(encoder.byteBuffer._offset, 0);
      assert.equal(Object.keys(encoder.objects).length, 0);
      assert.equal(encoder._typeRefs.length, 0);
    });

    it('should clean decoder ok', function () {
      var decoder = new DecoderV2([], []);
      var byteBuffer = decoder.byteBuffer;
      decoder.refId = 1;
      decoder.refMap = {a: 1};
      decoder.types.push(1);
      decoder.clean();
      assert.notEqual(byteBuffer, decoder.byteBuffer);
      assert.equal(decoder.refId, 0);
      assert.equal(Object.keys(decoder.refMap).length, 0);
      assert.equal(decoder.types.length, 0);
    });
  });
});
