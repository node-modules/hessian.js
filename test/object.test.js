/**!
 * hessian.js - test/object.test.js
 *
 * Copyright(c) 2014
 * MIT Licensed
 *
 * Authors:
 *   fengmk2 <fengmk2@gmail.com> (http://fengmk2.github.com)
 */

"use strict";

var assert = require('assert');
var hessian = require('../');
var utils = require('./utils');
var supportES6Map = require('../lib/utils').supportES6Map;

describe('object.test.js', function () {
  describe('v1.0', function () {

    it('should skip function', function() {
      var o = { foo: 'bar', fn: function() {} };
      var buf = hessian.encode(o, '1.0');
      var output = hessian.decode(buf, '1.0');
      assert.deepEqual(output, { foo: 'bar', fn: null });
    });

    it('should write null for property like: { a: { "$class": "yyy.yyy", "$": null } }', function () {
      var o = { '$class': 'xxx.xxx',
                '$': { a: { '$class': 'yyy.yyy', '$': null } } };
      var rightBuf = new Buffer('4d7400077878782e787878530001614e7a', 'hex');

      var buf = hessian.encode(o, '1.0');
      assert(buf.length === rightBuf.length);
      assert.deepEqual(buf, rightBuf);
    });

    it('should write object for property like: { a: { "$class": "yyy.yyy", "$": {} } }', function () {
      var o = { '$class': 'xxx.xxx',
                '$': { a: { '$class': 'yyy.yyy', '$': {} } } };
      var rightBuf = new Buffer('4d7400077878782e787878530001614d7400077979792e7979797a7a', 'hex');

      var buf = hessian.encode(o, '1.0');
      assert(buf.length === rightBuf.length);
      assert.deepEqual(buf, rightBuf);
    });

    it('should _assertType error when encode wrong object', function () {
      var req = {
        $class: 'com.alipay.x.biz.User',
        $: 'abc'
      };
      var rs;
      var buf;
      try {
        buf = hessian.encode(req, '1.0');
      } catch (err) {
        rs = err;
      }
      assert(rs);
      assert(rs.message.indexOf('com.alipay.x.biz.User') >= 0);
      assert(!buf);
    });

    it('should decode and encode ConnectionRequest', function () {
      var javabuf = utils.bytes('v1/object/ConnectionRequest');
      var connreq = hessian.decode(javabuf, '1.0', true);

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

      var jsbuf = hessian.encode(connreq, '1.0');
      var jsbuf2 = hessian.encode(jsconnreq, '1.0');
      // jsbuf2.should.length(javabuf.length);
      // jsbuf2.should.eql(javabuf);

      // jsbuf.should.length(javabuf.length);
      // jsbuf.should.eql(javabuf);

      var jsbuf2Again = hessian.encode(jsconnreq, '1.0');
      assert.deepEqual(jsbuf2Again, jsbuf2);
    });

    it('should write enum Color', function () {
      assert.deepEqual(hessian.encode({
        $class: 'hessian.Main$Color',
        $: {
          name: 'RED'
        }
      }, '1.0'), utils.bytes('v1/enum/red'));

      assert.deepEqual(hessian.encode({
        $class: 'hessian.Main$Color',
        $: {
          name: 'GREEN'
        }
      }, '1.0'), utils.bytes('v1/enum/green'));

      assert.deepEqual(hessian.encode({
        $class: 'hessian.Main$Color',
        $: {
          name: 'BLUE'
        }
      }, '1.0'), utils.bytes('v1/enum/blue'));
    });

    it('should write enum with ref', function () {
      // list = new ArrayList();
      // list.add(Color.BLUE);
      // list.add(Color.RED);
      // list.add(Color.GREEN);
      assert.deepEqual(hessian.encode([
        {
          $class: 'hessian.Main$Color',
          $: {
            name: 'BLUE'
          }
        },
        {
          $class: 'hessian.Main$Color',
          $: {
            name: 'RED'
          }
        },
        {
          $class: 'hessian.Main$Color',
          $: {
            name: 'GREEN'
          }
        },
      ], '1.0'), utils.bytes('v1/enum/lists'));
    });

    it('should read enum Color', function () {
      // enum Color {
      //   RED,
      //   GREEN,
      //   BLUE,
      // }

      assert.deepEqual(hessian.decode(utils.bytes('v1/enum/red'), '1.0'), {
        name: 'RED'
      });

      assert.deepEqual(hessian.decode(utils.bytes('v1/enum/green'), '1.0', true), {
        '$class': 'hessian.Main$Color',
        '$': {
          name: { '$class': 'java.lang.String', '$': 'GREEN' }
        }
      });

      assert.deepEqual(hessian.decode(utils.bytes('v1/enum/blue'), '1.0'), {
        name: 'BLUE'
      });

      assert.deepEqual(hessian.decode(utils.bytes('v1/enum/green'), '1.0'), {
        name: 'GREEN'
      });

      assert.deepEqual(hessian.decode(utils.bytes('v1/enum/red'), '1.0', true), {
        '$class': 'hessian.Main$Color',
        '$': {
          name: { '$class': 'java.lang.String', '$': 'RED' }
        }
      });

      assert.deepEqual(
        hessian.decode(utils.bytes('v1/enum/lists'), '1.0'),
        [ { name: 'BLUE' }, { name: 'RED' }, { name: 'GREEN' } ]
      );

      assert.deepEqual(hessian.decode(utils.bytes('v1/enum/lists'), '1.0', true), {
        $class: 'java.util.ArrayList',
        $: [
          { '$class': 'hessian.Main$Color', '$': { name: { '$class': 'java.lang.String', '$': 'BLUE' } } },
          { '$class': 'hessian.Main$Color', '$': { name: { '$class': 'java.lang.String', '$': 'RED' } } },
          { '$class': 'hessian.Main$Color', '$': { name: { '$class': 'java.lang.String', '$': 'GREEN' } } }
        ]
      });
    });

    it('should write "{$class: "hessian.test.demo.Car", $: {a: 1}}"', function () {
      var obj = {
        $class: 'hessian.test.demo.Car',
        $: {a: 1, b: 'map'}
      };
      var buf = hessian.encode(obj, '1.0');
      assert(buf[0] === 0x4d); // 'M'
      assert.deepEqual(hessian.decode(buf, '1.0'), obj.$);
      assert.deepEqual(hessian.decode(buf, '1.0', true), {
        '$class': 'hessian.test.demo.Car',
        '$': {
          a: { '$class': 'int', '$': 1 },
          b: { '$class': 'java.lang.String', '$': 'map' }
        }
      });
    });

    it('should read and write one car list', function () {
      assert.deepEqual(hessian.decode(utils.bytes('v1/map/one_car_list'), '1.0'), [
        { a: 'a',
          c: 'c',
          b: 'b',
          model: 'model 1',
          color: 'aquamarine',
          mileage: 65536 }
      ]);

      var cars = hessian.decode(utils.bytes('v1/map/one_car_list'), '1.0', true);
      assert.deepEqual(cars, {
        $class: 'java.util.ArrayList',
        $: [
          {
            '$class': 'hessian.demo.Car',
            '$': {
              a: { '$class': 'java.lang.String', '$': 'a' },
              c: { '$class': 'java.lang.String', '$': 'c' },
              b: { '$class': 'java.lang.String', '$': 'b' },
              model: { '$class': 'java.lang.String', '$': 'model 1' },
              color: { '$class': 'java.lang.String', '$': 'aquamarine' },
              mileage: { '$class': 'int', '$': 65536 }
            }
          }
        ]
      });

      assert.deepEqual(hessian.encode(cars, '1.0'), utils.bytes('v1/map/one_car_list'));
    });

    it('should read and write two car list', function () {
      assert.deepEqual(hessian.decode(utils.bytes('v1/map/two_car_list'), '1.0'), [
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

      var cars = hessian.decode(utils.bytes('v1/map/two_car_list'), '1.0', true);
      assert.deepEqual(cars, {
        $class: 'java.util.ArrayList',
        $: [
          {
            '$class': 'hessian.demo.Car',
            '$': {
              a: { '$class': 'java.lang.String', '$': 'a' },
              c: { '$class': 'java.lang.String', '$': 'c' },
              b: { '$class': 'java.lang.String', '$': 'b' },
              model: { '$class': 'java.lang.String', '$': 'model 1' },
              color: { '$class': 'java.lang.String', '$': 'aquamarine' },
              mileage: { '$class': 'int', '$': 65536 }
            }
          }, {
            '$class': 'hessian.demo.Car',
            '$': {
              a: { '$class': 'java.lang.String', '$': 'a' },
              c: { '$class': 'java.lang.String', '$': 'c' },
              b: { '$class': 'java.lang.String', '$': 'b' },
              model: { '$class': 'java.lang.String', '$': 'model 2' },
              color: { '$class': 'java.lang.String', '$': 'aquamarine' },
              mileage: { '$class': 'int', '$': 65536 }
            }
          }
        ]
      });

      var buf = hessian.encode(cars, '1.0');
      assert(buf.length === utils.bytes('v1/map/two_car_list').length);
      assert.deepEqual(buf, utils.bytes('v1/map/two_car_list'));
    });

    it('should read and write many cars', function () {
      // list = new ArrayList();
      // list.add(new Car("model 1"));
      // list.add(new Car("model 2"));
      // list.add(new Car("model 3"));
      assert.deepEqual(hessian.decode(utils.bytes('v1/map/car_list'), '1.0'), [
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

      var cars = hessian.decode(utils.bytes('v1/map/car_list'), '1.0', true);
      assert.deepEqual(cars, {
        $class: 'java.util.ArrayList',
        $: [
          {
            '$class': 'hessian.demo.Car',
            '$': {
              a: { '$class': 'java.lang.String', '$': 'a' },
              c: { '$class': 'java.lang.String', '$': 'c' },
              b: { '$class': 'java.lang.String', '$': 'b' },
              model: { '$class': 'java.lang.String', '$': 'model 1' },
              color: { '$class': 'java.lang.String', '$': 'aquamarine' },
              mileage: { '$class': 'int', '$': 65536 }
            }
          }, {
            '$class': 'hessian.demo.Car',
            '$': {
              a: { '$class': 'java.lang.String', '$': 'a' },
              c: { '$class': 'java.lang.String', '$': 'c' },
              b: { '$class': 'java.lang.String', '$': 'b' },
              model: { '$class': 'java.lang.String', '$': 'model 2' },
              color: { '$class': 'java.lang.String', '$': 'aquamarine' },
              mileage: { '$class': 'int', '$': 65536 }
            }
          }, {
            '$class': 'hessian.demo.Car',
            '$': {
              a: { '$class': 'java.lang.String', '$': 'a' },
              c: { '$class': 'java.lang.String', '$': 'c' },
              b: { '$class': 'java.lang.String', '$': 'b' },
              model: { '$class': 'java.lang.String', '$': 'model 3' },
              color: { '$class': 'java.lang.String', '$': 'aquamarine' },
              mileage: { '$class': 'int', '$': 65536 }
            }
          }
        ]
      });

      assert.deepEqual(hessian.encode(cars, '1.0'), utils.bytes('v1/map/car_list'));
    });

    describe('java.util.concurrent.atomic.AtomicLong', function () {
      it('should read and write', function () {
        var javabuf = utils.bytes('v1/object/AtomicLong0');
        var a0 = hessian.decode(javabuf);
        assert.deepEqual(a0, {value: 0});
        var a0 = hessian.decode(javabuf, true);
        assert.deepEqual(a0, {
          $class: 'java.util.concurrent.atomic.AtomicLong',
          $: {
            value: {
              $: 0,
              $class: 'long'
            }
          }
        });
        assert.deepEqual(hessian.encode(a0), javabuf);

        javabuf = utils.bytes('v1/object/AtomicLong1');
        var a1 = hessian.decode(javabuf);
        assert.deepEqual(a1, {value: 1});
        var a1 = hessian.decode(javabuf, true);
        assert.deepEqual(a1, {
          $class: 'java.util.concurrent.atomic.AtomicLong',
          $: {
            value: {
              $: 1,
              $class: 'long'
            }
          }
        });
        assert.deepEqual(hessian.encode(a1), javabuf);
      });
    });
  });

  describe('v2.0', function () {
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

      var jsbuf = hessian.encode(connreq, '2.0');
      var jsbuf2 = hessian.encode(jsconnreq, '2.0');
      // jsbuf2.should.length(javabuf.length);
      // jsbuf2.should.eql(javabuf);

      // jsbuf.should.length(javabuf.length);
      // jsbuf.should.eql(javabuf);
    });

    it('should decode hessian 1.0 ConnectionRequest', function () {
      var javabuf = utils.bytes('v1/object/ConnectionRequest');
      var connreq = hessian.decode(javabuf, '1.0', true);
      assert(connreq.$class === 'hessian.ConnectionRequest');
      assert(connreq.$.ctx.$class === 'hessian.ConnectionRequest$RequestContext');
    });

    it('should write enum Color', function () {
      assert.deepEqual(hessian.encode({
        $class: 'hessian.Main$Color',
        $: {
          name: 'RED'
        }
      }, '2.0'), utils.bytes('v2/enum/red'));

      assert.deepEqual(hessian.encode({
        $class: 'hessian.Main$Color',
        $: {
          name: 'GREEN'
        }
      }, '2.0'), utils.bytes('v2/enum/green'));

      assert.deepEqual(hessian.encode({
        $class: 'hessian.Main$Color',
        $: {
          name: 'BLUE'
        }
      }, '2.0'), utils.bytes('v2/enum/blue'));
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

    it('should write enum with ref', function () {
      // list = new ArrayList();
      // list.add(Color.BLUE);
      // list.add(Color.RED);
      // list.add(Color.GREEN);
      assert.deepEqual(hessian.encode([
        {
          $class: 'hessian.Main$Color',
          $: {
            name: 'BLUE'
          }
        },
        {
          $class: 'hessian.Main$Color',
          $: {
            name: 'RED'
          }
        },
        {
          $class: 'hessian.Main$Color',
          $: {
            name: 'GREEN'
          }
        },
      ], '2.0'), utils.bytes('v2/enum/lists'));
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
        var buf = hessian.encode(obj);
        var rs = hessian.decode(buf);
        rs.should.eql({ 'KEY': 'hello' });
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
        var rs = hessian.decode(buf, '2.0');
        rs.should.eql({ 'KEY': 'hello' });
      });

    });
  }



});
