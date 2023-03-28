"use strict";

var assert = require("assert");
var { encode } = require('../../index');
var Decoder = require("../../lib/v2rust/decoder");
var { preset } = Decoder.makeState();
var rustDecode = (p, offset) => preset(p, offset).read();

describe("valid.test.js", function () {
  describe("decode", function () {
    it('should drain work "', function () {
      const bf = encode(
        {
          a: 1,
          t: {
            $class: "foo",
            $: {
              s: 3
            }
          }
        },
        "2.0"
      );
      var { dump, drain, preset } = Decoder.makeState();
      var rustDecode = (p) => preset(p).read();
      assert.deepEqual(rustDecode(bf), { a: 1, t: { s: 3 } });
      assert.deepEqual(dump().rustShapeCache, 'State { map_shape_cache: {"a,t,": 0}, max_map_shape_cache_len: 20, class_shape_cache: {"foo": [ClassInfo { len: 1, bytelen: 2, skip_idx: [], cache_idx: 0 }]} }');
      assert.equal(dump().objectShapeCache.length, 1);
      assert.equal(dump().mapShapeCache.length, 1);
      drain();
      assert(dump().rustShapeCache === 'State { map_shape_cache: {}, max_map_shape_cache_len: 20, class_shape_cache: {} }');
      assert.equal(dump().mapShapeCache.length, 0);
      assert.equal(dump().objectShapeCache.length, 0);
    });
    it('can use shareBuffer "', function () {
      const bf = encode(
        "hello",
        "2.0"
      );
      var { preset } = Decoder.makeState({
        shareBuffer: Buffer.alloc(1000)
      });
      var rustDecode = (p) => preset(p).read();
      assert(rustDecode(bf) === 'hello');
    });
    it('cant use shareBuffer "', function () {
      const bf = encode(
        "hello",
        "2.0"
      );
      try {
        var { preset } = Decoder.makeState({
          shareBuffer: Buffer.alloc(1)
        });
        var rustDecode = (p) => preset(p).read();
        assert(rustDecode(bf) === 'hello');
      } catch (e) {
        assert(
          e ===
          "input太长了，达到了outputBufferLength: 1的3/5，可能会产生意想不到的结果，出于安全考虑抛出此异常，请精简返回结果，或加大输出buffer的size"
        );
        return;
      }
      assert(false);
    });
    it('cant include "', function () {
      const bf = encode(
        {
          '" + console.log() +"': 1,
        },
        "2.0"
      );
      try {
        rustDecode(bf);
      } catch (e) {
        assert(
          e.message ===
          "set cache error"
        );
        return;
      }
      assert(false);
    });
    it("use offset", function () {
      assert.deepEqual(
        rustDecode(new Buffer([0x00, 0x11, 0x38, 0x00, 0x00]), 2),
        -262144
      );
    });
    it("cant include separator", function () {
      const bf = encode(
        {
          'a,b': 1,
        },
        "2.0"
      );
      try {
        rustDecode(bf);
      } catch (e) {
        assert(
          e.message ===
          "set cache error"
        );
        return;
      }
      assert(false);
    });
    it("too big input", function () {
      const bf = Buffer.alloc(5 * 1024 * 1024);
      try {
        rustDecode(bf);
      } catch (e) {
        console.log(e);
        assert(
          e ===
          "input太长了，达到了outputBufferLength: 5242880的3/5，可能会产生意想不到的结果，出于安全考虑抛出此异常，请精简返回结果，或加大输出buffer的size"
        );
        return;
      }
      assert(false);
    });

    it('should usage work', function () {
      const bf = encode(
        {
          a: 1,
          t: {
            $class: "foo",
            $: {
              s: 3
            }
          }
        },
        "2.0"
      );
      var { preset, usage } = Decoder.makeState();
      var rustDecode = (p) => preset(p).read();

      for (let index = 0; index < 1000; index++) {
        rustDecode(bf);
      }
      const use = usage();
      assert.deepEqual(use.rustUsage, {
        temp_definition_size: 16,
        map_shape_cache_size: 1,
        class_shape_cache_size: 1,
        temp_buffer_size: 4864
      });

      assert.deepEqual(use.jsUsage, {
        map: 1,
        object: 1,
      });
    });
  });
});
