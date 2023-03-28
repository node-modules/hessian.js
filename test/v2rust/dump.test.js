"use strict";

var assert = require("assert");
var hessian = require('../../index');
var rustFun = require("./rustdecoder2");
const [rustDecode, dump] = rustFun;
describe("dump.test.js", function () {
  describe("v2.0", function () {
    it("dump", function () {
      let obj = hessian.encode({ a: 1, s: { $class: 'foo', $: { t: 1 }} }, "2.0");
      rustDecode(obj);
      if (!process.env.maxCacheLength) {
        assert(dump().rustShapeCache === 'State { map_shape_cache: {"a,s,": 0}, max_map_shape_cache_len: 20, class_shape_cache: {"foo": [ClassInfo { len: 1, bytelen: 2, skip_idx: [], cache_idx: 0 }]} }');
        assert.deepEqual(dump().objectShapeCache, [
          'function Record() {\n' +
          '      const result = {\n' +
          '        "t": null,\n' +
          '      };\n' +
          '      setRef(result);\n' +
          '      var temp;\n' +
          '      var key;\n' +
          '      \n' +
          '          temp = read();\n' +
          '          if (temp !== null) {\n' +
          '            result["t"] = temp;\n' +
          '          }\n' +
          '          \n' +
          '        return result;\n' +
          '    }'
        ]);
        console.log(dump().mapShapeCache);
        assert.deepEqual(dump().mapShapeCache, [
          'function Record() {\n' +
          '      const result = {\n' +
          '        "a": null,"s": null,\n' +
          '      };\n' +
          '      setRef(result);\n' +
          '      var temp;\n' +
          '      var key;\n' +
          '      \n' +
          '          temp = read();\n' +
          '          if (temp !== null) {\n' +
          '            result["a"] = temp;\n' +
          '          }\n' +
          '          \n' +
          '          temp = read();\n' +
          '          if (temp !== null) {\n' +
          '            result["s"] = temp;\n' +
          '          }\n' +
          '          \n' +
          '        return result;\n' +
          '    }'
        ]);
      } else {
        assert(dump().rustShapeCache === 'State { map_shape_cache: {}, max_map_shape_cache_len: 0, class_shape_cache: {"foo": [ClassInfo { len: 1, bytelen: 2, skip_idx: [], cache_idx: 0 }]} }');
        assert.deepEqual(dump().objectShapeCache, [
          'function Record() {\n' +
          '      const result = {\n' +
          '        "t": null,\n' +
          '      };\n' +
          '      setRef(result);\n' +
          '      var temp;\n' +
          '      var key;\n' +
          '      \n' +
          '          temp = read();\n' +
          '          if (temp !== null) {\n' +
          '            result["t"] = temp;\n' +
          '          }\n' +
          '          \n' +
          '        return result;\n' +
          '    }'
        ]);
        assert.deepEqual(dump().mapShapeCache, [
        ]);
      }
    });
  });
});
