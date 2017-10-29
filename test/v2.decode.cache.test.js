'use strict';

var assert = require('assert');
var hessian = require('../');
var utils = require('./utils');
var supportES6Map = require('../lib/utils').supportES6Map;

var cache = new Map();

describe('v2.decode.cache.test.js', function () {
  var decode = hessian.decode;
  // ensure all v2 decode use classCache
  before(function() {
    hessian.decode = function(buf, version, options) {
      if (version !== '2.0') {
        return decode(buf, version, options);
      }

      if (!options) {
        options = {};
      }
      if (typeof options === 'boolean') {
        options = { withType: options };
      }
      if (!options.classCache) {
        options.classCache = cache;
      }
      return decode(buf, version, options);
    };
  });

  // reset and check cache
  after(function() {
    assert(cache.size);
    hessian.decode = decode;
  });

  for (var i = 0; i < 3; i++) {
    describe('repeat ' + i, function() {
      it('should skip function', function() {
        var o = { foo: 'bar', fn: function() {} };
        var buf = hessian.encode(o, '2.0');
        var output = hessian.decode(buf, '2.0');
        assert.deepEqual(output, { foo: 'bar', fn: null });
      });

      it('should decode and encode ConnectionRequest', function () {
        var javabuf = utils.bytes('v2/object/ConnectionRequest');
        var connreq1 = hessian.decode(javabuf, '2.0');
        assert(connreq1.ctx);
        assert(connreq1.ctx.id === 101);

        var connreq = hessian.decode(javabuf, '2.0', true);
        var jsconnreq = {
          $class: 'hessian.ConnectionRequest',
          $: {
            ctx: {
              $class: 'hessian.ConnectionRequest$RequestContext',
              $: {
                id: 101,
              }
            }
          }
        };
        assert.deepEqual(connreq, jsconnreq);
        var jsbuf = hessian.encode(connreq, '2.0');
        var jsbuf2 = hessian.encode(jsconnreq, '2.0');
      });

      it('should read hessian 1.0 enum Color', function () {
        assert.deepEqual(hessian.decode(utils.bytes('v1/enum/red'), '2.0', true), {
          $class: 'hessian.Main$Color',
          $: {
            name: 'RED'
          }
        });

        assert.deepEqual(hessian.decode(utils.bytes('v1/enum/green'), '2.0', false), {
          name: 'GREEN'
        });

        assert.deepEqual(hessian.decode(utils.bytes('v1/enum/blue'), '2.0', true), {
          $class: 'hessian.Main$Color',
          $: {
            name: 'BLUE'
          }
        });
      });

      it('should read enum Color', function () {
        // enum Color {
        //   RED,
        //   GREEN,
        //   BLUE,
        // }

        // enum format:
        // O type 1 "name" o ref name-value
        assert.deepEqual(hessian.decode(utils.bytes('v2/enum/red'), '2.0'), {
          name: 'RED'
        });

        assert.deepEqual(hessian.decode(utils.bytes('v2/enum/green'), '2.0', true), {
          $class: 'hessian.Main$Color',
          $: {
            name: 'GREEN'
          }
        });

        assert.deepEqual(hessian.decode(utils.bytes('v2/enum/blue'), '2.0'), {
          name: 'BLUE'
        });

        assert.deepEqual(hessian.decode(utils.bytes('v2/enum/green'), '2.0'), {
          name: 'GREEN'
        });

        assert.deepEqual(hessian.decode(utils.bytes('v2/enum/red'), '2.0', true), {
          $class: 'hessian.Main$Color',
          $: {
            name: 'RED'
          }
        });

        assert.deepEqual(
          hessian.decode(utils.bytes('v2/enum/lists'), '2.0'),
          [ { name: 'BLUE' }, { name: 'RED' }, { name: 'GREEN' } ]
        );

        assert.deepEqual(hessian.decode(utils.bytes('v2/enum/lists'), '2.0', true), [
          { '$class': 'hessian.Main$Color', '$': { name: 'BLUE' } },
          { '$class': 'hessian.Main$Color', '$': { name: 'RED' } },
          { '$class': 'hessian.Main$Color', '$': { name: 'GREEN' } }
        ]);
      });

      it('should write "{$class: "hessian.test.demo.Car", $: {a: 1}}"', function () {
        var obj = {
          $class: 'hessian.test.demo.Car',
          $: {a: 1, b: 'map'}
        };
        var buf = hessian.encode(obj, '2.0');
        assert(buf[0] === 0x4f);
        assert.deepEqual(hessian.decode(buf, '2.0'), obj.$);
        assert.deepEqual(hessian.decode(buf, '2.0', true), obj);
      });

      it('should read one car list', function () {
        assert.deepEqual(hessian.decode(utils.bytes('v2/map/one_car_list'), '2.0'), [
          { a: 'a',
            c: 'c',
            b: 'b',
            model: 'model 1',
            color: 'aquamarine',
            mileage: 65536 }
        ]);

        var cars = hessian.decode(utils.bytes('v2/map/one_car_list'), '2.0', true);
        assert.deepEqual(cars, [
          {
            $class: 'hessian.demo.Car',
            $: {
              a: 'a',
              c: 'c',
              b: 'b',
              model: 'model 1',
              color: 'aquamarine',
              mileage: 65536 }
          }
        ]);

        assert.deepEqual(hessian.encode(cars, '2.0'), utils.bytes('v2/map/one_car_list'));
      });

      it('should read two car list', function () {
        assert.deepEqual(hessian.decode(utils.bytes('v2/map/two_car_list'), '2.0'), [
          { a: 'a',
            c: 'c',
            b: 'b',
            model: 'model 1',
            color: 'aquamarine',
            mileage: 65536 },
          { a: 'a',
            c: 'c',
            b: 'b',
            model: 'model 2',
            color: 'aquamarine',
            mileage: 65536 }
        ]);

        var cars = hessian.decode(utils.bytes('v2/map/two_car_list'), '2.0', true);
        assert.deepEqual(cars, [
          {
            $class: 'hessian.demo.Car',
            $: {
              a: 'a',
              c: 'c',
              b: 'b',
              model: 'model 1',
              color: 'aquamarine',
              mileage: 65536 }
          },
          {
            $class: 'hessian.demo.Car',
            $: {
              a: 'a',
              c: 'c',
              b: 'b',
              model: 'model 2',
              color: 'aquamarine',
              mileage: 65536 }
          }
        ]);

        var buf = hessian.encode(cars, '2.0');
        assert(buf.length === utils.bytes('v2/map/two_car_list').length);
        assert.deepEqual(buf, utils.bytes('v2/map/two_car_list'));
      });

      it('should read many cars', function () {
        // list = new ArrayList();
        // list.add(new Car("model 1"));
        // list.add(new Car("model 2"));
        // list.add(new Car("model 3"));
        assert.deepEqual(hessian.decode(utils.bytes('v2/map/car_list'), '2.0'), [
          { a: 'a',
            c: 'c',
            b: 'b',
            model: 'model 1',
            color: 'aquamarine',
            mileage: 65536 },
          { a: 'a',
            c: 'c',
            b: 'b',
            model: 'model 2',
            color: 'aquamarine',
            mileage: 65536 },
          { a: 'a',
            c: 'c',
            b: 'b',
            model: 'model 3',
            color: 'aquamarine',
            mileage: 65536 }
        ]);

        var cars = hessian.decode(utils.bytes('v2/map/car_list'), '2.0', true);
        assert.deepEqual(cars, [
          { '$class': 'hessian.demo.Car',
            '$':
             { a: 'a',
               c: 'c',
               b: 'b',
               model: 'model 1',
               color: 'aquamarine',
               mileage: 65536 } },
          { '$class': 'hessian.demo.Car',
            '$':
             { a: 'a',
               c: 'c',
               b: 'b',
               model: 'model 2',
               color: 'aquamarine',
               mileage: 65536 } },
          { '$class': 'hessian.demo.Car',
            '$':
             { a: 'a',
               c: 'c',
               b: 'b',
               model: 'model 3',
               color: 'aquamarine',
               mileage: 65536 } }
        ]);

        assert.deepEqual(hessian.encode(cars, '2.0'), utils.bytes('v2/map/car_list'));
      });

      it('should read hessian 1.0 one car list', function () {
        assert.deepEqual(hessian.decode(utils.bytes('v1/map/one_car_list'), '2.0'), [
          { a: 'a',
            c: 'c',
            b: 'b',
            model: 'model 1',
            color: 'aquamarine',
            mileage: 65536 }
        ]);

        var cars = hessian.decode(utils.bytes('v1/map/one_car_list'), '2.0', true);
        assert.deepEqual(cars, [
          {
            $class: 'hessian.demo.Car',
            $: {
              a: 'a',
              c: 'c',
              b: 'b',
              model: 'model 1',
              color: 'aquamarine',
              mileage: 65536 }
          }
        ]);
      });

      it('should read hessian 1.0 two car list', function () {
        assert.deepEqual(hessian.decode(utils.bytes('v1/map/two_car_list'), '2.0'), [
          { a: 'a',
            c: 'c',
            b: 'b',
            model: 'model 1',
            color: 'aquamarine',
            mileage: 65536 },
          { a: 'a',
            c: 'c',
            b: 'b',
            model: 'model 2',
            color: 'aquamarine',
            mileage: 65536 }
        ]);

        var cars = hessian.decode(utils.bytes('v1/map/two_car_list'), '2.0', true);
        assert.deepEqual(cars, [
          {
            $class: 'hessian.demo.Car',
            $: {
              a: 'a',
              c: 'c',
              b: 'b',
              model: 'model 1',
              color: 'aquamarine',
              mileage: 65536 }
          },
          {
            $class: 'hessian.demo.Car',
            $: {
              a: 'a',
              c: 'c',
              b: 'b',
              model: 'model 2',
              color: 'aquamarine',
              mileage: 65536 }
          }
        ]);
      });

      it('should read hessian 1.0 many cars', function () {
        // list = new ArrayList();
        // list.add(new Car("model 1"));
        // list.add(new Car("model 2"));
        // list.add(new Car("model 3"));
        assert.deepEqual(hessian.decode(utils.bytes('v1/map/car_list'), '2.0'), [
          { a: 'a',
            c: 'c',
            b: 'b',
            model: 'model 1',
            color: 'aquamarine',
            mileage: 65536 },
          { a: 'a',
            c: 'c',
            b: 'b',
            model: 'model 2',
            color: 'aquamarine',
            mileage: 65536 },
          { a: 'a',
            c: 'c',
            b: 'b',
            model: 'model 3',
            color: 'aquamarine',
            mileage: 65536 }
        ]);

        var cars = hessian.decode(utils.bytes('v1/map/car_list'), '2.0', true);
        assert.deepEqual(cars, [
          { '$class': 'hessian.demo.Car',
            '$':
             { a: 'a',
               c: 'c',
               b: 'b',
               model: 'model 1',
               color: 'aquamarine',
               mileage: 65536 } },
          { '$class': 'hessian.demo.Car',
            '$':
             { a: 'a',
               c: 'c',
               b: 'b',
               model: 'model 2',
               color: 'aquamarine',
               mileage: 65536 } },
          { '$class': 'hessian.demo.Car',
            '$':
             { a: 'a',
               c: 'c',
               b: 'b',
               model: 'model 3',
               color: 'aquamarine',
               mileage: 65536 } }
        ]);
      });

      describe('java.util.concurrent.atomic.AtomicLong', function () {
        it('should read and write', function () {
          var javabuf = utils.bytes('v2/object/AtomicLong0');
          var a0 = hessian.decode(javabuf, '2.0');
          assert.deepEqual(a0, {value: 0});
          var a0 = hessian.decode(javabuf, '2.0', true);
          assert.deepEqual(a0, {
            $class: 'java.util.concurrent.atomic.AtomicLong',
            $: {
              value: {
                $class: 'long',
                $: 0,
              },
            }
          });
          assert.deepEqual(hessian.encode({
            $class: 'java.util.concurrent.atomic.AtomicLong',
            $: {
              value: {
                $class: 'long',
                $: 0
              }
            }
          }, '2.0'), javabuf);

          javabuf = utils.bytes('v2/object/AtomicLong1');
          var a1 = hessian.decode(javabuf, '2.0');
          assert.deepEqual(a1, {value: 1});
          var a1 = hessian.decode(javabuf, '2.0', true);
          assert.deepEqual(a1, {
            $class: 'java.util.concurrent.atomic.AtomicLong',
            $: {
              value: {
                $class: 'long',
                $: 1,
              },
            }
          });
          assert.deepEqual(hessian.encode({
            $class: 'java.util.concurrent.atomic.AtomicLong',
            $: {
              value: {
                $class: 'long',
                $: 1
              }
            }
          }, '2.0'), javabuf);
        });
      });


      if (supportES6Map) {
        describe('map key object', function() {
          it('enum should use name v2', function() {
            var key = {
              $class: 'com.hessian.enums.TestEnum',
              $: {
                name: 'KEY',
              },
            };
            var obj = new Map();
            obj.set(key, 'hello');
            var buf = hessian.encode(obj, '2.0');
            var rs = hessian.decode(buf, '2.0');
            rs.should.eql({ 'KEY': 'hello' });
          });

        });
      }
    });
  }

});
