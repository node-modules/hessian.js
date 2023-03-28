"use strict";

var assert = require('assert');
var hessian = require('../../index');
var utils = require('../utils');
var supportES6Map = require('../../lib/utils').supportES6Map;
var rustDecode = require('./rustdecoder');
var big = require('../../benchmark/v2rust/big');
describe('object.test.js', function () {
  describe('v2.0', function () {
    it('should big object work', function() {
      var obj1 = rustDecode(big);
      var obj2 = hessian.decode(big, '2.0');
      assert.deepEqual(JSON.stringify(obj1), JSON.stringify(obj2));
    });


    it('should skip function', function() {
      var o = { foo: 'bar', fn() {} };
      var buf = hessian.encode(o, '2.0');
      var output = rustDecode(buf);
      assert.deepEqual(output, { foo: 'bar', fn: null });
    });

    it('should decode and encode ConnectionRequest', function () {
      var javabuf = utils.bytes('v2/object/ConnectionRequest');
      var connreq1 = rustDecode(javabuf);
      assert(connreq1.ctx);
      assert(connreq1.ctx.id === 101);
    });


    it('should read hessian 1.0 enum Color', function () {
      assert.deepEqual(rustDecode(utils.bytes('v1/enum/red')), {
        name: 'RED',
      });

      assert.deepEqual(rustDecode(utils.bytes('v1/enum/green')), {
        name: 'GREEN',
      });

      assert.deepEqual(rustDecode(utils.bytes('v1/enum/blue')), {
        name: 'BLUE',
      });
    });


    it('should read enum Color', function () {
      assert.deepEqual(rustDecode(utils.bytes('v2/enum/red')), {
        name: 'RED',
      });

      assert.deepEqual(rustDecode(utils.bytes('v2/enum/green')), {
        name: 'GREEN',
      });

      assert.deepEqual(rustDecode(utils.bytes('v2/enum/blue')), {
        name: 'BLUE',
      });

      assert.deepEqual(rustDecode(utils.bytes('v2/enum/green')), {
        name: 'GREEN',
      });

      assert.deepEqual(rustDecode(utils.bytes('v2/enum/red')), {
        name: 'RED',
      });

      assert.deepEqual(
        rustDecode(utils.bytes('v2/enum/lists')),
        [ { name: 'BLUE' }, { name: 'RED' }, { name: 'GREEN' } ]
      );

      assert.deepEqual(rustDecode(utils.bytes('v2/enum/lists')), [
        { name: 'BLUE' },
        { name: 'RED' },
        { name: 'GREEN' },
      ]);
    });

    it('should write "{$class: "hessian.test.demo.Car", $: {a: 1}}"', function () {
      var obj = {
        $class: 'hessian.test.demo.Car',
        $: {a: 1, b: 'map'}
      };
      var buf = hessian.encode(obj, '2.0');
      assert(buf[0] === 0x4f);
      assert.deepEqual(rustDecode(buf), {a: 1, b: 'map'});
    });

    it('should read one car list', function () {
      assert.deepEqual(rustDecode(utils.bytes('v2/map/one_car_list')), [
        { a: 'a',
          c: 'c',
          b: 'b',
          model: 'model 1',
          color: 'aquamarine',
          mileage: 65536 },
      ]);

      var cars = rustDecode(utils.bytes('v2/map/one_car_list'));
      assert.deepEqual(cars, [
        {
          a: 'a',
          c: 'c',
          b: 'b',
          model: 'model 1',
          color: 'aquamarine',
          mileage: 65536 },
      ]);
    });

    it('should read two car list', function () {
      assert.deepEqual(rustDecode(utils.bytes('v2/map/two_car_list')), [
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
      ]);

      var cars = rustDecode(utils.bytes('v2/map/two_car_list'));
      assert.deepEqual(cars, [
        {
          a: 'a',
          c: 'c',
          b: 'b',
          model: 'model 1',
          color: 'aquamarine',
          mileage: 65536 },
        {
          a: 'a',
          c: 'c',
          b: 'b',
          model: 'model 2',
          color: 'aquamarine',
          mileage: 65536 },
      ]);
    });

    it('should read many cars', function () {
      // list = new ArrayList();
      // list.add(new Car("model 1"));
      // list.add(new Car("model 2"));
      // list.add(new Car("model 3"));
      assert.deepEqual(rustDecode(utils.bytes('v2/map/car_list')), [
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
          mileage: 65536 },
      ]);

      var cars = rustDecode(utils.bytes('v2/map/car_list'));
      assert.deepEqual(cars, [
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
          mileage: 65536 },
      ]);
    });

    it('should read hessian 1.0 one car list', function () {
      assert.deepEqual(rustDecode(utils.bytes('v1/map/one_car_list')), [
        { a: 'a',
          c: 'c',
          b: 'b',
          model: 'model 1',
          color: 'aquamarine',
          mileage: 65536 },
      ]);

      var cars = rustDecode(utils.bytes('v1/map/one_car_list'));
      assert.deepEqual(cars, [
        {
          a: 'a',
          c: 'c',
          b: 'b',
          model: 'model 1',
          color: 'aquamarine',
          mileage: 65536 },
      ]);
    });

    it('should read hessian 1.0 two car list', function () {
      assert.deepEqual(rustDecode(utils.bytes('v1/map/two_car_list')), [
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
      ]);

      var cars = rustDecode(utils.bytes('v1/map/two_car_list'));
      assert.deepEqual(cars, [
        {
          a: 'a',
          c: 'c',
          b: 'b',
          model: 'model 1',
          color: 'aquamarine',
          mileage: 65536 },
        {
          a: 'a',
          c: 'c',
          b: 'b',
          model: 'model 2',
          color: 'aquamarine',
          mileage: 65536 },
      ]);
    });

    it('should read hessian 1.0 many cars', function () {
      // list = new ArrayList();
      // list.add(new Car("model 1"));
      // list.add(new Car("model 2"));
      // list.add(new Car("model 3"));
      assert.deepEqual(rustDecode(utils.bytes('v1/map/car_list')), [
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
          mileage: 65536 },
      ]);

      var cars = rustDecode(utils.bytes('v1/map/car_list'));
      assert.deepEqual(cars, [
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
          mileage: 65536 },
      ]);
    });

    describe('java.util.concurrent.atomic.AtomicLong', function () {
      it('should read and write', function () {
        var javabuf = utils.bytes('v2/object/AtomicLong0');
        var a0 = rustDecode(javabuf);
        assert.deepEqual(a0, { value: 0 });
        var a0 = rustDecode(javabuf);
        assert.deepEqual(a0, {
          value: 0,
        });


        javabuf = utils.bytes('v2/object/AtomicLong1');
        var a1 = rustDecode(javabuf);
        assert.deepEqual(a1, { value: 1 });
        var a1 = rustDecode(javabuf);
        assert.deepEqual(a1, {
          value: 1,
        });
      });
    });
  });


  if (supportES6Map) {
    describe('map key object', function() {

      it('enum should use name v1', function() {
        var key = {
          $class: 'com.hessian.enums.TestEnum',
          $: {
            name: 'KEY',
          },
        };
        var obj = new Map();
        obj.set(key, 'hello');
        var buf = hessian.encode(obj, '2.0');
        var rs = rustDecode(buf);
        rs.should.eql({ KEY: 'hello' });
      });

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
        var rs = rustDecode(buf);
        rs.should.eql({ KEY: 'hello' });
      });

    });
  }


});
